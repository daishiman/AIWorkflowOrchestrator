# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 2                                              |
| Phase名    | 設計                                           |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 1                                        |
| 後続Phase  | Phase 3                                        |

## 目的

AuthGuard タイムアウト機能と Settings 除外ルートの詳細設計を行い、実装の指針を確立する。

## 実行タスク

### タスク1: AuthGuardDisplayState 型拡張設計

**目的**: `"timed-out"` 状態を型安全に追加する

**設計**:

```typescript
// apps/desktop/src/renderer/components/AuthGuard/types.ts

// 変更前
export type AuthGuardDisplayState =
  | "checking"
  | "authenticated"
  | "unauthenticated";

// 変更後
export type AuthGuardDisplayState =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "timed-out";
```

**影響範囲**:

- `getAuthState()` 関数の戻り値型（自動で反映）
- `useAuthState()` フックの戻り値型（自動で反映）
- `AuthGuard` コンポーネントの switch 文（新ケース追加が必要）
- 型ガード関数は既存のまま（`"timed-out"` 用の型ガードは不要）

### タスク2: useAuthState フック タイムアウトロジック設計

**目的**: タイムアウト管理をフック内に追加する

**状態遷移図**:

```
                    ┌──────────────────────────────────────────┐
                    │                                          │
  ┌─────────┐      │    ┌───────────┐    10s timeout          │
  │ Initial │──────┼───>│ checking  │──────────────>┌──────────┴──┐
  └─────────┘      │    └───────────┘               │  timed-out  │
                   │         │                      └──────┬──────┘
                   │         │ isLoading=false              │
                   │         ▼                              │ retry
                   │    ┌──────────────┐                    │ (reset timer)
                   │    │authenticated │                    │
                   │    │     or       │<───────────────────┘
                   │    │unauthenticated│   isLoading=false
                   │    └──────────────┘
                   │         ▲
                   │         │ isLoading=false
                   │         │ (auth completed after timeout)
                   │    ┌────┴─────┐
                   └───>│timed-out │
                        └──────────┘
```

**設計**:

```typescript
// apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts

import { useState, useEffect } from "react";
import { useAppStore } from "../../../store";
import { getAuthState } from "../utils/getAuthState";
import type { AuthGuardDisplayState } from "../types";

/** 認証タイムアウト時間（ミリ秒） */
export const AUTH_TIMEOUT_MS = 10_000;

export const useAuthState = (): AuthGuardDisplayState => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    // isLoading が false になったらタイムアウトをリセット
    if (!isLoading) {
      setIsTimedOut(false);
      return;
    }

    // isLoading が true の間、タイムアウトタイマーを設定
    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, AUTH_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return getAuthState({ isLoading, isAuthenticated, isTimedOut });
};
```

**P31/P48 準拠確認**:

- `useAppStore` は個別セレクタ `(state) => state.isAuthenticated` と `(state) => state.isLoading` を使用（P31準拠）
- 派生セレクタ（`.filter()` / `.map()`）は不使用のため `useShallow` 不要（P48対策不要）
- `useState` はローカル状態のため Zustand Store には影響なし

### タスク3: getAuthState 関数拡張設計

**目的**: タイムアウト状態を判定ロジックに追加する

**設計**:

```typescript
// apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts

import type { AuthGuardDisplayState } from "../types";

export interface AuthStateInput {
  isLoading: boolean;
  isAuthenticated: boolean;
  isTimedOut: boolean; // 追加
}

export const getAuthState = ({
  isLoading,
  isAuthenticated,
  isTimedOut, // 追加
}: AuthStateInput): AuthGuardDisplayState => {
  // タイムアウト済みかつまだローディング中の場合
  if (isTimedOut && isLoading) return "timed-out";

  // ローディング中は checking（タイムアウト前）
  if (isLoading) return "checking";

  // 認証済み
  if (isAuthenticated) return "authenticated";

  // 未認証
  return "unauthenticated";
};
```

**判定ロジックの優先順序**:

1. `isTimedOut && isLoading` → `"timed-out"`（タイムアウト発動かつまだロード中）
2. `isLoading` → `"checking"`（通常ローディング）
3. `isAuthenticated` → `"authenticated"`
4. else → `"unauthenticated"`

**重要**: `isTimedOut && isLoading` の条件により、タイムアウト後に `isLoading` が `false` になった場合は自動的に `"authenticated"` or `"unauthenticated"` に遷移する（AC-6対応）。

### タスク4: AuthGuard フォールバックUI設計

**目的**: タイムアウト時に表示するフォールバックUIを設計する

**設計**:

```typescript
// apps/desktop/src/renderer/components/AuthGuard/index.tsx

// switch 文に "timed-out" ケースを追加
switch (authState) {
  case "checking":
    return fallback ?? <LoadingScreen />;

  case "timed-out":
    return <AuthTimeoutFallback />;  // 新コンポーネント

  case "authenticated":
    return children;

  case "unauthenticated":
    if (isDevMode()) {
      return fallback ?? <LoadingScreen />;
    }
    return <AuthView />;
}
```

**AuthTimeoutFallback コンポーネント設計**:

```typescript
// apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx

// Props
interface AuthTimeoutFallbackProps {
  // なし（内部で useAppStore と useNavigate を使用）
}

// UI構成:
// - アプリロゴ（LoadingScreen と同様）
// - エラーメッセージ: 「認証の確認に時間がかかっています」
// - サブメッセージ: 「ネットワーク接続を確認するか、以下のオプションをお試しください」
// - リトライボタン（プライマリ）: initializeAuth() を再呼び出し
// - Settings遷移ボタン（セカンダリ）: setCurrentView("settings") を呼び出し
```

**Apple HIG 準拠のUI設計**:

- 背景: `bg-[var(--bg-primary)]`（ライト/ダーク両対応）
- テキスト: `text-[var(--text-primary)]` / `text-[var(--text-secondary)]`
- リトライボタン: `bg-[var(--accent-primary)]` + `text-white` (systemBlue)
- Settings遷移ボタン: `bg-[var(--bg-tertiary)]` + `text-[var(--text-primary)]`
- アイコン: `Icon` コンポーネント使用（warning系）
- スペーシング: 8px グリッド準拠
- 角丸: `rounded-lg`（8-12px）
- アニメーション: ボタンにホバー/アクティブ状態のフィードバック

### タスク5: Settings 除外ルート設計

**目的**: Settings 画面を AuthGuard の外に配置する

**設計**:

```typescript
// apps/desktop/src/renderer/App.tsx

// 変更前（L184-361）:
<BrowserRouter>
  <AuthGuard>
    <Routes>
      {/* 全ルートが AuthGuard 内 */}
    </Routes>
  </AuthGuard>
</BrowserRouter>

// 変更後:
<BrowserRouter>
  <Routes>
    {/* Settings は AuthGuard 外（認証不要） */}
    <Route path="/settings" element={
      <AppLayout
        currentView={"settings" as DockViewType}
        onViewChange={(view) => handleViewChange(view as ViewType)}
        onGoBack={handleGoBack}
        canGoBack={canGoBack}
      >
        <SettingsView />
      </AppLayout>
    } />

    {/* 既存ルートは AuthGuard 内 */}
    <Route path="*" element={
      <AuthGuard>
        <Routes>
          {/* 既存の全ルート */}
        </Routes>
      </AuthGuard>
    } />
  </Routes>
</BrowserRouter>
```

**注意**: 現在の App.tsx はビューベースナビゲーション（`currentView` state）と URL ベースルーティングのハイブリッド構成。Settings 除外は以下の2つのアプローチが必要:

1. **URL ルーティング**: `/settings` パスを AuthGuard 外に配置
2. **ビューベースナビゲーション**: `renderView()` 内の `case "settings"` は AuthGuard 内のまま残す（AuthGuard が通過できる場合のみ使用される）
3. **AuthTimeoutFallback**: Settings 遷移ボタンは `setCurrentView("settings")` ではなく、URL ナビゲーション（`navigate("/settings")`）を使用する

**代替設計（推奨）**: ビューベースナビゲーションとの一貫性を保つため、AuthGuard コンポーネント内で `"timed-out"` 時に Settings 遷移ボタンを提供し、Settings 画面自体は AuthGuard 内に残す方法も検討可能。ただし、これだと AuthGuard が完全にブロックしている場合に Settings に到達できない問題が残る。

**最終決定**: AuthTimeoutFallback 内のボタンで `setCurrentView("settings")` を呼び出し、AuthGuard の switch 文で `"timed-out"` 時は AuthTimeoutFallback を返す（Settings は含まない）。ただし AuthGuard のフォールバックUI自体が Settings ボタンを持つため、ユーザーは Settings に到達可能。

→ **より安全な設計**: App.tsx のルーティングレベルで Settings を AuthGuard 外に配置する（URL ルーティング方式）。

### タスク6: セキュリティ影響分析

**目的**: Settings 画面の AuthGuard 除外によるセキュリティ影響を分析する

**分析結果**:

| 観点                 | 現状        | 変更後      | リスク                                                                                     |
| -------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------ |
| APIキー表示          | AuthGuard内 | AuthGuard外 | 低（APIキーは Main Process で管理、Renderer に直接送信されない）                           |
| LLM設定変更          | AuthGuard内 | AuthGuard外 | 低（設定変更はIPC経由でMain Processが処理）                                                |
| 認証モード切替       | AuthGuard内 | AuthGuard外 | 低（認証モード自体は機密情報ではない）                                                     |
| ユーザープロファイル | AuthGuard内 | AuthGuard外 | 中（認証済みの場合のみプロファイル表示。未認証時はプロファイルセクションを非表示にすべき） |

**対策**: Settings画面内で認証状態を確認し、認証済みの場合のみプロファイルセクションを表示する条件分岐は本タスクスコープ外とする（必要に応じて未タスク化）。

## 参照資料

| 参照資料         | パス                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Phase 1 成果物   | `docs/30-workflows/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-1-requirements.md` |
| AuthGuard 型定義 | `apps/desktop/src/renderer/components/AuthGuard/types.ts`                                  |
| getAuthState     | `apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts`                     |
| useAuthState     | `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts`                     |
| App.tsx          | `apps/desktop/src/renderer/App.tsx`                                                        |
| 状態管理ルール   | `.claude/rules/03-state-management.md`                                                     |

## 統合テスト連携

- getAuthState の新パラメータ `isTimedOut` が既存テストに影響する可能性あり → Phase 4 で既存テスト更新
- AuthGuard の switch 文に新ケース追加 → 既存テストの網羅性チェック

## 成果物

| 成果物 | パス                                                                                 |
| ------ | ------------------------------------------------------------------------------------ |
| 設計書 | `docs/30-workflows/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-2-design.md` |

## 完了条件

- [ ] AuthGuardDisplayState 型拡張が設計されていること
- [ ] useAuthState フックのタイムアウトロジックが設計されていること
- [ ] getAuthState 関数の拡張が設計されていること
- [ ] 状態遷移図が作成されていること
- [ ] AuthTimeoutFallback UIが Apple HIG 準拠で設計されていること
- [ ] Settings 除外ルートが設計されていること
- [ ] セキュリティ影響分析が完了していること
- [ ] P31/P48/P13/P39 の対策が設計に組み込まれていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 3: 設計レビューへ進む。要件・設計の妥当性を検証する。

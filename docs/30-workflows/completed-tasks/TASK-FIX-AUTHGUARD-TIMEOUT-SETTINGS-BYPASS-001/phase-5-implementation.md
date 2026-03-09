# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 5                                              |
| Phase名    | 実装                                           |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 4                                        |
| 後続Phase  | Phase 6                                        |

## 目的

Phase 4 で作成したテストを Green にするためのプロダクションコードを実装する。

## 実行タスク

### タスク1: AuthGuardDisplayState 型拡張

**目的**: `"timed-out"` 状態を型に追加する

**対象ファイル**: `apps/desktop/src/renderer/components/AuthGuard/types.ts`

**変更内容**:

```typescript
// L24-27: AuthGuardDisplayState に "timed-out" を追加
export type AuthGuardDisplayState =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "timed-out";
```

**影響確認**:

- `assertNever` は switch 文の default ケースで使用されるため、新状態追加時に既存の switch 文がコンパイルエラーになる → これにより修正漏れを検出できる

### タスク2: getAuthState 関数拡張

**目的**: タイムアウト状態の判定ロジックを追加する

**対象ファイル**: `apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts`

**変更内容**:

1. `AuthStateInput` に `isTimedOut` を追加
2. 判定ロジックに `isTimedOut && isLoading` を追加

```typescript
export interface AuthStateInput {
  isLoading: boolean;
  isAuthenticated: boolean;
  isTimedOut: boolean; // 追加
}

export const getAuthState = ({
  isLoading,
  isAuthenticated,
  isTimedOut,
}: AuthStateInput): AuthGuardDisplayState => {
  // タイムアウト済みかつまだローディング中
  if (isTimedOut && isLoading) return "timed-out";

  // ローディング中（タイムアウト前）
  if (isLoading) return "checking";

  // 認証済み
  if (isAuthenticated) return "authenticated";

  // 未認証
  return "unauthenticated";
};
```

### タスク3: useAuthState フック拡張

**目的**: タイムアウト管理ロジックを追加する

**対象ファイル**: `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts`

**変更内容**:

```typescript
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
    if (!isLoading) {
      setIsTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, AUTH_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isLoading]);

  return getAuthState({ isLoading, isAuthenticated, isTimedOut });
};
```

**P31準拠確認**:

- `useAppStore((state) => state.isAuthenticated)` — 個別セレクタ使用 ✓
- `useAppStore((state) => state.isLoading)` — 個別セレクタ使用 ✓
- 合成Hook不使用 ✓
- `useEffect` 依存配列に `isLoading` のみ（Zustand の state 参照は安定） ✓

### タスク4: AuthTimeoutFallback コンポーネント作成

**目的**: タイムアウト時に表示するフォールバックUIを実装する

**新規ファイル**: `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx`

**実装内容**:

```typescript
import type { FC } from "react";
import { Icon } from "../atoms/Icon";

interface AuthTimeoutFallbackProps {
  onRetry: () => void;
  onNavigateSettings: () => void;
}

export const AuthTimeoutFallback: FC<AuthTimeoutFallbackProps> = ({
  onRetry,
  onNavigateSettings,
}) => {
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--bg-primary)]"
      role="alert"
      aria-label="認証タイムアウト"
    >
      {/* アイコン */}
      <div className="mb-6">
        <Icon name="alert-triangle" size={48} className="text-[var(--status-warning)]" />
      </div>

      {/* メッセージ */}
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        認証の確認に時間がかかっています
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-8 text-center max-w-md px-4">
        ネットワーク接続を確認するか、以下のオプションをお試しください
      </p>

      {/* ボタン群 */}
      <div className="flex flex-col gap-3 w-64">
        <button
          type="button"
          onClick={onRetry}
          className="w-full px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium
                     hover:opacity-90 active:opacity-80 transition-opacity duration-200"
          aria-label="リトライ"
        >
          リトライ
        </button>
        <button
          type="button"
          onClick={onNavigateSettings}
          className="w-full px-6 py-3 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium
                     hover:opacity-90 active:opacity-80 transition-opacity duration-200"
          aria-label="設定画面へ"
        >
          設定画面へ
        </button>
      </div>
    </div>
  );
};

AuthTimeoutFallback.displayName = "AuthTimeoutFallback";
```

**Apple HIG 準拠**:

- CSS変数によるライト/ダーク自動切替
- 8pxグリッドスペーシング（mb-2=8px, mb-6=24px, mb-8=32px, gap-3=12px, py-3=12px, px-6=24px）
- 角丸: `rounded-lg`（8px）
- ホバー/アクティブ状態のフィードバック: `hover:opacity-90 active:opacity-80`
- トランジション: `transition-opacity duration-200`（200ms）
- コントラスト比: CSS変数がWCAG 2.1 AA準拠の値を保証

### タスク5: AuthGuard コンポーネント更新

**目的**: `"timed-out"` ケースの処理を追加する

**対象ファイル**: `apps/desktop/src/renderer/components/AuthGuard/index.tsx`

**変更内容**:

1. `AuthTimeoutFallback` のインポート追加
2. switch 文に `"timed-out"` ケース追加
3. `initializeAuth` と `setCurrentView` の取得追加

```typescript
import { AuthTimeoutFallback } from "./AuthTimeoutFallback";

export const AuthGuard: FC<AuthGuardProps> = ({ children, fallback }) => {
  const authState = useAuthState();
  const setDevModeAuth = useAppStore((state) => state.setDevModeAuth);
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const setCurrentView = useAppStore((state) => state.setCurrentView);

  // 開発モードでの自動ログイン（既存コード）
  useEffect(() => { /* ... */ }, [authState, setDevModeAuth]);

  switch (authState) {
    case "checking":
      return fallback ?? <LoadingScreen />;

    case "timed-out":
      return (
        <AuthTimeoutFallback
          onRetry={() => initializeAuth()}
          onNavigateSettings={() => setCurrentView("settings")}
        />
      );

    case "authenticated":
      return children;

    case "unauthenticated":
      if (isDevMode()) {
        return fallback ?? <LoadingScreen />;
      }
      return <AuthView />;
  }
};
```

### タスク6: App.tsx Settings state-based bypass 追加

**目的**: Settings 画面だけを既存の state-based navigation のまま AuthGuard 外に配置する

**対象ファイル**: `apps/desktop/src/renderer/App.tsx`

**変更内容**:

`/settings` 直ルートは追加せず、catch-all の app shell で `currentView === "settings"` のときだけ AuthGuard を bypass する。

```typescript
const renderAppShell = () =>
  useGlobalNavStrip ? (
    <AppLayout
      currentView={currentView as DockViewType}
      onViewChange={(view) => handleViewChange(view as ViewType)}
      onGoBack={handleGoBack}
      canGoBack={canGoBack}
    >
      {renderView()}
    </AppLayout>
  ) : (
    renderLegacyShell()
  );

return (
  <BrowserRouter>
    <Routes>
      {/* direct route は既存どおり保護 */}
      <Route path="/agent" element={<AuthGuard>{agentPage}</AuthGuard>} />
      {/* ... 既存 direct route ... */}

      {/* 既存の view-based shell */}
      <Route
        path="*"
        element={
          currentView === "settings" ? (
            renderAppShell()
          ) : (
            <AuthGuard>{renderAppShell()}</AuthGuard>
          )
        }
      />
    </Routes>
  </BrowserRouter>
);
```

**注意点**:

- bypass 条件は `currentView === "settings"` のみに限定し、他の ViewType へ拡大しない
- direct URL route は個別に `<AuthGuard>` で保護し、今回の bypass を波及させない
- AuthTimeoutFallback の Settings 遷移ボタンは `setCurrentView("settings")` を使用する

### タスク7: AuthTimeoutFallback の Settings 遷移ロジック更新

**目的**: AuthTimeoutFallback から Settings への遷移を既存の view-based navigation に揃える

**変更内容**: AuthGuard 内で `setCurrentView("settings")` を使用して Settings 遷移を実装

```typescript
export const AuthGuard: FC<AuthGuardProps> = ({ children, fallback }) => {
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  // ...

  case "timed-out":
    return (
      <AuthTimeoutFallback
        onRetry={() => initializeAuth()}
        onNavigateSettings={() => setCurrentView("settings")}
      />
    );
};
```

## 参照資料

| 参照資料             | パス                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-2-design.md`        |
| Phase 4 テスト       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-4-test-creation.md` |
| AuthGuard 既存コード | `apps/desktop/src/renderer/components/AuthGuard/`                                                           |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                        | 内容                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store設計・個別セレクタ（P31対策）・isLoadingフロー                    |
| 認証セキュリティ設計   | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | AuthGuardセッション待機・initializeAuth設計                                    |
| 実装パターン集         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Graceful Degradation(S30)・個別セレクタパターン(S18)                           |
| ナビゲーション UI仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | `currentView` / AppDock / shortcut と Settings 導線の整合                      |
| Settings UI仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                       | Settings画面レイヤー構成・AuthGuard除外時のUI遷移                              |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ（タイムアウト→3000番台: External Service Error → リトライ可能） |

## 統合テスト連携

- 各タスク完了後に対応するテストを実行し、Green になることを確認
- 全タスク完了後に全テストスイートを実行（`cd apps/desktop && pnpm vitest run`）

## 成果物

| 成果物                   | パス                                                                     |
| ------------------------ | ------------------------------------------------------------------------ |
| 型定義更新               | `apps/desktop/src/renderer/components/AuthGuard/types.ts`                |
| getAuthState 更新        | `apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts`   |
| useAuthState 更新        | `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts`   |
| AuthTimeoutFallback 新規 | `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx` |
| AuthGuard 更新           | `apps/desktop/src/renderer/components/AuthGuard/index.tsx`               |
| App.tsx 更新             | `apps/desktop/src/renderer/App.tsx`                                      |

## 完了条件

- [ ] `AuthGuardDisplayState` に `"timed-out"` が追加されていること
- [ ] `getAuthState` が `isTimedOut` パラメータを受け取り正しく判定すること
- [ ] `useAuthState` が10秒タイムアウト後に `"timed-out"` を返すこと
- [ ] `AuthTimeoutFallback` が Apple HIG 準拠で実装されていること
- [ ] `AuthGuard` が `"timed-out"` 時に `AuthTimeoutFallback` を表示すること
- [ ] Settings 画面が AuthGuard 外のルートでアクセス可能であること
- [ ] Phase 4 の全テストが Green になっていること
- [ ] 既存テストが全て PASS すること
- [ ] P31/P48 準拠のセレクタ設計であること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 6: テスト拡充へ進む。カバレッジ不足箇所のテストを追加する。

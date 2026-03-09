# Phase 2: 設計レポート

## タスク ID

TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## 前提

Phase 1 要件定義レポートの AC-1 から AC-8 を実現する設計を定義する。

---

## 1. AuthGuardDisplayState 型拡張設計

### 1.1 変更対象

`apps/desktop/src/renderer/components/AuthGuard/types.ts`

### 1.2 変更内容

```typescript
// Before
export type AuthGuardDisplayState =
  | "checking"
  | "authenticated"
  | "unauthenticated";

// After
export type AuthGuardDisplayState =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "timed-out";
```

### 1.3 AuthGuardState Discriminated Union 拡張

```typescript
// After
export type AuthGuardState =
  | { status: "checking" }
  | { status: "authenticated"; user: AuthUser }
  | { status: "unauthenticated" }
  | { status: "timed-out" };
```

### 1.4 型ガード追加

```typescript
export const isTimedOut = (
  state: AuthGuardState,
): state is { status: "timed-out" } => {
  return state.status === "timed-out";
};
```

### 1.5 assertNever との整合性

`AuthGuardDisplayState` に `"timed-out"` を追加することで、既存の switch 文で `"timed-out"` ケースを処理しない場合、TypeScript コンパイラが `assertNever` の引数型チェックでエラーを報告する。これにより網羅性が保証される。

---

## 2. getAuthState 拡張設計

### 2.1 変更対象

`apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts`

### 2.2 AuthStateInput 拡張

```typescript
// Before
export interface AuthStateInput {
  isLoading: boolean;
  isAuthenticated: boolean;
}

// After
export interface AuthStateInput {
  isLoading: boolean;
  isAuthenticated: boolean;
  isTimedOut?: boolean; // オプショナル（後方互換）
}
```

### 2.3 関数ロジック拡張

```typescript
export const getAuthState = ({
  isLoading,
  isAuthenticated,
  isTimedOut = false,
}: AuthStateInput): AuthGuardDisplayState => {
  // タイムアウト判定を最優先
  // isLoading が true かつ isTimedOut が true の場合のみ timed-out
  if (isLoading && isTimedOut) return "timed-out";

  // ローディング中は checking
  if (isLoading) return "checking";

  // 認証済み
  if (isAuthenticated) return "authenticated";

  // 未認証
  return "unauthenticated";
};
```

### 2.4 設計判断

- `isTimedOut` をオプショナルパラメータ（デフォルト `false`）にすることで、既存の呼び出し箇所（`isTimedOut` を渡さない箇所）の動作に影響を与えない
- タイムアウト判定は `isLoading && isTimedOut` の AND 条件。`isLoading` が `false` に戻った場合（認証完了）はタイムアウト状態を解除する
- 判定順序: `timed-out` > `checking` > `authenticated` > `unauthenticated`

---

## 3. useAuthState タイムアウトロジック設計

### 3.1 変更対象

`apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts`

### 3.2 タイムアウト定数

```typescript
/** AuthGuard タイムアウト時間（ミリ秒） */
export const AUTH_GUARD_TIMEOUT_MS = 10_000; // 10秒
```

### 3.3 フック実装設計

```typescript
import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "../../../store";
import { getAuthState } from "../utils/getAuthState";
import type { AuthGuardDisplayState } from "../types";

export const AUTH_GUARD_TIMEOUT_MS = 10_000;

export const useAuthState = (): {
  state: AuthGuardDisplayState;
  retry: () => void;
} => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);
  const initializeAuth = useAppStore((state) => state.initializeAuth);

  const [isTimedOut, setIsTimedOut] = useState(false);

  // isLoading が true になったらタイマー開始、false になったらリセット
  useEffect(() => {
    if (!isLoading) {
      setIsTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, AUTH_GUARD_TIMEOUT_MS);

    return () => clearTimeout(timer); // P5 対策: cleanup 必須
  }, [isLoading]);

  // 再試行コールバック
  const retry = useCallback(() => {
    setIsTimedOut(false);
    initializeAuth();
  }, [initializeAuth]);

  const state = getAuthState({ isLoading, isAuthenticated, isTimedOut });

  return { state, retry };
};
```

### 3.4 戻り値型の変更

**Before**: `AuthGuardDisplayState`（文字列リテラル）

**After**: `{ state: AuthGuardDisplayState; retry: () => void }`（オブジェクト）

この変更により AuthGuard コンポーネント側で `retry` 関数を受け取れる。

### 3.5 P31 準拠の確認

- `isAuthenticated`, `isLoading`, `initializeAuth` は全て個別セレクタで取得
- `retry` は `useCallback` でメモ化し、依存配列は `[initializeAuth]`（Zustand アクション参照は安定）
- `useState` の `setIsTimedOut` は React が参照安定性を保証

---

## 4. 状態遷移図

```
            [アプリ起動]
                |
                v
        isLoading = true
                |
                v
    +--- "checking" (LoadingScreen) ---+
    |                                   |
    |  10秒経過 & isLoading=true       |  isLoading=false
    |       |                           |       |
    |       v                           |       v
    | "timed-out"                       |  isAuthenticated?
    | (AuthTimeoutFallback)             |    /         \
    |       |                           |  true       false
    |  [再試行ボタン]                   |   |           |
    |       |                           |   v           v
    |  setIsTimedOut(false)             | "authenticated" "unauthenticated"
    |  initializeAuth()                 | (children)    (AuthView)
    |       |                           |
    +-------+---------------------------+
```

### 4.1 状態遷移テーブル

| 現在の状態      | イベント                                | 次の状態        | アクション                                       |
| --------------- | --------------------------------------- | --------------- | ------------------------------------------------ |
| checking        | 10秒経過 & isLoading=true               | timed-out       | setIsTimedOut(true)                              |
| checking        | isLoading=false & isAuthenticated=true  | authenticated   | なし                                             |
| checking        | isLoading=false & isAuthenticated=false | unauthenticated | なし                                             |
| timed-out       | 再試行ボタン押下                        | checking        | setIsTimedOut(false), initializeAuth()           |
| timed-out       | isLoading=false & isAuthenticated=true  | authenticated   | setIsTimedOut(false)（useEffect で自動リセット） |
| timed-out       | isLoading=false & isAuthenticated=false | unauthenticated | setIsTimedOut(false)（useEffect で自動リセット） |
| authenticated   | Store の isAuthenticated=false          | unauthenticated | なし                                             |
| unauthenticated | Store の isAuthenticated=true           | authenticated   | なし                                             |

### 4.2 無限ループ防止の検証

1. `setIsTimedOut` は `useEffect` 内で `isLoading` が変化した場合のみ実行される
2. `isTimedOut` の変更は `getAuthState` の戻り値を変えるが、`useEffect` の依存配列 `[isLoading]` には含まれないため、タイマー再起動は発生しない
3. `retry` は `isTimedOut` をリセットし `initializeAuth` を呼ぶが、`initializeAuth` は Store 内の `isLoading` を `true` にするため、`useEffect` が再起動してタイマーが正常にリスタートする

---

## 5. AuthTimeoutFallback UI 設計

### 5.1 新規ファイル

`apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx`

### 5.2 Props 定義

```typescript
export interface AuthTimeoutFallbackProps {
  /** 再試行コールバック */
  onRetry: () => void;
  /** 設定画面へ遷移するコールバック */
  onNavigateToSettings: () => void;
}
```

### 5.3 コンポーネント構造

```
AuthTimeoutFallback (organisms レベル)
  +-- Icon (atoms: exclamationTriangle)
  +-- Heading (h1: "認証の確認に時間がかかっています")
  +-- Description (p: 説明テキスト)
  +-- ButtonGroup
  |     +-- Button (primary: "再試行")
  |     +-- Button (secondary: "設定画面へ")
```

### 5.4 Apple HIG 準拠デザイン

#### レイアウト

- 全画面中央配置（`h-screen w-screen flex flex-col items-center justify-center`）
- 背景色: `bg-[var(--bg-primary)]`（ライト: `#FFFFFF` / ダーク: `#000000`）
- 8px グリッドに基づくスペーシング

#### カラー

- 警告アイコン: `text-[var(--status-warning)]`（ライト: `#FF9500` / ダーク: `#FF9F0A`）
- プライマリテキスト: `text-[var(--text-primary)]`
- セカンダリテキスト: `text-[var(--text-secondary)]`
- プライマリボタン: `bg-[var(--accent-primary)]`（ライト: `#007AFF` / ダーク: `#0A84FF`）
- セカンダリボタン: `bg-[var(--bg-tertiary)]`

#### タイポグラフィ

- 見出し: `text-xl font-semibold`（システムフォント）
- 説明: `text-sm`、行間 `leading-relaxed`

#### ボタン

- 角丸: `rounded-lg`（8px）
- パディング: `px-6 py-3`（8px グリッド準拠）
- ホバー: `opacity-90` トランジション `transition-opacity duration-200`
- フォーカス: `focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2`

### 5.5 アクセシビリティ

```tsx
<div
  role="alert"
  aria-label="認証タイムアウト"
  aria-live="assertive"
  className="..."
>
  {/* コンテンツ */}
  <button type="button" aria-label="認証を再試行">
    再試行
  </button>
  <button type="button" aria-label="設定画面を開く">
    設定画面へ
  </button>
</div>
```

- `role="alert"` + `aria-live="assertive"`: タイムアウト発生をスクリーンリーダーに即座に通知
- ボタンに `aria-label` を付与
- Tab キーでボタン間を移動可能
- Enter / Space でボタンを押下可能

---

## 6. Settings バイパス設計

### 6.1 設計方針

Settings バイパスは **AuthGuard コンポーネント内部** で実装する。App.tsx のルーティング構造は変更しない。

理由:

- App.tsx の構造変更は影響範囲が大きい（全ルートに波及）
- AuthGuard に `bypassForSettings` ロジックを集約することで、バイパス条件の一元管理が可能
- テストの書きやすさ（AuthGuard 単体テストでバイパスを検証可能）

### 6.2 AuthGuardProps 拡張

```typescript
export interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  /** Settings ビューかどうか（AuthGuard バイパス判定用） */
  isSettingsView?: boolean;
}
```

### 6.3 App.tsx 側の変更

```tsx
// Before
<AuthGuard>
  <Routes>...</Routes>
</AuthGuard>

// After
<AuthGuard isSettingsView={currentView === "settings"}>
  <Routes>...</Routes>
</AuthGuard>
```

### 6.4 AuthGuard switch 文の変更

```typescript
export const AuthGuard: FC<AuthGuardProps> = ({
  children,
  fallback,
  isSettingsView = false,
}) => {
  const { state: authState, retry } = useAuthState();
  const setDevModeAuth = useAppStore((state) => state.setDevModeAuth);
  const setCurrentView = useAppStore((state) => state.setCurrentView);

  // Settings バイパス: 認証状態に関係なく children を表示
  if (isSettingsView) {
    return children;
  }

  // 開発モードでの自動ログイン（既存ロジック維持）
  useEffect(() => {
    if (isDevMode() && authState === "unauthenticated") {
      const mockData = getMockAuthData();
      setDevModeAuth(mockData.user);
    }
  }, [authState, setDevModeAuth]);

  switch (authState) {
    case "checking":
      return fallback ?? <LoadingScreen />;

    case "timed-out":
      return (
        <AuthTimeoutFallback
          onRetry={retry}
          onNavigateToSettings={() => setCurrentView("settings")}
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

### 6.5 設計上の制約

1. **条件付き Hook 呼び出しの回避**: `isSettingsView` による早期 return は、`useAuthState()` と `useAppStore()` 呼び出しの**後**に配置する。React の Hook ルール（条件付き Hook 呼び出し禁止）を遵守するため
2. **useEffect の条件付き実行**: 開発モード自動ログインの `useEffect` は `isSettingsView` が `true` でも実行されるが、`authState` が変化しないため実質的に no-op

### 6.6 修正: Hook ルール準拠の構造

```typescript
export const AuthGuard: FC<AuthGuardProps> = ({
  children,
  fallback,
  isSettingsView = false,
}) => {
  // Hook は全て先頭で呼び出す（条件分岐の前）
  const { state: authState, retry } = useAuthState();
  const setDevModeAuth = useAppStore((state) => state.setDevModeAuth);
  const setCurrentView = useAppStore((state) => state.setCurrentView);

  // 開発モードでの自動ログイン
  useEffect(() => {
    if (isSettingsView) return; // Settings バイパス時はスキップ
    if (isDevMode() && authState === "unauthenticated") {
      const mockData = getMockAuthData();
      logDevModeStatus();
      setDevModeAuth(mockData.user);
    }
  }, [authState, setDevModeAuth, isSettingsView]);

  // Settings バイパス: Hook 呼び出しの後で早期 return
  if (isSettingsView) {
    return children;
  }

  switch (authState) {
    case "checking":
      return fallback ?? <LoadingScreen />;

    case "timed-out":
      return (
        <AuthTimeoutFallback
          onRetry={retry}
          onNavigateToSettings={() => setCurrentView("settings")}
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

---

## 7. セキュリティ影響分析

### 7.1 最小権限

- Settings バイパスは Renderer 内の UI 表示制御のみ。Main Process の IPC ハンドラには影響しない
- Settings 画面内の機密操作（API キー取得等）は IPC 経由で Main Process に問い合わせ、Main Process 側で認証バリデーションが行われる

### 7.2 多層防御

| 防御層                   | 本タスクの影響                                           |
| ------------------------ | -------------------------------------------------------- |
| AuthGuard（Renderer）    | `"timed-out"` ケース追加。保護対象コンテンツは表示しない |
| IPC ハンドラ（Main）     | 変更なし。引き続き全リクエストをバリデーション           |
| Preload（contextBridge） | 変更なし。ホワイトリスト管理は維持                       |
| CSP                      | 変更なし                                                 |

### 7.3 フェイルセキュア

- タイムアウト時は `"timed-out"` 状態。`children`（保護対象コンテンツ）は **表示しない**
- フォールバック UI は「再試行」と「設定画面へ」のみ提供
- `"timed-out"` から `"authenticated"` への遷移は、Store の `isAuthenticated` が `true` かつ `isLoading` が `false` になった場合のみ

### 7.4 完全仲介

- Settings バイパスは `isSettingsView` prop によるもの。この prop は `App.tsx` で `currentView === "settings"` から算出される
- `currentView` は Zustand Store の内部状態であり、URL パラメータやクエリ文字列からは設定不可
- ユーザーが DevTools で Store を直接操作した場合でも、Renderer 内部の操作であり、Main Process の認証には影響しない

---

## 8. 変更ファイル一覧

| ファイル                                 | 変更種別 | 内容                                                                                            |
| ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `AuthGuard/types.ts`                     | 修正     | `AuthGuardDisplayState` に `"timed-out"` 追加、`AuthGuardState` 拡張、`isTimedOut` 型ガード追加 |
| `AuthGuard/utils/getAuthState.ts`        | 修正     | `AuthStateInput` に `isTimedOut` 追加、判定ロジック拡張                                         |
| `AuthGuard/hooks/useAuthState.ts`        | 修正     | タイムアウトロジック追加、戻り値型変更                                                          |
| `AuthGuard/index.tsx`                    | 修正     | switch 文に `"timed-out"` ケース追加、`isSettingsView` prop 追加                                |
| `AuthGuard/AuthTimeoutFallback.tsx`      | 新規     | タイムアウト時フォールバック UI コンポーネント                                                  |
| `App.tsx`                                | 修正     | `<AuthGuard isSettingsView={currentView === "settings"}>` に変更                                |
| `AuthGuard/utils/getAuthState.test.ts`   | 修正     | `isTimedOut` パラメータのテスト追加                                                             |
| `AuthGuard/AuthGuard.test.tsx`           | 修正     | timed-out ケース、Settings バイパスのテスト追加                                                 |
| `AuthGuard/AuthTimeoutFallback.test.tsx` | 新規     | フォールバック UI のテスト                                                                      |
| `AuthGuard/hooks/useAuthState.test.ts`   | 新規     | タイムアウトロジックのテスト                                                                    |

---

## 9. 次フェーズ

Phase 3（設計レビュー）へ進む。

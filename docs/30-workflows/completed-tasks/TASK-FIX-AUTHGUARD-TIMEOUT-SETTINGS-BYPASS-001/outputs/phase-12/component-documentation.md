# コンポーネントドキュメント - TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001        |
| 対象       | `AuthTimeoutFallback`, `useAuthState`, `getAuthState` |
| ステータス | 実装済み                                              |
| 作成日     | 2026-03-09                                            |

---

## 1. AuthTimeoutFallback コンポーネント

### 概要

認証確認が10秒以上かかった場合に表示されるフォールバックUI。ユーザーにリトライと設定画面への遷移の2つの選択肢を提供する。

**ファイル**: `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx`

### Props

```typescript
interface AuthTimeoutFallbackProps {
  /** リトライボタンクリック時のコールバック */
  onRetry: () => void;
  /** 設定画面への遷移ボタンクリック時のコールバック */
  onNavigateSettings: () => void;
}
```

| Prop                 | 型           | 必須 | 説明                                                                                             |
| -------------------- | ------------ | ---- | ------------------------------------------------------------------------------------------------ |
| `onRetry`            | `() => void` | 必須 | リトライボタン押下時に呼ばれるコールバック。AuthGuard では `initializeAuth()` を渡す             |
| `onNavigateSettings` | `() => void` | 必須 | 設定画面へボタン押下時に呼ばれるコールバック。AuthGuard では `setCurrentView("settings")` を渡す |

### 使用例

```tsx
import { AuthTimeoutFallback } from "./AuthTimeoutFallback";

// AuthGuard 内での使用（実際の実装）
<AuthTimeoutFallback
  onRetry={() => initializeAuth()}
  onNavigateSettings={() => setCurrentView("settings")}
/>;
```

### UI構造

```
div (h-screen w-screen flex flex-col items-center justify-center)
  [role="alert" aria-label="認証タイムアウト"]
  |
  +-- div (mb-6)
  |     +-- Icon (name="alert-triangle" size=48 color=--status-warning)
  |
  +-- h2 "認証の確認に時間がかかっています"
  |     (text-xl font-semibold text-[var(--text-primary)] mb-2)
  |
  +-- p "ネットワーク接続を確認するか、以下のオプションをお試しください"
  |     (text-sm text-[var(--text-secondary)] mb-8 text-center max-w-md px-4)
  |
  +-- div (flex flex-col gap-3 w-64)
        +-- button "リトライ" [onClick=onRetry]
        |     (rounded-lg bg-[var(--accent-primary)] text-white)
        |     (aria-label="リトライ")
        |
        +-- button "設定画面へ" [onClick=onNavigateSettings]
              (rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)])
              (aria-label="設定画面へ")
```

### デザイントークン

| 要素                   | CSS変数            | 用途                               |
| ---------------------- | ------------------ | ---------------------------------- |
| 全体背景               | `--bg-primary`     | メイン背景色                       |
| 見出しテキスト         | `--text-primary`   | プライマリテキスト色               |
| 補足テキスト           | `--text-secondary` | セカンダリテキスト色               |
| 警告アイコン           | `--status-warning` | 警告状態の色（systemOrange準拠）   |
| リトライボタン背景     | `--accent-primary` | アクセントカラー（systemBlue準拠） |
| リトライボタンテキスト | 白 (`text-white`)  | ボタン上の白テキスト               |
| 設定ボタン背景         | `--bg-tertiary`    | ターシャリ背景色                   |
| 設定ボタンテキスト     | `--text-primary`   | プライマリテキスト色               |

### インタラクション

- ホバー: `opacity-90`
- アクティブ: `opacity-80`
- トランジション: `transition-opacity duration-200`（200ms）

### アクセシビリティ

- ルート要素に `role="alert"` と `aria-label="認証タイムアウト"` を設定
- 各ボタンに `aria-label` を設定
- `type="button"` を明示（フォーム送信防止）

### displayName

`"AuthTimeoutFallback"` を設定。React DevTools でのコンポーネント識別に使用。

---

## 2. useAuthState フック

### 概要

Zustand ストアから認証状態を取得し、`AuthGuardDisplayState` に変換するカスタムフック。10秒のタイムアウト機構を内蔵し、認証確認が長時間かかる場合にフォールバックUIへの遷移を可能にする。

**ファイル**: `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts`

### エクスポート

```typescript
/** 認証タイムアウト時間（ミリ秒） */
export const AUTH_TIMEOUT_MS = 10_000;

/** 認証状態を取得するカスタムフック */
export const useAuthState = (): AuthGuardDisplayState;
```

### 定数

| 名前              | 値              | 説明                                                                                                          |
| ----------------- | --------------- | ------------------------------------------------------------------------------------------------------------- |
| `AUTH_TIMEOUT_MS` | `10_000` (10秒) | 認証確認のタイムアウト時間。この時間を超えて `isLoading` が `true` のままの場合、`"timed-out"` 状態に遷移する |

### 戻り値

| 値                  | 条件                                                   | 説明                   |
| ------------------- | ------------------------------------------------------ | ---------------------- |
| `"checking"`        | `isLoading === true` かつ `isTimedOut === false`       | 認証確認中（10秒以内） |
| `"timed-out"`       | `isLoading === true` かつ `isTimedOut === true`        | 認証確認が10秒超過     |
| `"authenticated"`   | `isLoading === false` かつ `isAuthenticated === true`  | 認証済み               |
| `"unauthenticated"` | `isLoading === false` かつ `isAuthenticated === false` | 未認証                 |

### 内部動作

1. `useAppStore` から `isAuthenticated` と `isLoading` を個別セレクタで取得（P31準拠）
2. `useState` で `isTimedOut` フラグを管理
3. `useEffect` で `isLoading` の変化を監視:
   - `isLoading === true`: `setTimeout(AUTH_TIMEOUT_MS)` でタイマー開始
   - `isLoading === false`: `setIsTimedOut(false)` でリセット + `clearTimeout` でタイマーキャンセル
4. `getAuthState({ isLoading, isAuthenticated, isTimedOut })` で表示状態を計算

### 使用例

```tsx
import { useAuthState } from "./hooks/useAuthState";

const MyComponent = () => {
  const authState = useAuthState();

  switch (authState) {
    case "checking":
      return <LoadingScreen />;
    case "timed-out":
      return <AuthTimeoutFallback onRetry={...} onNavigateSettings={...} />;
    case "authenticated":
      return <Dashboard />;
    case "unauthenticated":
      return <LoginPage />;
  }
};
```

### P31/P48/P13 準拠ポイント

| 準拠項目                            | 実装内容                                                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| P31（合成Hook無限ループ防止）       | `useAppStore((state) => state.isAuthenticated)` のように個別セレクタで取得。`useAuthModeStore()` 等の合成Hookは不使用 |
| P48（派生セレクタ無限ループ防止）   | プリミティブ値（`boolean`）のみ取得。`.filter()` / `.map()` による新しい参照の生成なし。`useShallow` 不要             |
| P13（タイマーテスト無限ループ防止） | `setTimeout` を使用。テスト時は `vi.advanceTimersByTime(AUTH_TIMEOUT_MS)` で進める                                    |
| P5（リスナー二重登録防止）          | `useEffect` のクリーンアップで `clearTimeout` を確実に実行                                                            |

### テスト時の注意

```typescript
// fake timer を使用
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

// タイムアウトテスト
act(() => {
  vi.advanceTimersByTime(AUTH_TIMEOUT_MS);
});

// P39: happy-dom 環境では userEvent 禁止、fireEvent を使用
fireEvent.click(retryButton);
```

---

## 3. getAuthState 関数

### 概要

認証状態を判定する純粋関数。Zustand ストアから独立しており、単体テストが容易。

**ファイル**: `apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts`

### インターフェース

```typescript
export interface AuthStateInput {
  /** ローディング中かどうか */
  isLoading: boolean;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** タイムアウトしたかどうか */
  isTimedOut: boolean;
}
```

| パラメータ        | 型        | 説明                                                           |
| ----------------- | --------- | -------------------------------------------------------------- |
| `isLoading`       | `boolean` | Zustand ストアの `isLoading` 値。認証初期化中は `true`         |
| `isAuthenticated` | `boolean` | Zustand ストアの `isAuthenticated` 値。認証済みなら `true`     |
| `isTimedOut`      | `boolean` | `useAuthState` フック内の `useState` で管理。10秒超過で `true` |

### シグネチャ

```typescript
export const getAuthState = (input: AuthStateInput): AuthGuardDisplayState;
```

### 判定ロジック

判定は以下の優先順位で行われる（上から順に評価、最初に一致した条件で返却）:

| 優先順位 | 条件                      | 戻り値              | 説明                                       |
| -------- | ------------------------- | ------------------- | ------------------------------------------ |
| 1        | `isTimedOut && isLoading` | `"timed-out"`       | タイムアウト発火済みかつローディング継続中 |
| 2        | `isLoading`               | `"checking"`        | タイムアウト前のローディング中             |
| 3        | `isAuthenticated`         | `"authenticated"`   | ロード完了かつ認証済み                     |
| 4        | それ以外                  | `"unauthenticated"` | ロード完了かつ未認証                       |

### 入出力マトリクス

| isLoading | isAuthenticated | isTimedOut | 結果                |
| --------- | --------------- | ---------- | ------------------- |
| `true`    | `false`         | `false`    | `"checking"`        |
| `true`    | `false`         | `true`     | `"timed-out"`       |
| `true`    | `true`          | `false`    | `"checking"`        |
| `true`    | `true`          | `true`     | `"timed-out"`       |
| `false`   | `true`          | `false`    | `"authenticated"`   |
| `false`   | `true`          | `true`     | `"authenticated"`   |
| `false`   | `false`         | `false`    | `"unauthenticated"` |
| `false`   | `false`         | `true`     | `"unauthenticated"` |

注: `isLoading === false` かつ `isTimedOut === true` の組み合わせは、`useAuthState` フックの設計上通常発生しない（`isLoading` が `false` になった時点で `isTimedOut` は `false` にリセットされる）。安全のため、`getAuthState` 側でも `isTimedOut && isLoading` の AND 条件で評価している。

### テスト例

```typescript
import { getAuthState } from "./getAuthState";

describe("getAuthState", () => {
  it("isLoading=true, isTimedOut=false で checking を返す", () => {
    expect(
      getAuthState({
        isLoading: true,
        isAuthenticated: false,
        isTimedOut: false,
      }),
    ).toBe("checking");
  });

  it("isLoading=true, isTimedOut=true で timed-out を返す", () => {
    expect(
      getAuthState({
        isLoading: true,
        isAuthenticated: false,
        isTimedOut: true,
      }),
    ).toBe("timed-out");
  });

  it("isLoading=false, isAuthenticated=true で authenticated を返す", () => {
    expect(
      getAuthState({
        isLoading: false,
        isAuthenticated: true,
        isTimedOut: false,
      }),
    ).toBe("authenticated");
  });

  it("isLoading=false, isAuthenticated=false で unauthenticated を返す", () => {
    expect(
      getAuthState({
        isLoading: false,
        isAuthenticated: false,
        isTimedOut: false,
      }),
    ).toBe("unauthenticated");
  });
});
```

---

## 再エクスポート一覧

`components/AuthGuard/index.tsx` から以下がエクスポートされている:

| エクスポート名           | 種別           | ソース                  |
| ------------------------ | -------------- | ----------------------- |
| `AuthGuard`              | コンポーネント | `index.tsx`             |
| `LoadingScreen`          | コンポーネント | `./LoadingScreen`       |
| `AuthErrorBoundary`      | コンポーネント | `./AuthErrorBoundary`   |
| `AuthTimeoutFallback`    | コンポーネント | `./AuthTimeoutFallback` |
| `useAuthState`           | フック         | `./hooks/useAuthState`  |
| `getAuthState`           | 関数           | `./utils/getAuthState`  |
| `isAuthenticated`        | 型ガード       | `./types`               |
| `isChecking`             | 型ガード       | `./types`               |
| `isUnauthenticated`      | 型ガード       | `./types`               |
| `isError`                | 型ガード       | `./types`               |
| `hasExpiresAt`           | 型ガード       | `./types`               |
| `assertNever`            | ヘルパー       | `./types`               |
| `AuthGuardProps`         | 型             | `./types`               |
| `AuthGuardDisplayState`  | 型             | `./types`               |
| `AuthGuardState`         | 型             | `./types`               |
| `AuthError`              | 型             | `./types`               |
| `AuthErrorCode`          | 型             | `./types`               |
| `AuthErrorBoundaryProps` | 型             | `./AuthErrorBoundary`   |
| `AuthStateInput`         | 型             | `./utils/getAuthState`  |

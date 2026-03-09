# 実装ガイド - TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| 作成日   | 2026-03-09                                     |
| Phase    | 12                                             |

---

## Part 1: やさしい解説（中学生レベル）

### ドアの前で鍵の確認が終わらないなら、別の入口を用意する

#### どんな問題？

家のドアに「鍵が正しいか確認する機械」がついているとします。

でも、その確認が終わらないと、ずっとドアの前で待たされてしまいます。「10分経っても確認できていない！」というときにも、ずっと待ち続けるしかない状態でした。

さらに困ったことに、家の電気のブレーカー（アプリの設定画面）も同じドアの中にあるので、鍵の確認が終わらないと電気の設定もできないという問題がありました。

#### どう直したの？

**対策1: タイムアウトを追加**

「10秒経っても鍵の確認が終わらなかったら、エラー画面を表示する」仕組みを追加しました。これで無限に待たされることがなくなります。

エラー画面では「もう一度試す」ボタンと「設定画面へ」ボタンが表示されます。

**対策2: 設定画面への別の入口を用意**

ブレーカー（設定画面）は鍵に関係なくアクセスできるように、別の入口を用意しました。鍵が壊れていても、電気の設定はできるようにするためです。

これにより「API キーを設定したいのに設定画面に入れない」というデッドロック（行き詰まり）が解消されます。

#### 修正前と修正後の比較

**修正前**:

```
鍵の確認開始
  → 確認が終わらない
  → ずっとローディング...（無限）
  → 設定画面にも入れない
  → API キーも設定できない ← 詰み
```

**修正後**:

```
鍵の確認開始（10秒タイムアウト）
  → 10秒経過 → エラー画面表示（「もう一度試す」「設定へ」）
               ↓
  または「設定」アイコンを直接クリック → 設定画面に直接アクセス可能
```

---

## Part 2: 開発者向け実装詳細

### 1. 問題の技術的説明

#### 無限ブロックの仕組み

```typescript
// AuthGuard/utils/getAuthState.ts
export const getAuthState = ({ isLoading, isAuthenticated }: AuthStateInput) => {
  if (isLoading) return "checking"; // ← isLoading=true が続く限りここで止まる
  if (isAuthenticated) return "authenticated";
  return "unauthenticated";
};

// AuthGuard/index.tsx
switch (authState) {
  case "checking":
    return fallback ?? <LoadingScreen />; // ← 全画面がブロックされる
  ...
}
```

`isLoading` が `true` の間、全ての画面（Settings 含む）が `<LoadingScreen />` で覆われます。

#### デッドロック構造

```
新規ユーザーのオンボーディング時:

API キーを設定したい
  → Settings 画面へ
  → AuthGuard が "checking" → LoadingScreen
  → isLoading = true（IPC ハングにより）
  → 永遠に Settings に到達できない
  → API キーを設定できない
  → ← デッドロック
```

### 2. 修正内容

#### 変更ファイル一覧

| ファイル                          | 変更内容                                        |
| --------------------------------- | ----------------------------------------------- |
| `AuthGuard/types.ts`              | `AuthGuardDisplayState` に `"timed-out"` を追加 |
| `AuthGuard/utils/getAuthState.ts` | `isTimedOut` パラメータを追加                   |
| `AuthGuard/hooks/useAuthState.ts` | タイムアウトロジックを追加                      |
| `AuthGuard/index.tsx`             | `"timed-out"` 時のフォールバック UI を追加      |
| `App.tsx`                         | Settings 除外ルートを追加                       |

#### 状態遷移図

```
App 起動
  ↓
AuthGuard: checking (0-10秒)
  ↓
  ├─(認証完了)──→ authenticated → アプリ表示
  ├─(認証失敗)──→ unauthenticated → AuthView（ログイン画面）
  └─(10秒経過)──→ timed-out → AuthTimeoutFallback UI
                                ├─ [もう一度試す] → checking に戻る
                                └─ [設定画面へ] → Settings に遷移
```

#### 型定義の拡張

```typescript
// AuthGuard/types.ts
export type AuthGuardDisplayState =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "timed-out"; // ← 新規追加
```

#### getAuthState の拡張

```typescript
// AuthGuard/utils/getAuthState.ts
export interface AuthStateInput {
  isLoading: boolean;
  isAuthenticated: boolean;
  isTimedOut?: boolean; // ← 新規追加（オプション）
}

export const getAuthState = ({
  isLoading,
  isAuthenticated,
  isTimedOut = false,
}: AuthStateInput): AuthGuardDisplayState => {
  // タイムアウト判定を最初に確認（isLoading より優先）
  if (isTimedOut) return "timed-out";
  if (isLoading) return "checking";
  if (isAuthenticated) return "authenticated";
  return "unauthenticated";
};
```

#### useAuthState のタイムアウトロジック

```typescript
// AuthGuard/hooks/useAuthState.ts
import { useState, useEffect } from "react";

export const AUTH_TIMEOUT_MS = 10_000; // 10秒

export const useAuthState = (): AuthGuardDisplayState => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsTimedOut(false); // 認証完了時にタイムアウト状態をリセット
      return;
    }

    const timeout = setTimeout(() => {
      setIsTimedOut(true); // 10秒後にタイムアウト
    }, AUTH_TIMEOUT_MS);

    return () => clearTimeout(timeout); // クリーンアップ
  }, [isLoading]);

  return getAuthState({ isLoading, isAuthenticated, isTimedOut });
};
```

#### AuthTimeoutFallback のUI構成

```typescript
// AuthGuard/index.tsx（追加部分）
case "timed-out":
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2>認証の確認に時間がかかっています</h2>
      <p>接続に問題が発生している可能性があります。</p>
      <button onClick={() => initializeAuth()}>もう一度試す</button>
      <button onClick={() => setCurrentView("settings")}>設定画面へ</button>
    </div>
  );
```

#### Settings 除外ルートのルーティング構造

```typescript
// App.tsx
return (
  <BrowserRouter>
    <AuthGuard>
      <Routes>
        {/* 認証が必要なルート */}
        <Route path="/dashboard" element={<DashboardView />} />
        {/* ... */}
      </Routes>
    </AuthGuard>

    {/* AuthGuard 外のルート（認証不要） */}
    <Routes>
      <Route
        path="/settings"
        element={<SettingsView />}
      />
    </Routes>
  </BrowserRouter>
);
```

または、State-based routing（現行の `currentView` ベース）の場合:

```typescript
// App.tsx の renderView() で settings を AuthGuard 外に出す
const renderView = () => {
  if (currentView === "settings") {
    return <SettingsView />; // AuthGuard なしで直接返す
  }
  // 他のビューは AuthGuard 内で処理
  ...
};
```

### 3. P31/P48 準拠のポイント

```typescript
// ✅ P31対策: 個別セレクタを使用（合成Hook禁止）
const isAuthenticated = useAppStore((state) => state.isAuthenticated);
const isLoading = useAppStore((state) => state.isLoading);
// ❌ P31違反: const { isAuthenticated, isLoading } = useAppStore();

// ✅ P48対策: useEffect の依存配列に安定した値のみ
useEffect(() => {
  // タイムアウトロジック
}, [isLoading]); // isLoading はプリミティブ型なので安定
```

### 4. テスト実装のポイント（P13/P39準拠）

```typescript
// P13対策: advanceTimersByTime を使用（runAllTimers は無限ループの危険）
it("should timeout after AUTH_TIMEOUT_MS", async () => {
  vi.useFakeTimers();

  const { result } = renderHook(() => useAuthState(), {
    wrapper: ({ children }) => (
      <MockProvider isLoading={true} isAuthenticated={false}>
        {children}
      </MockProvider>
    ),
  });

  expect(result.current).toBe("checking");

  await act(async () => {
    vi.advanceTimersByTime(AUTH_TIMEOUT_MS);
  });

  expect(result.current).toBe("timed-out");

  vi.useRealTimers();
});

// P39対策: happy-dom 環境では fireEvent を使用
it("should reset timeout when loading completes", async () => {
  // userEvent.setup() は使わない（P39）
  fireEvent.click(retryButton);
  // または
  await act(async () => {
    fireEvent.click(retryButton);
  });
});
```

### 5. App.tsx の viewリセットロジックとの関係（新規発見）

調査で追加発見された問題（P2 新規）:

```typescript
// App.tsx L100-105
useEffect(() => {
  if (!isAuthenticated && !isLoading && currentView !== "dashboard") {
    setCurrentView("dashboard"); // ← Settings → Dashboard に強制リセット
  }
}, [isAuthenticated, isLoading, currentView, setCurrentView]);
```

AuthGuard の修正と合わせて、このロジックに Settings 除外を追加する必要あり:

```typescript
// 修正案
if (
  !isAuthenticated &&
  !isLoading &&
  currentView !== "dashboard" &&
  currentView !== "settings"
) {
  // ← settings を除外
  setCurrentView("dashboard");
}
```

---

## 未タスク候補

| #   | 内容                                                | 理由                                                      | 優先度     |
| --- | --------------------------------------------------- | --------------------------------------------------------- | ---------- |
| 1   | Settings 画面内のプロファイルセクション条件付き表示 | 未認証時にプロファイルセクションを非表示にすべき可能性    | P3         |
| 2   | AuthTimeoutFallback のアニメーション追加            | LoadingScreen → AuthTimeoutFallback の遷移アニメーション  | P4         |
| 3   | タイムアウト時間の設定可能化                        | 10秒固定ではなくユーザー設定可能にする可能性              | P4         |
| 4   | App.tsx viewリセットロジック修正                    | `!isAuthenticated && !isLoading` 時に Settings を除外する | P2（優先） |

---

## 関連タスク

| タスク ID                                 | 関係                                   |
| ----------------------------------------- | -------------------------------------- |
| TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 | アプリ層の根本原因（最初に修正すべき） |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001           | IPC 層の防御（本タスクの前提修正）     |

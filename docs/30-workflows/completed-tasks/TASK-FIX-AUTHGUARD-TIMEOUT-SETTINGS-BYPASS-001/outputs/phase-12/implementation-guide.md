# 実装ガイド - TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| 作成日     | 2026-03-09                                     |
| Phase      | 12                                             |
| ステータス | 実装済み                                       |

---

## Part 1: やさしい解説（中学生レベル）

### ドアの前で鍵の確認が終わらないなら、別の入口を用意する

まず **なぜ必要か** を先に説明すると、認証確認が止まったままだとユーザーは API キーも設定できず、問題を自分で直せなくなるからです。**たとえば** 教室の鍵確認が終わらず、名簿や本棚の場所を見に行くことすらできない状態を避けるための仕組みです。

#### どんな問題？

家のドアに「鍵が正しいか確認する機械」がついているとします。

普通なら数秒で確認が終わって家に入れます。でも、もしこの機械が故障して、いつまで経っても「確認中...」のまま進まなかったら？ ずっとドアの前で立ち尽くすことになります。

さらに困ったことに、家の電気のブレーカー（アプリの設定画面）も同じドアの中にあるので、鍵の確認が終わらないと電気の設定もできないという問題がありました。

#### どう直したの？

**対策1: タイムアウトを追加**

「10秒経っても鍵の確認が終わらなかったら、待つのをやめて案内画面を表示する」仕組みを追加しました。

案内画面には2つの選択肢があります:

- 「リトライ」ボタン: もう一度鍵の確認をやり直す
- 「設定画面へ」ボタン: ブレーカー（設定画面）に直接行く

**対策2: 設定画面は鍵の確認を待たない**

ブレーカー（設定画面）は鍵に関係なくアクセスできるようにしました。鍵が壊れていても、電気の設定はできるようにするためです。これは新しい裏口を増やすのではなく、もともとある通路（設定画面への導線）を「鍵の確認中でも止めない」ようにしているだけです。

これにより「API キーを設定したいのに設定画面に入れない」という行き詰まりが解消されます。

#### 何をするか

- 10秒待っても認証確認が終わらないときは案内画面を出す
- `設定画面へ` から未認証でも Settings に入れるようにする
- ただし保護ビューはそのまま守り、`settings` だけを例外にする

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
  → 10秒経過 → 案内画面表示（「リトライ」「設定へ」）
               ↓
  または「設定」アイコンを直接クリック → 設定画面に直接アクセス可能
```

---

## Part 2: 開発者向け実装詳細

### 1. アーキテクチャ概要

本タスクは AuthGuard コンポーネントに以下の2つの機能を追加した:

1. **認証タイムアウト機構**: `isLoading` が 10秒以上継続した場合にフォールバックUIを表示
2. **Settings画面バイパス**: `currentView === "settings"` の場合、AuthGuard をスキップ

#### 変更ファイル一覧

| ファイル                                       | 変更内容                                                                    |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `components/AuthGuard/types.ts`                | `AuthGuardDisplayState` に `"timed-out"` を追加                             |
| `components/AuthGuard/utils/getAuthState.ts`   | `isTimedOut` パラメータ追加、`AuthStateInput` 拡張                          |
| `components/AuthGuard/hooks/useAuthState.ts`   | `AUTH_TIMEOUT_MS` 定数（10秒）、`setTimeout` によるタイムアウトロジック     |
| `components/AuthGuard/AuthTimeoutFallback.tsx` | タイムアウト時のフォールバックUI（新規作成）                                |
| `components/AuthGuard/index.tsx`               | switch文に `"timed-out"` ケース追加、`AuthTimeoutFallback` の再エクスポート |
| `App.tsx`                                      | `renderCatchAllElement()` 内で Settings 画面バイパス                        |

### 2. 状態遷移図

```
                         初期状態
                            |
                            v
                  +-------------------+
                  |    checking       |
                  |  (isLoading=true) |
                  +-------------------+
                   /        |         \
                  /         |          \
    10秒タイムアウト   isLoading=false   isLoading=false
                /       isAuth=true      isAuth=false
               v            v               v
    +------------+   +--------------+   +----------------+
    | timed-out  |   | authenticated|   | unauthenticated|
    +------------+   +--------------+   +----------------+
         |    |
         |    +--- isLoading=false ---> authenticated / unauthenticated
         |
         +--- リトライ(initializeAuth) ---> checking (isLoading=true)
```

### 3. 型定義の拡張

**ファイル**: `apps/desktop/src/renderer/components/AuthGuard/types.ts`

```typescript
export type AuthGuardDisplayState =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "timed-out"; // 新規追加
```

`AuthGuardDisplayState` は switch 文の網羅性チェックに使用される。`assertNever` ヘルパーにより、新しい状態を追加した場合にすべてのケースが処理されていることがコンパイル時に保証される。

### 4. 認証状態判定ロジック（純粋関数）

**ファイル**: `apps/desktop/src/renderer/components/AuthGuard/utils/getAuthState.ts`

```typescript
export interface AuthStateInput {
  isLoading: boolean;
  isAuthenticated: boolean;
  isTimedOut: boolean; // 新規追加（必須パラメータ）
}

export const getAuthState = ({
  isLoading,
  isAuthenticated,
  isTimedOut,
}: AuthStateInput): AuthGuardDisplayState => {
  // タイムアウト＋ローディング中はtimed-out状態
  if (isTimedOut && isLoading) return "timed-out";

  // ローディング中は常にchecking状態を優先
  if (isLoading) return "checking";

  // 認証済みならauthenticated
  if (isAuthenticated) return "authenticated";

  // それ以外はunauthenticated
  return "unauthenticated";
};
```

判定の優先順位:

1. `isTimedOut && isLoading` → `"timed-out"` （タイムアウト発火済みかつまだローディング中）
2. `isLoading` → `"checking"` （タイムアウト前のローディング中）
3. `isAuthenticated` → `"authenticated"`
4. それ以外 → `"unauthenticated"`

重要: `isTimedOut` は `isLoading` と AND 条件で評価される。`isLoading` が `false` になった時点で `isTimedOut` フラグは `useAuthState` フック内で `false` にリセットされるため、タイムアウト後にロード完了した場合は正常に `authenticated` / `unauthenticated` に遷移する。

### 5. useAuthState フック

**ファイル**: `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts`

```typescript
export const AUTH_TIMEOUT_MS = 10_000; // 10秒

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

#### 設計上のポイント

| Pitfall | 対策                                                                                                                                        | 適用箇所             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| P31     | `useAppStore((state) => state.isAuthenticated)` のように個別セレクタで取得。合成Hook（`useAuthModeStore()` 等）は使用しない                 | ストア値の取得       |
| P48     | プリミティブ値（`boolean`）のみ取得。`.filter()` / `.map()` で配列を返す派生セレクタは不使用のため `useShallow` 不要                        | セレクタ設計         |
| P13     | `setTimeout` を使用。再帰的タイマーやsetIntervalではないため、テスト時に `advanceTimersByTime(AUTH_TIMEOUT_MS)` で1ステップ進めるだけでよい | タイムアウトロジック |
| P5      | `useEffect` のクリーンアップで `clearTimeout` を実行。React StrictMode の二重実行でもタイマー二重登録が発生しない                           | クリーンアップ関数   |

#### タイマー動作の詳細

1. `isLoading` が `true` になったとき: 10秒のタイマーを開始
2. 10秒経過前に `isLoading` が `false` になったとき: `clearTimeout` でタイマーキャンセル + `setIsTimedOut(false)` でリセット
3. 10秒経過後: `setIsTimedOut(true)` が発火 → `getAuthState` が `"timed-out"` を返す
4. リトライ時（`initializeAuth()` 呼び出し）: `isLoading` が `true` → `false` → `true` と変化し、`useEffect` のクリーンアップ → 再実行によりタイマーがリセットされる

### 6. AuthTimeoutFallback コンポーネント

**ファイル**: `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx`

```typescript
interface AuthTimeoutFallbackProps {
  onRetry: () => void;
  onNavigateSettings: () => void;
}
```

#### UI構成

- 全画面レイアウト: `h-screen w-screen flex flex-col items-center justify-center`
- 背景色: `bg-[var(--bg-primary)]`
- 警告アイコン: `Icon name="alert-triangle"` サイズ48px、カラー `text-[var(--status-warning)]`
- 見出し: 「認証の確認に時間がかかっています」（`text-xl font-semibold text-[var(--text-primary)]`）
- 補足テキスト: 「ネットワーク接続を確認するか、以下のオプションをお試しください」（`text-sm text-[var(--text-secondary)]`）
- ボタンコンテナ: `flex flex-col gap-3 w-64`
  - **リトライボタン**: `bg-[var(--accent-primary)] text-white` アクセントカラー背景
  - **設定画面へボタン**: `bg-[var(--bg-tertiary)] text-[var(--text-primary)]` ターシャリ背景
- インタラクション: `hover:opacity-90 active:opacity-80 transition-opacity duration-200`
- アクセシビリティ: `role="alert"` + `aria-label="認証タイムアウト"`、各ボタンに `aria-label`
- `displayName`: `"AuthTimeoutFallback"` を設定

#### デザイントークン一覧

| 要素               | CSS変数            |
| ------------------ | ------------------ |
| 背景               | `--bg-primary`     |
| 見出しテキスト     | `--text-primary`   |
| 補足テキスト       | `--text-secondary` |
| 警告アイコン       | `--status-warning` |
| リトライボタン背景 | `--accent-primary` |
| 設定ボタン背景     | `--bg-tertiary`    |
| 設定ボタンテキスト | `--text-primary`   |

### 7. AuthGuard コンポーネントの拡張

**ファイル**: `apps/desktop/src/renderer/components/AuthGuard/index.tsx`

switch文に `"timed-out"` ケースを追加:

```typescript
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
```

コールバック設計:

- **onRetry**: `initializeAuth()` を呼び出し。Zustand Store の `isLoading` が `true` に戻り、`useAuthState` 内のタイマーがリセット。状態遷移: `timed-out` → `checking`
- **onNavigateSettings**: `setCurrentView("settings")` を呼び出し。`currentView` が `"settings"` に変わり、`App.tsx` の Settings バイパスにより AuthGuard をスキップして Settings 画面を表示

再エクスポート（`index.tsx` 末尾）:

- `AuthTimeoutFallback` コンポーネント
- `useAuthState` フック
- `getAuthState` 関数
- `AuthStateInput` 型

### 8. Settings バイパス

**ファイル**: `apps/desktop/src/renderer/App.tsx`

`renderCatchAllElement()` 関数内で `currentView === "settings"` の場合に AuthGuard をバイパス:

```typescript
const renderCatchAllElement = () => {
  const viewContent = useGlobalNavStrip ? (
    <AppLayout ...>{renderView()}</AppLayout>
  ) : (
    <div ...>...</div>
  );

  // Settings画面はAuthGuardをバイパスして直接表示
  // 理由: 認証確認がハングした場合でもAPI Key等の設定変更を可能にするため
  if (currentView === "settings") {
    return viewContent;
  }

  return <AuthGuard>{viewContent}</AuthGuard>;
};
```

#### バイパスの範囲

- **バイパス対象**: `currentView === "settings"` の場合のみ（`renderCatchAllElement` 内）
- **AuthGuard維持**: URL直接ルーティング（`/agent`, `/chat/history/*`, `/history/*`, `/advanced/*`）は全てAuthGuardで保護されたまま
- **設計意図**: URL ルートを増やさず、既存の `ViewType` / `navContract.ts` / AppDock の契約をそのまま活用

#### セキュリティ考慮

Settings 画面は認証なしでアクセス可能になるが、以下の理由でリスクは限定的:

1. Settings は API キーの設定や認証モードの切り替えを行う管理画面であり、機密データの閲覧機能はない
2. 実際のデータ操作（LLM呼び出し、スキル実行等）は AuthGuard で保護された画面でのみ可能
3. Electron のデスクトップアプリであり、物理的なアクセス制御がブラウザアプリよりも厳格

### 9. App.tsx の viewリセットロジックとの関係

再監査で判明した重要点は、Settings bypass だけでは不十分で、未認証時の view reset から `settings` を除外しないと仕様が相殺されることだった。

`App.tsx` では、以下の helper 経由で reset 可否を判定する:

```typescript
export function shouldResetUnauthenticatedView({
  isAuthenticated,
  isLoading,
  currentView,
}: ShouldResetUnauthenticatedViewInput): boolean {
  if (isAuthenticated || isLoading) return false;
  if (currentView === "dashboard") return false;
  return !isPublicUnauthenticatedView(currentView);
}
```

これにより `settings` は `PUBLIC_UNAUTHENTICATED_VIEWS` の一員として保持され、`dashboard` だけでなく公開ビュー全般を安全に扱える。

### 10. テスト実装のポイント

#### P13準拠: タイマーテスト

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("10秒後にtimed-out状態になること", () => {
  // isLoading=true の状態でレンダリング
  const { result } = renderHook(() => useAuthState(), { wrapper });

  expect(result.current).toBe("checking");

  act(() => {
    vi.advanceTimersByTime(AUTH_TIMEOUT_MS);
  });

  expect(result.current).toBe("timed-out");
});
```

`vi.advanceTimersByTime` を使用し、`vi.runAllTimers` は使わない（再帰タイマーとの組み合わせで無限ループの危険があるため）。

#### P39準拠: happy-dom 環境

```typescript
// fireEvent を使用（userEvent は happy-dom で Symbol エラーを起こす）
fireEvent.click(retryButton);

// 非同期ハンドラの場合
await act(async () => {
  fireEvent.click(retryButton);
});
```

### 11. APIシグネチャ / CLIシグネチャ

| 種別          | シグネチャ                                                                            | 用途                                                                  |
| ------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| APIシグネチャ | `shouldResetUnauthenticatedView(input: ShouldResetUnauthenticatedViewInput): boolean` | 公開ビューかどうかを加味して reset 可否を判定                         |
| APIシグネチャ | `getAuthState(input: AuthStateInput): AuthGuardDisplayState`                          | `checking` / `timed-out` / `authenticated` / `unauthenticated` を返す |
| APIシグネチャ | `useAuthState(): AuthGuardDisplayState`                                               | Store 状態 + timeout を合成して AuthGuard 表示状態を返す              |
| CLIシグネチャ | `node apps/desktop/scripts/capture-task-authguard-timeout-phase11.mjs`                | Phase 11 screenshot 4件を取得する                                     |

### 12. 使用例

**使用例**: 未認証 reset 判定を `App.tsx` から呼び出す。

```ts
if (
  shouldResetUnauthenticatedView({
    isAuthenticated,
    isLoading,
    currentView,
  })
) {
  setCurrentView("dashboard");
}
```

**使用例**: Phase 11 screenshot を再取得する。

```bash
node apps/desktop/scripts/capture-task-authguard-timeout-phase11.mjs
```

### 13. エラーハンドリング

- `AuthTimeoutFallback` は通信エラーそのものを握らず、retry と settings 遷移だけを担当する
- `getAuthState()` は純粋関数なので、エラーを投げずに表示状態を返す
- `shouldResetUnauthenticatedView()` も純粋関数で、例外を投げずに `boolean` を返す

### 14. エッジケース

- **エッジケース1**: `isLoading` が `false` に戻った瞬間に timeout flag が残る  
  `useAuthState` で `setIsTimedOut(false)` へ戻す
- **エッジケース2**: timeout 後に `settings` へ遷移した直後、未認証判定で dashboard に戻る  
  `shouldResetUnauthenticatedView()` で `settings` を除外する
- **エッジケース3**: 未認証の Settings で profile 表示が壊れる  
  `AccountSection` は未認証時にログイン CTA へ degrade する

### 15. 設定と定数

| 定数一覧                       | 値             | 説明                             |
| ------------------------------ | -------------- | -------------------------------- |
| `AUTH_TIMEOUT_MS`              | `10_000`       | AuthGuard timeout しきい値       |
| `PUBLIC_UNAUTHENTICATED_VIEWS` | `["settings"]` | 未認証でも維持してよい公開ビュー |

---

## 関連タスク

| タスク ID                                 | 関係                                       |
| ----------------------------------------- | ------------------------------------------ |
| TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 | P1: デバッグコード残存（最初に修正すべき） |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001           | P2: IPC ハングの根本対策                   |

## 未タスク候補

今回の再監査で追加登録が必要な未タスクは 0 件だった。以前の reset 問題は本タスク内で解消済み。

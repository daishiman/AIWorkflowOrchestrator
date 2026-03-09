# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 4                                              |
| Phase名    | テスト作成                                     |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 3                                        |
| 後続Phase  | Phase 5                                        |

## 目的

Phase 2 の設計に基づき、TDD のテストファーストアプローチでテストケースを設計・実装する。

## 重要な注意事項（Pitfall準拠）

- **P13**: タイマーテストでは `vi.useFakeTimers()` + `vi.advanceTimersByTime()` を使用。`vi.runAllTimers()` は無限ループの危険あり
- **P39**: happy-dom 環境では `fireEvent` を使用。`userEvent.setup()` は使用禁止
- **P31**: `useAppStore` は個別セレクタでモック
- **P40**: テスト実行は `apps/desktop/` ディレクトリから行う

## 実行タスク

### タスク1: getAuthState 関数テスト作成

**目的**: 拡張された `getAuthState` の全パターンをテストする

**テストファイル**: `apps/desktop/src/renderer/components/AuthGuard/utils/__tests__/getAuthState.test.ts`

**テストケース**:

| #   | テスト名                                                     | 入力                                                              | 期待値              |
| --- | ------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------- |
| 1   | タイムアウト + ローディング中 → "timed-out"                  | `{ isLoading: true, isAuthenticated: false, isTimedOut: true }`   | `"timed-out"`       |
| 2   | タイムアウト + ローディング完了 + 認証済み → "authenticated" | `{ isLoading: false, isAuthenticated: true, isTimedOut: true }`   | `"authenticated"`   |
| 3   | タイムアウト + ローディング完了 + 未認証 → "unauthenticated" | `{ isLoading: false, isAuthenticated: false, isTimedOut: true }`  | `"unauthenticated"` |
| 4   | ローディング中 + タイムアウトなし → "checking"               | `{ isLoading: true, isAuthenticated: false, isTimedOut: false }`  | `"checking"`        |
| 5   | 認証済み → "authenticated"                                   | `{ isLoading: false, isAuthenticated: true, isTimedOut: false }`  | `"authenticated"`   |
| 6   | 未認証 → "unauthenticated"                                   | `{ isLoading: false, isAuthenticated: false, isTimedOut: false }` | `"unauthenticated"` |

**既存テスト影響**:

- 既存の `getAuthState.test.ts` がある場合、`isTimedOut` パラメータの追加で既存テストの引数を更新する必要がある

### タスク2: useAuthState フック タイムアウトテスト作成

**目的**: タイムアウトロジックの正常動作をテストする

**テストファイル**: `apps/desktop/src/renderer/components/AuthGuard/hooks/__tests__/useAuthState.test.ts`

**テストケース**:

| #   | テスト名                                                      | シナリオ                                                           | 期待値                                   |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| 1   | 初期状態でisLoading=trueの場合、"checking"を返す              | Store: isLoading=true                                              | `"checking"`                             |
| 2   | 10秒後にタイムアウトして"timed-out"を返す                     | Store: isLoading=true, `advanceTimersByTime(10_000)`               | `"timed-out"`                            |
| 3   | タイムアウト前にisLoadingがfalseになると"authenticated"を返す | Store: isLoading=true → false, isAuthenticated=true                | `"authenticated"`                        |
| 4   | タイムアウト後にisLoadingがfalseになると自動遷移する          | Store: isLoading=true → timeout → isLoading=false                  | `"authenticated"` or `"unauthenticated"` |
| 5   | isLoadingがfalseの場合、タイマーが設定されない                | Store: isLoading=false                                             | タイマー未設定                           |
| 6   | isLoadingがfalseになるとisTimedOutがリセットされる            | Store: isLoading=true → timeout → isLoading=false → isLoading=true | 再タイムアウトまで `"checking"`          |

**タイマーテスト実装パターン（P13準拠）**:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

it("10秒後にタイムアウトする", () => {
  // Store を isLoading=true に設定
  const { result } = renderHook(() => useAuthState());

  expect(result.current).toBe("checking");

  // P13: advanceTimersByTime で1ステップずつ進める（runAllTimers は禁止）
  act(() => {
    vi.advanceTimersByTime(10_000);
  });

  expect(result.current).toBe("timed-out");
});
```

### タスク3: AuthGuard コンポーネントテスト作成

**目的**: `"timed-out"` 状態でのフォールバックUI表示をテストする

**テストファイル**: `apps/desktop/src/renderer/components/AuthGuard/__tests__/AuthGuard.test.tsx`

**テストケース**:

| #   | テスト名                                          | シナリオ                  | 期待値                                   |
| --- | ------------------------------------------------- | ------------------------- | ---------------------------------------- |
| 1   | タイムアウト時にAuthTimeoutFallbackが表示される   | authState="timed-out"     | AuthTimeoutFallback がレンダリングされる |
| 2   | リトライボタンクリックでinitializeAuthが呼ばれる  | リトライボタンをクリック  | `initializeAuth` が呼ばれる              |
| 3   | Settings遷移ボタンが表示される                    | authState="timed-out"     | 「設定画面へ」ボタンが存在する           |
| 4   | checking状態ではLoadingScreenが表示される         | authState="checking"      | LoadingScreen がレンダリングされる       |
| 5   | authenticated状態では子コンポーネントが表示される | authState="authenticated" | children がレンダリングされる            |

**イベントテスト実装パターン（P39準拠）**:

```typescript
// P39: happy-dom では fireEvent を使用（userEvent 禁止）
import { fireEvent } from "@testing-library/react";

it("リトライボタンクリックでinitializeAuthが呼ばれる", async () => {
  // ... レンダリング

  // P39: fireEvent を使用
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /リトライ/ }));
  });

  expect(mockInitializeAuth).toHaveBeenCalled();
});
```

### タスク4: AuthTimeoutFallback コンポーネントテスト作成

**目的**: フォールバックUIの構成要素と動作をテストする

**テストファイル**: `apps/desktop/src/renderer/components/AuthGuard/__tests__/AuthTimeoutFallback.test.tsx`

**テストケース**:

| #   | テスト名                                                 | 期待値                                             |
| --- | -------------------------------------------------------- | -------------------------------------------------- |
| 1   | エラーメッセージが表示される                             | 「認証の確認に時間がかかっています」テキストが存在 |
| 2   | リトライボタンが表示される                               | role="button", name="リトライ" が存在              |
| 3   | Settings遷移ボタンが表示される                           | role="button", name=/設定/ が存在                  |
| 4   | リトライボタンクリックでonRetryが呼ばれる                | コールバック呼び出し確認                           |
| 5   | Settings遷移ボタンクリックでonNavigateSettingsが呼ばれる | コールバック呼び出し確認                           |
| 6   | アクセシビリティ: 適切なARIAラベルが設定される           | role="alert" が存在                                |

### タスク5: Settings 除外ルートテスト作成

**目的**: Settings 画面が AuthGuard なしでアクセス可能であることをテストする

**テストファイル**: `apps/desktop/src/renderer/__tests__/App.settings-bypass.test.tsx`

**テストケース**:

| #   | テスト名                                    | シナリオ                            | 期待値                                 |
| --- | ------------------------------------------- | ----------------------------------- | -------------------------------------- |
| 1   | /settings パスは AuthGuard なしで表示される | 未認証状態で /settings にアクセス   | SettingsView がレンダリングされる      |
| 2   | 認証済みでも /settings にアクセス可能       | 認証済み状態で /settings にアクセス | SettingsView がレンダリングされる      |
| 3   | 他のルートは AuthGuard で保護される         | 未認証状態で / にアクセス           | AuthView or LoadingScreen が表示される |

## 参照資料

| 参照資料         | パス                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------ |
| Phase 2 設計書   | `docs/30-workflows/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-2-design.md` |
| 既存テスト       | `apps/desktop/src/renderer/components/AuthGuard/__tests__/`                          |
| テスト設計ルール | `.claude/rules/02-code-quality.md`                                                   |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md` (P13, P39, P40)                                 |

## 統合テスト連携

- 既存の AuthGuard テストが存在する場合、`getAuthState` の引数変更に伴う更新が必要
- テスト実行は `cd apps/desktop && pnpm vitest run` で行う（P40準拠）

## 成果物

| 成果物                     | パス                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------- |
| getAuthState テスト        | `apps/desktop/src/renderer/components/AuthGuard/utils/__tests__/getAuthState.test.ts`   |
| useAuthState テスト        | `apps/desktop/src/renderer/components/AuthGuard/hooks/__tests__/useAuthState.test.ts`   |
| AuthGuard テスト           | `apps/desktop/src/renderer/components/AuthGuard/__tests__/AuthGuard.test.tsx`           |
| AuthTimeoutFallback テスト | `apps/desktop/src/renderer/components/AuthGuard/__tests__/AuthTimeoutFallback.test.tsx` |
| Settings除外ルートテスト   | `apps/desktop/src/renderer/__tests__/App.settings-bypass.test.tsx`                      |

## 完了条件

- [ ] getAuthState の全状態パターン（6ケース）のテストが作成されていること
- [ ] useAuthState のタイムアウトロジック（6ケース）のテストが作成されていること
- [ ] AuthGuard のフォールバックUI表示テスト（5ケース）が作成されていること
- [ ] AuthTimeoutFallback の構成要素テスト（6ケース）が作成されていること
- [ ] Settings除外ルートテスト（3ケース）が作成されていること
- [ ] テストが全て Red 状態（実装前なので失敗する）であること
- [ ] P13/P39/P40 準拠のテスト実装パターンが使用されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 5: 実装へ進む。テストを Green にするためのプロダクションコードを実装する。

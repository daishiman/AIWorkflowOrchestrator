# 実装ガイド: dangerouslyIgnoreUnhandledErrors 設定の解消

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| 作成日     | 2026-02-19                          |
| ステータス | 完了                                |

---

## Part 1: 概念的説明（中学生レベル）

### テストの「安全ネット」ってなに？

プログラムを作るとき、そのプログラムが正しく動くかどうかを確認するために「テスト」を書きます。テストは、体育のトランポリンや空中ブランコの下にある「安全ネット」のようなものです。

- プログラムの中でミスがあると、テストがそれを見つけて「ここがおかしいよ！」と教えてくれます
- 安全ネットがあるから、安心して新しい技（新機能）に挑戦できます

### 問題だった状態：安全ネットに穴が開いていた

このプロジェクトでは、テストの設定ファイルに `dangerouslyIgnoreUnhandledErrors: true` という設定がありました。この設定は名前の通り「危険に（dangerously）未処理のエラーを無視する（IgnoreUnhandledErrors）」という意味です。

これは安全ネットに穴を開けているのと同じ状態です。

- プログラムの中で「後でやるよ」と約束した処理（非同期処理=Promise）が失敗しても、テストは何も言わない
- 本当はエラーが出ているのに、テストは「問題ありません！」と報告してしまう
- その結果、気づかないままエラーがプログラムに残り続ける

### 今回の修正：穴をふさいだ

今回の修正では、この穴の開いた設定を削除しました。つまり「安全ネットの穴をふさいだ」ということです。

- テスト中にエラーが起きたら、すぐに報告されるようになった
- 隠れていたエラーに気づけるようになった
- プログラム全体の安全性が向上した

### さらに「モジュール解決」を整備した

プログラムは複数のファイルに分かれていて、あるファイルが別のファイルの機能を使うことがあります。住所を使って手紙を届けるように、プログラムも「このファイルはここにあるよ」という住所（パスエイリアス）が必要です。

今回、18個の住所（`@repo/shared` のサブパスエイリアス）を新たに登録しました。これにより、テスト実行時に「ファイルが見つかりません」というエラーが出なくなり、全てのテストがきちんと動くようになりました。

### なぜこの修正が大切なの？

| 修正前                                     | 修正後                                   |
| ------------------------------------------ | ---------------------------------------- |
| エラーが静かに無視される                   | エラーがすぐに報告される                 |
| 本番環境で突然クラッシュするリスクがある   | テスト段階でエラーを発見・修正できる     |
| 安全ネットに穴が開いた状態                 | 安全ネットが完全に機能する状態           |
| 一部のテストでファイルが見つからないエラー | 全てのテストがファイルを正しく参照できる |

---

## Part 2: 技術的詳細（開発者向け）

### 2.1 vitest.config.ts の変更内容

#### 削除した設定

```typescript
// 削除前（危険な設定）
export default defineConfig({
  test: {
    // ...
    dangerouslyIgnoreUnhandledErrors: true, // この行を削除
  },
});
```

**削除理由**: `dangerouslyIgnoreUnhandledErrors: true` は、テスト実行中の未処理 Promise 拒否（unhandled promise rejection）を無視する設定。これにより、非同期処理のエラーが検出されず、コード品質の低下を招く。

#### 追加した設定: @repo/shared サブパスエイリアス

モノレポ環境で `@repo/shared` パッケージの各サブパスをテスト環境で正しく解決するため、18個のエイリアスを追加。

```typescript
resolve: {
  alias: {
    // @repo/shared subpath aliases (longer/more specific paths first)
    "@repo/shared/infrastructure/ai/apiKeyValidator": resolve(
      __dirname,
      "../../packages/shared/infrastructure/ai/apiKeyValidator.ts"
    ),
    "@repo/shared/infrastructure/auth": resolve(
      __dirname,
      "../../packages/shared/infrastructure/auth/index.ts"
    ),
    "@repo/shared/services/history/history-service": resolve(
      __dirname,
      "../../packages/shared/src/services/history/history-service.ts"
    ),
    // ... 他15個のエイリアス
    "@repo/shared": resolve(__dirname, "../../packages/shared/index.ts"),
  },
},
```

**エイリアス順序の重要性**: より具体的なパス（例: `@repo/shared/types/llm/schemas`）を汎用パス（例: `@repo/shared/types`）より先に配置する必要がある。Vitest はエイリアスを上から順に評価し、最初にマッチしたものを使用するため。

### 2.2 追加したテストファイル

#### vitest-config.test.ts（5テスト）

| テスト名                                            | 検証内容                                       |
| --------------------------------------------------- | ---------------------------------------------- |
| should not contain dangerouslyIgnoreUnhandledErrors | 設定ファイルに危険なフラグが含まれていないこと |
| should use happy-dom as test environment            | テスト環境が happy-dom であること              |
| should have setup files configured                  | setupFiles が設定されていること                |
| should include test timeout configuration           | testTimeout が設定されていること               |
| should include teardown timeout configuration       | teardownTimeout が設定されていること           |

このテストはリグレッション防止のため、設定ファイルの内容を文字列として読み取り、危険なフラグが再追加されないことを保証する。

#### async-error-handling.test.ts（8テスト）

| カテゴリ                   | テスト名                                                | 検証内容                                                  |
| -------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| Promise rejection handling | should catch rejected promises with expect().rejects    | `expect().rejects.toThrow()` パターンの動作確認           |
| Promise rejection handling | should handle mockRejectedValue correctly               | `vi.fn().mockRejectedValue()` の動作確認                  |
| Promise rejection handling | should handle mockRejectedValueOnce correctly           | `mockRejectedValueOnce` と `mockResolvedValueOnce` の連鎖 |
| afterEach cleanup patterns | should complete async cleanup in afterEach              | 非同期クリーンアップの動作確認                            |
| afterEach cleanup patterns | should restore mocks without leaving pending operations | モック復元が未処理操作を残さないこと                      |
| Timer-based async handling | should handle timer cleanup without unhandled errors    | `setTimeout` + `advanceTimersByTime` の正常動作           |
| Timer-based async handling | should handle interval cleanup correctly                | `setInterval` のクリーンアップ検証                        |
| Error boundary patterns    | should handle try-catch in async functions              | try-catch による非同期エラー捕捉パターン                  |

### 2.3 非同期エラーハンドリングのベストプラクティス

#### async/await での適切なエラーキャッチ

```typescript
// 推奨: expect().rejects パターン
it("should handle async error", async () => {
  const asyncFn = async () => {
    throw new Error("failure");
  };
  await expect(asyncFn()).rejects.toThrow("failure");
});

// 推奨: try-catch パターン（戻り値の検証が必要な場合）
it("should catch and inspect error", async () => {
  let caughtError: Error | null = null;
  try {
    await riskyOperation();
  } catch (error) {
    caughtError = error as Error;
  }
  expect(caughtError).toBeInstanceOf(Error);
  expect(caughtError?.message).toBe("expected message");
});
```

#### vi.fn() モックの mockRejectedValue 使用時の注意

```typescript
// 推奨: mockRejectedValue で返したPromiseは必ずawaitでキャッチ
const mockFn = vi.fn().mockRejectedValue(new Error("mock error"));
await expect(mockFn()).rejects.toThrow("mock error");

// 非推奨: キャッチせずに放置（dangerouslyIgnoreUnhandledErrors削除後はテスト失敗の原因に）
const mockFn = vi.fn().mockRejectedValue(new Error("mock error"));
mockFn(); // 未処理のPromise拒否 → テスト失敗
```

#### テスト内での expect().rejects.toThrow() パターン

```typescript
// 正しい使い方: await で待機する
await expect(asyncFn()).rejects.toThrow("error message");

// 間違い: await を忘れる → テストが非同期エラーを検出する前に終了
expect(asyncFn()).rejects.toThrow("error message"); // await 忘れ
```

#### beforeEach / afterEach でのクリーンアップ

```typescript
describe("service tests", () => {
  afterEach(() => {
    // モックの復元（未処理操作を防止）
    vi.restoreAllMocks();
  });

  // タイマーを使うテストの場合
  afterEach(() => {
    vi.useRealTimers(); // フェイクタイマーを必ず元に戻す
  });
});
```

#### タイマーテストでの注意（P13参照）

```typescript
// 推奨: advanceTimersByTime で1ステップずつ進める
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
// テスト後に必ずクリーンアップ
vi.useRealTimers();

// 非推奨: runAllTimers は再スケジュールパターンで無限ループの危険
vi.runAllTimers(); // setTimeout → Promise → setTimeout の連鎖で無限ループ
```

### 2.4 変更ファイル一覧

| ファイル                                             | 変更種別 | 行数  | 内容                                                         |
| ---------------------------------------------------- | -------- | ----- | ------------------------------------------------------------ |
| `apps/desktop/vitest.config.ts`                      | 修正     | 182行 | dangerouslyIgnoreUnhandledErrors 削除 + 18個のエイリアス追加 |
| `apps/desktop/src/test/vitest-config.test.ts`        | 新規     | 35行  | 設定ファイルのリグレッション防止テスト5件                    |
| `apps/desktop/src/test/async-error-handling.test.ts` | 新規     | 106行 | 非同期エラーハンドリングパターン検証8件                      |

### 2.5 テスト実行結果

| 指標           | 値       |
| -------------- | -------- |
| 全テスト件数   | 10,189件 |
| テスト結果     | ALL PASS |
| 新規テスト件数 | 13件     |
| 手動テスト件数 | 5件      |
| 手動テスト結果 | 5/5 PASS |

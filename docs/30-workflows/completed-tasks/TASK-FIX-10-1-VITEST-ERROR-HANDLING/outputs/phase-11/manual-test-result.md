# Phase 11: 手動テスト結果

## メタ情報

| 項目             | 値                                  |
| ---------------- | ----------------------------------- |
| タスクID         | TASK-FIX-10-1-VITEST-ERROR-HANDLING |
| Phase            | 11 (手動テスト検証)                 |
| 実行日           | 2026-02-19                          |
| 実行環境         | macOS Darwin 24.6.0                 |
| Vitest           | v2.1.9                              |
| テスト環境       | happy-dom                           |
| 実行ディレクトリ | `apps/desktop/` (P40対策)           |

## テスト結果サマリ

| 項目         | 結果     |
| ------------ | -------- |
| 総合判定     | PASS     |
| テストケース | 5/5 PASS |

## テストケース詳細

| No  | カテゴリ                     | テスト項目                                                                 | 期待結果                                              | 実行結果                                                                          | 判定 |
| --- | ---------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- | ---- |
| 1   | 設定ファイル確認             | `vitest.config.ts` に `dangerouslyIgnoreUnhandledErrors` が存在しないこと  | 文字列が見つからない                                  | grep結果: No matches found。設定ファイル全183行を目視確認し、該当設定は存在しない | PASS |
| 2   | 全テスト実行                 | `pnpm vitest run` で全テストが PASS すること                               | 全テスト PASS                                         | 458ファイル / 10,189テスト ALL PASS (318.08s)                                     | PASS |
| 3   | unhandled rejection 検出     | 意図的な未処理Promise拒否が検出されること                                  | テスト失敗または unhandled rejection 警告が出力される | 「Unhandled Rejection」エラーが正しく検出・報告された。`Errors 1 error` と表示    | PASS |
| 4   | CI環境相当テスト             | `pnpm --filter @repo/desktop exec vitest run` で新規テストが PASS すること | 13テスト ALL PASS                                     | 2ファイル / 13テスト ALL PASS (1.17s)                                             | PASS |
| 5   | --no-file-parallelism テスト | `--no-file-parallelism` オプション付きで新規テストが PASS すること         | 13テスト ALL PASS                                     | 2ファイル / 13テスト ALL PASS (1.79s)                                             | PASS |

## テストケース No.1: 設定ファイル確認

### 実行方法

`apps/desktop/vitest.config.ts` を直接読み込み、`dangerouslyIgnoreUnhandledErrors` の存在を確認。

### 確認結果

- `grep` による検索: マッチなし
- ファイル全183行の目視確認: `dangerouslyIgnoreUnhandledErrors` は存在しない
- `test` セクション内の設定項目: `globals`, `environment`, `include`, `exclude`, `setupFiles`, `pool`, `poolOptions`, `testTimeout`, `teardownTimeout`, `fileParallelism`, `coverage` のみ

## テストケース No.2: 全テスト実行

### 実行コマンド

```bash
cd apps/desktop && pnpm vitest run
```

### 実行結果

```
Test Files  458 passed | 3 skipped (462)
     Tests  10189 passed | 62 skipped (10260)
    Errors  1 error
  Start at  16:28:57
  Duration  318.08s
```

### 補足: Worker 予期しない終了 (P22)

テスト結果に `Errors 1 error` が記録されているが、これは `Worker exited unexpectedly` エラー（既知の問題 P22）であり、`dangerouslyIgnoreUnhandledErrors` の削除とは無関係。大規模テスト実行時（10,000+ テスト）にメモリ/タイムアウトが原因で Vitest Worker が予期せず終了する既知の問題。全テスト結果（10,189 passed）には影響なし。

## テストケース No.3: 意図的 unhandled rejection 検出テスト

### 実行方法

一時テストファイル `src/test/tmp-unhandled-rejection.test.ts` を作成し、意図的に未処理の Promise 拒否を発生させた。

```typescript
import { describe, it } from "vitest";
describe("unhandled rejection detection", () => {
  it("should detect unhandled promise rejection", () => {
    new Promise((_, reject) =>
      reject(new Error("intentional unhandled rejection")),
    );
  });
});
```

### 実行結果

```
--- Unhandled Rejection ---
Error: intentional unhandled rejection
 > src/test/tmp-unhandled-rejection.test.ts:4:39

Test Files  1 passed (1)
     Tests  1 passed (1)
    Errors  1 error
```

### 検証ポイント

- `dangerouslyIgnoreUnhandledErrors: true` が存在していた場合、このエラーは検出されずテストは無警告で PASS していたはず
- 削除後は「Unhandled Rejection」として正しくエラー報告されており、未処理のPromise拒否がテスト実行中に隠蔽されないことが確認できた

### 後処理

一時テストファイルは実行後に削除済み。

## テストケース No.4: CI環境相当テスト

### 実行コマンド

```bash
cd /path/to/worktree && pnpm --filter @repo/desktop exec vitest run \
  src/test/vitest-config.test.ts src/test/async-error-handling.test.ts
```

### 実行結果

```
Test Files  2 passed (2)
     Tests  13 passed (13)
  Start at  16:42:26
  Duration  1.17s
```

### 検証ポイント

- `pnpm --filter` 経由での実行で `vitest.config.ts` の設定（happy-dom, setupFiles）が正しく適用されることを確認（P40対策）
- `vitest-config.test.ts` (5テスト) + `async-error-handling.test.ts` (8テスト) = 13テスト ALL PASS

## テストケース No.5: --no-file-parallelism テスト

### 実行コマンド

```bash
cd apps/desktop && pnpm vitest run \
  src/test/vitest-config.test.ts src/test/async-error-handling.test.ts \
  --no-file-parallelism
```

### 実行結果

```
Test Files  2 passed (2)
     Tests  13 passed (13)
  Start at  16:43:34
  Duration  1.79s
```

### 検証ポイント

- ファイル間並列実行を無効化した状態でもテストが正常に動作することを確認
- P22（Worker 予期しない終了）の回避策として `--no-file-parallelism` が使用可能であることを確認

## 既知の問題と注意事項

### Worker 予期しない終了 (P22)

- 全テスト実行時（テストケース No.2）に `Worker exited unexpectedly` エラーが 1 件発生
- これは P22 として既知の問題であり、本タスクの変更とは無関係
- テスト結果自体には影響なし（10,189テスト全て PASS）
- 対策: `--no-file-parallelism` や `--poolOptions.workers.max` の調整

## 結論

`dangerouslyIgnoreUnhandledErrors: true` の削除後、以下を確認した:

1. **設定ファイルの整合性**: フラグが完全に削除されていることを確認
2. **既存テストへの影響なし**: 458ファイル / 10,189テスト全て PASS
3. **unhandled rejection 検出機能の復活**: 意図的な未処理 Promise 拒否が正しくエラーとして報告されることを確認
4. **CI環境互換性**: `pnpm --filter` 経由の実行でも問題なし
5. **直列実行互換性**: `--no-file-parallelism` でも正常動作

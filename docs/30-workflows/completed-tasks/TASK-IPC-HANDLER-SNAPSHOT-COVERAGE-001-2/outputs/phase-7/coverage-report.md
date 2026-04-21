# Phase 7 Coverage Report

## サマリー

| Wave | 対象handler数 | テストファイル存在数 | 実行確認済み数 | 完了率 |
| ---- | ------------- | -------------------- | -------------- | ------ |
| 1    | 7             | 1                    | 0              | 14.3%  |
| 2    | 16            | 0                    | 0              | 0%     |
| 3    | 25            | 0                    | 0              | 0%     |

## handler別状況

| handler名                      | Wave | テストファイル                             | 状態                   |
| ------------------------------ | ---- | ------------------------------------------ | ---------------------- |
| registerLLMHandlers            | 1    | `llmHandlers.registrationSnapshot.test.ts` | 追加済み、実行確認待ち |
| registerSkillHandlers          | 1    | なし                                       | 未導入                 |
| registerSkillCreatorHandlers   | 1    | なし                                       | 未導入                 |
| registerSkillFileHandlers      | 1    | なし                                       | 未導入                 |
| registerSafetyGateHandlers     | 1    | なし                                       | 未導入                 |
| registerApprovalHandlers       | 1    | なし                                       | 未導入                 |
| registerAgentExecutionHandlers | 1    | なし                                       | 未導入                 |
| registerChatExportHandlers     | 3    | なし                                       | 未導入                 |

## 母集団の修正

- `registerAllIpcHandlers()` の直接呼び出しに `registerChatExportHandlers()` が含まれるため、Phase 1/2 の母集団へ追加した
- direct registration unit 数は 47 ではなく 48

## CI時間評価

| コマンド                                                                                                                                                                                                                                                  | 結果         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `ESBUILD_BINARY_PATH=.../@esbuild/darwin-arm64@0.21.5/... pnpm --dir apps/desktop exec vitest run src/main/ipc/__tests__/llmHandlers.registrationSnapshot.test.ts --reporter=verbose`                                                                     | PASS / 5.02s |
| `ESBUILD_BINARY_PATH=.../@esbuild/darwin-arm64@0.21.5/... pnpm --dir apps/desktop exec vitest run src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts src/main/ipc/__tests__/llmHandlers.registrationSnapshot.test.ts --reporter=verbose` | PASS / 6.58s |

## 実行基盤メモ

- デフォルト実行では `esbuild` host/binary mismatch が残る
- ただし `ESBUILD_BINARY_PATH` を 0.21.5 binary に固定するとテストは通る

## ゲート判定

- 判定: **Phase 6 へ進行不可**
- 理由:
  - Wave 1 完了率が 100% 未満
  - 常用コマンドでは実行基盤不整合が残る

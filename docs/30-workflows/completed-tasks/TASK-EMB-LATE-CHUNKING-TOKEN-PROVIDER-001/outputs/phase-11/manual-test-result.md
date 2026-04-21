# Manual Test Result

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

代替証跡:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-9/quality-gate-report.md`

## 実行ログ

| コマンド                                                                                                                                                                                           | 前提条件                | 期待結果                           | 実結果                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `pnpm --filter @repo/shared exec vitest run src/services/chunking/__tests__/chunking-service.integration.test.ts src/services/embedding/providers/__tests__/mock-token-embedding-provider.test.ts` | 依存解決済み            | 対象 2 ファイル PASS               | PASS, 2 files / 32 tests, 2.11s                                                                      |
| `pnpm --filter @repo/shared typecheck`                                                                                                                                                             | TypeScript 依存解決済み | 型エラー 0 件                      | PASS, `tsc --noEmit` 正常終了                                                                        |
| `pnpm --filter @repo/shared test:run`                                                                                                                                                              | `dist/` 未生成          | 回帰 FAIL 0 件                     | 初回 FAIL, `build-verification.test.ts` が `dist/index.js` / `index.cjs` / `index.d.ts` 未生成で失敗 |
| `pnpm --filter @repo/shared build`                                                                                                                                                                 | build 前提不足の解消    | `dist/` 生成                       | PASS, `dist/index.js` / `dist/index.cjs` / `dist/index.d.ts` 生成                                    |
| `pnpm --filter @repo/shared test:run`                                                                                                                                                              | `dist/` 生成済み        | 回帰 FAIL 0 件                     | WARN, `__tests__/build-verification.test.ts` の `dist/index.d.ts` 1件のみ失敗                        |
| `pnpm --filter @repo/shared exec vitest run __tests__/build-verification.test.ts`                                                                                                                  | `dist/` 生成済み        | build verification が単体でも PASS | PASS, 8 tests                                                                                        |

## 観測ポイント

- `chunk()` 本流で `getTokenEmbeddings?()` が優先利用されることを統合テストで確認
- fallback でも `chunk.metadata.lateChunking.embeddingDimension > 0` を維持
- Phase 4 artifact 名の不整合は `artifacts.json` と `index.md` を `test-scenarios.md` へそろえて解消

## 判定

- Phase 11 primary evidence として有効
- NON_VISUAL task のため screenshot は不要
- task scope の変更点は PASS
- shared package 全体では build artifact 参照の不安定要素が 1 件残る

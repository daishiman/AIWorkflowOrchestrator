# Phase 2 文書同期マトリクス

| 更新対象                                | 置換前                                                                                                 | 置換後                                                                      | 状態 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ---- |
| workflow02 Phase 11 manual-test-result  | `node apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs`                     | `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` | 完了 |
| workflow02 Phase 12 spec-update-summary | `pnpm --filter @repo/desktop exec node scripts/capture-skill-import-idempotency-guard-screenshots.mjs` | `pnpm --filter @repo/desktop run screenshot:skill-import-idempotency-guard` | 完了 |

## 残存確認

- 旧コマンド文字列検索: 0件（`rg` 実行結果）

## 完了判定

- [x] 更新対象2ファイルを同期
- [x] 置換前/置換後の差分を記録

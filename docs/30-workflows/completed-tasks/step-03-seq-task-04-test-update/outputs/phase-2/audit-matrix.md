# Phase 2: 監査マトリクス

## 4面監査マトリクス

| #   | 観点                | 正本                                                                 | 確認方法    | 期待値                                             | 検証結果 |
| --- | ------------------- | -------------------------------------------------------------------- | ----------- | -------------------------------------------------- | -------- |
| 1   | provider/model 定義 | `packages/shared/src/types/llm/schemas/provider-registry.ts`         | Read / grep | 5 provider + `o3` / `o4-mini` / `claude-haiku-4-5` | PASS     |
| 2   | Main 実装           | `apps/desktop/src/main/handlers/llm.ts`                              | Read        | shared 正本参照、ローカル定義なし                  | PASS     |
| 3   | テスト              | `llm.test.ts` / `AnthropicAdapter.test.ts` / `GoogleAdapter.test.ts` | grep        | 既存ケースが存在                                   | PASS     |
| 4   | system spec         | `.claude/skills/*/LOGS.md`                                           | Read        | 2026-03-24 完了記録あり                            | PASS     |

## stale path 置換方針

| 旧パス                                                         | 対処                               |
| -------------------------------------------------------------- | ---------------------------------- |
| `apps/desktop/src/main/handlers/llm/providers.ts`              | 不参照（ファイル不存在を確認済み） |
| `docs/30-workflows/llm-provider-model-modernization/tasks/...` | canonical path へ統一              |

## 設計判断

- 実装追加は不要
- stale な「変更予定」文言は「確認済み」へ置換
- Phase 11 は NON_VISUAL evidence 2ファイル構成
- Phase 12 は 6成果物構成

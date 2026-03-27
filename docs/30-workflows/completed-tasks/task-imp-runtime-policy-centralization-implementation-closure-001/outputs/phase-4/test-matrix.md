# Phase 4 Test Matrix

| 区分          | ケース                       | 対象                                                              | 期待値                                               |
| ------------- | ---------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| unit          | Agent integrated             | `agentHandlers.runtime.test.ts`                                   | `integrated_api` で既存 start フローが継続する       |
| unit          | Agent terminal handoff       | `agentHandlers.runtime.test.ts`                                   | `manualRetryRule` を error / guidance 理由へ反映する |
| unit          | Skill integrated             | `skillHandlers.runtime.test.ts`                                   | `integrated_api` で execute が継続する               |
| unit          | Skill terminal handoff       | `skillHandlers.runtime.test.ts`                                   | `terminal_handoff` で guidance を返し実行しない      |
| regression    | Skill backward compatibility | `skillHandlers.runtime.test.ts`                                   | resolver 未注入でも既存 execute が動く               |
| regression    | Agent baseline contract      | `agentHandlers.test.ts`                                           | 既存 handler contract を壊さない                     |
| regression    | Skill execute / contract     | `skillHandlers.execute.test.ts`, `skillHandlers.contract.test.ts` | runtime diff が既存 suite を壊さない                 |
| type          | desktop typecheck            | `pnpm --filter @repo/desktop typecheck`                           | DI 変更後も型が通る                                  |
| cleanup guard | legacy route 存続確認        | `aiHandlers` 既存 tests / code review                             | 今回 wave で削除していないことを確認する             |

## cleanup 用の確認項目

- `AI_CHECK_CONNECTION` は依然 public preload に露出している
- deprecated `RuntimeResolver` は slide / runtime service 側に残る
- `sanitizeForRenderer()` の配置判断は未着手のまま分離する

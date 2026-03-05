# Phase 8 リファクタ後再テスト計画

## 対象

- リファクタ実装変更はなし。Phase 5修正内容の回帰再確認を行う。

## SubAgent 並列テスト設計

- SubAgent-A: Main IPCライフサイクル
- SubAgent-B: Preload契約互換
- SubAgent-C: Renderer preflight連携
- SubAgent-D: 実行順序の統合判定

## 実行計画

| 区分         | テスト                                      | コマンド                                                                                                             | 期待                    |
| ------------ | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Main統合     | `ipc-double-registration.test.ts`           | `pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/ipc-double-registration.test.ts`                        | auth-key登録/解除が通る |
| Main単体     | `authKeyHandlers.test.ts`                   | `pnpm --filter @repo/desktop test:run src/main/ipc/__tests__/authKeyHandlers.test.ts`                                | 冪等登録/解除が通る     |
| Renderer連携 | `agentSlice.executeSkill.preflight.test.ts` | `pnpm --filter @repo/desktop test:run src/renderer/stores/agent/__tests__/agentSlice.executeSkill.preflight.test.ts` | preflight契約維持       |
| Hook連携     | `useSkillExecution.test.ts`                 | `pnpm --filter @repo/desktop test:run src/renderer/hooks/__tests__/useSkillExecution.test.ts`                        | UIフロー回帰なし        |

## 統合ログ保存方針

- 実行結果は Phase 9/10 の品質判定資料へ引き継ぐ。
- 失敗時はPhase 5へ差し戻し、登録漏れ/解除漏れの再検証を優先する。

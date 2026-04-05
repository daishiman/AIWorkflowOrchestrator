# Phase 11 Manual Test Checklist

## メタ情報

| 項目     | 値                                                                |
| -------- | ----------------------------------------------------------------- |
| Phase    | 11                                                                |
| タイプ   | NON_VISUAL                                                        |
| 実施対象 | TASK-P0-01 verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換） |

## チェック一覧

| TC-ID | 実施内容                                  | 実施コマンド / 方法                                                                                                                                                     | 結果               | 備考                          |
| ----- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----------------------------- |
| TC-01 | 実スキルディレクトリで verify 実行        | `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`                                                | PASS               | 60 tests passed               |
| TC-02 | Layer 1 エラーの確認                      | 同上                                                                                                                                                                    | PASS               | L1-001〜L1-005 系テストを含む |
| TC-03 | SKILL.md セクション不足の確認             | 同上                                                                                                                                                                    | PASS               | L2-001〜L2-007 系テストを含む |
| TC-04 | verificationEngine 未注入時の Facade 動作 | `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts -t "verificationEngine 未DI 時に全 PASS 扱いになる"` | PASS               | 1 test passed, 45 skipped     |
| TC-05 | TypeScript コンパイル確認                 | `pnpm --filter @repo/desktop typecheck` / `pnpm --filter @repo/shared typecheck`                                                                                        | PASS               | エラー 0 件                   |
| TC-06 | ESLint 確認                               | `pnpm lint`                                                                                                                                                             | PASS_WITH_WARNINGS | エラー 0 件、警告 10 件       |

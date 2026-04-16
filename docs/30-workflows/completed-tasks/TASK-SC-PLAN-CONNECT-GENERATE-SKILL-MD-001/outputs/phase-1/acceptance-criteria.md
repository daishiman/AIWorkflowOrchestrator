# 受け入れ基準 - TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001

## AC 一覧

| ID    | 受け入れ基準                                                                                      | 検証方法                                |
| ----- | ------------------------------------------------------------------------------------------------- | --------------------------------------- |
| AC-1  | `runCreateWorkflow` が `StructurePlanJson` を返した場合に `generateSkillMd` が呼ばれる            | 統合テスト TC-01                        |
| AC-2  | `runCreateWorkflow` が `null` を返した場合に `generateSkillMd` が呼ばれない                       | 統合テスト TC-02                        |
| AC-3  | `runCreateWorkflow` が `null` を返した場合にエラーログが出力される                                | 統合テスト TC-03                        |
| AC-4  | `generateSkillMd` が例外を投げた場合のエラーハンドリングが存在する                                | 統合テスト TC-04                        |
| AC-5  | `runCreateWorkflow` が例外を投げた場合のエラーハンドリングが存在する                              | 統合テスト TC-05                        |
| AC-6  | 既存の全テスト（TC-01〜TC-B06）が PASS し続ける                                                   | `pnpm --filter @repo/desktop test`      |
| AC-7  | TypeScript 型エラーがない                                                                         | `pnpm --filter @repo/desktop typecheck` |
| AC-8  | Lint エラーがない                                                                                 | `pnpm --filter @repo/desktop lint`      |
| AC-9  | `void structurePlan;` の行が削除されている                                                        | コードレビュー                          |
| AC-10 | create モード以外のモード（collaborative, orchestrate, update, improve-prompt）の動作に影響がない | 既存テスト PASS                         |

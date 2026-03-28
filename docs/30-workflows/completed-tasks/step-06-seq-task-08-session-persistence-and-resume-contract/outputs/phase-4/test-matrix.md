# Test Matrix

## Suite 一覧

| suite                                                      | 主対象              | 主要 assertion                                                                 |
| ---------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------ |
| `SkillCreatorWorkflowSessionRepository.test.ts`            | repository          | save / load / invalidate / revision update が正しい                            |
| `ResumeCompatibilityEvaluator.test.ts`                     | evaluator           | compatible / warning / incompatible / conflict を正しく返す                    |
| `SkillCreatorWorkflowEngine.persistence.test.ts`           | engine hydrate      | checkpoint から `currentPhase` / `awaitingUserInput` / `verifyResult` を戻せる |
| `session-persistence-handler.workflow.integration.test.ts` | IPC                 | workflow 専用 handler を追加した場合に failure envelope が安定する             |
| `RuntimeSkillCreatorFacade.resume-path.test.ts`            | runtime integration | restore 後の review / verify / handoff 再入場が side effect を増やさない       |

## Regression Cases

| ID    | ケース                                | 期待値                                               |
| ----- | ------------------------------------- | ---------------------------------------------------- |
| RG-01 | `review-ready` checkpoint を保存する  | `awaitingUserInput.reason=plan_review` で restore 可 |
| RG-02 | `handoff-ready` checkpoint を保存する | bundle 再表示可、CLI 自動再送なし                    |
| RG-03 | version mismatch                      | `incompatible`                                       |
| RG-04 | route type mismatch                   | `incompatible`                                       |
| RG-05 | hash mismatch                         | `incompatible`                                       |
| RG-06 | root relocation only                  | `compatible_with_warning`                            |
| RG-07 | active lease by another writer        | `conflict`                                           |
| RG-08 | expected revision mismatch            | `conflict`                                           |
| RG-09 | workflow payload なし legacy session  | graceful reject                                      |
| RG-10 | cleanup 後に古い checkpoint が消える  | latest checkpoint が整合している                     |

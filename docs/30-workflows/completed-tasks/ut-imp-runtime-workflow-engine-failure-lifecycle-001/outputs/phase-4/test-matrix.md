# Test Matrix

| Suite                             | ファイル                                                                                                    | 観点                        | 期待結果                                             |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------- |
| engine transition guard           | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`                       | `plan -> verify` を拒否する | stable error を返す                                  |
| execute reject lifecycle          | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | executor reject             | failure snapshot を保存する                          |
| execute `success:false` lifecycle | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | `success:false`             | verify pending に進まない                            |
| verification review lifecycle     | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | verify fail review          | `awaitingUserInput.reason === "verification_review"` |
| facade regression                 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`                        | error normalization         | existing public contract を維持する                  |
| shared contract parity            | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`                                  | type sync                   | review payload と runtime shape が一致する           |

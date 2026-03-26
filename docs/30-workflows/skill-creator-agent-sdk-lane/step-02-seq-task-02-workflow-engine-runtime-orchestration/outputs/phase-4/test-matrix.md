# Test Matrix

## Suite 一覧

| suite                                                      | 主対象       | 主要 assertion                                                                                                          |
| ---------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `SkillCreatorWorkflowEngine.test.ts`                       | engine       | `currentPhase`, `awaitingUserInput`, `verifyResult`, phase artifacts, `resumeTokenEnvelope` の owner が engine に閉じる |
| `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | facade       | route decision と handoff bundle 生成が facade に閉じる                                                                 |
| `creatorHandlers.runtime-workflow.test.ts`                 | IPC          | shared union response と validation error envelope が一定である                                                         |
| `skill-creator-api.runtime-workflow.test.ts`               | preload      | public method の戻り値が shared contract と一致する                                                                     |
| `skillCreator.contract-parity.test.ts`                     | shared types | plan / execute / improve の union 型が handler / preload で消費できる                                                   |

## Regression Cases

| ID    | ケース                       | 期待値                                                  |
| ----- | ---------------------------- | ------------------------------------------------------- |
| RG-01 | `integrated_api` plan        | handoff guidance を返さず structured plan result を返す |
| RG-02 | `terminal_handoff` plan      | guidance を返し executor を呼ばない                     |
| RG-03 | `integrated_api` execute     | engine に route snapshot を渡してから executor を呼ぶ   |
| RG-04 | `terminal_handoff` execute   | bundle を返し executor を呼ばない                       |
| RG-05 | service exception            | graceful degradation が public failure envelope を返す  |
| RG-06 | verify fail                  | engine が next action を保持する                        |
| RG-07 | artifact persistence failure | error を記録し phase artifact owner を崩さない          |

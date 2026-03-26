# Ownership Matrix

## Owner

| 項目                | owner  | 補足                                              |
| ------------------- | ------ | ------------------------------------------------- |
| `currentPhase`      | engine | transition guard を含む                           |
| `awaitingUserInput` | engine | `plan_review` と `verification_review` を生成する |
| `verifyResult`      | engine | success / fail を保存する                         |
| phase artifacts     | engine | append で履歴を残す                               |
| route decision      | facade | engine に snapshot を渡す                         |
| executor call       | facade | reject を catch して engine へ戻す                |

## 実装境界

| ファイル                                                               | 責務                                           |
| ---------------------------------------------------------------------- | ---------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | state owner, transition guard, artifact append |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | execute public path, reject capture            |

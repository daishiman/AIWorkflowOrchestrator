# Implementation Sequencing

1. `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` に guard fail-first test を追加する
2. `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` に reject / review fail-first test を追加する
3. `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` に guard と failure helper を実装する
4. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` に reject / `success:false` path を実装する
5. `packages/shared/src/types/skillCreator.ts` を同期する
6. parent workflow 文書の同期差分を Phase 12 対象として整理する

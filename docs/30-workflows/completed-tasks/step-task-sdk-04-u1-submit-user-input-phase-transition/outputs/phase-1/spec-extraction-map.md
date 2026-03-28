# Spec Extraction Map

## System Spec ↔ Code Anchor 対応表

| System Spec                    | Spec Location                                      | Code Anchor                                   | Anchor File                                                                     | 用途               |
| ------------------------------ | -------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------- | ------------------ |
| submitUserInput IPC 契約       | `api-ipc-system-core.md` L76-109                   | `skill-creator:submit-user-input` handler     | `apps/desktop/src/main/ipc/creatorHandlers.ts` L246-285                         | IPC boundary       |
| AwaitingUserInput reason types | `api-ipc-system-core.md`                           | `SkillCreatorAwaitingUserInputReason`         | `packages/shared/src/types/skillCreator.ts` L394-396                            | 型定義             |
| Engine state owner             | `arch-electron-services-details-part2.md` L143-166 | `SkillCreatorWorkflowEngine`                  | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`          | state 管理         |
| Facade public bridge           | `arch-electron-services-details-part2.md`          | `RuntimeSkillCreatorFacade.submitUserInput()` | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` L128-147  | デリゲーション     |
| submitUserInput semantics 課題 | `lessons-learned-ipc-preload-runtime.md` L53-69    | `submitUserInput()` メソッド本体              | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` L273-310 | 遷移ロジック追加先 |
| Workflow state changed push    | `api-ipc-system-core.md`                           | `emitWorkflowStateChanged()`                  | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                  | renderer 通知      |
| Preload API exposure           | `api-ipc-system-core.md`                           | `submitUserInput` preload                     | `apps/desktop/src/preload/skill-creator-api.ts` L336-339                        | safeInvoke         |

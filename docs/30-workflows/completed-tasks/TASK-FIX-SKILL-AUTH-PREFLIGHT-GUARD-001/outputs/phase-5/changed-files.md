# Phase 5 変更ファイル一覧

## 本実装の変更対象

| 区分             | ファイル                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Main IPC         | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                 |
| Main IPC         | `apps/desktop/src/main/ipc/authKeyHandlers.ts`                                               |
| Preload          | `apps/desktop/src/preload/skill-api.ts`                                                      |
| Renderer         | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                                       |
| Renderer         | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                        |
| Renderer Store   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                       |
| Renderer Utility | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`                             |
| Test             | `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`                          |
| Test             | `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`                                |
| Test             | `apps/desktop/src/preload/__tests__/skill-api.contract.test.ts`                              |
| Test             | `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`                        |
| Test             | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx`                     |
| Test             | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.executeSkill.preflight.test.ts` |

## 仕様書更新対象（Phase 12 で同期）

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

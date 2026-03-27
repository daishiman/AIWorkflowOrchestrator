# Implementation Sequencing

1. `packages/shared/src/types/skillCreator.ts` に Layer 3 / Layer 4 verify DTO を追加する。
2. `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` と `RuntimeSkillCreatorFacade.ts` で mapping を定義する。
3. `apps/desktop/src/main/ipc/creatorHandlers.ts` と `apps/desktop/src/preload/skill-creator-api.ts` で bridge を公開する。
4. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` で verify detail card / provenance / delegated note / re-verify action を追加する。
5. `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` を含む unit/runtime test を同 wave で更新する。
6. `.claude/skills/aiworkflow-requirements/references/` と `.agents/skills/aiworkflow-requirements/references/` の canonical docs を同期し、index を再生成する。

## guard

- engine owner を renderer へ移さない
- Task07 / Task08 owner の項目を bridge の入力値にしない
- `apps/backend/` は今回の workflow 範囲外とし、変更不要を明示したまま維持する

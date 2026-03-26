# Spec Extraction Map

| 論点               | system spec / parent doc                  | code anchor                                                | この task で固定する内容                                       |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------- |
| reject path        | `arch-electron-services-details-part2.md` | `RuntimeSkillCreatorFacade.ts`                             | facade が reject を捕捉して engine へ failure state を記録する |
| invalid transition | `TASK-SDK-02 ownership-matrix.md`         | `SkillCreatorWorkflowEngine.ts`                            | engine が phase jump を拒否する                                |
| review prompt      | `TASK-SDK-04 index.md`                    | `packages/shared/src/types/skillCreator.ts`                | `verification_review` の consumer contract を成立させる        |
| artifact history   | `TASK-SDK-02 ownership-matrix.md`         | `SkillCreatorWorkflowEngine.ts`                            | append 正本へ統一する                                          |
| resume impact      | `TASK-SDK-08 index.md`                    | `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` | failure 後 snapshot が resume 前提を壊さない                   |

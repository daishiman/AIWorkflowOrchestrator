# Verify Improve Surface Matrix

| concern             | current owner                                  | current fact                                                                                   | Task06 で追加する surface             | non-goal                      |
| ------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------- |
| verify status       | `SkillCreatorWorkflowEngine`                   | `status`, `message`, `nextAction`, `updatedAt` を保持                                          | detail panel の verify section        | verify owner の変更           |
| provenance summary  | `SkillCreatorWorkflowEngine` + Task03 input    | `resolvedSkillCreatorRoot`, `manifestPath`, `resourceDescriptorHash`, `routeSnapshot` を持てる | panel header の provenance chip       | source discovery ロジック追加 |
| improve suggestions | `RuntimeSkillCreatorFacade.improve()`          | `RuntimeSkillCreatorImproveSuggestion[]` を返す                                                | suggestion selection list             | suggestion schema 再定義      |
| apply result        | `RuntimeSkillCreatorFacade.applyImprovement()` | `ApplyImprovementResult` を返す                                                                | result section と skippedDetails 表示 | file write policy 変更        |
| re-entry            | renderer action                                | 実装なし                                                                                       | re-verify 起点ボタン                  | create 主導線統合             |
| terminal handoff    | `RuntimePolicyResolver` / facade               | improve は guidance を返せる                                                                   | detail panel の side guidance         | handoff governance hardening  |

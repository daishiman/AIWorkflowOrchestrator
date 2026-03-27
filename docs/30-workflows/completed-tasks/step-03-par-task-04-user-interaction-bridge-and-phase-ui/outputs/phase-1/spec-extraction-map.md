# Spec Extraction Map

Task04 は Task02 engine owner を前提にしつつ、質問入力と phase UI を public bridge と renderer surface に落とす task である。

## Source Map

| source                                                                                                  | 取り込む事実                                                                                                | Task04 への反映                         |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `../requirements-draft.md`                                                                              | `currentPhase` / `awaitingUserInput` / `verifyResult` / `laneResponse` / `resumeToken` owner を先に定義する | owner と UI host を分離する             |
| `../root-workflow-pack/index.md`                                                                        | Task04 は interaction bridge と `awaitingUserInput` 契約を担う                                              | Task05-08 との境界を固定する            |
| `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`                              | engine が workflow state owner                                                                              | renderer owner 化を禁止する             |
| `../step-03-par-task-03-context-budget-and-resource-selection/index.md`                                 | provenance summary は upstream から受け取る                                                                 | source 再探索を renderer へ持ち込まない |
| `docs/30-workflows/unassigned-task/ut-sc-02-006-skill-lifecycle-panel-execute-handoff-ui-connection.md` | execute handoff が console-only で gap になっている                                                         | visible handoff を受入基準へ含める      |

## Code Anchor Map

| code anchor                     | current fact                                | Task04 の設計判断                                     |
| ------------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| `SkillCreatorWorkflowEngine.ts` | snapshot owner が Main にある               | workflow snapshot getter / event の起点にする         |
| `RuntimeSkillCreatorFacade.ts`  | `plan()` / `execute()` が engine と連動する | input submit と state read の facade 入口にする       |
| `creatorHandlers.ts`            | workflow state 用 handler がない            | `get-workflow-state` / `submit-user-input` を追加する |
| `preload/channels.ts`           | `skill-creator:*` channels は一部のみ       | workflow bridge channels を追加する                   |
| `skill-creator-api.ts`          | runtime public API に state bridge がない   | getter / submitter / listener を公開する              |
| `SkillLifecyclePanel.tsx`       | execute handoff が console-only             | handoff card host を追加する                          |
| `agentSlice.ts`                 | generation state のみ                       | snapshot cache を追加候補とする                       |

## Non-goals

| 項目                              | 理由          |
| --------------------------------- | ------------- |
| create primary entry の最終決定   | Task05 の責務 |
| verify / improve detail surface   | Task06 の責務 |
| approval / disclosure の最終 copy | Task07 の責務 |
| resume persistence 意味論         | Task08 の責務 |

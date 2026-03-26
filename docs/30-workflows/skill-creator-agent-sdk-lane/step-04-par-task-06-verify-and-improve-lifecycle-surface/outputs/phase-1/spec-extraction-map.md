# Spec Extraction Map

## 概要

Task06 が参照する system spec、current code anchor、fixed owner、delegated gap を 1 つの表へ集約する。

## 一次結論

| 観点       | 結論                                                               |
| ---------- | ------------------------------------------------------------------ |
| 真の論点   | verify truth を増やさず detail surface を足す                      |
| owner 境界 | `verifyResult` / `sourceProvenance` は engine owner のまま維持する |
| UI 境界    | Task04 は summary host、Task06 は detail panel                     |
| 非対象     | create 主導線、governance hardening、session persistence           |

## Source Map

| source                                                                                                   | 取り込む事実                                  | Task06 への反映                   |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------- |
| `../requirements-draft.md`                                                                               | verify は Layer 1 / 2、improve は提案生成     | 初回 scope の上限を固定する       |
| `../root-workflow-pack/index.md`                                                                         | Task06 は Task03 / Task04 の後、Task05 と並列 | sibling task 境界を固定する       |
| `../../step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-1/spec-extraction-map.md` | `verifyResult` owner は engine                | renderer owner 化を禁止する       |
| `../step-03-par-task-03-context-budget-and-resource-selection/phase-2-design.md`                         | provenance summary は Task03 から受け取る     | verify 対象表示へ再利用する       |
| `../step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-1/spec-extraction-map.md`     | Task04 は phase summary host                  | Task06 は detail panel を担当する |

## Code Anchor Map

| code anchor                                 | current fact                                                                                 | Task06 の設計判断                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `SkillCreatorWorkflowEngine.ts`             | `verifyResult`, `routeSnapshot`, `sourceProvenance` を保持する                               | owner を変えず detail DTO を読む                      |
| `RuntimeSkillCreatorFacade.ts`              | `improve()` と `applyImprovement()` が存在する                                               | improve / apply の public contract を再利用する       |
| `creatorHandlers.ts`                        | improve / apply の validation がある                                                         | verify detail bridge を同じ validation 方針で追加する |
| `skill-creator-api.ts`                      | `planSkill`, `executePlan`, `improveSkillWithFeedback`, `applyRuntimeImprovement` を公開する | renderer 呼び出し面を統一する                         |
| `ImprovementProposalPanel.tsx`              | apply UI はあるが verify detail を持たない                                                   | detail panel host へ拡張する                          |
| `agentSlice.ts`                             | analysis 系 state はあるが runtime verify state はない                                       | UI local state だけを追加し truth は持たない          |
| `packages/shared/src/types/skillCreator.ts` | runtime public DTO の配置先                                                                  | verify detail 用 DTO をここへ追加する                 |

## Delegated Gap

| delegated item                          | owner task   |
| --------------------------------------- | ------------ |
| create entry の最終遷移                 | Task05       |
| approval / disclosure / manual boundary | Task07       |
| persistence / resume compatibility      | Task08       |
| Layer 3 / Layer 4 verify                | future scope |

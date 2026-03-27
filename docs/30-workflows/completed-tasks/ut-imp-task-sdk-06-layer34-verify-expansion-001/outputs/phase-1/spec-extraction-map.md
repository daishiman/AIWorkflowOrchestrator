# Spec Extraction Map

## 概要

Layer 3 / Layer 4 verify 拡張で参照する system spec、current code anchor、owner 境界、delegated gap を 1 枚へ集約する。

## 一次結論

| 観点       | 結論                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| 真の論点   | deeper verify を追加しても verify owner を増やさない                          |
| owner 境界 | `verifyResult` / `sourceProvenance` / `routeSnapshot` は engine owner のまま  |
| UI 境界    | Task06 の panel host を拡張するが governance / session は受け取るだけに留める |
| 非対象     | approval / disclosure / persistence / resume invalidation                     |

## Source Map

| source                                                                                                                   | 取り込む事実                                           | 本 task への反映                     |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------ |
| `../unassigned-task/task-imp-task-sdk-06-layer34-verify-expansion-001.md`                                                | Why/What/How、Phase A-C、完了条件                      | concern inventory と Phase 12 閉じ方 |
| `../../step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md`                                                | 初回 scope は Layer 1 / 2、Layer 3 / 4 は future scope | genuine gap の正本                   |
| `../../step-04-par-task-06-verify-and-improve-lifecycle-surface/outputs/phase-2/verify-improve-surface-matrix.md`        | Layer 1 / 2 current owner と UI host                   | Layer 3 / 4 差分の基準               |
| `../skill-creator-agent-sdk-lane/step-05-seq-task-07-execution-governance-and-handoff-alignment/phase-1-requirements.md` | governance / handoff / manual boundary owner           | delegated item 固定                  |
| `../skill-creator-agent-sdk-lane/step-06-seq-task-08-session-persistence-and-resume-contract/index.md`                   | persistence / checkpoint / invalidation owner          | session semantics の非対象化         |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md`                                        | `HandoffGuidance` と Manual Boundary の canonical      | governance slot の参照専用化         |

## Code Anchor Map

| code anchor                                 | current fact                                                     | 設計判断                                        |
| ------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| `SkillCreatorWorkflowEngine.ts`             | `verifyResult` / `sourceProvenance` / `routeSnapshot` を保持する | owner を変えず detail DTO を読む                |
| `RuntimeSkillCreatorFacade.ts`              | verify / improve / apply / route decision の bridge を持つ       | Layer 3 / 4 verify bridge の追加候補            |
| `creatorHandlers.ts`                        | runtime public surface の validation を持つ                      | detail payload を同じ validation 方針で追加する |
| `skill-creator-api.ts`                      | renderer invoke 面を持つ                                         | preload surface を 1:1 同期する                 |
| `ImprovementProposalPanel.tsx`              | Task06 の improve / apply host                                   | deeper verify section と re-verify action host  |
| `packages/shared/src/types/skillCreator.ts` | runtime DTO の配置先                                             | Layer 3 / 4 field set の canonical              |

## Delegated Gap

| delegated item                                 | owner task |
| ---------------------------------------------- | ---------- |
| approval / disclosure / manual boundary        | Task07     |
| route priority / integrated vs handoff         | Task07     |
| persistence / checkpoint / resume invalidation | Task08     |
| stale session / lease / revision               | Task08     |

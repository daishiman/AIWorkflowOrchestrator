# Phase 2 Output: Responsibility Split Plan

## target topology

| family                         | current scope                                       | target shape                                   | 保持責務                                            | 退避責務                              |
| ------------------------------ | --------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------- | ------------------------------------- |
| G0 generated index             | `indexes/topic-map.md`                              | 現 workflow では split 実装しない              | regenerate、行数測定、blocked record                | generator sharding 実装               |
| F1 ledger / archive            | `LOGS.md`、`lessons-learned.md`、`task-workflow.md` | parent index + archive / domain shard          | 直近導線、最新運用ルール、active summary            | 古い履歴、完了 task 群、詳細教訓本文  |
| F2 pattern / rulebook          | patterns / quality / testing / guidelines / error   | family index + theme shard + history companion | quick navigation、重要原則、最新必須 pattern        | 長い例、過去タスク履歴、詳細補足      |
| F3 architecture / core         | arch / architecture / structure docs                | overview + domain shard + history companion    | overview、層境界、頻出参照                          | task history、surface-specific detail |
| F4 interfaces / api / security | interface / IPC / security docs                     | parent index + domain split + history split    | core contract、共通型、主要 channel index           | task history、長い例、domain 詳細     |
| F5 ui / ux                     | ui-ux family docs                                   | overview + surface shard + history split       | design principle、component map、主要 surface index | surface 個別 detail、旧完了履歴       |
| F6 support / platform          | deployment / db / devops docs                       | overview + subtopic split                      | 概要、選定方針、主要判断                            | target 別 detail、運用補足            |

## planned shape examples

| current                                              | planned shape example                                                                                                                                                                                                                              |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LOGS.md`                                            | `LOGS.md` + `references/logs-archive-2026-q*.md`                                                                                                                                                                                                   |
| `references/lessons-learned.md`                      | `references/lessons-learned.md` + `references/lessons-learned-ui.md` + `references/lessons-learned-ipc.md` + `references/lessons-learned-workflow.md`                                                                                              |
| `references/task-workflow.md`                        | `references/task-workflow.md` + `references/task-workflow-active.md` + `references/task-workflow-completed.md` + `references/task-workflow-backlog.md`                                                                                             |
| `references/architecture-implementation-patterns.md` | `references/architecture-implementation-patterns.md` + `references/architecture-implementation-patterns-frontend.md` + `references/architecture-implementation-patterns-desktop.md` + `references/architecture-implementation-patterns-testing.md` |
| `references/interfaces-agent-sdk-skill.md`           | `references/interfaces-agent-sdk-skill.md` + feature/domain shards + history companion                                                                                                                                                             |
| `references/ui-ux-feature-components.md`             | `references/ui-ux-feature-components.md` + surface shards + history companion                                                                                                                                                                      |
| `references/deployment.md`                           | `references/deployment.md` + target-specific child docs                                                                                                                                                                                            |

## split ルール

1. parent file は overview / index 役に縮め、450 行以下を目標にする。
2. child shard は 500 行以下に収める。
3. 履歴と完了 task は history companion または archive へ退避する。
4. 新規 file は `references/` 直下の flat path を使う。
5. `.claude` を先に更新し、`.agents` に同名 mirror を同期する。
6. `topic-map.md` は hand-edit せず、`generate-index.js` 再生成後に行数を測定する。

## dependency contract

| parent                                                                    | child / dependent                                                            | 保持する依存関係                                                |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `SKILL.md`                                                                | `indexes/quick-reference.md`、`indexes/resource-map.md`、family parent files | 入口三層が family overview へ到達できる                         |
| family parent file                                                        | child shard、history companion、archive companion                            | parent から詳細と履歴へ 1 段で落ちる                            |
| `references/task-workflow.md`、`references/lessons-learned.md`、`LOGS.md` | archive / domain shard                                                       | ledger / history から分割先へ移動できる                         |
| `indexes/quick-reference.md`、`indexes/resource-map.md`                   | family parent file                                                           | discovery index から分割後の親へ到達できる                      |
| `.claude/skills/aiworkflow-requirements`                                  | `.agents/skills/aiworkflow-requirements`                                     | 正本と mirror が同名構造で一致する                              |
| `generate-index.js` 出力                                                  | `indexes/topic-map.md`、`indexes/keywords.json`                              | generated index は manual docs split と分けて status を記録する |

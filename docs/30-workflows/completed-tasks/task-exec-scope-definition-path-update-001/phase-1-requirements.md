# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 1                                          |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

source task の path drift と duplicate source を吸収し、actual target と受入基準を 1 枚に固定する。

## 実行タスク

- source facts 抽出: Issue #1664、2 本の unassigned task、parent workflow を照合する
- actual target 固定: 実更新対象を Task01 `outputs/phase-1/scope-definition.md` に決定する
- scope 固定: 追記対象、非対象、close-out no-op 条件を明文化する
- AC 定義: grep / diff / row preservation で検証できる基準へ落とす

## 参照資料

| 資料名                    | パス                                                                                                                                     | 説明                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| main source               | `docs/30-workflows/completed-tasks/unassigned-task/task-exec-scope-definition-path-update-001.md`                                        | richer source task               |
| duplicate source          | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-exec-01-scope-definition-execution-capability-path.md`                        | historical duplicate             |
| parent workflow           | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md`                            | Task01 の正本                    |
| target file               | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/outputs/phase-1/scope-definition.md` | 実更新対象                       |
| parent requirement        | `docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/phase-1-requirements.md`             | canonical doc set の要件         |
| execution capability spec | `.agents/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`                                                | `execution-capability.ts` の背景 |
| canonical workflow        | `.agents/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md`                          | workflow の current entrypoint   |

## 成果物

| 成果物                  | パス                                         | 説明                           |
| ----------------------- | -------------------------------------------- | ------------------------------ |
| requirements definition | `outputs/phase-1/requirements-definition.md` | FR / NFR / AC                  |
| scope definition        | `outputs/phase-1/scope-definition.md`        | in / out / actual target       |
| spec extraction map     | `outputs/phase-1/spec-extraction-map.md`     | source と current facts の対応 |

## 統合テスト連携

- Phase 1 では command 実行自体は行わないが、Phase 4 で使う `ls` / `rg` / `git diff` / workflow validator の根拠を固定する。
- duplicate source と CLOSED issue を false blocker にしない条件を先に書き、Phase 3 gate の前提にする。

## 完了条件

- [ ] actual target path が 1 つに固定されている
- [ ] source path drift が明記されている
- [ ] AC-1 から AC-4 が検証可能な文で定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

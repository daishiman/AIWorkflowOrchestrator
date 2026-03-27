# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                                                |
| ------ | ----------------------------------------------------------------- |
| Phase  | 1                                                                 |
| 機能名 | task-imp-runtime-policy-centralization-implementation-closure-001 |
| 作成日 | 2026-03-27                                                        |

## 目的

Issue #1663 が要求する current code close-out の対象、除外、受入基準、依存ゲートを明文化し、Phase 2 以降の設計入力を固定する。

## 実行タスク

- gap を consumer / transport / test / cleanup 条件の 4 観点で整理する
- current code anchor と Task02 設計成果物の対応を固定する
- AC-1 から AC-6 をテスト可能な文へ落とす
- Phase 1-3 完了前に実装へ進まない gate を明記する

## 参照資料

| 資料名          | パス                                                                                      | 説明                        |
| --------------- | ----------------------------------------------------------------------------------------- | --------------------------- |
| 元タスク        | `../unassigned-task/task-imp-runtime-policy-centralization-implementation-closure-001.md` | 問題定義の正本              |
| Task02 index    | `../step-02-seq-task-02-runtime-policy-centralization/index.md`                           | design close-out の前提     |
| Task02 contract | `../step-02-seq-task-02-runtime-policy-centralization/outputs/phase-2/contract-matrix.md` | ownership / policy contract |
| Task02 gate     | `../step-02-seq-task-02-runtime-policy-centralization/outputs/phase-3/gate-decision.md`   | 実装着手条件                |
| parent pack     | `../ai-runtime-execution-responsibility-realignment/index.md`                             | workflow 全体の依存順       |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                                            | 内容                         |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| canonical workflow | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md` | current canonical workflow   |
| auth / capability  | `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md`                                     | capability vocabulary        |
| IPC core           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | IPC envelope と handler 契約 |
| llm ipc types      | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`                                            | health / runtime transport   |
| security ipc       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`                               | preload / sender 境界        |
| governance         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                            | same-wave sync と ledger     |

## 成果物

| 成果物                  | パス                                         | 説明                                       |
| ----------------------- | -------------------------------------------- | ------------------------------------------ |
| spec extraction map     | `outputs/phase-1/spec-extraction-map.md`     | spec / code anchor / task02 成果物の対応表 |
| current state inventory | `outputs/phase-1/current-state-inventory.md` | 現状 gap 棚卸し                            |
| scope definition        | `outputs/phase-1/scope-definition.md`        | 対象 / 除外 / 依存 / gate 条件             |

## 統合テスト連携

- Phase 4 の test matrix は `consumer / transport / cleanup condition` の 3 軸でケース分解する。
- `AI_CHECK_CONNECTION` legacy route は normal path と cleanup path を分離して記録する。
- Task02 contract の ownership table を破る回帰ケースを、後続 Phase で必ず negative test 化する。

## 完了条件

- [ ] current code gap が consumer / transport / test / cleanup 条件に分解されている
- [ ] AC-1 から AC-6 が検証可能な文になっている
- [ ] 対象 / 除外 / 依存 / gate 条件が明記されている
- [ ] Phase 1-3 完了前に Phase 4 へ進まない条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

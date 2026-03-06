# Phase 2 下流引き渡し計画

## handoff 方針

- downstream が参照する正本は「A/B/C/D の completed 正本 + E の outputs」に限定する。
- unlock は task 別に判断し、まとめて一括解放しない。
- handoff 条件は downstream 実装開始前に `review-gate.md` で再確認する。

## Task 別計画

| 下流タスク                          | 必須参照                  | 前提成果物                                                                     | ブロッカー解除条件                                         | 不合格時の戻り先 |
| ----------------------------------- | ------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- | ---------------- |
| `TASK-UI-02-GLOBAL-NAV-CORE`        | D 正本, E gate, E handoff | `outputs/phase-2/integration-gate-design.md`, `outputs/phase-5/review-gate.md` | navigation/state が PASS、parent/current path が一意       | Phase 2          |
| `TASK-UI-03-AGENT-VIEW-ENHANCEMENT` | A/B/C 正本, E sync ledger | `outputs/phase-2/spec-sync-matrix.md`, `outputs/phase-5/spec-sync-targets.md`  | state/ipc/security が PASS、新規 IPC 追加不要が説明済み    | Phase 1 または 2 |
| `TASK-UI-04A-WORKSPACE-LAYOUT`      | A/D 正本, E gate          | `outputs/phase-2/dependency-handoff-plan.md`, `outputs/phase-5/review-gate.md` | `workspace` 導線、ViewType handoff、A/B/C/D 正本リンク固定 | Phase 2          |

## 引き渡しパッケージ

| パッケージID | 内容                                             | 受け取り先                                |
| ------------ | ------------------------------------------------ | ----------------------------------------- |
| HP-01        | ViewType / nav 契約一覧                          | `TASK-UI-02`, `TASK-UI-04A`               |
| HP-02        | notification / history / IPC / security 判定根拠 | `TASK-UI-03`, `TASK-UI-04A`               |
| HP-03        | sync target 一覧と Step 1-A/1-B/1-C/2 の分岐     | `TASK-UI-02`, `TASK-UI-03`, `TASK-UI-04A` |
| HP-04        | path 正規化ルールと parent/current の参照導線    | downstream 全件                           |

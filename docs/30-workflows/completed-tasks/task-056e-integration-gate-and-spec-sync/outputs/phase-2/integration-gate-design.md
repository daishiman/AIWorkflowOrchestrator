# Phase 2 統合レビューゲート設計

## 設計方針

- 判定は `state / ipc / security / navigation / documentation` の5軸で行う。
- 1軸でも `MAJOR` 条件に該当した場合は gate 全体を `MAJOR` とする。
- `MINOR` は Phase 4 着手前に解消条件を残し、戻り先 Phase を明示する。

## 判定フロー

1. 上流正本と aiworkflow 正本の証跡ソースを固定する。
2. 5軸ごとに PASS / MINOR / MAJOR 条件を評価する。
3. downstream 3タスクの unblock 可否を task 別に決める。
4. `review-gate.md` に最終判定と戻り先を記録する。

## 軸別設計

| 軸            | 主な確認項目                                       | 主証跡                                                             | PASS 条件                                                    | MINOR 条件           | MAJOR 条件                            | 戻り先           |
| ------------- | -------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ | -------------------- | ------------------------------------- | ---------------- |
| state         | A/C/D の state 境界が矛盾しない                    | A 正本, C 正本, D 正本, `arch-state-management.md`                 | ViewType / notification / history の境界が一意               | 表記ゆれのみ         | state 境界または責務が二重定義        | Phase 1 または 2 |
| ipc           | B/C の channel 契約が downstream に説明可能        | B 正本, C 正本, `api-ipc-system.md`                                | `notification:*` / `history:*` の契約が説明可能              | channel 名の補足不足 | invoke/on、payload、Result 契約の欠落 | Phase 2          |
| security      | sender / whitelist / auth gate の根拠がある        | B 正本, `security-api-electron.md`, `security-electron-ipc.md`     | sender/auth/whitelist の判定根拠がある                       | 参照箇所の補足不足   | security 判断根拠の欠落               | Phase 1 または 2 |
| navigation    | D と `TASK-UI-02` の handoff が成立する            | D 正本, `ui-ux-navigation.md`, `task-057-ui-02-global-nav-core.md` | `workspace` / `skillCenter` / `historySearch` handoff が成立 | ラベル補足不足       | ViewType / nav handoff 欠落           | Phase 2          |
| documentation | sync target、logs、lessons、未タスク運用が説明可能 | `task-workflow.md`, `lessons-learned.md`, Phase 12 guides          | Step 1-A/1-B/1-C/2 が追跡可能                                | 文言補足不足         | sync 区分欠落、台帳更新先欠落         | Phase 1 または 2 |

## downstream 解放設計

| 下流タスク                          | 必須条件                                                   | 参照成果物                                             |
| ----------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| `TASK-UI-02-GLOBAL-NAV-CORE`        | navigation/state が PASS、parent/current path が解決済み   | `dependency-handoff-plan.md`, `review-gate.md`         |
| `TASK-UI-03-AGENT-VIEW-ENHANCEMENT` | state/ipc/security が PASS、新規 IPC 追加不要が説明済み    | `spec-sync-matrix.md`, `review-gate.md`                |
| `TASK-UI-04A-WORKSPACE-LAYOUT`      | `workspace` route の handoff、A/B/C/D 正本リンクが固定済み | `dependency-handoff-plan.md`, `traceability-matrix.md` |

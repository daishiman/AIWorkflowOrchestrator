# Phase 5 レビューゲート

## 総則

- 全軸 PASS で gate 全体を PASS とする。
- 1軸でも MAJOR があれば gate 全体を MAJOR とする。
- MINOR は downstream 解放前に解消条件を明記し、Phase 10 で再判定する。

## 5軸判定表

| 軸            | 主証跡                                                         | PASS 条件                                                                                                | MINOR 条件       | MAJOR 条件                                | 戻り先       |
| ------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------- | ------------ |
| state         | A/C/D 正本, `arch-state-management.md`                         | `workspace` / `skillCenter` / `historySearch` と `notificationSlice` / `historySearchSlice` の境界が一意 | 表記の揺れのみ   | state 境界が二重定義または欠落            | Phase 1 or 2 |
| ipc           | B/C 正本, `api-ipc-system.md`                                  | `notification:*` / `history:*` の契約と戻り値が追跡可能                                                  | channel 補足不足 | invoke/on、payload、Result 契約の欠落     | Phase 2      |
| security      | B 正本, `security-api-electron.md`, `security-electron-ipc.md` | sender / whitelist / auth gate の根拠がある                                                              | 根拠の追記不足   | sender/auth の判断根拠がない              | Phase 1 or 2 |
| navigation    | D 正本, `TASK-UI-02` 正本                                      | nav handoff と ViewType handoff が downstream へ渡せる                                                   | ラベル補足不足   | `TASK-UI-02` / `TASK-UI-04A` handoff 欠落 | Phase 2      |
| documentation | Phase 12 guides, `task-workflow.md`, `lessons-learned.md`      | Step 1-A/1-B/1-C/2 と未タスク分岐が追跡可能                                                              | 文言補足不足     | sync target または台帳更新先の欠落        | Phase 1 or 2 |

## downstream ブロッカー解除条件

| タスク                              | 解放可否       | 条件                                                            |
| ----------------------------------- | -------------- | --------------------------------------------------------------- |
| `TASK-UI-02-GLOBAL-NAV-CORE`        | 条件付き解放可 | state/navigation が PASS、parent/current path が一意            |
| `TASK-UI-03-AGENT-VIEW-ENHANCEMENT` | 条件付き解放可 | state/ipc/security が PASS、Step 2 条件判定が定義済み           |
| `TASK-UI-04A-WORKSPACE-LAYOUT`      | 条件付き解放可 | `workspace` 導線、A/B/C/D の参照リンク、documentation 軸の PASS |

## 失敗時の記録ルール

| 判定  | 記録内容                                                |
| ----- | ------------------------------------------------------- |
| MINOR | 問題、解消条件、再確認コマンド、再開条件                |
| MAJOR | 問題、戻り先 Phase、再レビュー条件、downstream への影響 |

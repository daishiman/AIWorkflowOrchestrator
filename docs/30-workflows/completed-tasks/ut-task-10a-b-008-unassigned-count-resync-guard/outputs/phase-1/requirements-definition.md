# Phase 1 要件定義書

## 要約

- historical: Issue #996 と元指示書は「7件→5件」の初回是正経緯として参照する。
- canonical: `task-workflow.md` 残課題表、completed 指示書配置、実在パスを正本とする。
- derived: `ui-ux-feature-components.md` と parent `unassigned-task-detection.md` は canonical へ追随する。

## 日付整理

| 日付       | 事象                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 2026-03-02 | Issue #996 起点。5件同期が必要になった                                       |
| 2026-03-05 | `UT-TASK-10A-B-001` 完了、`UT-TASK-10A-B-003` 完了、`UT-TASK-10A-B-009` 追加 |
| 2026-03-06 | `UT-TASK-10A-B-008` を完了し、3台帳同期ガードを実装                          |

## 機能要件

| ID   | 要件                                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------- |
| FR-1 | active set は固定レンジでなく canonical ledger から導出する                                           |
| FR-2 | completed 集合 `001 / 003 / 008` を active 集合から除外する                                           |
| FR-3 | current active set `002 / 004 / 005 / 006 / 007 / 009` を 3台帳へ同一ターンで反映する                 |
| FR-4 | `validate-task10ab-ledger-sync` / `verify-unassigned-links` / `audit --diff-from HEAD` で機械検証する |

## 非機能要件

| ID    | 要件                                                        |
| ----- | ----------------------------------------------------------- |
| NFR-1 | `currentViolations.total=0` を合否判定に使う                |
| NFR-2 | `baselineViolations.total` は監視値として別記録する         |
| NFR-3 | exact date を残し、2026-03-02 と 2026-03-05/06 を混同しない |

## current / completed 集合

| 区分               | ID                                                     |
| ------------------ | ------------------------------------------------------ |
| current active set | `UT-TASK-10A-B-002`, `004`, `005`, `006`, `007`, `009` |
| completed set      | `UT-TASK-10A-B-001`, `003`, `008`                      |

## 物理配置の扱い

| 観点             | 判断                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| completed 指示書 | `docs/30-workflows/completed-tasks/` 配下を正とする                              |
| 継続UT           | `docs/30-workflows/unassigned-task/` 配下を正とする                              |
| anomaly          | duplicate ID を持つ物理ファイルは active set に自動採用せず、risk として記録する |

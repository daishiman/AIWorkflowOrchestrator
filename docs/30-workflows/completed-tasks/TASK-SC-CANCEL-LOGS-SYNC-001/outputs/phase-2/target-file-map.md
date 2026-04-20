---
phase: 2
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
artifact: target-file-map
created_date: 2026-04-20
status: completed
---

# Phase 2 成果物: 対象ファイルマップ

## 対象ファイル一覧

| #   | ファイル                                                                                       | 形式                  | 追記位置                         | AC   | Lane |
| --- | ---------------------------------------------------------------------------------------------- | --------------------- | -------------------------------- | ---- | ---- |
| 1   | `.claude/skills/task-specification-creator/LOGS.md`                                            | h2 + 3節構成 + 表     | 末尾追加                         | AC-1 | A    |
| 2   | `.claude/skills/aiworkflow-requirements/LOGS.md`                                               | h2 + 3節構成 + 表     | 末尾追加                         | AC-2 | A    |
| 3   | `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md`                    | h2 + メタ表           | エントリ削除（completed へ移動） | AC-3 | B    |
| 4   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-recent-2026-04g.md` | h2 + メタ表 + h4 節   | 末尾追加                         | AC-3 | B    |
| 5   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`         | h2 教訓 + h3 L-\*\*\* | 末尾追加（3 知見）               | AC-4 | B    |
| 6   | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                            | フロントマター + 表   | 2 箇所更新                       | AC-5 | C    |

## ファイルごとの詳細情報

### 1. task-specification-creator/LOGS.md

| 項目           | 値                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------- |
| パス           | `.claude/skills/task-specification-creator/LOGS.md`                                                        |
| 既存行数       | 約 3214 行                                                                                                 |
| 最新エントリ   | 2026-04-19 `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 Phase 12 close-out sync`                                |
| 追記形式       | h2 + h3（変更内容 / 背景）+ 表（種別 / 変更対象 / 結果 / 検証）                                            |
| 追記位置       | ファイル末尾（時系列昇順維持）                                                                             |
| 追記内容の要点 | 親タスク完了の受けて repo-wide sync wave 発足、本タスク（TASK-SC-CANCEL-LOGS-SYNC-001）への follow-up 参照 |

### 2. aiworkflow-requirements/LOGS.md

| 項目           | 値                                                                    |
| -------------- | --------------------------------------------------------------------- |
| パス           | `.claude/skills/aiworkflow-requirements/LOGS.md`                      |
| 既存行数       | 約 3040 行                                                            |
| 追記形式       | h2 + h3 + 表                                                          |
| 追記位置       | ファイル末尾                                                          |
| 追記内容の要点 | spec-update-workflow 準拠、3 知見への references、repo-wide sync 手法 |

### 3-4. canonical spec: task-workflow-active → completed

| 項目     | active                              | completed                                                            |
| -------- | ----------------------------------- | -------------------------------------------------------------------- |
| パス     | `.../task-workflow-active.md`       | `.../task-workflow-completed-recent-2026-04g.md`                     |
| 既存行数 | 約 151 行                           | 約 579 行                                                            |
| 操作     | 親タスクエントリを削除              | 末尾に追加                                                           |
| 追記形式 | -                                   | h2 + メタ表 + h4（実施内容 / 検証証跡 / 苦戦箇所 / lessons-learned） |
| 追記位置 | -                                   | ファイル末尾                                                         |
| 移動対象 | 親タスク 2026-04-19 active エントリ | -                                                                    |

### 5. lessons-learned-current-2026-04.md

| 項目       | 値                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------- |
| パス       | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`             |
| 既存行数   | 約 1868 行                                                                                         |
| 追記形式   | h2 教訓 + 3 × h3 エントリ                                                                          |
| 追記位置   | ファイル末尾                                                                                       |
| 追記内容   | `L-SC-CANCEL-NON-VISUAL-001` / `L-SC-CANCEL-SCOPE-BOUNDARY-001` / `L-SC-CANCEL-REPO-WIDE-SYNC-001` |
| 各 h3 構成 | 表（症状 / 原因 / 解決策 / 設計原則 / 適用条件 / 関連タスク）                                      |

### 6. 親 index.md

| 項目               | 値                                                                  |
| ------------------ | ------------------------------------------------------------------- |
| パス               | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md` |
| 操作箇所           | フロントマター `status` + Phase 一覧テーブル Phase 12 行            |
| フロントマター変更 | `status: in_progress` → `status: pending_pr`                        |
| `current_phase`    | 13 を維持                                                           |
| Phase 12 行        | ステータス列を `completed` に（備考に `2026-04-20` 完了日記録）     |
| Phase 13 行        | `pending` 維持（PR 作成 blocked）                                   |

## mirror 同期対象（Phase 12 で実施）

| canonical                   | mirror                      | 同期方式                      |
| --------------------------- | --------------------------- | ----------------------------- |
| `agents/` canonical         | `.claude/agents/` mirror    | Phase 12 で parity guard 実行 |
| `.claude/skills/` canonical | `skills/` mirror (もし存在) | Phase 12 で parity guard 実行 |

## 参照資料

- [sync-design.md](sync-design.md)
- [../../phase-2-design.md](../../phase-2-design.md)

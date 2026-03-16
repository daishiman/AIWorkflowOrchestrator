# 未タスク検出レポート

## メタ情報

| 項目               | 値         |
| ------------------ | ---------- |
| タスクID           | UT-06-001  |
| 検出日             | 2026-03-16 |
| 検出件数           | 1件        |
| 再評価クローズ対象 | なし       |

## 概要

エレガンスレビューにより、CSS変数定義の欠如が1件検出された。

## 調査結果

検出件数: **1件**

### 未タスク1: CSS リスクレベル変数定義（UT-06-001-CSS-RISK-VARS）

| 項目     | 内容                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| タスクID | UT-06-001-CSS-RISK-VARS                                                                                                         |
| 優先度   | medium                                                                                                                          |
| 検出理由 | `TOOL_RISK_CONFIG.headerColorToken` が参照する CSS 変数 `--risk-low` / `--risk-medium` / `--risk-high` がプロジェクト内に未定義 |
| 影響     | UT-06-004 (PermissionDialog) で CSS 変数参照時に undefined となる                                                               |
| 指示書   | `docs/30-workflows/unassigned-task/task-ut-06-001-css-risk-variables-definition.md`                                             |

### 3ステップ完了確認（P3対策）

| ステップ                           | 内容                                                                                | ステータス |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ---------- |
| ① 指示書作成                       | `docs/30-workflows/unassigned-task/task-ut-06-001-css-risk-variables-definition.md` | 完了       |
| ② task-workflow 残課題テーブル登録 | `task-workflow-backlog.md` に登録                                                   | 完了       |
| ③ 関連仕様書リンク                 | `security-implementation.md` に参照追記                                             | 完了       |

## 再評価クローズ対象

なし

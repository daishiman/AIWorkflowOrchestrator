# [#1088] [UT-10A-F-2WORKFLOW-BASELINE-NORMALIZATION] 2Workflow Baseline 正規化自動化

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-10A-F-2WORKFLOW-BASELINE-NORMALIZATION           |
| 分類         | 改善                                                |
| 対象機能     | 2Workflow 運用（current / completed baseline 管理） |
| 優先度       | 中                                                  |
| 見積もり規模 | 中規模                                              |
| 発見元       | TASK-10A-F Phase 12 実行時の苦戦箇所 #6, #7         |
| 発見日       | 2026-03-08                                          |

## 概要

2workflow 間の整合性検証と baseline 正規化を自動化するスクリプトを作成し、Phase 12 の手動同期コストを削減する。

## 背景・課題

- current workflow の stale 化（苦戦箇所 #6）: completed workflow 完了後に current workflow の仕様書が陳腐化
- legacy drift による baseline 汚染（苦戦箇所 #7）: ファイル命名揺れ、成果物パス不統一が残存
- 2workflow 間の整合性確認が完全に手作業（Phase 12 作業時間の 30%以上）

## 成果物

- `validate-2workflow-sync.js`（検証スクリプト）
- `normalize-baseline.js`（正規化スクリプト）
- テストフィクスチャ + テストコード
- 運用ガイドライン

## タスク仕様書

`docs/30-workflows/unassigned-task/task-10a-f-2workflow-baseline-normalization.md`

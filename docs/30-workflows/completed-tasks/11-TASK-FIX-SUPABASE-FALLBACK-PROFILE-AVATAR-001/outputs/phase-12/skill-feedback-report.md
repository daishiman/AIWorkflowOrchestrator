# Phase 12: Skill Feedback Report

## task-specification-creator

| 項目       | 内容                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 良かった点 | `validate-phase11-screenshot-coverage` と `validate-phase12-implementation-guide` が stale 成果物を機械的に落としてくれた                                                                   |
| 改善提案 1 | App shell 遷移が不安定なときは、Phase 11 ガイドに「本番コンポーネント + Store + 公開 contract を維持した専用 harness で再撮影してよい」をより強く出すと迷いが減る                           |
| 改善提案 2 | Phase 12 テンプレートに「画面証跡から見つけた follow-up issue を `discovered-issues.md` と `unassigned-task-*` に同期する」チェックを追加すると、今回のような UI 文言漏れを取りこぼしにくい |

## aiworkflow-requirements

| 項目       | 内容                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 良かった点 | `error-handling.md`, `interfaces-auth.md`, `task-workflow.md` の 3 点で fallback 契約と follow-up 登録を整理しやすかった                                 |
| 改善提案 1 | fallback error の `message` は transport default、UI は `error.code` で localized message を決める、という責務線を auth 系仕様へ最初から明記した方がよい |
| 改善提案 2 | `completed-tasks/unassigned-task/` への移管後に `task-workflow.md` のリンクを自動で再確認する運用を既定化すると broken link を減らせる                   |

## 横断的な教訓

| 教訓                               | 内容                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| 画面確認は取得だけでなく目視が必要 | 今回は screenshot 取得後に実際の画像を見たことで、英語 error 露出を検出できた |
| current / baseline 分離は有効      | workflow11 固有の新規課題 1 件と、既存 broken link を混同せず処理できた       |

## 今回の反映結果

| 反映先                       | 内容                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `skill-creator`              | Phase 12 で fallback error の `transport message` と UI localized message の責務を分離し、画面検証から見つかった issue を未タスク化まで閉じるパターンを追加 |
| `task-specification-creator` | system spec を更新した場合は domain spec 側にも苦戦箇所と再利用手順を残す完了条件を追記                                                                     |

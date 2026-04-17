# TASK-SW-STRUCT-002 未タスク検出レポート

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-STRUCT-002 |
| 作成日   | 2026-04-17         |

## 正式な未タスク

| ID     | 内容                                | 重要度 | 備考                                                            |
| ------ | ----------------------------------- | ------ | --------------------------------------------------------------- |
| UT-001 | `structurePlan.purpose` の LLM 統合 | 中     | 現状は `options.description` の固定値。将来タスクとして分離済み |

## スコープ外確認

以下は TASK-SW-STRUCT-002 のスコープ外として明示的に除外済み:

- `runCreateWorkflow` の出力仕様修正（TASK-SW-STRUCT-001）
- LLM 統合（実際のAI生成処理との接続）—別タスクへ分離済み
- `generate_skill_md.js` スクリプト自体の変更

## 観察メモ（未タスク化しない）

- `structurePlan.features` は現状未使用だが、今回の接続配線に直接の障害はない
- `plan.workflow.phases` / `plan.workflow.tasks` は空配列だが、現時点の `generate_skill_md.js` 契約では許容されている
- SKILL.md のより詳細なカスタマイズは将来の改善余地として残るが、今回の完了条件には含めない

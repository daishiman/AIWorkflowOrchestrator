# システム仕様更新サマリ

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | UT-06-002  |
| 作成日   | 2026-03-23 |
| 状態     | 完了       |

## 更新実績

### 更新対象

| #   | ファイル                                                         | 更新内容                                             | 状態 |
| --- | ---------------------------------------------------------------- | ---------------------------------------------------- | ---- |
| 1   | `references/security-skill-execution.md`                         | Permission Store V2 セクション追加 + v1.7.0 変更履歴 | 完了 |
| 2   | `references/ui-ux-settings-core.md`                              | permission:clear-session チャネル追加                | 完了 |
| 3   | `references/interfaces-agent-sdk-skill.md`                       | IPermissionStoreV2 インターフェース参照追加          | 完了 |
| 4   | `references/task-workflow-completed-skill-lifecycle-security.md` | UT-06-002 完了記録追加                               | 完了 |
| 5   | `references/task-workflow-completed-skill-lifecycle.md`          | インデックス・ルーティングテーブル更新               | 完了 |
| 6   | `references/task-workflow-backlog.md`                            | 未タスク4件登録                                      | 完了 |
| 7   | `LOGS.md` (aiworkflow-requirements)                              | タスク完了記録追加                                   | 完了 |
| 8   | `LOGS.md` (task-specification-creator)                           | タスク完了記録追加                                   | 完了 |
| 9   | `SKILL.md` (aiworkflow-requirements)                             | 変更履歴 v9.02.15 追加                               | 完了 |
| 10  | `SKILL.md` (task-specification-creator)                          | 変更履歴 v10.09.17 追加                              | 完了 |
| 11  | `indexes/topic-map.md`                                           | generate-index.js 再生成                             | 完了 |
| 12  | `indexes/keywords.json`                                          | generate-index.js 再生成                             | 完了 |

### 実装変更の要約

| 変更カテゴリ     | 変更内容                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| 新規型定義       | AllowedToolEntryV2, ExpiryPolicy, IPermissionStoreV2, PermissionStoreSchemaV2, ClearSessionResponse |
| 新規関数         | calcExpiresAt                                                                                       |
| 拡張メソッド     | isToolAllowed (6分岐), allowToolV2, revokeSessionEntries (V2), getAllowedToolEntriesV2              |
| 新規 IPC         | permission:clear-session                                                                            |
| マイグレーション | V1→V2 自動マイグレーション                                                                          |

### 未タスク

| ID             | 内容                        | 優先度 | 指示書                                                                   |
| -------------- | --------------------------- | ------ | ------------------------------------------------------------------------ |
| UT-06-002-UT-1 | sender 検証追加             | 中     | `docs/30-workflows/unassigned-task/UT-06-002-UT-1-sender-validation.md`  |
| UT-06-002-UT-2 | before-quit フック          | 中     | `docs/30-workflows/unassigned-task/UT-06-002-UT-2-before-quit-hook.md`   |
| UT-06-002-UT-3 | calcExpiresAtLocal 重複解消 | 低     | `docs/30-workflows/unassigned-task/UT-06-002-UT-3-calc-expires-dedup.md` |
| UT-06-002-UT-4 | ロガー統一                  | 低     | `docs/30-workflows/unassigned-task/UT-06-002-UT-4-logger-unification.md` |

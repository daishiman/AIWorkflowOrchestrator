# Unassigned Task Detection Report

- Task ID: TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001
- Phase: 12
- Updated on: 2026-03-19
- Result: 3 tasks formalized

## 1. 検出結果サマリ

今回の実装は scope 内の堅牢化を完了しているが、次回以降の安定運用に向けた残課題が3件ある。  
いずれも今回タスクでは実装しない代わりに、[docs/30-workflows/unassigned-task/](../../../unassigned-task/) 配下へ formalize した。

## 2. Formalized tasks

| ID             | タイトル                               | ステータス | 指示書                                                                                                                    |
| -------------- | -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| UT-CONV-DB-001 | better-sqlite3 ABI rebuild 再発防止    | 未実施     | [task-conv-db-001-better-sqlite3-abi-rebuild.md](../../../unassigned-task/task-conv-db-001-better-sqlite3-abi-rebuild.md) |
| UT-CONV-DB-002 | Conversation DB schema versioning 導入 | 未実施     | [task-conv-db-002-schema-versioning.md](../../../unassigned-task/task-conv-db-002-schema-versioning.md)                   |
| UT-CONV-DB-003 | legacy conversation DB path migration  | 未実施     | [task-conv-db-003-legacy-path-migration.md](../../../unassigned-task/task-conv-db-003-legacy-path-migration.md)           |

## 3. なぜ未タスク化したか

### UT-CONV-DB-001

今回の修正対象は ABI 不整合そのものの再発防止機構まで含めていない。  
実装の堅牢化とは責務が異なるため切り出した。

### UT-CONV-DB-002

現時点で schema は単純だが、今後の変更追跡と migration safety のために versioning が必要である。  
今回のスコープ外なので別タスク化した。

### UT-CONV-DB-003

旧 ~/.claude/conversations.db 利用者への移行導線は、今回の新実装とは別のリスクを持つ。  
データ保全と UX を伴うため独立タスクとした。

## 4. 配置確認

- 配置先: [docs/30-workflows/unassigned-task/](../../../unassigned-task/)
- フォーマット: task-specification-creator の unassigned-task 形式に準拠
- ファイル命名: lower-case + hyphen-case で統一

### 実体パス

- `docs/30-workflows/completed-tasks/unassigned-task/task-conv-db-001-better-sqlite3-abi-rebuild.md`
- `docs/30-workflows/completed-tasks/unassigned-task/task-conv-db-002-schema-versioning.md`
- `docs/30-workflows/completed-tasks/unassigned-task/task-conv-db-003-legacy-path-migration.md`

## 5. 関連仕様

- [system-spec-update-summary.md](./system-spec-update-summary.md)
- [.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md](../../../../.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md)
- [.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md](../../../../.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md)

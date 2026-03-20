# [#1225] [TASK-IMP-CHAT-EDIT-CUSTOM-INSTRUCTION-BUG-001] custom コマンドで instruction が未展開になる経路の修正

## メタ情報

```yaml
issue_number: 1225
title: [TASK-IMP-CHAT-EDIT-CUSTOM-INSTRUCTION-BUG-001] custom コマンドで instruction が未展開になる経路の修正
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-14
updated_date: 2026-03-14
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1225
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`EditCommand.type = custom` で `instruction` が prompt に正しく展開されない経路が残っている可能性がある。未展開のまま送信されるとユーザー意図が失われるため、経路を閉じる必要がある。

## 対象ファイル

- `apps/desktop/src/main/services/chat-edit/prompts.ts`
- `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`

## 完了条件

- [ ] custom 実行時に prompt 文字列へ instruction が埋め込まれる
- [ ] instruction 未指定時のエラーハンドリング方針が明確化される
- [ ] 回帰テストで custom 経路が緑化される

## 発見元

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 (2026-03-14)

## 仕様書パス

`docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-custom-instruction-bug-001.md`

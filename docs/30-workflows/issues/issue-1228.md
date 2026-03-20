# [#1228] [TASK-IMP-CHAT-EDIT-CONTEXT-PATH-GUARD-001] send-with-context の filePath workspace 境界検証追加

## メタ情報

```yaml
issue_number: 1228
title: [TASK-IMP-CHAT-EDIT-CONTEXT-PATH-GUARD-001] send-with-context の filePath workspace 境界検証追加
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-14
updated_date: 2026-03-14
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1228
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`read/write` には workspacePath ガードがある一方、`send-with-context` の `contexts[*].filePath` 側には越境検証がない。仕様境界を揃えないと機密流出リスクが残る。

## 対象ファイル

- `apps/desktop/src/main/ipc/chatEditHandlers.ts`

## 完了条件

- [ ] workspace 外 path を含む request が拒否される
- [ ] 正常 path は既存挙動を維持する
- [ ] エラーが sanitize 方針に従う

## 発見元

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 (2026-03-14)

## 仕様書パス

`docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/unassigned-task/task-imp-chat-edit-context-path-guard-001.md`

# [#1440] [UT-CHATPANEL-STUB-CLEANUP-001] ChatPanel（スタブ版）LLMSelectorPanelの整理・削除

## メタ情報

```yaml
issue_number: 1440
title: [UT-CHATPANEL-STUB-CLEANUP-001] ChatPanel（スタブ版）LLMSelectorPanelの整理・削除
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-21
updated_date: 2026-03-21
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1440
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 背景

components/chat/LLMSelectorPanel.tsx（24行）はスタブ版でonSelectが空。InlineModelSelector導入後は役割が完全に重複するため整理が必要。

## タスク仕様書

`docs/30-workflows/unassigned-task/task-ut-chatpanel-stub-cleanup-001.md`

## 優先度

低

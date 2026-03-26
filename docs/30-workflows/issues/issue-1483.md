# [#1483] [UT-TRANSCRIPT-M1] SelectedFile source フィールド追加

## メタ情報

```yaml
issue_number: 1483
title: [UT-TRANSCRIPT-M1] SelectedFile source フィールド追加
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1483
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`packages/shared/schemas/file-selection.schema.ts` の `SelectedFile` に `source` フィールドを追加し、ファイル背景情報の出所（transcript / manual / system）を追跡可能にする。

## 背景

Transcript -> Chat provenance linkage の設計タスク（TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001）Phase 3 MINOR指摘 M-1 で検出。

## 受入基準

- [ ] SelectedFile に source?: "transcript" | "manual" | "system" フィールドが追加されている
- [ ] 既存のファイル選択フローに影響を与えない（optional フィールド）
- [ ] Transcript からファイルを添付した場合に source = "transcript" が設定される

## 参照

- 指示書: `docs/30-workflows/unassigned-task/ut-transcript-m1-selected-file-source.md`
- 発生元: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 Phase 3 M-1

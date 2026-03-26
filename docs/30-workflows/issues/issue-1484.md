# [#1484] [UT-TRANSCRIPT-M2] TranscriptSession 型の workspaceSlice 追加

## メタ情報

```yaml
issue_number: 1484
title: [UT-TRANSCRIPT-M2] TranscriptSession 型の workspaceSlice 追加
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1484
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`TranscriptSession` 型を `packages/shared/src/types/` に定義し、`workspaceSlice` に `transcriptSessions: TranscriptSession[]` state を追加する。

## 背景

Transcript -> Chat provenance linkage の設計タスク（TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001）Phase 3 MINOR指摘 M-2 で検出。P31（Zustand 無限ループ）対策として個別セレクタパターンを適用する。

## 受入基準

- [ ] TranscriptSession 型が packages/shared に定義されている
- [ ] workspaceSlice に transcriptSessions state が追加されている
- [ ] 個別セレクタ（useTranscriptSessions 等）が定義されている（P31対策）
- [ ] 既存の workspaceSlice の他の state に影響を与えない

## 参照

- 指示書: `docs/30-workflows/unassigned-task/ut-transcript-m2-session-type.md`
- 発生元: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001 Phase 3 M-2

# [#1307] [UT-TASK06-001] RAG state IPC チャンネル設計と仕様書整備

## メタ情報

```yaml
issue_number: 1307
title: [UT-TASK06-001] RAG state IPC チャンネル設計と仕様書整備
state: OPEN
priority: 中
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-17
updated_date: 2026-03-17
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1307
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

RAG state を Main authority に寄せる方針は確定したが、IPC 契約（取得・更新・通知）が system spec に未反映。

## タスクID

UT-TASK06-001

## 分類

仕様同期

## 発見元

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 10 MINOR-01 / Phase 11 DI-0002

## 目的

- `rag:get-state` / `rag:set-state` / `rag:on-state-changed` の契約を正本仕様へ固定
- `contract-matrix.md` と system spec の参照を一致させる

## 仕様書

`docs/30-workflows/completed-tasks/UT-TASK06-001-rag-ipc-spec.md`

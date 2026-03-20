# [#1304] [UT-TASK06-004] AI_CHECK_CONNECTION legacy 整理と後方互換テスト

## メタ情報

```yaml
issue_number: 1304
title: [UT-TASK06-004] AI_CHECK_CONNECTION legacy 整理と後方互換テスト
state: OPEN
priority: 中
scale: 小規模
category: -
status: 未実施
created_date: 2026-03-17
updated_date: 2026-03-17
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1304
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

実装は `AI_CHECK_CONNECTION` を legacy 互換として保持している一方、Task06 文書には「廃止完了」の記述が残り、契約解釈が分裂している。

## タスクID

UT-TASK06-004

## 分類

IPC契約整備

## 発見元

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 GAP-02 / DRIFT-4 / Phase 11 DI-0001

## 目的

- `AI_CHECK_CONNECTION` の存廃方針を「legacy残置（新規利用禁止）」として明文化
- `llm:check-health` を primary とする実装ルールを定着
- 削除時に必要な互換テスト一覧を整備

## 仕様書

`docs/30-workflows/completed-tasks/UT-TASK06-004-ai-check-connection-cleanup.md`

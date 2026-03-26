# [#1544] test: checkHealth リクエストボディ固定値テスト追加

## メタ情報

```yaml
issue_number: 1544
title: test: checkHealth リクエストボディ固定値テスト追加
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1544
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

TASK-LLM-MOD-HEALTHCHECK-BODY

## 概要

`checkHealth` リクエストの `max_tokens: 1` と `messages` が固定値として正しいことを検証するテストを追加する。

## 対象ファイル

- `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts`

## 発見元

TASK-LLM-MOD-02 Phase 6

## タスク仕様書

`docs/30-workflows/unassigned-task/task-llm-mod-healthcheck-body.md`

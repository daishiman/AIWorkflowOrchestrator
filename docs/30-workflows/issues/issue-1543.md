# [#1543] feat: ヘルスチェックモデルIDの定数化（全 Adapter 統一）

## メタ情報

```yaml
issue_number: 1543
title: feat: ヘルスチェックモデルIDの定数化（全 Adapter 統一）
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1543
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

TASK-LLM-MOD-HEALTHCHECK-CONST

## 概要

ヘルスチェックで使用するモデルIDが各 Adapter でハードコードされている。定数化することでモデル退役時の変更を1箇所に集約する。

## 対象ファイル

- `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts` L207
- `apps/desktop/src/main/services/auth/types.ts` L286（`ANTHROPIC_VALIDATION_MODEL` 旧ID残存）

## 発見元

TASK-LLM-MOD-02 Phase 8

## タスク仕様書

`docs/30-workflows/unassigned-task/task-llm-mod-healthcheck-const.md`

# [#1522] UT-LLM-MOD-01-003: 既存テストのモデルIDフィクスチャ更新

## メタ情報

```yaml
issue_number: 1522
title: UT-LLM-MOD-01-003: 既存テストのモデルIDフィクスチャ更新
state: OPEN
priority: 低
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1522
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

UT-LLM-MOD-01-003

## 由来

TASK-LLM-MOD-01 Phase 1 影響テスト調査

## 目的

既存テスト内の `validRequest.modelId: "gpt-4o"` 等のフィクスチャ値を新モデルIDに更新する。機能影響はないが、コードレビュー時の可読性・保守性を向上させる。

## 対象ファイル

- `apps/desktop/src/main/handlers/__tests__/llm.test.ts`（既存テスト部分のフィクスチャ）

## 完了条件

- [ ] 既存テスト内の旧モデルID（`gpt-4o` 等）が新モデルID（`gpt-5.4` 等）に更新されている
- [ ] 全テストがPASS

## 仕様書

`docs/30-workflows/unassigned-task/UT-LLM-MOD-01-003.md`

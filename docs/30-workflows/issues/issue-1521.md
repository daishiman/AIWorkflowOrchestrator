# [#1521] UT-LLM-MOD-01-002: LLMProvider 共有型への description フィールド追加

## メタ情報

```yaml
issue_number: 1521
title: UT-LLM-MOD-01-002: LLMProvider 共有型への description フィールド追加
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1521
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

UT-LLM-MOD-01-002

## 由来

TASK-LLM-MOD-01 Phase 3 未解決事項 U-02

## 目的

`packages/shared/src/types/llm/schemas.ts` の `LLMProvider` 型に `description?: string` を追加し、Renderer側でツールチップ等の表示に利用可能にする。

## 対応方針

`LLMProvider` の `models` 配列要素型に `description?: string` を追加。Preload型定義も同時更新（P32対策: 型定義の二箇所同時更新必須）。

## 対象ファイル

- `packages/shared/src/types/llm/schemas.ts`
- `apps/desktop/src/preload/types.ts`

## 完了条件

- [ ] `LLMProvider` の models 配列要素に `description?: string` が追加されている
- [ ] Preload型定義が同時に更新されている（P32対策）
- [ ] TypeScript コンパイルが通る

## 仕様書

`docs/30-workflows/unassigned-task/UT-LLM-MOD-01-002.md`

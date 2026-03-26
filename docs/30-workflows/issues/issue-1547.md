# [#1547] UT-LLM-MOD-03-TYPE-01: buildRequestBody 戻り値型の厳密化（GeminiRequestBody 型定義）

## メタ情報

```yaml
issue_number: 1547
title: UT-LLM-MOD-03-TYPE-01: buildRequestBody 戻り値型の厳密化（GeminiRequestBody 型定義）
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-03-24
updated_date: 2026-03-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1547
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

GoogleAdapter の `buildRequestBody` メソッドの戻り値型を `Record<string, unknown>` から厳密な `GeminiRequestBody` インターフェースに変更し、型安全性を向上させる。

## 由来

TASK-LLM-MOD-03 Phase 10 Task 10-5 MINOR指摘

## 対象ファイル

- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`

## 完了条件

- [ ] `GeminiRequestBody` インターフェースが定義されている
- [ ] `buildRequestBody` の戻り値型が `GeminiRequestBody` である
- [ ] TypeScript コンパイルが通る
- [ ] 既存テストが全て PASS する

## 仕様書

`docs/30-workflows/unassigned-task/UT-LLM-MOD-03-TYPE-01.md`

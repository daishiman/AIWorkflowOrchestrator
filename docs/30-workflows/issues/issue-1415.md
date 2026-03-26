# [#1415] [UT-RAG-08-007] ILLMClient 型定義統一（UT-RAG-08-002 wave）

## メタ情報

```yaml
issue_number: 1415
title: [UT-RAG-08-007] ILLMClient 型定義統一（UT-RAG-08-002 wave）
state: OPEN
priority: 中
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-03-20
updated_date: 2026-03-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1415
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`crag/types.ts` と `llm/types.ts` に同名 `ILLMClient` が異なるシグネチャで定義されている問題を解消する。UT-RAG-08-002 では type alias で回避済みだが、将来の保守混乱を防ぐために統一型を定義し alias を削除する。

## 仕様書

`docs/30-workflows/unassigned-task/task-rag-08-007-illmclient-type-unification.md`

## 受入基準

- [ ] `ILLMClient` が1箇所で定義されていること
- [ ] `crag/types.ts` が `packages/shared` の統一型を参照していること
- [ ] UT-RAG-08-002 で追加した type alias が削除されていること
- [ ] 全テストが PASS すること
- [ ] `pnpm typecheck` がエラーゼロで通ること

## 依存

- 推奨前提: UT-RAG-08-002 (HybridRAGFactory 実配線)
- 後続: UT-RAG-08-004 (HybridRAGEngine 型安全化)

## 関連

- #1371 (UT-RAG-08-005: 旧 wave の同等タスク - 着手前に状態確認必須)

## 苦戦箇所 (P64)

同名インターフェースのシグネチャドリフトが各モジュール単独ではコンパイルが通るため Factory 配線時まで不整合が検出されない。

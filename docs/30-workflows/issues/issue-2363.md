# [#2363] refactor(chunking): TASK-EMB-CONTEXTUAL-SEPARATION-001 Contextual Embeddings責務分離・専用サービス層抽出

## メタ情報

```yaml
issue_number: 2363
title: refactor(chunking): TASK-EMB-CONTEXTUAL-SEPARATION-001 Contextual Embeddings責務分離・専用サービス層抽出
state: OPEN
priority: 中
scale: 中規模
category: リファクタリング
status: 未実施
created_date: 2026-04-20
updated_date: 2026-04-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2363
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

`ChunkingService` に残存している Contextual Embeddings 処理ロジック（`applyContextualEmbeddings` / `generateContext` / `truncateDocument` / `combineContextAndContent`）を独立した `ContextualEmbeddingsAdapter` クラスとして `packages/shared/src/services/embedding/contextual/` に抽出・分離する。
Late Chunking 分離（TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001, #2314）と同パターンで SRP 違反を解消する。

## 背景・課題

TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 の完了により Late Chunking 処理は `ChunkingLateChunkingAdapter` として分離済みだが、Contextual Embeddings 処理は依然 `ChunkingService` に残存しており SRP 違反が継続している。

主な問題：

- Contextual Embeddings のコンテキスト生成ロジックを `ChunkingService` の全依存なしに単独テストできない
- `generateContext()` / `truncateDocument()` などの内部処理が `private` に隠れており挙動把握が困難
- `DEFAULT_CONTEXT_TEMPLATE` や `combineContextAndContent()` が `chunking-service.ts` に埋め込まれており再利用できない
- LLM プロバイダー変更時に `ChunkingService` への変更が集中し影響範囲特定が困難になる

## スコープ

**含むもの**

- `ContextualEmbeddingsAdapter` クラスの新設（`packages/shared/src/services/embedding/contextual/`）
- `ChunkingService` から `applyContextualEmbeddings()` / `generateContext()` / `truncateDocument()` / `combineContextAndContent()` / `DEFAULT_CONTEXT_TEMPLATE` の移動
- `ContextualEmbeddingsAdapter` 単体テスト新設（CTX-01〜CTX-09）
- `ChunkingService` 既存テストが引き続き PASS することの確認

**含まないもの**

- `ContextualEmbeddingsOptions` 型定義の移動（`chunking/types.ts` に残す）
- `EmbeddingPipeline` との統合（別タスク）
- LLM クライアントインターフェースの変更

## 依存タスク

| タスクID                                              | 関係                   | 理由                                                                                |
| ----------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------- |
| TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 (#2314) | 先行タスク（完了済み） | `ChunkingLateChunkingAdapter` 分離によりコンストラクタ構成の実績パターンが確立済み  |
| TASK-EMB-LATE-CHUNKING-PIPELINE-INTEGRATION-001       | 関連タスク（後続）     | `EmbeddingPipeline` との統合時に `ContextualEmbeddingsAdapter` を利用する可能性あり |

## 完了条件（簡略）

- [ ] `ContextualEmbeddingsAdapter` が `applyContextualEmbeddings()` / `generateContext()` / `combineContextAndContent()` を持つ
- [ ] `ChunkingService.applyContextualEmbeddings()` が `ContextualEmbeddingsAdapter` に委譲している
- [ ] CTX-01〜CTX-09 のテストが全件 PASS している
- [ ] `ChunkingService.chunk()` の入出力シグネチャが変化しない（後方互換維持）
- [ ] `pnpm --filter @repo/shared typecheck` / `lint` / `test` がすべて通過する

## 成果物

| ファイル                                                                                          | 変更種別 |
| ------------------------------------------------------------------------------------------------- | -------- |
| `packages/shared/src/services/embedding/contextual/ContextualEmbeddingsAdapter.ts`                | 新規     |
| `packages/shared/src/services/embedding/contextual/index.ts`                                      | 新規     |
| `packages/shared/src/services/embedding/contextual/__tests__/ContextualEmbeddingsAdapter.test.ts` | 新規     |
| `packages/shared/src/services/chunking/chunking-service.ts`                                       | 修正     |
| `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`            | 修正     |

## タスク仕様書

`docs/30-workflows/unassigned-task/TASK-EMB-CONTEXTUAL-SEPARATION-001.md`

（発見元: TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001 Phase-12 task-12-4、発見日: 2026-04-20）

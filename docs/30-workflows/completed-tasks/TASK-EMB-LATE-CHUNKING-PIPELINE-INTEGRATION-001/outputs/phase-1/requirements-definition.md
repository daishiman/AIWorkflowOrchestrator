# Phase 1 成果物: 要件定義

## P50 チェック結果

| 確認項目                                                      | 判定  | 根拠                                                             |
| ------------------------------------------------------------- | ----- | ---------------------------------------------------------------- | --- | --------------------------------- |
| `PipelineConfig` に `lateChunking` フィールドが存在する       | No    | types.ts に該当フィールドなし                                    |
| `StageTimings` に `lateChunking` フィールドが存在する         | No    | preprocessing/chunking/embedding/deduplication の4フィールドのみ |
| `EmbeddingPipeline.process()` に Late Chunking 分岐が存在する | No    | Stage 3 で常に `embedBatch()` を呼ぶ                             |
| `EmbeddingService.generateChunkEmbeddings()` が存在する       | Yes   | lateChunkingService 未設定時は EmbeddingError を throw           |
| `PoolingStrategy = "mean"                                     | "max" | "cls"` が定義済み                                                | Yes | late-chunking-types.ts に定義済み |

## implementation_mode 判定

`implementation_mode: "new"` — Pipeline 側の Late Chunking 統合が未実装のため新規実装。

## task classification

NON_VISUAL code task — Renderer 変更なし、対象は packages/shared の Service 層と統合テスト。

## 受入基準（確定）

| ID   | 基準                                                                             |
| ---- | -------------------------------------------------------------------------------- |
| AC-1 | `PipelineConfig.lateChunking` がオプショナルで型安全に定義されている             |
| AC-2 | `StageTimings.lateChunking` がオプショナルで追加され既存フィールドが壊れていない |
| AC-3 | `lateChunking.enabled=true` 時に `generateChunkEmbeddings()` が呼ばれる          |
| AC-4 | `lateChunking.enabled=true` 時に `embedBatch()` が呼ばれない                     |
| AC-5 | `lateChunking` 未設定または `enabled=false` 時に従来フローが維持される           |
| AC-6 | `lateChunkingService` 未設定で `enabled=true` の場合に失敗が診断可能に伝播する   |
| AC-7 | `stageTimings.lateChunking` が Late Chunking 有効時に数値として記録される        |
| AC-8 | `PipelineOutput.embeddings` が既存下流互換を維持して返却される                   |

## Phase 2 への申し送り

- 責務境界: `EmbeddingPipeline` は `EmbeddingService.generateChunkEmbeddings()` のみ使用し、`lateChunkingService` 内部構成を知らない
- `poolingStrategy` は `"mean" | "max" | "cls"` に統一（正本仕様の `PoolingStrategy` と整合）
- `maxTokenLength` を採用し `LateChunkingConfig` と名称を揃える

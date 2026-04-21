# Phase 5 成果物: 実装サマリー

## 変更ファイル

### 1. `packages/shared/src/services/embedding/pipeline/types.ts`

- `PipelineConfig` に `lateChunking?: { enabled: boolean; poolingStrategy?: "mean" | "max" | "cls"; maxTokenLength?: number }` を追加
- `StageTimings` に `lateChunking?: number` を追加

### 2. `packages/shared/src/services/embedding/pipeline/embedding-pipeline.ts`

- インポート追加: `ChunkBoundary`, `ChunkEmbeddingResult` from `../late-chunking/index`
- `process()` に `validateLateChunkingConfig(config)` の呼び出し追加（Stage 1 前）
- Stage 2.5 分岐を追加（`config.lateChunking?.enabled === true` 時に `generateChunkEmbeddings()` を呼ぶ）
- Stage 3 を `lateChunkingEmbeddings` の有無で排他分岐
- `validateLateChunkingConfig(config: PipelineConfig): void` プライベートメソッド追加
- `convertLateChunkingToEmbeddingResults(results, modelId): EmbeddingResult[]` プライベートメソッド追加

## テスト結果

PI-01〜PI-08 + PI-03b: 全 9 件 PASS
TypeScript 型チェック: PASS

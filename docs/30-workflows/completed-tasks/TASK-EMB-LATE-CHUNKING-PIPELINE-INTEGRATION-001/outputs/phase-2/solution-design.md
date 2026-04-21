# Phase 2 成果物: ソリューション設計

## 設計決定事項

### 1. `PipelineConfig.lateChunking` 型定義

```typescript
lateChunking?: {
  enabled: boolean;
  poolingStrategy?: "mean" | "max" | "cls";
  maxTokenLength?: number;
};
```

- オプショナルにより既存利用箇所を無変更で動作させる
- `poolingStrategy` は正本 `PoolingStrategy` 型と整合

### 2. `StageTimings.lateChunking?: number` 追加

- オプショナルにより通常フローの既存メトリクスを破壊しない
- Late Chunking 有効時のみ Stage 2.5 の処理時間を記録

### 3. Stage 2.5 分岐設計

```
Stage 1: Preprocessing
Stage 2: Chunking
    ↓ if config.lateChunking?.enabled === true
Stage 2.5: Late Chunking Embedding (generateChunkEmbeddings)
Stage 3: Embedding (embedBatch) — lateChunking有効時はスキップ
Stage 4: Deduplication（共通）
```

### 4. バリデーション設計

- `validateLateChunkingConfig(config)` を `process()` 冒頭で呼ぶ（早期エラー検出）
- 無効な `poolingStrategy` → `PipelineError("Invalid poolingStrategy: <value>")`
- `maxTokenLength < 1` → `PipelineError("lateChunking.maxTokenLength must be greater than 0")`

### 5. テストケース一覧（PI-01〜PI-08）

| ID    | 内容                                                     | 受入基準 |
| ----- | -------------------------------------------------------- | -------- |
| PI-01 | `enabled=true` で `generateChunkEmbeddings()` が呼ばれる | AC-3     |
| PI-02 | `enabled=true` で `embedBatch()` が呼ばれない            | AC-4     |
| PI-03 | `enabled=false`/未設定で通常フロー維持                   | AC-5     |
| PI-04 | `lateChunkingService` 未設定時の失敗伝播                 | AC-6     |
| PI-05 | `poolingStrategy`/`maxTokenLength` が正しく渡る          | AC-3     |
| PI-06 | `stageTimings.lateChunking` が数値として記録される       | AC-7     |
| PI-07 | `PipelineOutput.embeddings` が `EmbeddingResult[]` 形式  | AC-8     |
| PI-08 | 無効な `poolingStrategy` で `PipelineError`              | AC-6     |

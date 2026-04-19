# 既存EmbeddingService統合設計書

## 統合方式: フラグベース委譲

EmbeddingServiceのコンストラクタ設定に `lateChunkingService` を追加。
`generateChunkEmbeddings()` メソッドを新設し、内部でLateChunkingServiceに委譲する。

```typescript
// EmbeddingServiceConfig への追加
interface EmbeddingServiceConfig {
  providers: IEmbeddingProvider[];
  fallbackChain: EmbeddingModelId[];
  metricsCollector?: MetricsCollector;
  lateChunkingService?: ILateChunkingService; // 追加
}

// EmbeddingService への追加メソッド
class EmbeddingService {
  // 既存メソッドは変更なし
  async embed(...): Promise<EmbeddingResult> { ... }
  async embedBatch(...): Promise<BatchEmbeddingResult> { ... }

  // 新規追加
  async generateChunkEmbeddings(
    text: string,
    chunkBoundaries: ChunkBoundary[],
    config?: Partial<LateChunkingConfig>,
  ): Promise<ChunkEmbeddingResult[]> {
    if (!this.lateChunkingService) {
      throw new EmbeddingError("LateChunkingService not configured");
    }
    return this.lateChunkingService.generateChunkEmbeddings(text, chunkBoundaries, config);
  }
}
```

## 後方互換性保証

- 既存 `embed()` / `embedBatch()` / `healthCheckAll()` の引数・戻り値を変更しない
- `lateChunkingService` はオプション（未設定時は例外をスロー）
- 既存テストは全て無修正でパスする

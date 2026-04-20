# 契約差分 - Phase 5

## 新規追加インターフェース

```typescript
// ILateChunkingService
generateChunkEmbeddings(text, chunkBoundaries, config?): Promise<ChunkEmbeddingResult[]>

// ITokenBoundaryCalculator
calculate(boundaries, offsetMapping): TokenRange[]

// IHiddenStatePooler
pool(hiddenStates, range): number[]

// IWindowSplitter
split(tokens): number[][]

// IEncoder (モック注入用)
encode(text): Promise<EncoderOutput>
```

## EmbeddingService差分

```typescript
// 追加メソッド
generateChunkEmbeddings(text, chunkBoundaries, config?): Promise<ChunkEmbeddingResult[]>
```

## 変更なしAPI（後方互換確認）

- `embed()` ✅ 変更なし
- `embedBatch()` ✅ 変更なし
- `healthCheckAll()` ✅ 変更なし
- `getAvailableProviders()` ✅ 変更なし
- `getMetricsCollector()` ✅ 変更なし
- `getFallbackChain()` ✅ 変更なし
- `setFallbackChain()` ✅ 変更なし

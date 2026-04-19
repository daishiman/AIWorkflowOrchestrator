# サービス層API設計書

## 型定義

```typescript
// ChunkBoundary: テキスト上の文字オフセット境界
interface ChunkBoundary {
  startChar: number;
  endChar: number;
  chunkId: string;
}

// TokenRange: トークンインデックス境界
interface TokenRange {
  startToken: number;
  endToken: number;
  chunkId: string;
}

// HiddenState: 単一トークンの隠れ状態
interface HiddenState {
  tokenIndex: number;
  vector: Float32Array;
}

// PoolingStrategy: プーリング戦略
type PoolingStrategy = "mean" | "max" | "cls";

// LateChunkingConfig: サービス設定
interface LateChunkingConfig {
  poolingStrategy: PoolingStrategy;
  useFloat16: boolean;
  maxTokenLength: number;
  windowOverlapTokens: number;
}

// ChunkEmbeddingResult: 出力
interface ChunkEmbeddingResult {
  chunkId: string;
  embedding: number[];
  tokenCount: number;
}
```

## ILateChunkingService

```typescript
interface ILateChunkingService {
  generateChunkEmbeddings(
    text: string,
    chunkBoundaries: ChunkBoundary[],
    config?: Partial<LateChunkingConfig>,
  ): Promise<ChunkEmbeddingResult[]>;
}
```

## エラー契約

| エラークラス           | 発生条件                         |
| ---------------------- | -------------------------------- |
| `InvalidBoundaryError` | `startChar > endChar` または負値 |
| `RangeError`           | オフセットがテキスト長超過       |
| `TokenLimitError`      | ウィンドウ分割後もトークン数超過 |

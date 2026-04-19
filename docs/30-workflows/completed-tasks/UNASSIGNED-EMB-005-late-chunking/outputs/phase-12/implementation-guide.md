# Implementation Guide - UNASSIGNED-EMB-005: Late Chunking

## Part 1: 概要と背景

### 何を実装したか

`packages/shared/src/services/embedding/late-chunking/` に Late Chunking 機能を実装した。
Late Chunking は「全文をTransformerに入力 → Hidden State取得 → チャンク境界ごとにプーリング」という手順で、
従来の事前チャンキング（Early Chunking）より 10〜30% 高い検索品質を実現する。

### アーキテクチャ

```
EmbeddingService (既存Facade)
  └─ generateChunkEmbeddings() [新規追加]
       └─ LateChunkingService [新規]
            ├─ IEncoder (外部モデル抽象)
            ├─ TokenBoundaryCalculator [新規]
            ├─ HiddenStatePooler [新規] (mean/max/cls)
            └─ WindowSplitter [新規]
```

## Part 2: 使い方

### 基本的な使い方

```typescript
import { LateChunkingService } from "@repo/shared/services/embedding/late-chunking";
import type {
  IEncoder,
  ChunkBoundary,
} from "@repo/shared/services/embedding/late-chunking";

// 1. IEncoder を実装（例: @xenova/transformers ラッパー）
const encoder: IEncoder = {
  async encode(text: string) {
    // モデルを呼び出してhiddenStatesとoffsetMappingを返す
    return { hiddenStates, offsetMapping };
  },
};

// 2. サービスを初期化
const service = new LateChunkingService(encoder);

// 3. チャンク境界を定義
const boundaries: ChunkBoundary[] = [
  { startChar: 0, endChar: 100, chunkId: "chunk-1" },
  { startChar: 101, endChar: 250, chunkId: "chunk-2" },
];

// 4. チャンクEmbeddingを生成
const results = await service.generateChunkEmbeddings(fullText, boundaries, {
  poolingStrategy: "mean",
  maxTokenLength: 512,
  windowOverlapTokens: 16,
});
```

### EmbeddingService経由で使う場合

```typescript
const embeddingService = new EmbeddingService({
  providers: [...],
  fallbackChain: [...],
  lateChunkingService: new LateChunkingService(encoder),
});

const results = await embeddingService.generateChunkEmbeddings(
  fullText,
  boundaries,
);
```

## NON_VISUAL 証跡セクション

本実装はバックエンドライブラリ（UIなし）のため、スクリーンショットは不要。
自動テスト31件（6ファイル）が全件GREENであることが品質証跡。

テスト実行コマンド:

```bash
ESBUILD_BINARY_PATH=... vitest run --root packages/shared "src/services/embedding/__tests__/late-chunking"
```

結果: **31 passed (31)** ✅

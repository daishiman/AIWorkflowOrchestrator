# システム仕様更新サマリー - Phase 12

## Step 1-A: 変更されたファイル

| ファイル                                               | 変更種別               |
| ------------------------------------------------------ | ---------------------- |
| `embedding/late-chunking/late-chunking-types.ts`       | 新規作成               |
| `embedding/late-chunking/late-chunking-interfaces.ts`  | 新規作成               |
| `embedding/late-chunking/token-boundary-calculator.ts` | 新規作成               |
| `embedding/late-chunking/hidden-state-pooler.ts`       | 新規作成               |
| `embedding/late-chunking/window-splitter.ts`           | 新規作成               |
| `embedding/late-chunking/late-chunking-service.ts`     | 新規作成               |
| `embedding/late-chunking/index.ts`                     | 新規作成               |
| `embedding/embedding-service.ts`                       | 修正（オプション追加） |

## Step 1-B: 公開APIの変更

`EmbeddingService` に `generateChunkEmbeddings()` メソッドを追加。
既存メソッド（embed/embedBatch等）は変更なし。

## Step 1-C: 型の変更

新規型: `ChunkBoundary`, `TokenRange`, `PoolingStrategy`, `LateChunkingConfig`,
`IEncoder`, `EncoderOutput`, `ChunkEmbeddingResult`

新規エラークラス: `InvalidBoundaryError`, `OutOfMemoryError`

## Step 1-D: 設定の変更

`EmbeddingServiceConfig` に `lateChunkingService?: ILateChunkingService` を追加（オプション）。

## Step 2: 仕様書同期判定

既存の system spec（references/）に Late Chunking の記述なし → 新規追加推奨。
本実装ガイドが仕様書を兼ねる。

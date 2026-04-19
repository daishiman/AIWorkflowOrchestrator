# キャリーオーバー棚卸し

## 再利用可能な資産

| 資産                 | パス                                 | 再利用内容                          |
| -------------------- | ------------------------------------ | ----------------------------------- |
| `EmbeddingError`     | `embedding/types/errors.ts`          | Late Chunking専用エラーの基底クラス |
| `TokenLimitError`    | `embedding/types/errors.ts`          | トークン長超過エラーとして流用      |
| `EmbeddingResult`    | `embedding/types/embedding.types.ts` | チャンクEmbedding結果の型ベース     |
| `PoolingStrategy`    | `chunking/types.ts`                  | 命名参照（embedding側で独自定義）   |
| `IEmbeddingProvider` | `embedding/providers/interfaces.ts`  | プロバイダー抽象の参照パターン      |
| vitest設定           | `packages/shared/vitest.config.ts`   | テスト実行環境                      |

## 再利用しない資産

| 資産                                    | 理由                                  |
| --------------------------------------- | ------------------------------------- |
| `ChunkingService.applyLateChunking()`   | stubのため。新実装で置き換える        |
| `ChunkingService.poolTokenEmbeddings()` | 未実装のため参照しない                |
| `chunking/types.ts`の`PoolingStrategy`  | embedding側で独自定義し責務を分離する |

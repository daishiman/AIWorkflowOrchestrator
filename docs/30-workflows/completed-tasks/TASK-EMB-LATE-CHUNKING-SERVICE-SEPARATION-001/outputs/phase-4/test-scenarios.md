# Test Scenarios - Phase 4

## テスト作成方針

- TDD Red フェーズ: `LateChunkingService.ts` はまだ存在しないため、import 時点でエラーになる
- Phase 5 実装完了時点で Green になる
- 既存モック `MockTokenizer` / `MockEmbeddingClient` を再利用（`__tests__/mocks/`）

## 作成するテストファイル

`packages/shared/src/services/embedding/late-chunking/__tests__/LateChunkingService.test.ts`

## テストシナリオ（SEP-01〜SEP-07）

| ID     | describe                 | it 記述                                                         | 検証ポイント                                                       |
| ------ | ------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| SEP-01 | applyLateChunking        | 単一チャンク、mean pooling で applied=true を返す               | `metadata.lateChunking.applied === true`、`embeddingDimension > 0` |
| SEP-02 | applyLateChunking        | 複数チャンク、cls pooling で各チャンクの embeddingDimension > 0 | 全チャンクで `embeddingDimension > 0` かつ `applied=true`          |
| SEP-03 | determineChunkBoundaries | 複数チャンクで position.end の配列を返す                        | `[10, 20]` を返す                                                  |
| SEP-04 | determineChunkBoundaries | 空配列で空配列を返す                                            | `[]` を返す                                                        |
| SEP-05 | poolTokenEmbeddings      | strategy=mean で埋め込み配列を返す                              | 戦略分岐を通過、出力形状保持                                       |
| SEP-06 | poolTokenEmbeddings      | strategy=cls で埋め込み配列を返す                               | 戦略分岐を通過、出力形状保持                                       |
| SEP-07 | poolTokenEmbeddings      | strategy=attention で埋め込み配列を返す                         | 戦略分岐を通過、出力形状保持                                       |

## テストシナリオ（SEP-08〜SEP-09 - 委譲確認）

既存 `chunking-service.integration.test.ts` に追加セクション。

| ID     | describe                                   | it 記述                                                        | 検証ポイント                                                |
| ------ | ------------------------------------------ | -------------------------------------------------------------- | ----------------------------------------------------------- |
| SEP-08 | ChunkingService → LateChunkingService 委譲 | lateChunking.enabled=true で applyLateChunking が 1 回呼ばれる | `mockLateChunkingService.applyLateChunking` が 1 回呼ばれる |
| SEP-09 | ChunkingService → LateChunkingService 委譲 | lateChunking.enabled=false で applyLateChunking が呼ばれない   | `mockLateChunkingService.applyLateChunking` が呼ばれない    |

## Expected Red（Phase 4 時点）

- `import { LateChunkingService } from "../LateChunkingService"` → **モジュール未作成**
- テスト実行結果: `ERR_MODULE_NOT_FOUND` or TypeScript コンパイルエラー

## Expected Green（Phase 5 完了時点）

- 9 tests すべて PASS
- 既存 `chunking-service.integration.test.ts` の Late Chunking セクション（L381-L504）も PASS 維持

## 参照 mock

- `packages/shared/src/services/chunking/__tests__/mocks/mock-tokenizer.ts` の `MockTokenizer`
- `packages/shared/src/services/chunking/__tests__/mocks/mock-embedding-client.ts` の `MockEmbeddingClient`

# Implementation Diff Check - Phase 5

## 名前衝突発見と命名方針変更

| 項目           | 仕様書                   | 実装                                                                              |
| -------------- | ------------------------ | --------------------------------------------------------------------------------- |
| 抽出クラス名   | `LateChunkingService`    | `ChunkingLateChunkingAdapter`                                                     |
| 抽出先ファイル | `LateChunkingService.ts` | `chunking-late-chunking-adapter.ts`                                               |
| 理由           | -                        | 既存 `LateChunkingService` クラス（`late-chunking-service.ts`）と名前衝突するため |
| 既存クラス     | 不在前提                 | `IEncoder` + hidden states による真の token-level Late Chunking（先行タスク成果） |

## 変更ファイル

### 新規作成

1. `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts`
   - `ChunkingLateChunkingAdapter` クラス
   - public: `applyLateChunking` / `determineChunkBoundaries` / `poolTokenEmbeddings`
   - private: `getTokenEmbeddings`
   - ロジックは `ChunkingService` からのコピー移動のみ

2. `packages/shared/src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts`
   - SEP-01〜SEP-07 の単体テスト

### 変更

3. `packages/shared/src/services/embedding/late-chunking/index.ts`
   - `ChunkingLateChunkingAdapter` の export 追加（既存 `LateChunkingService` export は維持）

4. `packages/shared/src/services/chunking/chunking-service.ts`
   - コンストラクタ第 4 引数 `lateChunkingAdapter?: ChunkingLateChunkingAdapter` を追加
   - `lateChunkingAdapter` プロパティ追加
   - `applyLateChunking` を委譲形に書き換え（ロジック本体は削除）
   - `getTokenEmbeddings` / `determineChunkBoundaries` / `poolTokenEmbeddings` を削除（Adapter 側へ移動）
   - import 追加: `ChunkingLateChunkingAdapter`

## `ChunkingService` 既定挙動マップ（実装版）

| 呼び出しパターン                                   | `lateChunkingAdapter` の値                              |
| -------------------------------------------------- | ------------------------------------------------------- |
| `new ChunkingService(tok)`                         | `undefined`                                             |
| `new ChunkingService(tok, emb)`                    | `new ChunkingLateChunkingAdapter(tok, emb)`（自動生成） |
| `new ChunkingService(tok, emb, llm)`               | `new ChunkingLateChunkingAdapter(tok, emb)`（自動生成） |
| `new ChunkingService(tok, emb, llm, custom)`       | `custom`（DI 注入）                                     |
| `new ChunkingService(tok, undefined, llm, custom)` | `custom`（DI 注入・embeddingClient なしでも許可）       |

## 後方互換性

既存 3 引数呼び出し（`new ChunkingService(tokenizer)`, `new ChunkingService(tokenizer, embClient)`, `new ChunkingService(tokenizer, embClient, llm)`）は非破壊。

## Late Chunking 挙動の不変性

| 状態                                       | Before（`ChunkingService` 内包）                 | After（`Adapter` 委譲） |
| ------------------------------------------ | ------------------------------------------------ | ----------------------- |
| `embeddingClient` 未設定時エラー           | `Embedding client is required for Late Chunking` | 同上                    |
| `metadata.lateChunking.applied`            | `true`                                           | `true`                  |
| `metadata.lateChunking.embeddingDimension` | `> 0`                                            | `> 0`                   |
| プーリング戦略別ロジック                   | 簡略化実装（全戦略で同値）                       | 同上                    |

## 参照方向

```
chunking/chunking-service.ts
    │ import (value)
    ▼
embedding/late-chunking/chunking-late-chunking-adapter.ts
    │ import (type)
    ▼
chunking/interfaces.ts  (ITokenizer, IEmbeddingClient)
chunking/types.ts       (Chunk, LateChunkingOptions)
chunking/errors.ts      (ChunkingError)
```

逆方向参照なし。

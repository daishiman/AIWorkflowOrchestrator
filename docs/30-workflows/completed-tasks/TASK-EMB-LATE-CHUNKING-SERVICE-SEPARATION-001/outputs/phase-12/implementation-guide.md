# Implementation Guide

## Part 1: 概念説明

長い文章をあとで探しやすくするために、文章を小さなかたまりへ分けて番号札を付ける処理がある。このタスクは、その番号札の付け方のうち Late Chunking だけを、巨大な引き出しから専用の小箱へ移した作業に近い。

今までは `ChunkingService` という大きな箱の中に、文章の分割、補足説明の付与、Late Chunking の計算が全部入っていた。これだと一部だけ確かめたいときでも箱全体を開ける必要があり、確認も修理もやりづらい。そこで Late Chunking の処理を `ChunkingLateChunkingAdapter` に分離し、`ChunkingService` は「必要なときにその箱へお願いする」役だけにした。

この変更で良くなった点は次の 3 つ。

1. Late Chunking だけを単独テストできる。
2. `ChunkingService` 側は外部契約を変えずに薄くなる。
3. 将来の token-level 実装や pipeline 統合の前に、責務境界を先に整えられる。

## Part 2: 技術詳細

### 実装サマリ

- 追加: `packages/shared/src/services/embedding/late-chunking/chunking-late-chunking-adapter.ts`
- 追加: `packages/shared/src/services/embedding/late-chunking/__tests__/chunking-late-chunking-adapter.test.ts`
- 変更: `packages/shared/src/services/chunking/chunking-service.ts`
- 変更: `packages/shared/src/services/embedding/late-chunking/index.ts`
- 変更: `packages/shared/src/services/chunking/__tests__/chunking-service.integration.test.ts`

### 依存関係

```text
ChunkingService
  -> ChunkingLateChunkingAdapter
      -> chunking/interfaces.ts
      -> chunking/types.ts
      -> chunking/errors.ts
```

- `ChunkingService` は `ChunkingLateChunkingAdapter` へ value import
- Adapter 側は `chunking` 層の型と `ChunkingError` を参照
- 既存の token-level `LateChunkingService` とは別責務で共存

### API

```ts
new ChunkingService(
  tokenizer: ITokenizer,
  embeddingClient?: IEmbeddingClient,
  llmClient?: ILLMClient,
  lateChunkingAdapter?: ChunkingLateChunkingAdapter,
)
```

```ts
class ChunkingLateChunkingAdapter {
  applyLateChunking(
    text: string,
    chunks: Chunk[],
    options: LateChunkingOptions,
  ): Promise<Chunk[]>;

  determineChunkBoundaries(chunks: Chunk[]): number[];

  poolTokenEmbeddings(
    tokenEmbeddings: number[][],
    boundaries: number[],
    strategy: "mean" | "cls" | "attention",
  ): number[][];
}
```

### 使用例

```ts
const service = new ChunkingService(tokenizer, embeddingClient, llmClient);

const result = await service.chunk({
  text,
  strategy: "fixed",
  options: { chunkSize: 512 },
  advanced: {
    lateChunking: {
      enabled: true,
      embeddingModel: "text-embedding-3-small",
      chunkBoundaries: "token",
      maxSequenceLength: 512,
      poolingStrategy: "mean",
    },
  },
});
```

### エラーハンドリング

- `ChunkingService` 側で adapter 未設定時は `ChunkingError("Embedding client is required for Late Chunking")`
- Adapter 側で埋め込み取得不可時は `ChunkingError("Embedding client is required")`
- 既存 `chunk()` の戻り値型と例外契約は変更していない

### エッジケース

- `embeddingClient` 未指定かつ `lateChunking.enabled=true`
- `chunks.length === 0`
- `maxSequenceLength` より長い入力で複数 segment に分割されるケース
- `poolingStrategy` 切替時も metadata 付与形は共通

### 設定項目

| 項目                | 型        | 役割                     |
| ------------------- | --------- | ------------------------ | -------------- | ---------------------- |
| `enabled`           | `boolean` | Late Chunking 有効化     |
| `embeddingModel`    | `string`  | 利用する埋め込みモデル名 |
| `chunkBoundaries`   | `"token"  | ...`                     | 境界の解釈方法 |
| `maxSequenceLength` | `number`  | segment 分割閾値         |
| `poolingStrategy`   | `"mean"   | "cls"                    | "attention"`   | segment 埋め込みの扱い |

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡として以下を参照する。

- `../phase-10/final-review-result.md`
- `../phase-11/manual-test-result.md`
- `../phase-11/automated-test-evidence.md`
- `../phase-11/static-analysis-evidence.md`

## 補足

- 実装名は既存 `LateChunkingService` との衝突回避のため `ChunkingLateChunkingAdapter`
- token-level `LateChunkingService` は既存の `IEncoder` ベース実装として温存

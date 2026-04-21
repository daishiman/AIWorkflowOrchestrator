# Implementation Guide

UI/UX変更なしのため Phase 11 スクリーンショット不要

## Part 1

### この変更は何のためか

長い文章を小さく切る前に、文章全体を一度見てから切った方が、途中の単語の意味を取り違えにくくなる。この task は、その「全体を先に見るための受け口」を `ChunkingService` に足した。

#### 日常生活での例え

たとえば、長い会話をメモにまとめるときに、最初の1文だけ見て区切るより、会話全体を一度読んでから話題ごとに分けた方が意味がズレにくい。今回の token provider は、その「先に全部読んでおく役」に近い。

### 何が変わったか

| 項目     | 変更内容                                  | 効果                     |
| -------- | ----------------------------------------- | ------------------------ |
| 受け口   | `getTokenEmbeddings?()` を追加            | token-level 情報を扱える |
| 本流     | `chunk()` の Late Chunking が新契約を使う | helper 止まりを解消      |
| fallback | provider 未実装時も近似処理を維持         | 既存 provider を壊さない |

## Part 2

### 1. 追加した型

```ts
export interface TokenEmbeddingsResult {
  tokens: string[];
  embeddings: number[][];
}
```

- 制約: `tokens.length === embeddings.length`
- export: `packages/shared/src/services/chunking/index.ts` から再公開

### 2. 追加した契約

```ts
export interface IEmbeddingClient {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>;
}
```

- optional 契約なので既存 provider 実装の修正は不要
- token-level provider がある場合のみ `ChunkingService` が優先利用する

### 3. `ChunkingService` の現在 contract

```ts
async applyLateChunking(
  client: IEmbeddingClient,
  text: string,
  chunks: Array<{ start: number; end: number }>,
): Promise<Array<{ vector: number[] }>>
```

現在の本流は次の順で動く。

1. `client.getTokenEmbeddings` があれば全文テキストで呼ぶ
2. `tokens.length !== embeddings.length` なら `ChunkingError`
3. token 文字列を元テキスト上の span へ近似マッピングする
4. 各 chunk と重なる token 埋め込みを平均化する
5. provider が無ければ `embed(text)` を1回呼び、近似 token 列へ複製してから chunk 単位に再集約する

### 4. 使用例

```ts
const service = new ChunkingService(tokenizer, embeddingClient);

const result = await service.chunk({
  text,
  strategy: "fixed",
  options: { chunkSize: 128 },
  advanced: {
    lateChunking: {
      enabled: true,
      boundaryType: "token",
      poolingStrategy: "mean",
      maxSequenceLength: 512,
    },
  },
});
```

### 5. エラーハンドリング

| 条件                                  | 挙動                      |
| ------------------------------------- | ------------------------- |
| `embeddingClient` 未設定              | `ChunkingError`           |
| `tokens.length !== embeddings.length` | `ChunkingError`           |
| provider 未実装                       | `embed(text)` へ fallback |

### 6. エッジケース

| ケース                            | 現在の扱い                       |
| --------------------------------- | -------------------------------- |
| provider が token-level 未対応    | fallback で近似継続              |
| token span が厳密一致しない       | `indexOf` ベースの近似マッピング |
| real provider の独自 tokenization | follow-up task で正式対応        |

### 7. 設定値

| 設定                | 役割                                                                    |
| ------------------- | ----------------------------------------------------------------------- |
| `boundaryType`      | task では `"token"` 前提                                                |
| `poolingStrategy`   | 現在は mean 相当の平均化                                                |
| `maxSequenceLength` | task 契約上は保持。provider が全文 token を返す場合は window 分割しない |

### 8. 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

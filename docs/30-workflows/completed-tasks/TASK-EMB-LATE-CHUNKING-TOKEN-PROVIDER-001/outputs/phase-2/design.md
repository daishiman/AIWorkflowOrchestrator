# Phase 2 設計書

## 設計事項1: TokenEmbeddingsResult 型

配置先: `packages/shared/src/services/chunking/types.ts`

```typescript
export interface TokenEmbeddingsResult {
  tokens: string[];
  embeddings: number[][];
}
```

**設計理由**: types.ts は interfaces.ts と chunking-service.ts の両方から参照されるため循環参照が発生しない中立的な配置場所。

## 設計事項2: IEmbeddingClient 拡張

```typescript
import type { TokenEmbeddingsResult } from "./types";

export interface IEmbeddingClient {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>;
}
```

**設計理由**: `?` でオプショナル化し、既存実装クラスへの変更不要。

## 設計事項3: ChunkingService フォールバック戦略

新規 public メソッド `applyLateChunking(client, text, chunks)` を追加:

```typescript
async applyLateChunking(
  client: IEmbeddingClient,
  text: string,
  chunks: Array<{ start: number; end: number }>,
): Promise<Array<{ vector: number[] }>> {
  if (client.getTokenEmbeddings) {
    const result = await client.getTokenEmbeddings(text);
    if (result.tokens.length !== result.embeddings.length) {
      throw new ChunkingError(`TokenEmbeddingsResult の lengths が不一致`);
    }
    return this.aggregateTokenEmbeddings(result, chunks);
  }
  // フォールバック: embed() を使用（真のLate Chunkingではない近似）
  const singleVector = await client.embed(text);
  const tokens = text.split(' ').filter((t) => t.length > 0);
  const effectiveTokens = tokens.length > 0 ? tokens : [''];
  return effectiveTokens.map(() => ({ vector: [...singleVector] }));
}
```

既存 private `applyLateChunking` は `applyLateChunkingInternal` にリネーム。

## 設計事項4: MockTokenEmbeddingClient

配置先: `packages/shared/src/services/embedding/providers/mock-token-embedding-provider.ts`

テスト専用の決定論的トークン埋め込みモック。`embed/embedBatch/getTokenEmbeddings` を全実装。

## 設計事項5: テストケース TP-01〜TP-05

| ID    | テスト名                                                  | 期待動作                                              |
| ----- | --------------------------------------------------------- | ----------------------------------------------------- |
| TP-01 | getTokenEmbeddings を持つクライアントで Late Chunking     | embed() が呼ばれず getTokenEmbeddings() が1回呼ばれる |
| TP-02 | getTokenEmbeddings を持たないクライアントはフォールバック | embed() が呼ばれる                                    |
| TP-03 | MockTokenEmbeddingClient の長さ整合性確認                 | tokens.length === embeddings.length                   |
| TP-04 | チャンク境界とトークン隠れ状態の対応確認                  | 各チャンクに異なるベクトル                            |
| TP-05 | TokenEmbeddingsResult の lengths 不一致エラー             | ChunkingError がスロー                                |

## 型互換性検証テーブル

| 確認項目                                                    | 確認方法                                 | 期待結果    |
| ----------------------------------------------------------- | ---------------------------------------- | ----------- |
| 既存 IEmbeddingClient モック実装に型エラーが発生しないか    | pnpm typecheck                           | エラー 0 件 |
| MockTokenEmbeddingClient が IEmbeddingClient を充足するか   | implements IEmbeddingClient でコンパイル | エラー 0 件 |
| TokenEmbeddingsResult の import が循環参照を生まないか      | pnpm typecheck                           | 循環なし    |
| getTokenEmbeddings?.() の optional chain が strict で通るか | pnpm typecheck                           | エラー 0 件 |

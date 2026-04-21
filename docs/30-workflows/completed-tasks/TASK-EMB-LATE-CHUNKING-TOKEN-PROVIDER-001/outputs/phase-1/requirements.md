# Phase 1 要件定義成果物

## 現行 IEmbeddingClient メソッド一覧

- `embed(text: string): Promise<number[]>` — 単一テキストの埋め込みベクトル生成
- `embedBatch(texts: string[]): Promise<number[][]>` — バッチ埋め込みベクトル生成

## ChunkingService.getTokenEmbeddings() 現状実装

現在の実装（`private getTokenEmbeddings(tokens: number[], maxSequenceLength: number): Promise<number[][]>`）は：

- トークン配列を maxSequenceLength 単位で分割
- 各セグメントを decode → embed() 呼び出し
- 真のトークンレベル隠れ状態ではなく、セグメント単位の近似

## 新規 getTokenEmbeddings?() シグネチャ確定

```typescript
getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>
```

- オプショナル（`?`）にすることで既存実装クラスの変更不要
- 引数は「文書全体テキスト」（セグメントではない）

## TokenEmbeddingsResult 型構造

```typescript
export interface TokenEmbeddingsResult {
  tokens: string[]; // テキストを分割したトークン列
  embeddings: number[][]; // 各トークンに対応する隠れ状態ベクトルの配列
}
```

**整合性制約**: `tokens.length === embeddings.length` が常に成立すること

## フォールバック仕様

`getTokenEmbeddings?()` が存在しないクライアントに対して:

1. `embed(text)` を1回呼び出し単一ベクトルを取得
2. テキストをスペース分割して概算トークン列を生成（空の場合は `['']`）
3. 各トークンに単一ベクトルを複製して `embeddings` を生成
4. フォールバックは真のLate Chunkingではない旨をコメントで明記

## 受け入れ基準 AC-1〜AC-5

| 基準ID | 内容                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------- |
| AC-1   | `TokenEmbeddingsResult` 型が `packages/shared/src/services/chunking/types.ts` に定義されている             |
| AC-2   | `IEmbeddingClient` に `getTokenEmbeddings?(text: string): Promise<TokenEmbeddingsResult>` が追加されている |
| AC-3   | `ChunkingService` が `getTokenEmbeddings?()` を呼び出す（クライアントが実装している場合）                  |
| AC-4   | `ChunkingService` が `embed()` にフォールバックする（クライアントが実装していない場合）                    |
| AC-5   | 既存の `embed()` / `embedBatch()` の動作が変わらない                                                       |

# Phase 8 リファクタリングサマリー

## 検討事項

### 型ガード `hasTokenEmbeddingSupport` の導入要否

**検討内容:**

現在の実装では `applyLateChunking` 内で以下のようにオプショナルチェーンで判定している。

```typescript
if (client.getTokenEmbeddings) {
  const result = await client.getTokenEmbeddings(text);
  ...
}
```

型ガード関数として切り出す場合:

```typescript
function hasTokenEmbeddingSupport(
  client: IEmbeddingClient,
): client is IEmbeddingClient &
  Required<Pick<IEmbeddingClient, "getTokenEmbeddings">> {
  return typeof client.getTokenEmbeddings === "function";
}
```

**判断: 導入不要**

理由:

- `getTokenEmbeddings` はオプショナルメソッドであり、`if (client.getTokenEmbeddings)` で
  TypeScript の型絞り込みが正しく機能するため、型ガードなしでも型安全
- 呼び出し箇所が `applyLateChunking` 内の 1 箇所のみで、再利用の必要性が低い
- 型ガード関数を追加すると `interfaces.ts` または `chunking-service.ts` に追加の輸出が必要になり、
  今回のスコープを超える

### `aggregateTokenEmbeddings` の設計

チャンクインデックスで embeddings をマッピングする簡略実装を採用した。
本来のLate Chunkingでは文字オフセットをトークンオフセットに変換してプーリングすべきだが、
今回はインターフェース整合性の確認が主目的のため、インデックスベースの近似で問題なし。

### フォールバックの単純化

`embed()` フォールバック時はスペース区切りトークン数分のベクトルを複製して返す。
これは「近似」であり、真のLate Chunkingとは異なることをコード内コメントで明示済み。

## リファクタリング実施内容

- 既存 private `applyLateChunking` を `applyLateChunkingInternal` にリネームし、
  `chunk()` 経由の既存動作を保持した（リグレッションなし）
- `aggregateTokenEmbeddings` を private ヘルパーとして分離し、単一責務を維持

## 判定

リファクタリングは最小限で十分。型ガード追加・プーリング実装の強化は今後のタスクで行う。

# Phase 6 テスト拡充結果

## 追加テスト一覧

### chunking-service.integration.test.ts に追加

1. 長文テキスト（maxSequenceLength 超過）での Late Chunking 動作
   - 100 トークンからなる長文で `applyLateChunking` を呼び出し、2 チャンク分のベクトルが返ることを確認

2. セグメント内ローカルトークン位置とグローバルトークン位置の変換
   - 4 単語テキストを 2 チャンクに分割し、各チャンクに定義済みの異なるベクトルが割り当てられることを確認

### mock-token-embedding-provider.test.ts（新規）

1. TP-MOCK-01: getTokenEmbeddings が正しい形式を返す
   - 3 トークンのテキストに対して tokens・embeddings それぞれ長さ 3 で返ること
   - 全 embedding の次元数が一致すること

## テスト実行結果

```
pnpm --filter @repo/shared exec vitest run src/services/embedding/providers

 ✓ src/services/embedding/providers/__tests__/mock-token-embedding-provider.test.ts (1 test) 10ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
```

```
pnpm --filter @repo/shared exec vitest run src/services/chunking

 ✓ src/services/chunking/__tests__/chunking-service.integration.test.ts (29 tests) 101ms

 Test Files  2 passed (2)
      Tests  59 passed (59)
```

全追加テスト PASS 確認済み。

# 受入条件 - UNASSIGNED-EMB-005 Late Chunking

## AC-001: 基本動作

- [ ] `LateChunkingService.generateChunkEmbeddings()` が正常テキストで ChunkEmbeddingResult[] を返す
- [ ] 返される配列長が入力 `chunkBoundaries` 数と一致する
- [ ] 各 ChunkEmbeddingResult の `embedding` が数値配列として存在する

## AC-002: プーリング戦略

- [ ] `poolingStrategy: "mean"` が範囲内トークンの平均ベクトルを返す
- [ ] `poolingStrategy: "max"` が範囲内トークンの最大値ベクトルを返す
- [ ] `poolingStrategy: "cls"` がCLSトークンのベクトルを返す

## AC-003: ウィンドウ分割

- [ ] `maxTokenLength` を超えるテキストがウィンドウ分割されて処理される
- [ ] 分割後も各チャンクのEmbeddingが正常に返される

## AC-004: エラーハンドリング

- [ ] `startChar > endChar` の境界入力で `InvalidBoundaryError` がスローされる
- [ ] 文字オフセットがテキスト長超過で `RangeError` がスローされる
- [ ] 空文字列入力で空配列が返される（エラーなし）

## AC-005: 後方互換性

- [ ] `useLateChunking: false`（デフォルト）でEmbeddingService既存APIが変わらない
- [ ] 既存テストが全てパスする

## AC-006: 型安全性

- [ ] `pnpm --filter @repo/shared typecheck` がエラーなし
- [ ] `pnpm --filter @repo/shared build` がエラーなし

# 拡張テストケース - Phase 6

## 追加ファイル

`late-chunking-regression.test.ts`

## 追加テストケース

| テスト                                                   | 目的                     |
| -------------------------------------------------------- | ------------------------ |
| EmbeddingService が lateChunkingService なしで構築できる | 後方互換性確認           |
| WindowSplitter が既存の chunkSize 設定と競合しない       | 回帰ガード               |
| 単一トークンでMean/Max/CLSが同じベクトルを返す           | プーリング境界           |
| hiddenStatesが空でも例外を投げない                       | 防御的プログラミング確認 |
| 全テキストを一つのチャンクとして扱える                   | TokenBoundary境界        |

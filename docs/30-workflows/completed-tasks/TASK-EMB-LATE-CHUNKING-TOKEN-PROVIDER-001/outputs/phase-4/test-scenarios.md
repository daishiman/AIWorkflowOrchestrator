# Phase 4 テストシナリオ一覧

| ID    | テスト名                                | 期待結果                                   |
| ----- | --------------------------------------- | ------------------------------------------ |
| TP-01 | getTokenEmbeddings 有りでLate Chunking  | embed()不呼出・getTokenEmbeddings()1回呼出 |
| TP-02 | getTokenEmbeddings 無しでフォールバック | embed()が呼ばれる                          |
| TP-03 | MockTokenEmbeddingClient 長さ整合性     | tokens.length === embeddings.length        |
| TP-04 | チャンク境界とベクトル対応              | 各チャンクに異なるベクトル                 |
| TP-05 | lengths 不一致エラー                    | ChunkingError スロー                       |

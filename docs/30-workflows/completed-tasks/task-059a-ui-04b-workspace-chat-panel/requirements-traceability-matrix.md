# 要件トレーサビリティ

| 元要求                                         | Phase                 | 仕様化ポイント                                                           |
| ---------------------------------------------- | --------------------- | ------------------------------------------------------------------------ |
| ゼロステートに 3 つの suggestion bubble        | 1, 2, 4, 5, 11        | suggestion UI、micro interaction、component test、manual screenshot      |
| 入力欄を主役として強調                         | 1, 2, 4, 5, 11        | input layout、send button、focus ring、theme 差分                        |
| 選択中ファイルを背景情報に含める               | 1, 2, 4, 5, 6, 9      | `workspaceSlice` / `fileSelectionSlice` 連携、`file:read`、context build |
| `@mention` でファイル参照                      | 1, 2, 4, 5, 6, 11     | autocomplete、keyboard nav、preview 連動                                 |
| `window.electronAPI.llm.streamChat` の逐次表示 | 1, 2, 4, 5, 6         | stream start / chunk / end / error / cancel                              |
| `conversationAPI` で会話保存                   | 1, 2, 4, 5, 6, 12     | create / addMessage / get / title 更新                                   |
| 04A 後に着手、04C と並列可能                   | 1, 2, 3               | 責務境界、review gate、並列条件                                          |
| system spec skill の内容を反映                 | index, 1, 2, 3, 9, 12 | aiworkflow spec 抽出、レビュー、Phase 12 同期                            |

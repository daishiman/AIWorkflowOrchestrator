# Phase 2 HistorySearchドメイン設計

## 1. 責務境界

| レイヤー       | 責務                                | 対象                                             |
| -------------- | ----------------------------------- | ------------------------------------------------ |
| Main IPC       | sender検証・入力検証・検索/統計提供 | `history:search`, `history:get-stats`            |
| Preload        | invokeラッパ                        | `historySearch.search`, `historySearch.getStats` |
| Renderer Store | 検索状態管理・ページング            | `historySearchSlice`                             |
| Renderer View  | query入力・結果表示・統計表示       | `HistorySearchView`                              |

## 2. 状態遷移設計

| フェーズ | 条件                           | 変化                                                              |
| -------- | ------------------------------ | ----------------------------------------------------------------- |
| 検索開始 | `searchHistory(query, offset)` | `isHistorySearching=true`, `historySearchError=null`              |
| 検索成功 | `response.success && data`     | query更新, results更新(初回/追補), total/hasMore更新, loading解除 |
| 検索失敗 | `!success` or 例外             | `historySearchError` に文言設定, loading解除                      |
| 追補開始 | `hasMore=true && !loading`     | `offset=results.length` で検索呼び出し                            |
| リセット | `resetHistorySearch()`         | query/results/total/hasMore/error/expandedを初期化                |

## 3. IPC契約（HistorySearch）

| Channel             | 方向   | 引数型                                                                                     | 戻り値型                                                                                     |
| ------------------- | ------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `history:search`    | invoke | `{ query: string; filter: "all"\|"chat"\|"file"\|"skill"; limit: number; offset: number }` | `{ success, data?: { items: HistoryItem[]; totalCount: number; hasMore: boolean }, error? }` |
| `history:get-stats` | invoke | `なし`                                                                                     | `{ success, data?: { chat: number; file: number; skill: number; total: number }, error? }`   |

## 4. 入力検証

- `query` は P42 3段を適用（空文字/空白は全件検索として許容）。
- `filter` は許可値のみ（`all/chat/file/skill`）。
- `limit` / `offset` は非負整数に正規化（不正値はfallback）。

## 5. エラー契約

- sender不正: IPC認可エラー返却。
- バリデーション失敗: `VALIDATION_ERROR`。
- 内部例外: `UNKNOWN_ERROR` + sanitize message。

## 6. 統計パネル設計

- `history:get-stats` で `chat/file/skill/total` を取得。
- Viewでは4指標を同時表示し、取得失敗時は `0` か「取得失敗」を表示。

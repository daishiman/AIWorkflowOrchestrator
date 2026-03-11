# Phase 9 QA checklist

## UI 品質

| 項目        | 期待結果                            | 根拠          | 結果 |
| ----------- | ----------------------------------- | ------------- | ---- |
| タイトル    | `あなたの記録` を表示               | AC-01         | PASS |
| 初期表示    | timeline が主役、stats/filter 不在  | AC-01 / AC-02 | PASS |
| 検索        | 300ms デバウンスで切替              | AC-02         | PASS |
| empty state | 初期空 / 検索空 / error を分離      | AC-05         | PASS |
| sticky      | mobile で検索バーと日付見出しが固定 | UX 設計       | PASS |

## Data / Store 品質

| 項目          | 期待結果                                        | 結果 |
| ------------- | ----------------------------------------------- | ---- |
| query trim    | 空白付き query が normalize される              | PASS |
| dedupe append | 同一 id の重複が残らない                        | PASS |
| 初回取得状態  | `hasFetchedHistory` で空状態を切り分ける        | PASS |
| loading more  | `isHistoryLoadingMore` で observer 追補中を識別 | PASS |

## 検証根拠

- 自動 test: 5 files / 26 tests PASS
- typecheck: PASS
- screenshot: 6 枚取得済み

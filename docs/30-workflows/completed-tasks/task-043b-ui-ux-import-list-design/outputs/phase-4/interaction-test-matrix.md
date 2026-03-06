# Phase 4 interaction matrix

| 操作                        | 期待結果                                        | 自動化      |
| --------------------------- | ----------------------------------------------- | ----------- |
| 検索入力に文字列入力        | imported / available の両方が同時に絞り込まれる | unit        |
| available row の `追加する` | dialog が開く                                   | integration |
| dialog `キャンセル`         | dialog close + trigger focus return             | integration |
| dialog `追加する` 成功      | imported 側へ移動 + status + focus              | integration |
| dialog `追加する` 失敗      | dialog stay open + alert                        | integration |
| `Escape`                    | dialog close                                    | integration |
| dark mode 切替              | contrast と hierarchy が維持                    | manual      |

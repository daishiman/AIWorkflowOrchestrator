# Phase 3 オープンリスク台帳

| ID   | 重要度 | 内容                                                                              | 対応                                     |
| ---- | ------ | --------------------------------------------------------------------------------- | ---------------------------------------- |
| R-01 | MINOR  | store `importSkill` が failure 時に throw しないため、dialog 側が成功扱いしやすい | 実装で store state 判定へ変更済み        |
| R-02 | MINOR  | error alert を panel / dialog で二重表示しやすい                                  | dialog open 中の panel alert 抑止で解消  |
| R-03 | MINOR  | `description` / resource arrays 欠損時に検索と描画が壊れやすい                    | defensive helper と unit / manual で固定 |

## Gate 判定

- Phase 4 着手可
- 差戻し不要

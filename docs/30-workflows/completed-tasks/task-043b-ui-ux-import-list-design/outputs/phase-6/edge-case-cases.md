# Phase 6 edge case 一覧

| ID    | 条件                                     | 期待結果                 |
| ----- | ---------------------------------------- | ------------------------ |
| EC-01 | `description` undefined                  | fallback copy で描画継続 |
| EC-02 | resources arrays undefined               | 0件扱いで dialog 継続    |
| EC-03 | imported 済み skill が available に混在  | available で再表示しない |
| EC-04 | import failure が store error のみを返す | dialog close しない      |
| EC-05 | dialog open 中に error が出る            | dialog 内 alert のみ表示 |
| EC-06 | `importingSkillName` 一致                | 対象 row のみ disabled   |
| EC-07 | query no-result                          | 全体 no-result state     |

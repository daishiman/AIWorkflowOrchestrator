# Phase 6 回帰マトリクス

| 領域        | 既存挙動                   | 新挙動                                      | 検証                 |
| ----------- | -------------------------- | ------------------------------------------- | -------------------- |
| list view   | imported の検索・削除      | available 追加、2セクション、status / alert | unit / integration   |
| currentView | editor / analysis / create | 変更なし                                    | integration          |
| dialog      | open / close               | import success / failure 契約追加           | integration / manual |
| state guard | duplicate / nullish 未保証 | duplicate hide、nullish fallback            | unit / manual        |
| responsive  | desktop 中心               | mobile dark capture 追加                    | manual               |

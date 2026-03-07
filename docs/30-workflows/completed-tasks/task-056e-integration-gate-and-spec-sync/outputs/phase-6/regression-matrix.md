# Phase 6 回帰マトリクス

| ケース | 対象            | 確認内容                                               | 主なコマンド              | 優先度       |
| ------ | --------------- | ------------------------------------------------------ | ------------------------- | ------------ | ------------- | ------ |
| RC-01  | path 正規化     | parent/current/completed の参照先が実在する            | `test -f`, `rg -n "056e"` | High         |
| RC-02  | status ドリフト | `artifacts.json` と index / phase 本文の状態が一致する | `rg -n "ステータス"`      | High         |
| RC-03  | sync 区分       | 3区分と理由がセットで記録される                        | `rg -n "常時更新          | 条件付き更新 | 更新不要"`    | High   |
| RC-04  | handoff         | `TASK-UI-02/03/04A` が個別条件を持つ                   | `rg -n "TASK-UI-02        | TASK-UI-03   | TASK-UI-04A"` | High   |
| RC-05  | B 正本境界      | B が `entry_spec` として説明される                     | `rg -n "entry spec        | entry_spec   | B 正本"`      | Medium |

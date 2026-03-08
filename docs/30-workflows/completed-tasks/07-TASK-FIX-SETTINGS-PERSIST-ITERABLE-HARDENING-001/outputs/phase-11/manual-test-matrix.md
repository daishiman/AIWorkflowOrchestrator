# Phase 11 Manual Test Matrix

| TC-ID    | 観点     | 手順                                                | 期待結果                                | 結果 |
| -------- | -------- | --------------------------------------------------- | --------------------------------------- | ---- |
| TC-11-01 | 正常系   | 正常 persist state で Settings を表示               | 例外なく Settings が表示される          | PASS |
| TC-11-02 | 破損復旧 | `viewHistory=null` で起動して Settings を表示       | 配列フォールバックでクラッシュしない    | PASS |
| TC-11-03 | 破損復旧 | `expandedFolders=number` で起動して Settings を表示 | 空 Set フォールバックでクラッシュしない | PASS |

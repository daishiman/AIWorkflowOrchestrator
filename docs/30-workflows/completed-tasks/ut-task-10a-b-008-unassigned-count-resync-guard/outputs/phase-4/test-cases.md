# Phase 4 テストケース

| TC      | 内容                                                 | 期待値                      |
| ------- | ---------------------------------------------------- | --------------------------- |
| TC-4-01 | task-workflow / ui-ux / detection の active set 比較 | 6件が一致                   |
| TC-4-02 | completed set 比較                                   | 001/003/008 が一致          |
| TC-4-03 | 参照先ファイル欠損                                   | validator が FAIL           |
| TC-4-04 | derived ledger が 1件不足                            | validator が FAIL           |
| TC-4-05 | `audit --diff-from HEAD`                             | `currentViolations.total=0` |

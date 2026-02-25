# Phase 2 設計-テスト対応表

| 設計ID | 設計内容          | テストケース                                          |
| ------ | ----------------- | ----------------------------------------------------- |
| D-1    | full mode互換維持 | TC-001 full mode fail                                 |
| D-2    | target-file分類   | TC-002 baseline分離、TC-003 current fail              |
| D-3    | diff-from分類     | TC-004 diff scope                                     |
| D-4    | invalid input     | TC-005 invalid target-file exit 2                     |
| D-5    | JSON拡張          | TC-002〜004で `scope/current/baseline` フィールド確認 |

## 受け入れ判定

- 5ケースすべてPASSで設計妥当。

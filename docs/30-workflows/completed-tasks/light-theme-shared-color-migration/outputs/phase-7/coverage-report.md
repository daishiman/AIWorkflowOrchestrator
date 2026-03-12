# Phase 7 Output: Coverage Report

## 自動テスト coverage

| 指標                      | 結果         |
| ------------------------- | ------------ |
| representative test files | 10           |
| representative tests      | 286/286 PASS |
| guard coverage files      | 8/8 PASS     |
| typecheck                 | PASS         |
| build                     | PASS         |

## batch coverage 判定

| Batch | 自動テスト       | 手動証跡            | 判定 |
| ----- | ---------------- | ------------------- | ---- |
| A     | PASS             | TC-01, TC-02        | 十分 |
| B     | PASS             | TC-03〜TC-07, TC-11 | 十分 |
| C     | PASS             | TC-08               | 十分 |
| D     | PASS             | TC-09, TC-10        | 十分 |
| E     | screenshot smoke | TC-12, TC-13        | 十分 |

## blind spot と対応

| blind spot                                              | 対応                        |
| ------------------------------------------------------- | --------------------------- |
| `SettingsView` auth-mode status の green/amber hardcode | token 化し guard 対象へ昇格 |
| danger dialog の visual evidence 不足                   | TC-05, TC-07 を追加         |
| theme coverage が light のみになりやすい                | TC-13 dark smoke を追加     |

## 残留リスク

- `ApiKeysSection` / `SettingsView.integration` に React `act(...)` warning が残るが、テスト fail ではなく既存 async update 由来

# Phase 6: 拡張テストケース

## 追加エッジケース

| テスト名                               | 入力                    | 期待結果                                 |
| -------------------------------------- | ----------------------- | ---------------------------------------- |
| 重複値の正規化                         | `weekdays: [0, 0]`      | `"0 9 * * 0"`                            |
| 土曜のみ（weekdays=[6]）               | `weekdays: [6]`         | `"0 9 * * 6"`                            |
| 逆順ソート                             | `weekdays: [5, 3, 1]`   | `"0 9 * * 1,3,5"`                        |
| InvalidConfigError instanceof チェック | `weekdays: []` でスロー | `instanceof InvalidConfigError && Error` |

## テスト結果

- **Tests**: 16 passed / 16 total
- 全エッジケースが Green

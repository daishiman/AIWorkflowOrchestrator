# Phase 6 テスト拡充結果

## 追加した回帰観点

| 観点           | 内容                                              |
| -------------- | ------------------------------------------------- |
| 完了除外       | 001/003/008 が active に残らない                  |
| 追加反映       | 009 が active に含まれる                          |
| completed 表示 | ui-ux / detection でも completed 集合を別表へ分離 |
| path 実在      | stale 旧参照を許容しない                          |

## 結果

- validator test で PASS ケース / active mismatch / missing path を網羅
- current/baseline 判定は audit で別検証する設計にした

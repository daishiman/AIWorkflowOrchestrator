# Phase 6 Edge Case Result

| ケース                              | 判定 | メモ                          |
| ----------------------------------- | ---- | ----------------------------- |
| restored = null / snapshot = null   | PASS | 待機表示へ遷移                |
| restored != null / snapshot != null | PASS | restored を優先               |
| snapshot requestId change           | PASS | clear effect 発火             |
| snapshot same requestId             | PASS | 不要な clear を増やさない想定 |

## 残件

- same requestId の実測は downstream task でも再確認する価値があるが、RALLY-002 単体では blocker なし

# 拡充テストケース一覧 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 追加テストケース（Phase 6）

| TC番号 | 入力                      | 期待値         | 理由                                             |
| ------ | ------------------------- | -------------- | ------------------------------------------------ |
| TC-16  | `dayOfMonth=NaN`          | `""`           | `Number.isInteger(NaN)=false` で弾かれること確認 |
| TC-17  | `dayOfMonth=15.5`         | `""`           | 小数値の拒否確認                                 |
| TC-18  | `dayOfMonth=15`（中間値） | `"0 9 15 * *"` | 正常系・中間値の動作確認                         |
| TC-19  | `dayOfMonth=0.5`          | `""`           | 小数値（0以上1未満）の拒否確認                   |

## 全テストケース一覧

| TC番号 | 説明                                             | AC対応              | Phase     |
| ------ | ------------------------------------------------ | ------------------- | --------- |
| TC-01  | `weekly`, `weekdays=[]` → `""`                   | WEEKDAYS-GUARD AC-1 | 旧Phase 4 |
| TC-02  | `weekly`, `weekdays=[0]` → `"0 9 * * 0"`         | WEEKDAYS-GUARD      | 旧Phase 4 |
| TC-03  | `weekly`, `weekdays=[1,3,5]` → `"0 9 * * 1,3,5"` | WEEKDAYS-GUARD      | 旧Phase 4 |
| TC-04  | `daily` → weekday 影響なし                       | WEEKDAYS-GUARD      | 旧Phase 4 |
| TC-05  | `every-hour` → weekday 影響なし                  | WEEKDAYS-GUARD      | 旧Phase 4 |
| TC-07  | `weekly`, `weekdays=[]` → `""` （重複確認）      | WEEKDAYS-GUARD      | 旧Phase 6 |
| TC-08  | weekdays の順序・重複正規化                      | WEEKDAYS-GUARD      | 旧Phase 6 |
| TC-09  | `every-hour` で weekdays 無視                    | WEEKDAYS-GUARD      | 旧Phase 6 |
| TC-10  | `monthly` で weekdays 無視                       | WEEKDAYS-GUARD      | 旧Phase 6 |
| TC-11  | `dayOfMonth=0` → `""`                            | AC-1                | Phase 4   |
| TC-12  | `dayOfMonth=32` → `""`                           | AC-2                | Phase 4   |
| TC-13  | `dayOfMonth=-1` → `""`                           | AC-3                | Phase 4   |
| TC-14  | `dayOfMonth=1` → `"0 9 1 * *"`                   | AC-4                | Phase 4   |
| TC-15  | `dayOfMonth=31` → `"0 9 31 * *"`                 | AC-5                | Phase 4   |
| TC-16  | `dayOfMonth=NaN` → `""`                          | 非整数チェック      | Phase 6   |
| TC-17  | `dayOfMonth=15.5` → `""`                         | 小数拒否            | Phase 6   |
| TC-18  | `dayOfMonth=15` → `"0 9 15 * *"`                 | 中間値正常確認      | Phase 6   |
| TC-19  | `dayOfMonth=0.5` → `""`                          | 小数拒否            | Phase 6   |

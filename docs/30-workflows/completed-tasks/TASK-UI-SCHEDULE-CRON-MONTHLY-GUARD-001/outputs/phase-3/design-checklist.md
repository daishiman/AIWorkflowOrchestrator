# 設計チェックリスト - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## AC 対応確認

| チェック観点        | 確認内容                                                               | 判定    |
| ------------------- | ---------------------------------------------------------------------- | ------- |
| AC-1 対応           | `dayOfMonth=0` → `0 < 1` でガードされる                                | ✅ PASS |
| AC-2 対応           | `dayOfMonth=32` → `32 > 31` でガードされる                             | ✅ PASS |
| AC-3 対応           | `dayOfMonth=-1` → `-1 < 1` でガードされる                              | ✅ PASS |
| AC-4 対応           | `dayOfMonth=1` → ガード条件 false、`"0 9 1 * *"` を返す                | ✅ PASS |
| AC-5 対応           | `dayOfMonth=31` → ガード条件 false、`"0 9 31 * *"` を返す              | ✅ PASS |
| AC-6 対応           | 既存テストへの影響なし（monthly 分岐のみ変更）                         | ✅ PASS |
| AC-7 対応           | JSDoc 更新設計あり（`outputs/phase-2/jsdoc-design.md`）                | ✅ PASS |
| 非整数値チェック    | `Number.isInteger(NaN)=false`、`Number.isInteger(15.5)=false` で弾ける | ✅ PASS |
| `weekly` との対称性 | ブロック構文 `{}` + 早期リターン `return ""` パターンが一致            | ✅ PASS |

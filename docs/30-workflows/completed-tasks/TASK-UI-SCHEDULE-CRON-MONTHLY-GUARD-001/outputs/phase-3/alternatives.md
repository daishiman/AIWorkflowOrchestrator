# 代替案検討書 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 検討した代替案

| 案        | コード                                                                   | メリット                       | デメリット                                             |
| --------- | ------------------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------ |
| A（選択） | `!Number.isInteger(dayOfMonth) \|\| dayOfMonth < 1 \|\| dayOfMonth > 31` | NaN・小数・範囲外を1式でカバー | やや長い                                               |
| B         | `dayOfMonth == null \|\| dayOfMonth < 1 \|\| dayOfMonth > 31`            | null/undefined に強い          | `NaN`・`15.5` を取りこぼす（`NaN < 1` は false）       |
| C         | `!(dayOfMonth >= 1 && dayOfMonth <= 31)`                                 | 短くシンプル                   | 整数性が曖昧（`1.5 >= 1 && 1.5 <= 31` は true になる） |

---

## 選択した案: 案A

**理由**:

- `Number.isInteger()` で「整数性」を明示的にチェックし、`NaN` と小数を確実に弾く
- 型定義 `dayOfMonth: number` では `NaN`・小数が型レベルで通ってしまうため、ランタイムガードが必要
- 案Bは `NaN` の漏れリスクあり（`NaN < 1 === false`, `NaN > 31 === false` で条件が全て false になる）
- 案Cは小数の漏れリスクあり（`1.5 >= 1 && 1.5 <= 31 === true`）

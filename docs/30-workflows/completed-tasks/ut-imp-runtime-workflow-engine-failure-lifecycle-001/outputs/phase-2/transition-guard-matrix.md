# Transition Guard Matrix

| From      | To        | 判定   | 理由                       |
| --------- | --------- | ------ | -------------------------- |
| `plan`    | `execute` | allow  | 正常遷移                   |
| `execute` | `review`  | allow  | review prompt が必要なとき |
| `execute` | `verify`  | allow  | 正常遷移                   |
| `verify`  | `review`  | allow  | verification review        |
| `review`  | `verify`  | allow  | 再送後の検証               |
| `plan`    | `verify`  | reject | phase jump                 |
| `review`  | `execute` | reject | 再実行の入口を分離する     |
| `verify`  | `plan`    | reject | backward jump              |

# Phase 11: manual-test-checklist

## 判定方式

- 本 workflow は Main IPC の差し替えであり、新規 renderer surface は追加していない
- そのため Phase 11 は `NON_VISUAL` として実施する

## チェック項目

| ID       | 観点                            | 結果 |
| -------- | ------------------------------- | ---- |
| NV-11-01 | subscription 時の disclosure 値 | PASS |
| NV-11-02 | api-key 時の disclosure 値      | PASS |
| NV-11-03 | fallback 値                     | PASS |
| NV-11-04 | DENY-5                          | PASS |
| NV-11-05 | sender 検証                     | PASS |

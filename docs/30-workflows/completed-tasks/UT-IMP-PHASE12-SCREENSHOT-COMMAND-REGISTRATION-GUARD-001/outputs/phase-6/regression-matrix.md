# Phase 6 回帰テストマトリクス

| ID    | 種別   | 検査方法                                              | 期待値       | 実績 |
| ----- | ------ | ----------------------------------------------------- | ------------ | ---- |
| TC-07 | 失敗系 | `package.json` scriptsキー確認                        | キー存在     | PASS |
| TC-08 | 失敗系 | 旧文字列 `rg`                                         | 0件          | PASS |
| TC-09 | 失敗系 | 旧実行例残存確認                                      | 0件          | PASS |
| TC-10 | 回帰   | `rg screenshot:skill-import-idempotency-guard`        | 1件以上      | PASS |
| TC-11 | 回帰   | `rg -P screenshot:skill-import-idempotency(?!-guard)` | 0件          | PASS |
| TC-12 | 回帰   | command run log確認                                   | 実行記録あり | PASS |

## 監査連携

- coverage validator: PASS（4/4）
- audit-unassigned(diff): `currentViolations=0`, `baselineViolations=97`

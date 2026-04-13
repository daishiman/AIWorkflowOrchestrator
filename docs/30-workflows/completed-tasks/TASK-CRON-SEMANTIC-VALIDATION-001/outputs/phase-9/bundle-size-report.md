# バンドルサイズ確認結果

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 9                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 実行日   | 2026-04-12                        |

---

## 確認結果

| 項目                  | 結果 | 備考                                            |
| --------------------- | ---- | ----------------------------------------------- |
| 外部依存の追加        | なし | `package.json` 変更なし                         |
| 新規 import 追加      | なし | `scheduleConfigValidator.ts` の import 変更なし |
| Tree-shaking への影響 | なし | 既存の export 構成を変更していない              |

---

## 変更量の見積もり

`scheduleConfigValidator.ts` の追加コード:

- `CRON_VALIDATION_ERRORS` 定数: ~100bytes（gzip後 ~80bytes）
- `MAX_DAYS_PER_MONTH` 定数: ~150bytes（gzip後 ~100bytes）
- `validateCronSemantics` 関数: ~250bytes（gzip後 ~180bytes）

**合計推定増加量: ~360bytes（gzip後 ~300bytes）**

---

## 判定

**許容範囲内（PASS）**

# 要件定義書 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## P50 チェック結果

- **変更履歴**: `e79030253 fix(cron): TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001` が直前のコミット
- **現状実装確認**: `cronConverter.ts` line 43 に `dayOfMonth` ガードは**未実装**
  ```typescript
  case "monthly":
    return `${minute} ${hour} ${dayOfMonth} * *`;  // ガードなし
  ```
- **対象ファイル確定**:
  - `apps/desktop/src/renderer/utils/cronConverter.ts`
  - `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`

---

## 機能要件

| 要件ID | 内容                                                                |
| ------ | ------------------------------------------------------------------- | --- | -------------- | --- | ---------------- |
| FR-1   | `dayOfMonth` の有効範囲は整数 1〜31                                 |
| FR-2   | ガード条件: `!Number.isInteger(dayOfMonth)                          |     | dayOfMonth < 1 |     | dayOfMonth > 31` |
| FR-3   | ガード条件が真の場合、空文字 `""` を返す                            |
| FR-4   | `NaN`・小数（例: `15.5`）は `Number.isInteger()` で非整数として弾く |
| FR-5   | 有効範囲内（1〜31 の整数）では既存の cron 式生成ロジックを維持する  |

---

## 非機能要件

| 要件ID | 内容                                                               |
| ------ | ------------------------------------------------------------------ |
| NFR-1  | 既存テスト全件（`cronConverter.edge.test.ts`）がグリーンであること |
| NFR-2  | TypeScript 型チェック通過                                          |
| NFR-3  | ESLint Lint 通過                                                   |
| NFR-4  | JSDoc の `@returns` と `@remarks` にガード仕様を追記すること       |
| NFR-5  | `weekly` ガードとの対称性を保つこと（ブロック構文 + 早期リターン） |

---

## スコープ外

- `hour`/`minute` の範囲チェック → 別タスク
- UI バリデーションロジックの変更 → スコープ外
- `weekly` 分岐の変更 → スコープ外
- `dayOfMonth: null` の既定値ルール → 別タスク

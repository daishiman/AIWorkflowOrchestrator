# リファクタリング前後の差分記録

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 8                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 作成日   | 2026-04-12                        |

---

## 主要差分（scheduleConfigValidator.ts）

### 追加: `CRON_VALIDATION_ERRORS` 定数

```typescript
// After (追加)
const CRON_VALIDATION_ERRORS = {
  EMPTY: "cron式を入力してください",
  INVALID_FORMAT: "cron式の形式が正しくありません",
  INVALID_DATE: "指定した日付は存在しません（例: 2月31日）",
} as const;
```

### 変更: `validateCronExpression` エラーメッセージ参照

```typescript
// Before
if (!trimmed) {
  return "cron式を入力してください";
}
// ...
return allValid ? null : "cron式の形式が正しくありません";

// After
if (!trimmed) {
  return CRON_VALIDATION_ERRORS.EMPTY;
}
// ...
if (!allValid) {
  return CRON_VALIDATION_ERRORS.INVALID_FORMAT;
}
```

### 変更: `validateCronSemantics` エラーメッセージ参照

```typescript
// Before
return "指定した日付は存在しません（例: 2月31日）";

// After
return CRON_VALIDATION_ERRORS.INVALID_DATE;
```

---

## 変更なし箇所

- `isValidCronField` 関数: 変更不要（重複なし・可読性十分）
- `validateTimezone` 関数: 変更不要（スコープ外）
- `validateSkillWizardScheduleConfig` 関数: 変更不要
- テストファイル: 変更不要（`toMatch(/[\u3040-\u9FFF]/)` で日本語チェックのため、定数変更に耐性あり）

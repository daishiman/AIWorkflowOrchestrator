# 型定義・関数シグネチャ設計

## メタ情報

| 項目     | 内容                              |
| -------- | --------------------------------- |
| Phase    | 2                                 |
| タスクID | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 作成日   | 2026-04-12                        |

---

## 関数シグネチャ

### `validateCronSemantics`（新規追加 - 内部関数）

```typescript
/**
 * cron 式の意味論的バリデーションを行う。
 * 単純な日付指定に限り、存在しない日付を拒否する。
 *
 * @param fields - 5フィールドに分割済みの cron 式
 * @returns エラーメッセージ文字列、または有効なら null
 */
function validateCronSemantics(fields: string[]): string | null;
```

- **可視性**: ファイル内部（export しない）
- **入力**: `string[]` - 5フィールドに分割済みの cron フィールド配列
- **出力**: `string | null` - エラーメッセージまたは null
- **副作用**: なし（純粋関数）

### `validateCronExpression`（既存 - 変更なし）

```typescript
/**
 * cron 式の 5 フィールド構文、値域、意味論を順に検証する。
 * @returns エラーメッセージ文字列、または有効なら null
 */
export function validateCronExpression(value: string): string | null;
```

- **変更内容**: Stage 3 として `validateCronSemantics` の呼び出しを追加するのみ
- **シグネチャ**: 変更なし（後方互換性維持）

---

## 定数定義

```typescript
/** 月ごとの最大日数（2月は閏年を許容して29日とする） */
const MAX_DAYS_PER_MONTH: Record<number, number> = {
  1: 31,
  2: 29,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};
```

---

## 公開 API の契約

| 関数名                              | 変更前                           | 変更後                           | 破壊的変更 |
| ----------------------------------- | -------------------------------- | -------------------------------- | ---------- |
| `validateCronExpression`            | `string \| null`                 | `string \| null`                 | なし       |
| `validateTimezone`                  | `string \| null`                 | `string \| null`                 | なし       |
| `validateSkillWizardScheduleConfig` | `ScheduleConfigValidationResult` | `ScheduleConfigValidationResult` | なし       |
| `validateCronSemantics`             | 存在しない                       | `string \| null`（内部）         | N/A        |

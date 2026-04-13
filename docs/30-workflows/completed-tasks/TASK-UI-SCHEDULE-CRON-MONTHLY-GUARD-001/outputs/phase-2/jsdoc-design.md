# JSDoc 更新設計書 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 更新対象

`apps/desktop/src/renderer/utils/cronConverter.ts` - `visualConfigToCron` 関数の JSDoc

---

## 現状 JSDoc

```typescript
/**
 * @returns cron 式文字列。`frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
 *
 * @remarks
 * 空曜日は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
 * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
 */
```

## 修正後 JSDoc

```typescript
/**
 * @returns cron 式文字列。
 *   - `frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
 *   - `frequency="monthly"` かつ `dayOfMonth` が非整数、または範囲外（< 1 または > 31）の場合は空文字 `""` を返す。
 *
 * @remarks
 * 空曜日・不正な日付は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
 * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
 */
```

---

## 変更箇所

| 変更点     | 内容                                               |
| ---------- | -------------------------------------------------- |
| `@returns` | bullet list 形式に変更し、monthly ガード仕様を追記 |
| `@remarks` | 「空曜日」→「空曜日・不正な日付」に修正            |

これにより AC-7（JSDoc の `@returns` と `@remarks` にガード仕様が追記されている）を満たす。

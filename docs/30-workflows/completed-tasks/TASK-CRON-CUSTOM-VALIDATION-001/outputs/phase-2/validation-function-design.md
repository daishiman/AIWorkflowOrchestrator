# バリデーション関数設計

## タスク: TASK-CRON-CUSTOM-VALIDATION-001

## 設計方針

renderer環境制約のため外部ライブラリ禁止。純粋な文字列操作のみで2つのバリデーション関数を実装する。
関数はコンポーネントファイル（`VisualCronPicker.tsx`）内にプライベート関数として配置する（単一ファイル変更の原則）。

## validateCronSyntax

```typescript
/**
 * cron式の構文バリデーション（空文字・フィールド数チェック）
 * @param expression - cron式文字列
 * @returns 有効なら true、無効なら false
 */
function validateCronSyntax(expression: string): boolean {
  const trimmed = expression.trim();
  if (!trimmed) return false;
  const fields = trimmed.split(/\s+/);
  return fields.length === 5;
}
```

**設計判断:**

- `trim()` で先頭/末尾の空白を除去してから空文字チェック（AC-1, CV-12対応）
- `split(/\s+/)` で複数スペース区切りにも対応（CV-16対応）
- フィールド数が5でない場合は false（AC-2対応）

## validateCronDayOfMonth

```typescript
/**
 * cron式のday-of-month範囲バリデーション
 * day-of-monthフィールドが純粋な数値の場合のみ、1〜31の範囲チェックを行う。
 * 非数値（*, */2, 1-15, 1,15, L 等）はスキップする（trueを返す）。
 * @param expression - cron式文字列（5フィールド前提）
 * @returns 有効なら true、無効なら false
 */
function validateCronDayOfMonth(expression: string): boolean {
  const fields = expression.trim().split(/\s+/);
  if (fields.length < 3) return false;
  const dom = fields[2];
  // 純粋な数値以外（*、*/2、1-15、1,15、L 等）はバリデーション対象外
  if (!/^\d+$/.test(dom)) return true;
  const num = parseInt(dom, 10);
  return num >= 1 && num <= 31;
}
```

**設計判断:**

- `fields.length < 3` ガード: フィールド数不足時はfalseではなくfalse（validateCronSyntaxとの連携前提）
- `/^\d+$/` テスト: 純粋な数値のみ範囲チェック対象（AC-6対応、`*`/`*/2`/`1-15`/`1,15`/`L`はスキップ）
- `parseInt(dom, 10)`: 10進数解釈で範囲チェック（AC-3: 0以下, AC-4: 32以上を検出）

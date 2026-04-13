# API設計書 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## ValidateCronOptions インターフェース

```typescript
/**
 * validateCronExpression のオプション設定
 */
export interface ValidateCronOptions {
  /**
   * true の場合、構文・値域チェックに加えて next-execution-time 計算による
   * 意味論的バリデーション（到達可能性チェック）を実行する。
   * false または省略した場合は従来の構文チェックのみ実行（後方互換）。
   * @default false
   */
  semantic?: boolean;
}
```

## validateCronExpression 変更後シグネチャ

**変更前**:

```typescript
export function validateCronExpression(value: string): string | null;
```

**変更後**:

```typescript
/**
 * cron 式の 5 フィールド構文とフィールド値の範囲を検証する。
 * options.semantic が true の場合は next-execution-time 計算による到達可能性チェックも実行する。
 *
 * @param value - 検証対象の cron 式文字列
 * @param options - バリデーションオプション
 * @param options.semantic - true の場合、意味論的検証（next-run 計算）を追加実行する（デフォルト: false）
 * @returns エラーメッセージ文字列、または有効なら null
 */
export function validateCronExpression(
  value: string,
  options?: ValidateCronOptions,
): string | null;
```

## バリデーションフロー設計

```
validateCronExpression(value, options)
│
├─ [1] trimmed が空文字 → "cron式を入力してください" を返す
│
├─ [2] fields.length !== 5 → フィールド数エラーを返す
│
├─ [3] 各フィールドの値域チェック（既存ロジック・変更なし）
│       └─ 不正 → "cron式の形式が正しくありません" を返す
│
├─ [4] options?.semantic !== true → null を返す（従来動作・後方互換）
│
└─ [5] semantic チェック実行（options.semantic === true の場合のみ）
        │
        ├─ CronExpressionParser.parse(trimmed).next() 成功 → null を返す
        │
        └─ 例外発生 → "指定した日付の組み合わせは存在しません（例: 2月31日）" を返す
```

## 後方互換性の保証

```
既存呼び出し例:
  validateCronExpression("0 0 31 2 *")
  → options が undefined → semantic チェックをスキップ → 従来通り null を返す

新規呼び出し例（semantic 有効化）:
  validateCronExpression("0 0 31 2 *", { semantic: true })
  → next-execution-time 計算を実施 → 到達不能と判定 → エラー文字列を返す
```

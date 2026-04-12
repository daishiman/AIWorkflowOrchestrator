# Phase 2: コード変更差分プレビュー

## cronConverter.ts: visualConfigToCron 関数の変更

### Before (現状の実装)

```typescript
/**
 * VisualCronConfig をクロン式文字列に変換する。
 * 外部ライブラリへの依存なし（純粋な文字列操作のみ）。
 */
export function visualConfigToCron(config: VisualCronConfig): string {
  const { frequency, hour, minute, weekdays, dayOfMonth, rawCronExpression } =
    config;

  switch (frequency) {
    // ...
    case "weekly": {
      const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
      return `${minute} ${hour} * * ${sorted.join(",")}`;
      // ↑ weekdays=[] のとき sorted=[] → join("")="" → "0 9 * * " (不正)
    }
    // ...
  }
}
```

### After (修正後)

```typescript
/**
 * VisualCronConfig をクロン式文字列に変換する。
 * 外部ライブラリへの依存なし（純粋な文字列操作のみ）。
 *
 * @param config - スケジュール設定
 * @returns cron 式文字列。`frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
 *
 * @remarks
 * 空曜日は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
 * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
 */
export function visualConfigToCron(config: VisualCronConfig): string {
  const { frequency, hour, minute, weekdays, dayOfMonth, rawCronExpression } =
    config;

  switch (frequency) {
    // ...
    case "weekly": {
      if (weekdays.length === 0) {
        return ""; // ← ガード処理追加: 空曜日は空文字を返す
      }
      const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
      return `${minute} ${hour} * * ${sorted.join(",")}`;
    }
    // ...
  }
}
```

### 変更差分

```diff
+  * @param config - スケジュール設定
+  * @returns cron 式文字列。`frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
+  *
+  * @remarks
+  * 空曜日は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
+  * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
   case "weekly": {
+    if (weekdays.length === 0) {
+      return "";
+    }
     const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
     return `${minute} ${hour} * * ${sorted.join(",")}`;
```

## cronConverter.edge.test.ts: テスト更新

### Before (バグ動作を期待するテスト)

```typescript
it("weekly weekdays が空配列のとき空の曜日フィールドになる", () => {
  // ...
  expect(result).toBe("0 9 * * "); // バグ動作を期待
});
```

### After (正しい期待値 + 新テストケース追加)

```typescript
it("weekly weekdays が空配列のとき空文字を返す", () => {
  // ...
  expect(result).toBe(""); // 修正: 空文字を期待
});

// TC-01〜TC-10 の新テストケースを追加
describe("visualConfigToCron - 空weekdaysガード処理", () => {
  // TC-01: weekdays=[] → ""
  // TC-02: weekdays=[0] → "0 9 * * 0"
  // TC-03: weekdays=[1,3,5] → "0 9 * * 1,3,5"
  // TC-04: frequency="daily" → weekday 影響なし
  // TC-05: frequency="every-hour" → weekday 影響なし
  // TC-07: 空曜日ガード確認
  // TC-08: 重複・未ソート weekdays の正規化
  // TC-09: every-hour で weekdays 無視
  // TC-10: monthly で weekdays 無視
});
```

# 実装ガイド: cronExpression 意味論的バリデーション

## わかりやすい説明

カレンダーに存在しない日付に予約を入れようとしたらどうなるでしょうか？

たとえば「2月31日の9時に会議」と予約しようとしても、
2月は最大でも28日か29日しかありません。
そのような「存在しない日付」をスケジュールに登録しようとすると、
アプリが「その日付は存在しません」とエラーを教えてくれます。

これまでのアプリは「31という数字が正しい範囲か」しか確認していませんでした（1〜31の範囲内なのでOKとなっていた）。
今回の改善で、「その月に実際に31日は存在するか」まで確認するようになりました。

---

## 技術者向け説明

### 変更対象ファイル

`apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`

### 型定義

```typescript
/** バリデーションエラーメッセージ定数 */
const CRON_VALIDATION_ERRORS = {
  EMPTY: "cron式を入力してください",
  INVALID_FORMAT: "cron式の形式が正しくありません",
  INVALID_DATE: "指定した日付は存在しません（例: 2月31日）",
} as const;

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

/**
 * cron 式の意味論的バリデーションを実行する（Stage 3）。
 * @param fields - 5フィールドに分割済みの cron 式
 * @returns エラーメッセージ文字列、または有効なら null
 */
function validateCronSemantics(fields: string[]): string | null;

/**
 * cron 式の 5 フィールド構文、値域、意味論を順に検証する。
 * @returns エラーメッセージ文字列、または有効なら null
 */
export function validateCronExpression(value: string): string | null;
```

### バリデーション 3 段階フロー

```
[入力] cron式文字列
       |
       v
Stage 1: 構文チェック
  空文字・5フィールド数チェック
  → NG: CRON_VALIDATION_ERRORS.EMPTY / フィールド数エラー
       |
       v
Stage 2: 値域チェック
  各フィールドの数値範囲（FIELD_RANGES）
  → NG: CRON_VALIDATION_ERRORS.INVALID_FORMAT
       |
       v
Stage 3: 意味論的チェック（新規追加）
  日・月が単純数値 かつ weekday "*" の場合のみ
  MAX_DAYS_PER_MONTH で日付の存在を確認
  → NG: CRON_VALIDATION_ERRORS.INVALID_DATE
       |
       v
[出力] null（有効）
```

### 使用例

```typescript
// エラーになる例
validateCronExpression("0 9 31 2 *");
// → "指定した日付は存在しません（例: 2月31日）"

validateCronExpression("0 9 30 2 *");
// → "指定した日付は存在しません（例: 2月31日）"

// null（正常）になる例
validateCronExpression("0 9 29 2 *");
// → null（2月29日は有効 - 閏年に実行される）

validateCronExpression("0 9 1,15 2 *");
// → null（複合フィールドは意味論チェックをスキップ）

validateCronExpression("0 9 * * *");
// → null
```

### UI コンポーネントとの統合

`ScheduleDialog` / `ConversationRoundStep` は `validateCronExpression` の戻り値（`string | null`）を
既存のエラー表示ロジックで処理するため、**UI コンポーネントの変更は不要**。
あわせて `ScheduleDialog.test.tsx` と `ConversationRoundStep.test.tsx` で、意味論エラーが既存の保存・生成ブロック経路にそのまま流れることも回帰確認している。

```
validateCronExpression("0 9 31 2 *")
  → "指定した日付は存在しません（例: 2月31日）"（string）
    ↓
ScheduleDialog の既存エラー表示コンポーネント
  → 文字列がそのまま表示される
```

### 設計上の制約

| 項目                           | 仕様                                         |
| ------------------------------ | -------------------------------------------- |
| 複合フィールドの意味論チェック | スキップ（`1,15 2 *` 等は Stage 2 に委ねる） |
| 2月29日の扱い                  | 有効（cron は年を指定しないため閏年対応）    |
| 外部依存                       | なし（純 TypeScript 実装）                   |
| ブラウザ対応                   | 完全対応（Electron Renderer で動作）         |

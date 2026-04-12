# Phase 5: 実装結果レポート

## タスクID: TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001

## 実施日: 2026-04-12

## 変更内容

### ファイル: `apps/desktop/src/renderer/utils/cronConverter.ts`

**変更箇所**: JSDoc 更新 + `case "weekly"` にガード処理追加

```diff
+  * @param config - スケジュール設定
+  * @returns cron 式文字列。`frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
+  *
+  * @remarks
+  * 空曜日は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
+  * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
   case "weekly": {
+    if ((weekdays ?? []).length === 0) {
+      return "";
+    }
     const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
     return `${minute} ${hour} * * ${sorted.join(",")}`;
```

## Before/After

| 状態   | 入力                                                        | 出力                |
| ------ | ----------------------------------------------------------- | ------------------- |
| Before | `{ frequency: "weekly", weekdays: [], hour: 9, minute: 0 }` | `"0 9 * * "` (不正) |
| After  | `{ frequency: "weekly", weekdays: [], hour: 9, minute: 0 }` | `""` (正常)         |

## AC 充足確認

| AC番号 | 充足状況                                                      |
| ------ | ------------------------------------------------------------- |
| AC-1   | PASS: `weekdays: []` で `""` が返る                           |
| AC-2   | PASS: 正常ケース（weekdays に値あり）は変わらず正しい式       |
| AC-5   | PASS: JSDoc に `@returns` / `@remarks` でガード処理仕様を記載 |

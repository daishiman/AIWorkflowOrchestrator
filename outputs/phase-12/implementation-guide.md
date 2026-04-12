# 実装ガイド - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## Part 1: 中学生レベルの説明

### たとえ話

カレンダーにない日付は、どれだけ待っても来ません。たとえば「2月31日」は存在しないので、「毎年2月31日に実行してください」と言っても、実行日は永遠に来ません。

### 何が変わったか

`validateCronExpression` に `semantic` という追加スイッチを入れました。

- `semantic` を付けないときは、今まで通り「書き方が正しいか」だけを見ます
- `semantic: true` を付けたときだけ、「その日付が本当に存在するか」まで見ます

### 変更ファイル

| ファイル                                                                | 変更種別 | 変更内容                                                                                                               |
| ----------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | 修正     | `ValidateCronOptions` インターフェース追加、`validateCronExpression` シグネチャ拡張、semantic ロジック追加、JSDoc 更新 |
| `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 修正     | TC-01〜TC-16（semantic validation テスト）追加                                                                         |
| `apps/desktop/package.json`                                             | 修正     | `cron-parser@5.5.0` を `dependencies` に追加                                                                           |

## Part 2: 技術者向けの説明

### API 変更

```typescript
export interface ValidateCronOptions {
  /** true の場合、cron-parser を使用して意味論的バリデーション（next-execution-time 計算）を実行する */
  semantic?: boolean;
}
```

```typescript
/**
 * cron 式を検証する。
 * @param value - 検証する cron 式（5フィールド形式）
 * @param options - オプション（省略時は従来の構文・値域チェックのみ）
 * @param options.semantic - true の場合、next-execution-time 計算による意味論的バリデーションを追加する
 * @returns エラーメッセージ文字列（エラーなしの場合は null）
 */
export function validateCronExpression(
  value: string,
  options?: ValidateCronOptions,
): string | null;
```

### 実装の要点

```typescript
import { CronExpressionParser } from "cron-parser";

if (options?.semantic === true) {
  try {
    const interval = CronExpressionParser.parse(trimmed);
    interval.next();
  } catch {
    return "指定した日付の組み合わせは存在しません（例: 2月31日）";
  }
}
```

- `semantic` は opt-in です。既存呼び出しはそのまま動きます
- `validateSkillWizardScheduleConfig` は変更していません。呼び出し元が必要な場合だけ `semantic` を渡します
- `cron-parser@5.5.0` は day-of-week を使った救済を保証しません。安全側に倒して、到達不能と判断したものはエラーにしています

### 使い方

```typescript
// 従来どおり: 構文・値域チェックのみ
validateCronExpression("0 0 31 2 *"); // null

// 意味論チェックを有効化
validateCronExpression("0 0 31 2 *", { semantic: true });
// → "指定した日付の組み合わせは存在しません（例: 2月31日）"

// 到達可能な式は通す
validateCronExpression("0 0 * * *", { semantic: true }); // null
```

### テスト結果

- 全 42 テスト PASS（TC-01〜TC-16 + SCV-01〜SCV-12 + エッジケース）
- TypeScript 型チェック PASS
- ESLint PASS（0 errors）
- カバレッジ: Line 100% / Branch 86.84%（目標 90%/85% 達成）

## 関連 Issue

[#2074](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2074)

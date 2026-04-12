# 変更ログ - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## 変更ファイル一覧

### apps/desktop/package.json

- `dependencies` に `"cron-parser": "^5.5.0"` を追加

### apps/desktop/src/renderer/utils/scheduleConfigValidator.ts

- `import { CronExpressionParser } from "cron-parser"` を追加
- `ValidateCronOptions` インターフェースを追加・エクスポート
- `validateCronExpression` シグネチャを `(value: string, options?: ValidateCronOptions): string | null` に変更
- JSDoc を更新（`@param options.semantic` の説明追加、「semantic validationは行わない」コメント削除）
- semantic チェックブロック（`if (options?.semantic === true) { ... }` ）を追加

### apps/desktop/src/**tests**/utils/scheduleConfigValidator.edge.test.ts

- タスク ID コメント更新
- TC-01〜TC-08 の describe ブロック追加（semantic validation TDD Red Phase）
- TC-08 期待値を `toBeNull()` → `not.toBeNull()` に更新（cron-parser AND semantics のため）

## cron-parser バージョン情報

- パッケージ名: `cron-parser`
- バージョン: `5.5.0`
- 追加先: `apps/desktop/package.json` の `dependencies`

## テスト結果

```
Tests  34 passed (34)
- scheduleConfigValidator.edge.test.ts: 17 tests passed
- scheduleConfigValidator.test.ts: 17 tests passed
```

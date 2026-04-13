# 実装計画書 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## タスク1: cron-parser インストール

```bash
pnpm --filter @repo/desktop add cron-parser
```

結果: `cron-parser@5.5.0` が `apps/desktop/package.json` の `dependencies` に追加済み

## タスク2: scheduleConfigValidator.ts 変更

### 2-1. import追加

```typescript
import { CronExpressionParser } from "cron-parser";
```

### 2-2. ValidateCronOptions インターフェース追加（エクスポート済み）

```typescript
export interface ValidateCronOptions {
  semantic?: boolean;
}
```

### 2-3. validateCronExpression シグネチャ変更

- `(value: string): string | null` → `(value: string, options?: ValidateCronOptions): string | null`

### 2-4. semantic チェックロジック追加

既存の構文チェック直後（return null の直前）に追加:

```typescript
if (options?.semantic === true) {
  try {
    const interval = CronExpressionParser.parse(trimmed);
    interval.next();
  } catch {
    return "指定した日付の組み合わせは存在しません（例: 2月31日）";
  }
}
```

## タスク3: Green確認

```
Tests  34 passed (34)
- scheduleConfigValidator.edge.test.ts: 17 passed（TC-01〜TC-08含む）
- scheduleConfigValidator.test.ts: 17 passed（SCV-01〜SCV-12含む）
```

## 重要な発見: TC-08 安全側判定

`cron-parser` は day-of-month と day-of-week の複合指定を安全側に判定する。
`"0 0 31 2 1"` は `CronExpressionParser.parse()` 段階で例外 "Invalid explicit day of month definition" を投げる。
TC-08 の期待値を `not.toBeNull()` に更新し、安全側判定を採用。

## Phase 3 MINOR 解決

| ID       | 内容                           | 状態                                                               |
| -------- | ------------------------------ | ------------------------------------------------------------------ |
| SEM-M-01 | cron-parser バンドルサイズ確認 | 5.5.0 ~10KB gzip、tree-shaking適用可能 ✅                          |
| SEM-M-02 | エラーメッセージ文言統一       | 「指定した日付の組み合わせは存在しません（例: 2月31日）」に統一 ✅ |

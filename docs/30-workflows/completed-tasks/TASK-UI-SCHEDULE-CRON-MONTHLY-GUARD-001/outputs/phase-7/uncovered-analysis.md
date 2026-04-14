# 未到達パス分析書 - TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001

## 未到達行

| 行番号 | コード                                     | 分類       |
| ------ | ------------------------------------------ | ---------- |
| 28     | `return "* * * * *";`（every-minute 分岐） | スコープ外 |
| 55     | `return "";`（default 分岐）               | スコープ外 |

## 対応方針

**対応不要** — 以下の理由により、本タスクでのカバレッジ追加は不要と判定する:

1. **Line 28 (every-minute)**: `cronConverter.edge.test.ts` のテスト対象は `monthly` ガード処理。`every-minute` は別タスクのテストに存在する可能性がある
2. **Line 55 (default)**: TypeScript の型チェックにより `frequency` に不正な値は渡せない。`default` は型安全上の保険コード

## monthly 分岐の全パス確認

```typescript
case "monthly": {
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    return "";  // ← TC-11〜TC-13, TC-16, TC-17, TC-19 でカバー ✅
  }
  return `${minute} ${hour} ${dayOfMonth} * *`;  // ← TC-14, TC-15, TC-18 でカバー ✅
}
```

**本タスクのスコープ内は全パスカバー済み** ✅

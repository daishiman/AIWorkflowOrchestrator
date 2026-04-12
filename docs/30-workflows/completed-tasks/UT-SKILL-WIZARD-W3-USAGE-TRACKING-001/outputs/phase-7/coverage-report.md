# Phase 7: カバレッジレポート

# 実行日時: 2026-04-11

## trackEvent.ts カバレッジ (AC-7: 100% 達成)

| Metric     | Value | Threshold |
| ---------- | ----- | --------- |
| Lines      | 100%  | 80%       |
| Functions  | 100%  | 80%       |
| Branches   | 100%  | 60%       |
| Statements | 100%  | 80%       |

## 計測方法

```bash
pnpm exec vitest run --coverage \
  src/renderer/utils/__tests__/trackEvent.test.ts
```

Provider: v8 (vitest-coverage-v8)

## 分岐カバレッジ詳細

`trackEvent.ts` は以下の2分岐を持つ:

1. `NODE_ENV !== "production"` → `console.info` 呼び出し（TC-08, TC-08b, NODE_ENV=development テストでカバー）
2. `NODE_ENV === "production"` → no-op（TC-09, NODE_ENV=production テストでカバー）

全分岐 = 100% 達成

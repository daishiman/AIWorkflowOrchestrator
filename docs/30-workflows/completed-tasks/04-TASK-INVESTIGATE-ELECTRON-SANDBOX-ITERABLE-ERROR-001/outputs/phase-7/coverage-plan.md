# Phase 7 カバレッジ計画

## 計測対象

- `src/renderer/store/slices/authSlice.ts`
- `src/main/ipc/profileHandlers.ts`
- `src/renderer/components/organisms/AccountSection/index.tsx`

## 計測コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  --coverage.enabled true \
  --coverage.provider v8 \
  --coverage.reporter text \
  --coverage.reporter json-summary \
  --coverage.thresholds.lines=0 \
  --coverage.thresholds.functions=0 \
  --coverage.thresholds.branches=0 \
  --coverage.thresholds.statements=0 \
  --coverage.include "src/renderer/store/slices/authSlice.ts" \
  --coverage.include "src/main/ipc/profileHandlers.ts" \
  --coverage.include "src/renderer/components/organisms/AccountSection/index.tsx" \
  src/renderer/store/slices/authSlice.test.ts \
  src/main/ipc/profileHandlers.test.ts \
  src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx
```

## 計測結果

| ファイル                   | Stmts/Lines | Branch | Funcs |
| -------------------------- | ----------- | ------ | ----- |
| `authSlice.ts`             | 81.38       | 84.88  | 86.95 |
| `profileHandlers.ts`       | 32.74       | 63.51  | 33.33 |
| `AccountSection/index.tsx` | 68.59       | 70.00  | 71.42 |

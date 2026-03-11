# Phase 7 coverage 計画

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  --coverage.thresholds.lines=0 \
  --coverage.thresholds.functions=0 \
  --coverage.thresholds.statements=0 \
  --coverage.thresholds.branches=0 \
  --coverage.include='src/renderer/views/HistorySearchView/**' \
  --coverage.include='src/renderer/store/slices/historySearchSlice.ts' \
  --coverage.include='src/main/ipc/historySearchHandlers.ts' \
  --coverage.reporter=json-summary \
  src/renderer/views/HistorySearchView/HistorySearchView.test.tsx \
  src/renderer/views/HistorySearchView/hooks/useTimelineGroups.test.tsx \
  src/renderer/views/HistorySearchView/hooks/useInfiniteScroll.test.tsx \
  src/renderer/store/slices/historySearchSlice.test.ts \
  src/main/ipc/__tests__/historySearchHandlers.test.ts
```

## 方針

- repository 全体の global threshold は本 task と無関係の未計測ファイルで落ちるため、058c 変更面に対象を限定した
- line / statement / function / branch を `coverage-summary.json` で取得し、Phase 7 の根拠へ使う
- 視覚品質だけは coverage では測れないため、Phase 11 の screenshot へ補完を委譲する

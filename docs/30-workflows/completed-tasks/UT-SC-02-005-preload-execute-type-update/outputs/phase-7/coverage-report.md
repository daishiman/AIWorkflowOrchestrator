# Phase 7: カバレッジレポート

## 実行コマンド

```bash
pnpm exec vitest run \
  --coverage \
  --coverage.reporter=json-summary \
  --coverage.reporter=text-summary \
  --coverage.include=src/preload/skill-creator-api.ts \
  --coverage.include=src/renderer/components/skill/SkillLifecyclePanel.tsx \
  src/preload/__tests__/skill-creator-api.test.ts \
  src/preload/__tests__/skill-creator-api.runtime.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
```

## 集計結果

| 指標       | 値               |
| ---------- | ---------------- |
| Statements | 89.56% (833/930) |
| Branches   | 80.88% (165/204) |
| Functions  | 88.88% (32/36)   |
| Lines      | 89.56% (833/930) |

## 対象ファイル別結果

| ファイル                                                | Statements | Branches | Functions | Lines  |
| ------------------------------------------------------- | ---------- | -------- | --------- | ------ |
| `src/preload/skill-creator-api.ts`                      | 91.66%     | 95.00%   | 90.00%    | 91.66% |
| `src/renderer/components/skill/SkillLifecyclePanel.tsx` | 89.29%     | 79.34%   | 87.50%    | 89.29% |

## 判定

- Line / Branch / Function の最低基準をすべて満たした。
- 今回の coverage は変更影響ファイルに限定して計測し、タスク要求範囲の回帰を確認した。

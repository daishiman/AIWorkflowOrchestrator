# Phase 7 カバレッジ結果

## 実行情報

- 実行日: 2026-03-04
- 実行ディレクトリ: `apps/desktop`
- 実行コマンド:

```bash
pnpm vitest run \
  src/renderer/components/organisms/CardGrid/CardGrid.test.tsx \
  src/renderer/components/organisms/MasterDetailLayout/MasterDetailLayout.test.tsx \
  src/renderer/components/organisms/SearchFilterList/SearchFilterList.test.tsx \
  --coverage \
  --coverage.include=src/renderer/components/organisms/CardGrid/index.tsx \
  --coverage.include=src/renderer/components/organisms/MasterDetailLayout/index.tsx \
  --coverage.include=src/renderer/components/organisms/SearchFilterList/index.tsx
```

## 集計結果

| 対象                         | Statements |   Branches |  Functions |      Lines |
| ---------------------------- | ---------: | ---------: | ---------: | ---------: |
| CardGrid/index.tsx           |     89.43% |     76.92% |       100% |     89.43% |
| MasterDetailLayout/index.tsx |     91.56% |     81.81% |        80% |     91.56% |
| SearchFilterList/index.tsx   |     95.74% |     89.65% |       100% |     95.74% |
| **全体**                     | **92.34%** | **82.22%** | **94.73%** | **92.34%** |

## 閾値判定（quality-requirements準拠）

- lines >= 80: PASS
- functions >= 80: PASS
- branches >= 60: PASS
- statements >= 80: PASS

## 判定

- **Phase 7 判定: PASS**

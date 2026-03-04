# Phase 7 カバレッジレポート

- 作成日: 2026-03-04

## 実行1（仕様コマンド）

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/molecules --coverage
```

- 実行結果: テストはPASS（416 tests）
- 失敗要因: グローバル coverage 閾値（80/60）を、モノレポ全体ファイル対象で評価するため閾値未達
- 主要値: lines 2.22%, functions 11.65%, branches 39.23%, statements 2.22%

## 実行2（スコープ限定）

```bash
cd apps/desktop
pnpm vitest run \
  src/renderer/components/molecules/SearchBar/__tests__/SearchBar.test.tsx \
  src/renderer/components/molecules/CodeViewer/__tests__/CodeViewer.test.tsx \
  src/renderer/components/molecules/TabSwitcher/__tests__/TabSwitcher.test.tsx \
  src/renderer/components/molecules/SlideInPanel/__tests__/SlideInPanel.test.tsx \
  src/renderer/components/molecules/ConfirmDialog/__tests__/ConfirmDialog.test.tsx \
  --coverage \
  --coverage.include="src/renderer/components/molecules/{SearchBar,CodeViewer,TabSwitcher,SlideInPanel,ConfirmDialog}/**/*.{ts,tsx}" \
  --coverage.thresholds.lines=0 \
  --coverage.thresholds.functions=0 \
  --coverage.thresholds.branches=0 \
  --coverage.thresholds.statements=0
```

| 指標       |     値 | 基準 |
| ---------- | -----: | ---: |
| Lines      | 94.71% |  80% |
| Branches   | 87.07% |  60% |
| Functions  |   100% |  80% |
| Statements | 94.71% |  80% |

判定: スコープ内は基準達成

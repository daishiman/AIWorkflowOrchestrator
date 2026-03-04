# Phase 7 カバレッジレポート

## 計測コマンド

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/components/molecules/SearchBar/SearchBar.test.tsx \
  src/renderer/components/molecules/CodeViewer/CodeViewer.test.tsx \
  src/renderer/components/molecules/TabSwitcher/TabSwitcher.test.tsx \
  src/renderer/components/molecules/SlideInPanel/SlideInPanel.test.tsx \
  src/renderer/components/molecules/ConfirmDialog/ConfirmDialog.test.tsx \
  src/renderer/components/organisms/CardGrid/CardGrid.test.tsx \
  src/renderer/components/organisms/MasterDetailLayout/MasterDetailLayout.test.tsx \
  src/renderer/components/organisms/SearchFilterList/SearchFilterList.test.tsx \
  --coverage \
  --coverage.include='src/renderer/components/molecules/SearchBar/index.tsx' \
  --coverage.include='src/renderer/components/molecules/CodeViewer/index.tsx' \
  --coverage.include='src/renderer/components/molecules/TabSwitcher/index.tsx' \
  --coverage.include='src/renderer/components/molecules/SlideInPanel/index.tsx' \
  --coverage.include='src/renderer/components/molecules/ConfirmDialog/index.tsx' \
  --coverage.include='src/renderer/components/organisms/CardGrid/index.tsx' \
  --coverage.include='src/renderer/components/organisms/MasterDetailLayout/index.tsx' \
  --coverage.include='src/renderer/components/organisms/SearchFilterList/index.tsx'
```

## 計測結果（対象範囲）

| Metric     |  Value | Threshold | 判定 |
| ---------- | -----: | --------: | ---- |
| lines      | 94.17% |       80% | PASS |
| branches   | 88.67% |       60% | PASS |
| functions  | 80.95% |       80% | PASS |
| statements | 94.17% |       80% | PASS |

## 主要ファイル

- `SearchBar/index.tsx` lines 97.53%
- `CodeViewer/index.tsx` lines 97.26%
- `TabSwitcher/index.tsx` lines 100%
- `SlideInPanel/index.tsx` lines 100%
- `ConfirmDialog/index.tsx` lines 81.25%
- `CardGrid/index.tsx` lines 100%
- `MasterDetailLayout/index.tsx` lines 92.30%
- `SearchFilterList/index.tsx` lines 97.46%

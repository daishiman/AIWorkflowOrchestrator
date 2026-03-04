# Phase 4 テスト実行手順

- 作成日: 2026-03-04

## 前提

- 作業ディレクトリ: `apps/desktop`
- テスト環境: happy-dom

## 実行コマンド

```bash
cd apps/desktop
pnpm vitest run \
  src/renderer/components/molecules/SearchBar/__tests__/SearchBar.test.tsx \
  src/renderer/components/molecules/CodeViewer/__tests__/CodeViewer.test.tsx \
  src/renderer/components/molecules/TabSwitcher/__tests__/TabSwitcher.test.tsx \
  src/renderer/components/molecules/SlideInPanel/__tests__/SlideInPanel.test.tsx \
  src/renderer/components/molecules/ConfirmDialog/__tests__/ConfirmDialog.test.tsx
```

## 期待結果

- Test Files: 5 passed
- Tests: 69 passed

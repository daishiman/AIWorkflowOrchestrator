# Phase 2 コンポーネント設計

- 作成日: 2026-03-04

## ディレクトリ設計

- `apps/desktop/src/renderer/components/molecules/SearchBar/index.tsx`
- `apps/desktop/src/renderer/components/molecules/CodeViewer/index.tsx`
- `apps/desktop/src/renderer/components/molecules/TabSwitcher/index.tsx`
- `apps/desktop/src/renderer/components/molecules/SlideInPanel/index.tsx`
- `apps/desktop/src/renderer/components/molecules/ConfirmDialog/index.tsx`

## 設計方針

1. Props駆動で責務を閉じる（Store非依存）
2. a11yをコンポーネント内部に同梱（role/aria/focus trap）
3. テーマ依存は CSS 変数で吸収
4. テストしやすい純粋イベント設計（`onChange`, `onClose`, `onConfirm`）

## キーボード/フォーカス設計

- SearchBar: Escapeで値クリア
- TabSwitcher: Arrow / Home / End / Enter / Space
- SlideInPanel: Escape close + Tab循環 + close時フォーカス復元
- ConfirmDialog: Escape/Enter + Tab循環 + 初期フォーカスをキャンセル

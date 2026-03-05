# Phase 5 ナビ/ショートカット契約（SubAgent-B）

## 契約ファイル

- `apps/desktop/src/renderer/navigation/navContract.ts`

## ガード条件

- `metaKey || ctrlKey` が false の場合は無効
- `altKey || shiftKey` が true の場合は無効
- 編集可能要素（input/textarea/select/contenteditable）上では無効

## 副作用

- 解決成功時のみ `event.preventDefault()` を実行
- `setCurrentView(resolvedView)` を発火

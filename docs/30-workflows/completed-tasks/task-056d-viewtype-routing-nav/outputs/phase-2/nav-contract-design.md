# Phase 2 ナビ契約設計（SubAgent-A）

## 契約正本

- `apps/desktop/src/renderer/navigation/navContract.ts`

## セクション設計

| section | items                                                         |
| ------- | ------------------------------------------------------------- |
| main    | dashboard, workspace, chat, agent, skillCenter, historySearch |
| sub     | graph, editor                                                 |
| footer  | settings                                                      |

## ショートカット設計

- `1..8` -> `dashboard..editor`
- `,` -> `settings`
- 修飾キー条件: `metaKey || ctrlKey` 必須、`altKey` と `shiftKey` は不可
- 編集可能要素ではショートカット無効

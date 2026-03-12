# Phase 8 リファクタ記録

| 変更                                                       | 理由                           | 効果                                |
| ---------------------------------------------------------- | ------------------------------ | ----------------------------------- |
| `createSelectedFile` を `workspaceFileSelection.ts` へ分離 | 重複除去                       | `index.tsx` / controller で共通利用 |
| stream ref 同期 (`streamContentRef`, `isStreamingRef`)     | race対策                       | chunk/end 同期時の欠落防止          |
| `openPreviewForFile()` 共通化                              | mention/context menuの重複削減 | preview open の一貫性向上           |
| attach エラーハンドリング統一                              | UI surfacing一元化             | failure時の原因追跡改善             |

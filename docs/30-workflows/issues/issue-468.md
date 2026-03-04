# [#468] [UT-WCE-001] Workspace Chat Edit UI Components

## タスク概要

ワークスペースチャット編集機能のUIコンポーネント実装

## メタ情報

- **タスクID**: UT-WCE-001
- **優先度**: 高
- **見積もり規模**: 中〜大規模
- **発見元**: Phase 11（ISSUE-001）

## 成果物

- DiffPreview.tsx - 差分プレビューパネル（Monaco Diff Editor統合）
- DiffEditor.tsx - Monaco Diff Editor統合コンポーネント
- ApplyControls.tsx - 適用/却下ボタン
- FileContextBadge.tsx - 添付ファイルバッジ
- FileContextDropZone.tsx - D&Dドロップゾーン
- EditCommandInput.tsx - 編集コマンド入力UI

## 仕様書

docs/30-workflows/unassigned-task/task-workspace-chat-edit-ui-components.md

## 依存関係

- workspace-chat-edit コアロジック実装済み
- chatEditSlice、useFileContext、useDiffApply利用可能

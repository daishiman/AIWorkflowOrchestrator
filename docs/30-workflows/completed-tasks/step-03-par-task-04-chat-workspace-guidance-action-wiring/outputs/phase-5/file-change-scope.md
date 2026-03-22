# Phase 5: 変更スコープ - File Change Scope

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 5                                                  |
| 作成日   | 2026-03-22                                         |

## 1. 対象ファイル

| ファイル                                                                   | 変更種別 | ownership | 変更概要                       |
| -------------------------------------------------------------------------- | -------- | --------- | ------------------------------ |
| apps/desktop/src/renderer/guidance/blockedGuidanceConfig.ts                | 新規     | Concern-1 | reason-action mapping 定数     |
| apps/desktop/src/renderer/guidance/useBlockedGuidance.ts                   | 新規     | Concern-2 | 共有 Hook                      |
| apps/desktop/src/renderer/guidance/guidanceActionDispatcher.ts             | 新規     | Concern-2 | action dispatch                |
| apps/desktop/src/renderer/guidance/index.ts                                | 新規     | Concern-1 | barrel export                  |
| apps/desktop/src/renderer/views/WorkspaceView/components/GuidanceBlock.tsx | 修正     | Concern-3 | secondary CTA props 追加       |
| apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx       | 修正     | Concern-2 | local 判定除去、Hook 消費      |
| apps/desktop/src/renderer/views/ChatView/index.tsx                         | 修正     | Concern-2 | GuidanceBanner → GuidanceBlock |

## 2. 除外ファイル

| ファイル                                                                          | 除外理由                          |
| --------------------------------------------------------------------------------- | --------------------------------- |
| apps/desktop/src/renderer/store/slices/chatSlice.ts                               | chatSlice 変更は後続タスク        |
| apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts | controller 変更は最小限に留める   |
| apps/desktop/src/main/\*\*                                                        | Main Process は本タスクスコープ外 |
| apps/desktop/src/preload/\*\*                                                     | Preload は本タスクスコープ外      |

## 3. テストファイル（新規）

| テストファイル                                                                | テストタイプ |
| ----------------------------------------------------------------------------- | ------------ |
| apps/desktop/src/renderer/guidance/**tests**/blockedGuidanceConfig.test.ts    | unit         |
| apps/desktop/src/renderer/guidance/**tests**/useBlockedGuidance.test.ts       | unit         |
| apps/desktop/src/renderer/guidance/**tests**/guidanceActionDispatcher.test.ts | unit         |

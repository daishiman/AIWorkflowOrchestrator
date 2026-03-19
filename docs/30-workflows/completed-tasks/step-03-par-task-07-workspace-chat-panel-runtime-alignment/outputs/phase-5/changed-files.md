# Phase 5: 変更ファイル一覧

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| Phase      | 5                                            |
| ステータス | completed                                    |
| 作成日     | 2026-03-18                                   |

## 変更ファイル

### Phase A: Main Process（T5-1）

| ファイル                                | 変更種別 | 変更内容                                                      |
| --------------------------------------- | -------- | ------------------------------------------------------------- |
| `apps/desktop/src/main/handlers/llm.ts` | 修正     | A-1: handleStreamChat に modelId 必須検証追加（P62/P42 準拠） |
| (同上)                                  | 修正     | A-3: API_KEY_MISSING エラーの guidance メッセージ整形         |

### Phase B: Renderer Controller（T5-2）

| ファイル                                                                            | 変更種別 | 変更内容                                                      |
| ----------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | 修正     | B-1: sendMessage に `!selectedModelId` ガード追加             |
| (同上)                                                                              | 修正     | B-2: `buildChatRequest` の `?? "gpt-4o"` fallback 削除（P62） |
| (同上)                                                                              | 修正     | B-3: onStreamError の error.code 別 guidance メッセージ分岐   |
| (同上)                                                                              | 修正     | B-5: `selectedModelId` を interface に追加・return に追加     |
| (同上)                                                                              | 修正     | B-6: persistAssistantMessage に llmProvider/llmModel 追加     |

### Phase C: Renderer UI（T5-3, T5-5, T5-6）

| ファイル                                                                                | 変更種別 | 変更内容                                             |
| --------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                  | 修正     | GuidanceBlock 統合、model blocked 表示               |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatInput.tsx`                  | 修正     | C-3: canSend に `selectedModelId !== null` 条件追加  |
| (同上)                                                                                  | 修正     | C-7: selectedModelId=null 時のマイクロコピー追加     |
| `apps/desktop/src/renderer/views/WorkspaceView/components/GuidanceBlock.tsx`            | 新規     | error/handoff/blocked の3 variant ガイダンスブロック |
| `apps/desktop/src/renderer/views/WorkspaceView/components/TranscriptProvenanceChip.tsx` | 新規     | transcript 出典チップ（selection/recent/session）    |
| `apps/desktop/src/renderer/views/WorkspaceView/components/CompactLayout.tsx`            | 新規     | ResizeObserver ベースの compact レイアウトラッパー   |

### テストファイル修正

| ファイル                                                                                      | 変更種別 | 変更内容                                                |
| --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| `apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.runtime.test.tsx` | 修正     | mockController に selectedModelId 追加、U-06 テスト修正 |

## 変更の依存関係

```
Phase A (Main Process: llm.ts)
  ↓
Phase B (Controller: useWorkspaceChatController.ts)
  ↓
Phase C (UI: WorkspaceChatPanel.tsx, WorkspaceChatInput.tsx, 新規3コンポーネント)
```

## P62 対策の実装箇所

| 層           | 実装箇所                  | 防御内容                                            |
| ------------ | ------------------------- | --------------------------------------------------- |
| Main Process | handleStreamChat L313-323 | modelId の P42 3段バリデーション + VALIDATION_ERROR |
| Controller   | sendMessage L344          | `!selectedModelId` ガードで early return            |
| Controller   | buildChatRequest L127     | `selectedModelId: string` 型で null 不許可          |
| UI (Input)   | WorkspaceChatInput L27-31 | canSend に `selectedModelId !== null` 追加          |
| UI (Panel)   | WorkspaceChatPanel        | isModelBlocked 時に GuidanceBlock("blocked") 表示   |

## GAP 対応状況

| GAP    | 対応状況 | 実装内容                                                                  |
| ------ | -------- | ------------------------------------------------------------------------- |
| GAP-01 | 完了     | P62 fallback 削除、selectedModelId=null 時の GuidanceBlock 表示           |
| GAP-02 | 完了     | onStreamError で error.code 別 guidance メッセージ表示                    |
| GAP-03 | 既実装   | cancel ボタンは Task059a で実装済み                                       |
| GAP-04 | 部分     | GuidanceBlock の handoff variant は実装済み、RuntimeResolver 連携は未統合 |
| GAP-05 | 完了     | persistAssistantMessage に llmProvider/llmModel 追加                      |
| GAP-06 | 完了     | GuidanceBlock, TranscriptProvenanceChip, CompactLayout 新規作成           |

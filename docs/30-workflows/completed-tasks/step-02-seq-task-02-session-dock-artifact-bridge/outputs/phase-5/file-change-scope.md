# File Change Scope - Session Dock Artifact Bridge

## 変更ファイル一覧

### packages/shared/

| ファイル                                  | 変更種別 | Ownership | 変更内容                                                                                             |
| ----------------------------------------- | -------- | --------- | ---------------------------------------------------------------------------------------------------- |
| `packages/shared/src/types/dock-state.ts` | 新規     | Task02    | DockState / DockEvent / TranscriptEntry / ArtifactSummaryData / SharePayload / ProvenanceData 型定義 |

### apps/desktop/src/renderer/store/

| ファイル                                               | 変更種別 | Ownership                 | 変更内容                                   |
| ------------------------------------------------------ | -------- | ------------------------- | ------------------------------------------ |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 修正     | Task02 (SessionDock 部分) | SessionDockState 追加、dock アクション追加 |

### apps/desktop/src/renderer/components/execution/

| ファイル                                                                 | 変更種別 | Ownership | 変更内容                              |
| ------------------------------------------------------------------------ | -------- | --------- | ------------------------------------- |
| `apps/desktop/src/renderer/components/execution/ArtifactSummary.tsx`     | 新規     | Task02    | artifact-first 結果表示コンポーネント |
| `apps/desktop/src/renderer/components/execution/TranscriptShareRail.tsx` | 新規     | Task02    | 手動 3 操作 rail コンポーネント       |
| `apps/desktop/src/renderer/components/execution/ProvenanceChip.tsx`      | 新規     | Task02    | provenance 表示コンポーネント         |

### apps/desktop/src/renderer/views/

| ファイル                                                         | 変更種別 | Ownership                    | 変更内容                                      |
| ---------------------------------------------------------------- | -------- | ---------------------------- | --------------------------------------------- |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx` | 修正     | Task02 (dock state 接続部分) | dock state machine 接続、state ベース表示切替 |

### apps/desktop/src/renderer/components/chat/

| ファイル                                                                   | 変更種別 | Ownership              | 変更内容                      |
| -------------------------------------------------------------------------- | -------- | ---------------------- | ----------------------------- |
| `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`               | 修正     | Task02 (dock 接続部分) | dock ready → handoff 遷移接続 |
| `apps/desktop/src/renderer/components/chat/PersistentTerminalLauncher.tsx` | 修正     | Task02 (dock 接続部分) | collapsed → ready 遷移接続    |

### apps/desktop/src/preload/

| ファイル                            | 変更種別 | Ownership | 変更内容                                                            |
| ----------------------------------- | -------- | --------- | ------------------------------------------------------------------- |
| `apps/desktop/src/preload/index.ts` | 確認のみ | 既存      | claudeCliAPI event と dock state の接続確認（変更なしの可能性あり） |

### テストファイル

| ファイル                                                                                | 変更種別 | Ownership | 変更内容                         |
| --------------------------------------------------------------------------------------- | -------- | --------- | -------------------------------- |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.sessionDock.test.ts`       | 新規     | Task02    | SessionDock state machine テスト |
| `apps/desktop/src/renderer/components/execution/__tests__/ArtifactSummary.test.tsx`     | 新規     | Task02    | Artifact Summary テスト          |
| `apps/desktop/src/renderer/components/execution/__tests__/TranscriptShareRail.test.tsx` | 新規     | Task02    | Manual Share テスト              |
| `apps/desktop/src/renderer/components/execution/__tests__/ProvenanceChip.test.tsx`      | 新規     | Task02    | Provenance Chip テスト           |

## 影響分析

### 変更による影響範囲

| 影響先                     | 影響内容                          | リスク                              |
| -------------------------- | --------------------------------- | ----------------------------------- |
| agentSlice                 | SessionDockState 追加による型拡張 | P35: 既存テストへの mock 追加が必要 |
| ExecutionConsoleView       | dock state による表示分岐追加     | 既存ビューの振る舞い変更            |
| HandoffBlock               | dock 接続の追加                   | 既存 prop への追加                  |
| PersistentTerminalLauncher | dock 接続の追加                   | 既存 prop への追加                  |

### リスク軽減策

| リスク                      | 対策                                                                |
| --------------------------- | ------------------------------------------------------------------- |
| P35 (DI 追加時のテスト修正) | SessionDockState のデフォルト値を定義し、既存テストへの影響を最小化 |
| P31 (無限ループ)            | 個別セレクタパターンで実装                                          |
| P48 (useShallow 未適用)     | 配列を返すセレクタには useShallow を適用                            |
| P5 (リスナー二重登録)       | claudeCliAPI event リスナーは一度だけ登録するガードを追加           |

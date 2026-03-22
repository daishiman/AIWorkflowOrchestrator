# Phase 5: 変更スコープ

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. 新規作成ファイル

| ファイル                                                                   | Concern | 責務                 |
| -------------------------------------------------------------------------- | ------- | -------------------- |
| apps/desktop/src/renderer/components/settings/CapabilityCard.tsx           | C-1     | capability 4状態表示 |
| apps/desktop/src/renderer/components/settings/CapabilityCard.test.tsx      | C-1     | TC-C01〜C06          |
| apps/desktop/src/renderer/components/settings/HealthStatusRow.tsx          | C-1     | health 状態表示      |
| apps/desktop/src/renderer/components/settings/HealthStatusRow.test.tsx     | C-1     | TC-H01〜H04          |
| apps/desktop/src/renderer/components/settings/ProviderSummaryCard.tsx      | C-1     | provider/model 表示  |
| apps/desktop/src/renderer/components/settings/ProviderSummaryCard.test.tsx | C-1     | TC-P01〜P03          |
| apps/desktop/src/renderer/components/settings/AccessMatrixSection.tsx      | C-1     | 3コンポーネント合成  |
| apps/desktop/src/renderer/components/settings/AccessMatrixSection.test.tsx | C-1     | 統合テスト           |
| apps/desktop/src/renderer/components/layout/TerminalLauncher.tsx           | C-2     | terminal 起動ボタン  |
| apps/desktop/src/renderer/components/layout/TerminalLauncher.test.tsx      | C-2     | TC-L01〜L03          |

## 2. 変更ファイル

| ファイル                                                           | Concern  | 変更内容                            |
| ------------------------------------------------------------------ | -------- | ----------------------------------- |
| apps/desktop/src/renderer/views/SettingsView/index.tsx             | C-1, C-3 | AccessMatrixSection の追加配置      |
| apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx | C-2      | TerminalLauncher の persistent 配置 |

## 3. 除外ファイル（変更しない）

| ファイル                                                          | 理由                              |
| ----------------------------------------------------------------- | --------------------------------- |
| apps/desktop/src/renderer/utils/shouldResetUnauthenticatedView.ts | PUBLIC_UNAUTHENTICATED_VIEWS 不変 |
| apps/desktop/src/renderer/store/slices/uiSlice.ts                 | 設計タスクではstore変更なし       |
| packages/shared/src/types/execution-capability.ts                 | Task01 で確定済み                 |

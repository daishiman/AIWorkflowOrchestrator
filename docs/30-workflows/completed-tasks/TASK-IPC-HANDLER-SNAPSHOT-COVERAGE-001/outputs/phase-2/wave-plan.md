# wave-plan.md

## Phase 2 成果物 - Wave 1〜3 計画

- 作成/更新日: 2026-04-20
- 正本: 本ファイルが wave 割当の唯一の参照元
- 分母: direct registration unit **48件**
- 別枠: auxiliary snapshot **1件**（`registerRuntimeSkillCreatorHandlers`）

## Wave 1（direct 7件）

- `registerSkillHandlers`
- `registerLLMHandlers`
- `registerSkillCreatorHandlers`
- `registerSkillFileHandlers`
- `registerSafetyGateHandlers`
- `registerApprovalHandlers`
- `registerAgentExecutionHandlers`

補助証跡:

- `registerRuntimeSkillCreatorHandlers` → `creatorHandlers.registrationSnapshot.test.ts`

## Wave 2（direct 16件）

- `registerFileHandlers`
- `registerFsHandlers`
- `registerStoreHandlers`
- `registerUserSettingsHandlers`
- `registerAIHandlers`
- `registerDashboardHandlers`
- `registerGraphHandlers`
- `registerAuthHandlers`
- `registerApiKeyHandlers`
- `registerHistoryHandlers`
- `registerHistorySearchHandlers`
- `registerNotificationHandlers`
- `registerAgentSkillHandlers`
- `registerCommunityHandlers`
- `registerSkillScheduleHandlers`
- `registerSkillAnalyticsHandlers`

## Wave 3（direct 25件）

- `registerWindowHandlers`
- `registerThemeHandlers`
- `registerProfileHandlers`
- `registerAvatarHandlers`
- `registerDialogHandlers`
- `registerTerminalHandlers`
- `registerWorkspaceHandlers`
- `registerSearchHandlers`
- `registerFileSelectionHandlers`
- `registerSkillDocsHandlers`
- `registerSkillChainHandlers`
- `registerSkillShareHandlers`
- `registerSkillDebugHandlers`
- `registerClaudeCliHandlers`
- `registerDisclosureHandlers`
- `registerAdvancedConsoleHandlers`
- `registerAnalyticsHandlers`
- `registerPermissionStoreHandlers`
- `registerAuthKeyHandlers`
- `registerAuthModeHandlers`
- `registerChatEditHandlers`
- `registerConversationHandlers`
- `registerChatExportHandlers`
- `registerSlideIpcHandlers`
- `registerSkillCreatorOpenSkillHandler`

## 特殊ケース

- `setupThemeWatcher` は watcher のため対象外
- auth/profile/avatar/conversation の fallback handler は対象外

## 2026-04-20 時点の進捗

| wave   | direct件数 | 実装状況                     |
| ------ | ---------: | ---------------------------- |
| Wave 1 |          7 | 完了                         |
| Wave 2 |         16 | 完了                         |
| Wave 3 |         25 | 未着手、Phase 6 で後続計画化 |

## 実測メモ

- Wave 1: 8 files / 41 tests PASS
- Wave 2: 16 files / 80 tests PASS
- 24 files の一括実行はこの環境で SIGKILL したため、Phase 11 は wave 分割・単一 fork 実行を正本とする

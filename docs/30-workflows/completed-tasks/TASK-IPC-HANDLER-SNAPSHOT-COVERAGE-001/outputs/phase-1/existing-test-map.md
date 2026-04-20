# existing-test-map.md

## 2026-04-20 時点の registration snapshot test 対応表

### direct unit 対応済み（23件）

| registration unit                | テストファイル                                        |
| -------------------------------- | ----------------------------------------------------- |
| `registerSkillHandlers`          | `skillHandlers.registrationSnapshot.test.ts`          |
| `registerLLMHandlers`            | `llmHandlers.registrationSnapshot.test.ts`            |
| `registerSkillCreatorHandlers`   | `skillCreatorHandlers.registrationSnapshot.test.ts`   |
| `registerSkillFileHandlers`      | `skillFileHandlers.registrationSnapshot.test.ts`      |
| `registerSafetyGateHandlers`     | `safetyGateHandlers.registrationSnapshot.test.ts`     |
| `registerApprovalHandlers`       | `approvalHandlers.registrationSnapshot.test.ts`       |
| `registerAgentExecutionHandlers` | `agentExecutionHandlers.registrationSnapshot.test.ts` |
| `registerFileHandlers`           | `fileHandlers.registrationSnapshot.test.ts`           |
| `registerFsHandlers`             | `fsHandlers.registrationSnapshot.test.ts`             |
| `registerStoreHandlers`          | `storeHandlers.registrationSnapshot.test.ts`          |
| `registerUserSettingsHandlers`   | `userSettingsHandlers.registrationSnapshot.test.ts`   |
| `registerAIHandlers`             | `aiHandlers.registrationSnapshot.test.ts`             |
| `registerDashboardHandlers`      | `dashboardHandlers.registrationSnapshot.test.ts`      |
| `registerGraphHandlers`          | `graphHandlers.registrationSnapshot.test.ts`          |
| `registerAuthHandlers`           | `authHandlers.registrationSnapshot.test.ts`           |
| `registerApiKeyHandlers`         | `apiKeyHandlers.registrationSnapshot.test.ts`         |
| `registerHistoryHandlers`        | `historyHandlers.registrationSnapshot.test.ts`        |
| `registerHistorySearchHandlers`  | `historySearchHandlers.registrationSnapshot.test.ts`  |
| `registerNotificationHandlers`   | `notificationHandlers.registrationSnapshot.test.ts`   |
| `registerAgentSkillHandlers`     | `agentSkillHandlers.registrationSnapshot.test.ts`     |
| `registerCommunityHandlers`      | `communityHandlers.registrationSnapshot.test.ts`      |
| `registerSkillScheduleHandlers`  | `skillScheduleHandlers.registrationSnapshot.test.ts`  |
| `registerSkillAnalyticsHandlers` | `skillAnalyticsHandlers.registrationSnapshot.test.ts` |

### auxiliary 対応済み（1件）

| registration unit                     | テストファイル                                 | 備考                                   |
| ------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| `registerRuntimeSkillCreatorHandlers` | `creatorHandlers.registrationSnapshot.test.ts` | nested runtime registration の補助証跡 |

### 未対応（Wave 3 direct 25件）

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

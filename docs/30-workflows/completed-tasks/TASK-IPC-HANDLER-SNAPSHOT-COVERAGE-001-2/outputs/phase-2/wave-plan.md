# wave-plan.md

## Phase 2 成果物 - Wave 1〜3 計画

**正本**: 本ファイルが全 wave 割当の唯一の参照元
**作成日**: 2026-04-19

---

## Wave 1（7件）

| 関数名                         | テストファイルパス                                                                        | プレフィックス | 想定チャンネル数 |
| ------------------------------ | ----------------------------------------------------------------------------------------- | -------------- | ---------------- |
| registerSkillHandlers          | `apps/desktop/src/main/ipc/__tests__/skillHandlers.registrationSnapshot.test.ts`          | SKILL          | 17               |
| registerLLMHandlers            | `apps/desktop/src/main/ipc/__tests__/llmHandlers.registrationSnapshot.test.ts`            | LLM            | 6                |
| registerSkillCreatorHandlers   | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.registrationSnapshot.test.ts`   | SCREATOR       | 13               |
| registerSkillFileHandlers      | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.registrationSnapshot.test.ts`      | SFILE          | 7                |
| registerSafetyGateHandlers     | `apps/desktop/src/main/ipc/__tests__/safetyGateHandlers.registrationSnapshot.test.ts`     | SAFETY         | 1                |
| registerApprovalHandlers       | `apps/desktop/src/main/ipc/__tests__/approvalHandlers.registrationSnapshot.test.ts`       | APPROVAL       | 1                |
| registerAgentExecutionHandlers | `apps/desktop/src/main/ipc/__tests__/agentExecutionHandlers.registrationSnapshot.test.ts` | AGENTEXEC      | 5                |

Wave 1 合計: 50チャンネル

## Wave 2（16件）

| 関数名                         | テストファイルパス                                                                        | プレフィックス | 想定チャンネル数 |
| ------------------------------ | ----------------------------------------------------------------------------------------- | -------------- | ---------------- |
| registerFileHandlers           | `apps/desktop/src/main/ipc/__tests__/fileHandlers.registrationSnapshot.test.ts`           | FILE           | 8                |
| registerFsHandlers             | `apps/desktop/src/main/ipc/__tests__/fsHandlers.registrationSnapshot.test.ts`             | FS             | 2                |
| registerStoreHandlers          | `apps/desktop/src/main/ipc/__tests__/storeHandlers.registrationSnapshot.test.ts`          | STORE          | 4                |
| registerUserSettingsHandlers   | `apps/desktop/src/main/ipc/__tests__/userSettingsHandlers.registrationSnapshot.test.ts`   | USERSETTINGS   | 2                |
| registerAIHandlers             | `apps/desktop/src/main/ipc/__tests__/aiHandlers.registrationSnapshot.test.ts`             | AI             | 3                |
| registerDashboardHandlers      | `apps/desktop/src/main/ipc/__tests__/dashboardHandlers.registrationSnapshot.test.ts`      | DASHBOARD      | 2                |
| registerGraphHandlers          | `apps/desktop/src/main/ipc/__tests__/graphHandlers.registrationSnapshot.test.ts`          | GRAPH          | 2                |
| registerAuthHandlers           | `apps/desktop/src/main/ipc/__tests__/authHandlers.registrationSnapshot.test.ts`           | AUTH           | 1                |
| registerApiKeyHandlers         | `apps/desktop/src/main/ipc/__tests__/apiKeyHandlers.registrationSnapshot.test.ts`         | APIKEY         | 4                |
| registerHistoryHandlers        | `apps/desktop/src/main/ipc/__tests__/historyHandlers.registrationSnapshot.test.ts`        | HISTORY        | 4                |
| registerHistorySearchHandlers  | `apps/desktop/src/main/ipc/__tests__/historySearchHandlers.registrationSnapshot.test.ts`  | HISTORYSEARCH  | 2                |
| registerNotificationHandlers   | `apps/desktop/src/main/ipc/__tests__/notificationHandlers.registrationSnapshot.test.ts`   | NOTIFICATION   | 5                |
| registerAgentSkillHandlers     | `apps/desktop/src/main/ipc/__tests__/agentSkillHandlers.registrationSnapshot.test.ts`     | AGENTSKILL     | 4                |
| registerCommunityHandlers      | `apps/desktop/src/main/ipc/__tests__/communityHandlers.registrationSnapshot.test.ts`      | COMMUNITY      | 6                |
| registerSkillScheduleHandlers  | `apps/desktop/src/main/ipc/__tests__/skillScheduleHandlers.registrationSnapshot.test.ts`  | SSCHEDULE      | 5                |
| registerSkillAnalyticsHandlers | `apps/desktop/src/main/ipc/__tests__/skillAnalyticsHandlers.registrationSnapshot.test.ts` | SANALYTICS     | 5                |

Wave 2 合計: 59チャンネル

## Wave 3（25件）

| 関数名                               | テストファイルパス                                                                               | プレフィックス | 想定チャンネル数 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------ | -------------- | ---------------- |
| registerWindowHandlers               | `apps/desktop/src/main/ipc/__tests__/windowHandlers.registrationSnapshot.test.ts`                | WINDOW         | 2                |
| registerThemeHandlers                | `apps/desktop/src/main/ipc/__tests__/themeHandlers.registrationSnapshot.test.ts`                 | THEME          | 3                |
| registerProfileHandlers              | `apps/desktop/src/main/ipc/__tests__/profileHandlers.registrationSnapshot.test.ts`               | PROFILE        | 11               |
| registerAvatarHandlers               | `apps/desktop/src/main/ipc/__tests__/avatarHandlers.registrationSnapshot.test.ts`                | AVATAR         | 3                |
| registerDialogHandlers               | `apps/desktop/src/main/ipc/__tests__/dialogHandlers.registrationSnapshot.test.ts`                | DIALOG         | 2                |
| registerTerminalHandlers             | `apps/desktop/src/main/ipc/__tests__/terminalHandlers.registrationSnapshot.test.ts`              | TERMINAL       | 1                |
| registerWorkspaceHandlers            | `apps/desktop/src/main/ipc/__tests__/workspaceHandlers.registrationSnapshot.test.ts`             | WORKSPACE      | 5                |
| registerSearchHandlers               | `apps/desktop/src/main/ipc/__tests__/searchHandlers.registrationSnapshot.test.ts`                | SEARCH         | 7                |
| registerFileSelectionHandlers        | `apps/desktop/src/main/ipc/__tests__/fileSelectionHandlers.registrationSnapshot.test.ts`         | FILESEL        | 4                |
| registerSkillDocsHandlers            | `apps/desktop/src/main/ipc/__tests__/skillDocsHandlers.registrationSnapshot.test.ts`             | SDOCS          | 4                |
| registerSkillChainHandlers           | `apps/desktop/src/main/ipc/__tests__/skillChainHandlers.registrationSnapshot.test.ts`            | SCHAIN         | 5                |
| registerSkillShareHandlers           | `apps/desktop/src/main/ipc/__tests__/skillShareHandlers.registrationSnapshot.test.ts`            | SSHARE         | 3                |
| registerSkillDebugHandlers           | `apps/desktop/src/main/ipc/__tests__/skillDebugHandlers.registrationSnapshot.test.ts`            | SDEBUG         | 6                |
| registerClaudeCliHandlers            | `apps/desktop/src/main/ipc/__tests__/claudeCliHandlers.registrationSnapshot.test.ts`             | CLAUDECLI      | 8                |
| registerDisclosureHandlers           | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.registrationSnapshot.test.ts`            | DISCLOSURE     | 1                |
| registerAdvancedConsoleHandlers      | `apps/desktop/src/main/ipc/__tests__/advancedConsoleHandlers.registrationSnapshot.test.ts`       | ADVCON         | 2                |
| registerAnalyticsHandlers            | `apps/desktop/src/main/ipc/__tests__/analyticsHandlers.registrationSnapshot.test.ts`             | ANALYTICS      | 2                |
| registerPermissionStoreHandlers      | `apps/desktop/src/main/ipc/__tests__/permissionStoreHandlers.registrationSnapshot.test.ts`       | PERMSTORE      | 4                |
| registerAuthKeyHandlers              | `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.registrationSnapshot.test.ts`               | AUTHKEY        | 4                |
| registerAuthModeHandlers             | `apps/desktop/src/main/ipc/__tests__/authModeHandlers.registrationSnapshot.test.ts`              | AUTHMODE       | 4                |
| registerChatEditHandlers             | `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.registrationSnapshot.test.ts`              | CHATEDIT       | 4                |
| registerConversationHandlers         | `apps/desktop/src/main/ipc/__tests__/conversationHandlers.registrationSnapshot.test.ts`          | CONV           | 9                |
| registerChatExportHandlers           | `apps/desktop/src/main/ipc/__tests__/chatExportHandlers.registrationSnapshot.test.ts`            | CHATEXPORT     | 2                |
| registerSlideIpcHandlers             | `apps/desktop/src/main/ipc/__tests__/slideHandlers.registrationSnapshot.test.ts`                 | SLIDE          | 6                |
| registerSkillCreatorOpenSkillHandler | `apps/desktop/src/main/ipc/__tests__/skillCreatorOpenSkillHandlers.registrationSnapshot.test.ts` | SCOPEN         | 1                |

Wave 3 合計: 92チャンネル

## 例外ルール

| 関数名                               | 例外理由                       | 代替                                                |
| ------------------------------------ | ------------------------------ | --------------------------------------------------- |
| setupThemeWatcher                    | ipcMain登録なし                | 対象外                                              |
| registerAuthFallbackHandlers         | Supabase未設定時の条件付き登録 | ipcHandlerRegistrationSnapshot.test.ts でカバー済み |
| registerProfileFallbackHandlers      | 同上                           | 同上                                                |
| registerAvatarFallbackHandlers       | 同上                           | 同上                                                |
| registerConversationFallbackHandlers | DB初期化失敗時の条件付き登録   | 同上                                                |

## CI コスト見積もり

| Wave   | 対象件数 | 必須テスト数 | 推定追加時間 |
| ------ | -------- | ------------ | ------------ |
| Wave 1 | 7件      | 7×3=21       | ~15秒        |
| Wave 2 | 16件     | 16×3=48      | ~25秒        |
| Wave 3 | 24件     | 24×3=72      | ~35秒        |
| 合計   | 48件     | 144          | ~78秒        |

採用値: 中央値。Wave 1完了時点（Phase 5）で初回実測する。
許容基準: Wave当たり30秒以内、全体90秒以内。

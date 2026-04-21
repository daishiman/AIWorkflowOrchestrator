# priority-matrix.md

## Phase 2 成果物 - 優先度スコアリング表

**入力**: outputs/phase-1/handler-inventory.md
**作成日**: 2026-04-19

スコアリング軸（各1〜3点）:

- **変更頻度**: 高=3, 中=2, 低=1
- **セキュリティ重要度**: 高=3, 中=2, 低=1
- **チャンネル数**: 10以上=3, 5〜9=2, 1〜4=1

---

## Wave 1 対象（合計スコア 7点以上）

| 関数名                         | 変更頻度 | セキュリティ | チャンネル数 | 合計  | Wave     |
| ------------------------------ | -------- | ------------ | ------------ | ----- | -------- |
| registerSkillHandlers          | 3        | 2            | 3(17ch)      | **8** | Wave 1   |
| registerLLMHandlers            | 3        | 3            | 2(6ch)       | **8** | Wave 1   |
| registerSkillCreatorHandlers   | 3        | 2            | 3(13ch)      | **8** | Wave 1   |
| registerSkillFileHandlers      | 2        | 3            | 2(7ch)       | **7** | Wave 1   |
| registerSafetyGateHandlers     | 2        | 3            | 1(1ch)       | **6** | Wave 1 ※ |
| registerApprovalHandlers       | 2        | 3            | 1(1ch)       | **6** | Wave 1 ※ |
| registerAgentExecutionHandlers | 3        | 2            | 2(5ch)       | **7** | Wave 1   |

※ セキュリティ中核であるため、スコアが6点でもWave 1に昇格

## Wave 2 対象（スコア 4〜6点）

| 関数名                         | 変更頻度 | セキュリティ | チャンネル数 | 合計  | Wave   |
| ------------------------------ | -------- | ------------ | ------------ | ----- | ------ |
| registerFileHandlers           | 2        | 2            | 2(8ch)       | **6** | Wave 2 |
| registerFsHandlers             | 2        | 2            | 1(2ch)       | **5** | Wave 2 |
| registerStoreHandlers          | 2        | 2            | 1(4ch)       | **5** | Wave 2 |
| registerUserSettingsHandlers   | 2        | 1            | 1(2ch)       | **4** | Wave 2 |
| registerAIHandlers             | 2        | 2            | 1(3ch)       | **5** | Wave 2 |
| registerDashboardHandlers      | 1        | 1            | 1(2ch)       | **3** | Wave 2 |
| registerGraphHandlers          | 1        | 1            | 1(2ch)       | **3** | Wave 2 |
| registerAuthHandlers           | 2        | 3            | 1(1ch)       | **6** | Wave 2 |
| registerApiKeyHandlers         | 2        | 3            | 1(4ch)       | **6** | Wave 2 |
| registerHistoryHandlers        | 2        | 1            | 1(4ch)       | **4** | Wave 2 |
| registerHistorySearchHandlers  | 1        | 1            | 1(2ch)       | **3** | Wave 2 |
| registerNotificationHandlers   | 2        | 1            | 2(5ch)       | **5** | Wave 2 |
| registerAgentSkillHandlers     | 2        | 2            | 1(4ch)       | **5** | Wave 2 |
| registerCommunityHandlers      | 1        | 1            | 2(6ch)       | **4** | Wave 2 |
| registerSkillScheduleHandlers  | 2        | 1            | 2(5ch)       | **5** | Wave 2 |
| registerSkillAnalyticsHandlers | 2        | 1            | 2(5ch)       | **5** | Wave 2 |

## Wave 3 対象（スコア 3点以下）

| 関数名                               | 変更頻度 | セキュリティ | チャンネル数 | 合計  | Wave     |
| ------------------------------------ | -------- | ------------ | ------------ | ----- | -------- |
| registerWindowHandlers               | 1        | 1            | 1(2ch)       | **3** | Wave 3   |
| registerThemeHandlers                | 1        | 1            | 1(3ch)       | **3** | Wave 3   |
| registerProfileHandlers              | 1        | 2            | 3(11ch)      | **6** | Wave 3 ※ |
| registerAvatarHandlers               | 1        | 1            | 1(3ch)       | **3** | Wave 3   |
| registerDialogHandlers               | 1        | 1            | 1(2ch)       | **3** | Wave 3   |
| registerTerminalHandlers             | 1        | 1            | 1(1ch)       | **3** | Wave 3   |
| registerWorkspaceHandlers            | 1        | 2            | 2(5ch)       | **5** | Wave 3   |
| registerSearchHandlers               | 1        | 1            | 2(7ch)       | **4** | Wave 3   |
| registerFileSelectionHandlers        | 1        | 1            | 1(4ch)       | **3** | Wave 3   |
| registerSkillDocsHandlers            | 2        | 1            | 1(4ch)       | **4** | Wave 3   |
| registerSkillChainHandlers           | 2        | 1            | 2(5ch)       | **5** | Wave 3   |
| registerSkillShareHandlers           | 1        | 2            | 1(3ch)       | **4** | Wave 3   |
| registerSkillDebugHandlers           | 1        | 1            | 2(6ch)       | **4** | Wave 3   |
| registerClaudeCliHandlers            | 2        | 2            | 2(8ch)       | **6** | Wave 3 ※ |
| registerDisclosureHandlers           | 1        | 1            | 1(1ch)       | **3** | Wave 3   |
| registerAdvancedConsoleHandlers      | 1        | 1            | 1(2ch)       | **3** | Wave 3   |
| registerAnalyticsHandlers            | 1        | 1            | 1(2ch)       | **3** | Wave 3   |
| registerPermissionStoreHandlers      | 2        | 2            | 1(4ch)       | **5** | Wave 3   |
| registerAuthKeyHandlers              | 2        | 3            | 1(4ch)       | **6** | Wave 3 ※ |
| registerAuthModeHandlers             | 2        | 2            | 1(4ch)       | **5** | Wave 3   |
| registerChatEditHandlers             | 2        | 2            | 1(4ch)       | **5** | Wave 3   |
| registerConversationHandlers         | 2        | 1            | 3(9ch)       | **6** | Wave 3 ※ |
| registerSlideIpcHandlers             | 1        | 1            | 2(6ch)       | **4** | Wave 3   |
| registerSkillCreatorOpenSkillHandler | 1        | 1            | 1(1ch)       | **3** | Wave 3   |

※ スコアが高いが既存のCIカバレッジ状況を考慮してWave 3に配置

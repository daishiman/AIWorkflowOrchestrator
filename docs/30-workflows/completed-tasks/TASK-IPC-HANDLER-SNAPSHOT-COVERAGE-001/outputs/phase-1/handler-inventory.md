# handler-inventory.md

## Phase 1 成果物 - register\*Handlers() 棚卸し一覧

- 調査基準: `apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` から直接呼ばれる registration unit
- 調査日: 2026-04-20
- 正本方針: direct registration unit は **48件**、既存の補助 snapshot として `registerRuntimeSkillCreatorHandlers` を **auxiliary 1件** で別管理する

## direct registration unit（48件）

### Wave 1 direct（7件）

- `registerSkillHandlers`
- `registerLLMHandlers`
- `registerSkillCreatorHandlers`
- `registerSkillFileHandlers`
- `registerSafetyGateHandlers`
- `registerApprovalHandlers`
- `registerAgentExecutionHandlers`

### Wave 2 direct（16件）

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

### Wave 3 direct（25件）

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

## 対象外の特殊ケース（5件）

- `setupThemeWatcher`
- `registerAuthFallbackHandlers`
- `registerProfileFallbackHandlers`
- `registerAvatarFallbackHandlers`
- `registerConversationFallbackHandlers`

上記は fallback / watcher / 非 direct unit のため、wave 分母には含めない。

## auxiliary registration snapshot（1件）

- `registerRuntimeSkillCreatorHandlers`
  - テスト: `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`
  - 位置づけ: `registerSkillCreatorHandlers` の nested runtime registration を守る既存補助証跡
  - 注意: direct unit の 48件とは別勘定

## 2026-04-20 時点の導入状況

| 区分          | 件数 | 状態     | 備考                                           |
| ------------- | ---: | -------- | ---------------------------------------------- |
| Wave 1 direct |    7 | 導入済み | 7/7                                            |
| Wave 2 direct |   16 | 導入済み | 16/16                                          |
| Wave 3 direct |   25 | 未導入   | Phase 6/7 で後続計画化済み                     |
| auxiliary     |    1 | 導入済み | `creatorHandlers.registrationSnapshot.test.ts` |

## 現在の結論

- direct coverage は **23/48**
- 補助 snapshot を含む実ファイル数は **24**
- stale だった「テスト欠損リスト」は廃止し、本ファイルの導入状況表を正本とする

# existing-test-map.md

## Phase 1 成果物 - 既存スナップショットテスト対応表

**調査日**: 2026-04-19
**調査対象**: `apps/desktop/src/main/ipc/__tests__/` 配下の `*registrationSnapshot*` ファイル

---

## 既存スナップショットテストファイル

| ファイル名                                     | 対象関数                              | スナップショットファイル                                          |
| ---------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| `creatorHandlers.registrationSnapshot.test.ts` | `registerRuntimeSkillCreatorHandlers` | `__snapshots__/creatorHandlers.registrationSnapshot.test.ts.snap` |
| `ipcHandlerRegistrationSnapshot.test.ts`       | `registerAllIpcHandlers` (全体)       | `__snapshots__/ipcHandlerRegistrationSnapshot.test.ts.snap`       |

## registration unit 別 テスト対応表

| 関数名                               | Wave | スナップショットテスト                         | 状態                   |
| ------------------------------------ | ---- | ---------------------------------------------- | ---------------------- |
| registerSkillHandlers                | 1    | なし                                           | **テスト欠損**         |
| registerLLMHandlers                  | 1    | `llmHandlers.registrationSnapshot.test.ts`     | **追加済み（未実行）** |
| registerSkillCreatorHandlers         | 1    | なし                                           | **テスト欠損**         |
| registerSkillFileHandlers            | 1    | なし                                           | **テスト欠損**         |
| registerSafetyGateHandlers           | 1    | なし                                           | **テスト欠損**         |
| registerApprovalHandlers             | 1    | なし                                           | **テスト欠損**         |
| registerAgentExecutionHandlers       | 1    | なし                                           | **テスト欠損**         |
| registerFileHandlers                 | 2    | なし                                           | **テスト欠損**         |
| registerFsHandlers                   | 2    | なし                                           | **テスト欠損**         |
| registerStoreHandlers                | 2    | なし                                           | **テスト欠損**         |
| registerUserSettingsHandlers         | 2    | なし                                           | **テスト欠損**         |
| registerAIHandlers                   | 2    | なし                                           | **テスト欠損**         |
| registerDashboardHandlers            | 2    | なし                                           | **テスト欠損**         |
| registerGraphHandlers                | 2    | なし                                           | **テスト欠損**         |
| registerAuthHandlers                 | 2    | なし                                           | **テスト欠損**         |
| registerApiKeyHandlers               | 2    | なし                                           | **テスト欠損**         |
| registerHistoryHandlers              | 2    | なし                                           | **テスト欠損**         |
| registerHistorySearchHandlers        | 2    | なし                                           | **テスト欠損**         |
| registerNotificationHandlers         | 2    | なし                                           | **テスト欠損**         |
| registerAgentSkillHandlers           | 2    | なし                                           | **テスト欠損**         |
| registerCommunityHandlers            | 2    | なし                                           | **テスト欠損**         |
| registerSkillScheduleHandlers        | 2    | なし                                           | **テスト欠損**         |
| registerSkillAnalyticsHandlers       | 2    | なし                                           | **テスト欠損**         |
| registerWindowHandlers               | 3    | なし                                           | **テスト欠損**         |
| registerThemeHandlers                | 3    | なし                                           | **テスト欠損**         |
| registerProfileHandlers              | 3    | なし                                           | **テスト欠損**         |
| registerAvatarHandlers               | 3    | なし                                           | **テスト欠損**         |
| registerDialogHandlers               | 3    | なし                                           | **テスト欠損**         |
| registerTerminalHandlers             | 3    | なし                                           | **テスト欠損**         |
| registerWorkspaceHandlers            | 3    | なし                                           | **テスト欠損**         |
| registerSearchHandlers               | 3    | なし                                           | **テスト欠損**         |
| registerFileSelectionHandlers        | 3    | なし                                           | **テスト欠損**         |
| registerSkillDocsHandlers            | 3    | なし                                           | **テスト欠損**         |
| registerSkillChainHandlers           | 3    | なし                                           | **テスト欠損**         |
| registerSkillShareHandlers           | 3    | なし                                           | **テスト欠損**         |
| registerSkillDebugHandlers           | 3    | なし                                           | **テスト欠損**         |
| registerClaudeCliHandlers            | 3    | なし                                           | **テスト欠損**         |
| registerDisclosureHandlers           | 3    | なし                                           | **テスト欠損**         |
| registerAdvancedConsoleHandlers      | 3    | なし                                           | **テスト欠損**         |
| registerAnalyticsHandlers            | 3    | なし                                           | **テスト欠損**         |
| registerPermissionStoreHandlers      | 3    | なし                                           | **テスト欠損**         |
| registerAuthKeyHandlers              | 3    | なし                                           | **テスト欠損**         |
| registerAuthModeHandlers             | 3    | なし                                           | **テスト欠損**         |
| registerChatEditHandlers             | 3    | なし                                           | **テスト欠損**         |
| registerConversationHandlers         | 3    | なし                                           | **テスト欠損**         |
| registerChatExportHandlers           | 3    | なし                                           | **テスト欠損**         |
| registerSlideIpcHandlers             | 3    | なし                                           | **テスト欠損**         |
| registerSkillCreatorOpenSkillHandler | 3    | なし                                           | **テスト欠損**         |
| registerRuntimeSkillCreatorHandlers  | 既存 | `creatorHandlers.registrationSnapshot.test.ts` | **導入済み**           |

## テスト欠損サマリー

- 合計 registration unit 数: 48
- direct registration unit の追加済み: 1 (`registerLLMHandlers`, 未実行)
- 参照パターンとして導入済み: 1 (`registerRuntimeSkillCreatorHandlers`)
- テスト欠損: 47

## 既存の重複検出テストとの役割分担

| テスト                                   | 役割                                                | スナップショットテストとの差分                       |
| ---------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| `ipc-double-registration.test.ts`        | `registerAllIpcHandlers` 全体での重複チャンネル検出 | 全体の重複は検出するが、個別関数の変更を検出できない |
| `ipcHandlerRegistrationSnapshot.test.ts` | `registerAllIpcHandlers` 全体のスナップショット     | 全体の変化を検出するが、どの関数が原因かわかりにくい |
| **新規スナップショットテスト群**         | 個別 registration unit のスナップショット           | 変更箇所の特定が容易、fail-fastの粒度が細かい        |

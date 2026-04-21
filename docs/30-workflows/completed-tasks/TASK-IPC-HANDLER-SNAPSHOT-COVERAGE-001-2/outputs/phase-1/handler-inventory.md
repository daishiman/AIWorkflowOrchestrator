# handler-inventory.md

## Phase 1 成果物 - register\*Handlers() 棚卸し一覧

**調査基準**: `apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` から呼ばれる全 registration unit
**調査日**: 2026-04-19

---

## 全 registration unit 一覧

| 関数名                               | 実装ファイル                       | 分類        | チャンネル概算数 | wave候補 | 備考                                   |
| ------------------------------------ | ---------------------------------- | ----------- | ---------------- | -------- | -------------------------------------- |
| registerSkillHandlers                | ipc/skillHandlers.ts:119           | handle-only | 17               | Wave 1   | スキル中核、変更頻度高                 |
| registerLLMHandlers                  | main/handlers/llm.ts               | handle-only | 6                | Wave 1   | AI機能中核                             |
| registerSkillCreatorHandlers         | ipc/skillCreatorHandlers.ts:128    | handle-only | 13               | Wave 1   | 既存パターン隣接                       |
| registerSkillFileHandlers            | ipc/skillFileHandlers.ts           | handle-only | 7                | Wave 1   | ファイル操作・セキュリティ重要         |
| registerSafetyGateHandlers           | ipc/safetyGateHandlers.ts          | handle-only | 1                | Wave 1   | セキュリティ中核                       |
| registerApprovalHandlers             | ipc/approvalHandlers.ts            | handle-only | 1                | Wave 1   | 承認フロー中核                         |
| registerAgentExecutionHandlers       | ipc/agentHandlers.ts:38            | handle-only | 5                | Wave 1   | エージェント実行中核                   |
| registerFileHandlers                 | ipc/fileHandlers.ts:69             | handle-only | 8                | Wave 2   | 基本ファイル操作                       |
| registerFsHandlers                   | ipc/fileHandlers.ts:311            | handle-only | 2                | Wave 2   | ファイルシステム                       |
| registerStoreHandlers                | ipc/storeHandlers.ts:54            | handle-only | 4                | Wave 2   | ストア管理                             |
| registerUserSettingsHandlers         | ipc/storeHandlers.ts:239           | handle-only | 2                | Wave 2   | ユーザー設定                           |
| registerAIHandlers                   | ipc/aiHandlers.ts                  | handle-only | 3                | Wave 2   | AI汎用                                 |
| registerDashboardHandlers            | ipc/dashboardHandlers.ts           | handle-only | 2                | Wave 2   | ダッシュボード                         |
| registerGraphHandlers                | ipc/graphHandlers.ts               | handle-only | 2                | Wave 2   | グラフ表示                             |
| registerAuthHandlers                 | ipc/authHandlers.ts                | handle-only | 1                | Wave 2   | 認証（Supabase条件付き）               |
| registerApiKeyHandlers               | ipc/apiKeyHandlers.ts              | handle-only | 4                | Wave 2   | APIキー管理                            |
| registerHistoryHandlers              | ipc/historyHandlers.ts             | handle-only | 4                | Wave 2   | 履歴管理                               |
| registerHistorySearchHandlers        | ipc/historySearchHandlers.ts       | handle-only | 2                | Wave 2   | 履歴検索                               |
| registerNotificationHandlers         | ipc/notificationHandlers.ts        | handle-only | 5                | Wave 2   | 通知                                   |
| registerAgentSkillHandlers           | ipc/agentHandlers.ts:342           | handle-only | 4                | Wave 2   | エージェントスキル                     |
| registerCommunityHandlers            | ipc/communityHandlers.ts           | handle-only | 6                | Wave 2   | コミュニティ                           |
| registerSkillScheduleHandlers        | ipc/skillHandlers.ts:959           | handle-only | 5                | Wave 2   | スキルスケジュール                     |
| registerSkillAnalyticsHandlers       | ipc/skillAnalyticsHandlers.ts      | handle-only | 5                | Wave 2   | スキル分析                             |
| registerWindowHandlers               | ipc/windowHandlers.ts              | handle-only | 2                | Wave 3   | ウィンドウ管理                         |
| registerThemeHandlers                | ipc/themeHandlers.ts               | handle-only | 3                | Wave 3   | テーマ（deps.ipcMain使用）             |
| registerProfileHandlers              | ipc/profileHandlers.ts             | handle-only | 11               | Wave 3   | プロフィール                           |
| registerAvatarHandlers               | ipc/avatarHandlers.ts              | handle-only | 3                | Wave 3   | アバター                               |
| registerDialogHandlers               | ipc/dialogHandlers.ts              | handle-only | 2                | Wave 3   | ダイアログ                             |
| registerTerminalHandlers             | ipc/terminalHandlers.ts            | handle-only | 1                | Wave 3   | ターミナル（deps.ipcMain使用）         |
| registerWorkspaceHandlers            | ipc/workspaceHandlers.ts           | handle-only | 5                | Wave 3   | ワークスペース（createIpcHandler使用） |
| registerSearchHandlers               | ipc/searchHandlers.ts              | handle-only | 7                | Wave 3   | 検索                                   |
| registerFileSelectionHandlers        | ipc/fileSelectionHandlers.ts       | handle-only | 4                | Wave 3   | ファイル選択                           |
| registerSkillDocsHandlers            | ipc/skillHandlers.ts:1164          | handle-only | 4                | Wave 3   | スキルドキュメント                     |
| registerSkillChainHandlers           | ipc/skillHandlers.ts:1395          | handle-only | 5                | Wave 3   | スキルチェーン                         |
| registerSkillShareHandlers           | ipc/skillHandlers.share.ts:127     | handle-only | 3                | Wave 3   | スキル共有                             |
| registerSkillDebugHandlers           | ipc/skillDebugHandlers.ts          | handle-only | 6                | Wave 3   | スキルデバッグ                         |
| registerClaudeCliHandlers            | main/claude-cli/ipc-handler.ts:193 | handle-only | 8                | Wave 3   | Claude CLI                             |
| registerDisclosureHandlers           | ipc/disclosureHandlers.ts          | handle-only | 1                | Wave 3   | ディスクロージャー                     |
| registerAdvancedConsoleHandlers      | ipc/advancedConsoleHandlers.ts     | handle-only | 2                | Wave 3   | 高度コンソール                         |
| registerAnalyticsHandlers            | ipc/analyticsHandler.ts            | handle-only | 2                | Wave 3   | 分析                                   |
| registerPermissionStoreHandlers      | ipc/permission-store-handlers.ts   | handle-only | 4                | Wave 3   | パーミッションストア                   |
| registerAuthKeyHandlers              | ipc/authKeyHandlers.ts             | handle-only | 4                | Wave 3   | 認証キー                               |
| registerAuthModeHandlers             | ipc/authModeHandlers.ts            | handle-only | 4                | Wave 3   | 認証モード（deps.ipcMain使用）         |
| registerChatEditHandlers             | ipc/chatEditHandlers.ts            | handle-only | 4                | Wave 3   | チャット編集                           |
| registerConversationHandlers         | ipc/conversationHandlers.ts        | handle-only | 9                | Wave 3   | 会話管理                               |
| registerChatExportHandlers           | ipc/conversationHandlers.ts        | handle-only | 2                | Wave 3   | 会話エクスポート                       |
| registerSlideIpcHandlers             | main/slide/ipc-handlers.ts         | handle-only | 6                | Wave 3   | スライド                               |
| registerSkillCreatorOpenSkillHandler | ipc/index.ts（インライン）         | handle-only | 1                | Wave 3   | スキルオープン（インライン登録）       |

## 特殊ケース（wave対象外）

| 関数名                               | 理由                                                |
| ------------------------------------ | --------------------------------------------------- |
| setupThemeWatcher                    | ipcMain登録なし、nativeThemeのwatcherを設定する関数 |
| registerAuthFallbackHandlers         | Supabase未設定時のフォールバック、wave対象外        |
| registerProfileFallbackHandlers      | Supabase未設定時のフォールバック、wave対象外        |
| registerAvatarFallbackHandlers       | Supabase未設定時のフォールバック、wave対象外        |
| registerConversationFallbackHandlers | DB初期化失敗時のフォールバック、wave対象外          |

## テスト欠損リスト（スナップショットテスト未導入）

以下は `existing-test-map.md` に基づいて確認したテスト未対応の registration unit:

**Wave 1（緊急対応）:**

- registerSkillHandlers
- registerLLMHandlers
- registerSkillCreatorHandlers
- registerSkillFileHandlers
- registerSafetyGateHandlers
- registerApprovalHandlers
- registerAgentExecutionHandlers

**Wave 2（中優先）:**

- registerFileHandlers
- registerFsHandlers
- registerStoreHandlers
- registerUserSettingsHandlers
- registerAIHandlers
- registerDashboardHandlers
- registerGraphHandlers
- registerAuthHandlers
- registerApiKeyHandlers
- registerHistoryHandlers
- registerHistorySearchHandlers
- registerNotificationHandlers
- registerAgentSkillHandlers
- registerCommunityHandlers
- registerSkillScheduleHandlers
- registerSkillAnalyticsHandlers

**Wave 3（低優先）:**

- その他全 registration unit

## 分類説明

- **handle-only**: `ipcMain.handle()` のみを使用
- **on-only**: `ipcMain.on()` のみを使用（本棚卸しではhanlde-onlyのみ確認）
- **mixed**: 両方を使用

※ 全registration unitでon-onlyおよびmixedの例は確認されなかった。ただし、themeHandlers・terminalHandlers・workspaceHandlers・authModeHandlersは`deps.ipcMain`・`createIpcHandler`経由でipcMain.handleを呼ぶため、モックテストでの捕捉方法に注意が必要。

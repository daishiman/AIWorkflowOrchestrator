# test-pattern-design.md

## Phase 2 成果物 - テストパターン設計書

**基準**: `creatorHandlers.registrationSnapshot.test.ts`
**作成日**: 2026-04-19

---

## 共通テスト契約

各 registration unit に以下の 3 テストを必須とする:

| テストID形式          | 内容                                              |
| --------------------- | ------------------------------------------------- |
| REG-SNAP-{PREFIX}-01  | 登録チャンネル一覧がスナップショットと一致する    |
| REG-DEDUP-{PREFIX}-01 | 重複チャンネルが存在しない（Set.size === length） |
| REG-COUNT-{PREFIX}-01 | 登録チャンネル総数が期待値と一致する              |

## プレフィックス採番規則

| 関数名                               | プレフィックス |
| ------------------------------------ | -------------- |
| registerSkillHandlers                | SKILL          |
| registerLLMHandlers                  | LLM            |
| registerSkillCreatorHandlers         | SCREATOR       |
| registerSkillFileHandlers            | SFILE          |
| registerSafetyGateHandlers           | SAFETY         |
| registerApprovalHandlers             | APPROVAL       |
| registerAgentExecutionHandlers       | AGENTEXEC      |
| registerFileHandlers                 | FILE           |
| registerFsHandlers                   | FS             |
| registerStoreHandlers                | STORE          |
| registerUserSettingsHandlers         | USERSETTINGS   |
| registerAIHandlers                   | AI             |
| registerDashboardHandlers            | DASHBOARD      |
| registerGraphHandlers                | GRAPH          |
| registerAuthHandlers                 | AUTH           |
| registerApiKeyHandlers               | APIKEY         |
| registerHistoryHandlers              | HISTORY        |
| registerHistorySearchHandlers        | HISTORYSEARCH  |
| registerNotificationHandlers         | NOTIFICATION   |
| registerAgentSkillHandlers           | AGENTSKILL     |
| registerCommunityHandlers            | COMMUNITY      |
| registerSkillScheduleHandlers        | SSCHEDULE      |
| registerSkillAnalyticsHandlers       | SANALYTICS     |
| registerWindowHandlers               | WINDOW         |
| registerThemeHandlers                | THEME          |
| registerProfileHandlers              | PROFILE        |
| registerAvatarHandlers               | AVATAR         |
| registerDialogHandlers               | DIALOG         |
| registerTerminalHandlers             | TERMINAL       |
| registerWorkspaceHandlers            | WORKSPACE      |
| registerSearchHandlers               | SEARCH         |
| registerFileSelectionHandlers        | FILESEL        |
| registerSkillDocsHandlers            | SDOCS          |
| registerSkillChainHandlers           | SCHAIN         |
| registerSkillShareHandlers           | SSHARE         |
| registerSkillDebugHandlers           | SDEBUG         |
| registerClaudeCliHandlers            | CLAUDECLI      |
| registerDisclosureHandlers           | DISCLOSURE     |
| registerAdvancedConsoleHandlers      | ADVCON         |
| registerAnalyticsHandlers            | ANALYTICS      |
| registerPermissionStoreHandlers      | PERMSTORE      |
| registerAuthKeyHandlers              | AUTHKEY        |
| registerAuthModeHandlers             | AUTHMODE       |
| registerChatEditHandlers             | CHATEDIT       |
| registerConversationHandlers         | CONV           |
| registerSlideIpcHandlers             | SLIDE          |
| registerSkillCreatorOpenSkillHandler | SCOPEN         |

## vi.spyOn パターン設計方針

既存の `creatorHandlers.registrationSnapshot.test.ts` に完全準拠:

```typescript
// 1. vi.hoisted() でモック変数を事前定義
const { mockIpcMainHandle, mockIpcMainOn } = vi.hoisted(() => ({
  mockIpcMainHandle: vi.fn(),
  mockIpcMainOn: vi.fn().mockReturnValue({ removeAllListeners: vi.fn() }),
}));

// 2. Electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: vi.fn(),
    on: mockIpcMainOn,
    removeAllListeners: vi.fn(),
  },
}));

// 3. beforeEach でリセット + キャプチャ設定
beforeEach(() => {
  handles = [];
  vi.clearAllMocks();
  vi.resetModules();
  mockIpcMainHandle.mockImplementation((channel: string) => {
    handles.push(channel);
  });
});
```

## ipcMain.on を持つ handler の対応方針

本棚卸しでは全 registration unit が handle-only であることを確認した。
ただし、以下のケースは特殊なモック注入パターンを使用しているため注意が必要:

| 関数名                    | 特殊パターン            | 対応方針                                                           |
| ------------------------- | ----------------------- | ------------------------------------------------------------------ |
| registerThemeHandlers     | `deps.ipcMain` 経由     | deps引数にモックipcMainを渡す                                      |
| registerTerminalHandlers  | `deps.ipcMain` 経由     | deps引数にモックipcMainを渡す                                      |
| registerWorkspaceHandlers | `createIpcHandler` 経由 | `createIpcHandler`がipcMain.handleを呼ぶため通常のモックで捕捉可能 |
| registerAuthModeHandlers  | `deps.ipcMain` 経由     | deps引数にモックipcMainを渡す                                      |

## テストファイル命名規則

形式: `{handlerPrefix}Handlers.registrationSnapshot.test.ts`

例:

- `skillHandlers.registrationSnapshot.test.ts`
- `llmHandlers.registrationSnapshot.test.ts`
- `agentExecutionHandlers.registrationSnapshot.test.ts`

## テストファイル構造

```typescript
/**
 * {関数名} チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-{PREFIX}-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-{PREFIX}-01: 重複チャンネルが存在しない
 * REG-COUNT-{PREFIX}-01: 登録チャンネル総数が N
 * REG-EDGE-{PREFIX}-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-{PREFIX}-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow } from "electron";

const { mockIpcMainHandle, mockIpcMainOn } = vi.hoisted(() => ({ ... }));

vi.mock("electron", () => ({ ipcMain: { handle: mockIpcMainHandle, ... } }));

describe("{関数名} - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-{PREFIX}-01〜REG-COUNT-{PREFIX}-01: 正常系", () => {
    beforeEach(async () => {
      const { register{Name}Handlers } = await import("../{fileName}");
      register{Name}Handlers(...deps);
    });

    it("REG-SNAP-{PREFIX}-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-{PREFIX}-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-{PREFIX}-01: 登録チャンネル総数が N", () => {
      expect(handles).toHaveLength(N); // Phase 5で実測値に更新
    });
  });

  describe("REG-EDGE-{PREFIX}-01〜REG-EDGE-{PREFIX}-03: 境界値・異常系", () => {
    it("REG-EDGE-{PREFIX}-01: 重複チャンネルが存在する場合に検出できる", () => { ... });
    it("REG-EDGE-{PREFIX}-03: 各テストで handles が独立している", () => { ... });
  });
});
```

## CI コスト評価方針

- 採用値: 中央値（外れ値除外）
- Wave単位での追加時間を計測（Phase 5完了後に初回計測）
- 許容基準: Wave当たり30秒以内

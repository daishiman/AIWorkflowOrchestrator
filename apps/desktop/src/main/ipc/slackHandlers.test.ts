/**
 * slackHandlers ユニットテスト
 *
 * TC-H-01: slack:send がメッセージを送信する
 * TC-H-02: slack:send がinvalidメッセージを拒否する
 * TC-H-03: slack:send がWebhook URL未設定時にエラーを返す
 * TC-H-04: slack:send がデフォルト設定を使用する
 * TC-H-05: slack:test が接続テストを実行する
 * TC-H-06: slack:test が無効なURLを拒否する
 * TC-H-07: slack:config:get-all が全設定を返す（URLマスク済み）
 * TC-H-08: slack:config:add が設定を追加する
 * TC-H-09: slack:config:remove が設定を削除する
 * TC-H-10: slack:config:set-default がデフォルトを変更する
 * TC-H-11: slack:config:clear が全設定をクリアする
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const { handleMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: handleMock,
  },
}));

import { registerSlackHandlers } from "./slackHandlers";
import type { SlackHandlerDeps } from "./slackHandlers";
import { IPC_CHANNELS } from "../../preload/channels";

const VALID_WEBHOOK_URL =
  "https://hooks.slack.com/services/T000/B000/testtoken";

describe("slackHandlers", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;
  let deps: SlackHandlerDeps;
  const validEvent = {};

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    deps = {
      slackService: {
        send: vi.fn(async () => ({ success: true })),
        test: vi.fn(async () => ({ success: true, latencyMs: 42 })),
      } as unknown as SlackHandlerDeps["slackService"],
      configStore: {
        getAll: vi.fn(() => [
          { webhookUrl: VALID_WEBHOOK_URL, label: "#general" },
        ]),
        getDefault: vi.fn(() => ({
          webhookUrl: VALID_WEBHOOK_URL,
          label: "#general",
        })),
        add: vi.fn(() => 0),
        update: vi.fn(() => true),
        remove: vi.fn(() => true),
        setDefault: vi.fn(() => true),
        clear: vi.fn(),
      } as unknown as SlackHandlerDeps["configStore"],
    };

    handleMock.mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    registerSlackHandlers(deps);
  });

  // ─── slack:send ────────────────────────────────────────────────

  describe("slack:send", () => {
    it("TC-H-01: テキストメッセージを送信する", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_SEND);
      expect(handler).toBeDefined();

      const result = (await handler!(validEvent, {
        message: { type: "text", text: "テストメッセージ" },
        webhookUrl: VALID_WEBHOOK_URL,
      })) as { success: boolean; data?: { sent: boolean } };

      expect(result.success).toBe(true);
      expect(result.data?.sent).toBe(true);
      expect(deps.slackService.send).toHaveBeenCalledOnce();
    });

    it("TC-H-02: invalidなmessageを拒否する", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_SEND);

      const result = (await handler!(validEvent, {
        message: { type: "invalid", text: "" },
      })) as { success: boolean; error?: { code: string } };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });

    it("TC-H-03: Webhook URL未設定時にエラーを返す", async () => {
      vi.mocked(deps.configStore.getDefault).mockReturnValue(null);

      const handler = handlers.get(IPC_CHANNELS.SLACK_SEND);
      const result = (await handler!(validEvent, {
        message: { type: "text", text: "test" },
      })) as { success: boolean; error?: { code: string } };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("CONFIG_NOT_FOUND");
    });

    it("TC-H-04: Webhook URL未指定時にデフォルト設定を使用する", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_SEND);
      await handler!(validEvent, {
        message: { type: "text", text: "test" },
      });

      expect(deps.configStore.getDefault).toHaveBeenCalledOnce();
      expect(deps.slackService.send).toHaveBeenCalledWith(
        { type: "text", text: "test" },
        VALID_WEBHOOK_URL,
      );
    });
  });

  // ─── slack:test ────────────────────────────────────────────────

  describe("slack:test", () => {
    it("TC-H-05: 接続テストを実行し latencyMs を返す", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_TEST);
      expect(handler).toBeDefined();

      const result = (await handler!(validEvent, {
        webhookUrl: VALID_WEBHOOK_URL,
      })) as { success: boolean; data?: { latencyMs: number } };

      expect(result.success).toBe(true);
      expect(result.data?.latencyMs).toBe(42);
    });

    it("TC-H-06: 無効なURLを拒否する", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_TEST);

      const result = (await handler!(validEvent, {
        webhookUrl: "https://example.com/not-slack",
      })) as { success: boolean; error?: { code: string } };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  // ─── slack:config:get-all ──────────────────────────────────────

  describe("slack:config:get-all", () => {
    it("TC-H-07: 全設定を返す（URLはマスク済み）", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_CONFIG_GET_ALL);
      expect(handler).toBeDefined();

      const result = (await handler!(validEvent)) as {
        success: boolean;
        data?: { configs: Array<{ webhookUrl: string; label?: string }> };
      };

      expect(result.success).toBe(true);
      expect(result.data?.configs).toHaveLength(1);
      // URLがマスクされていることを確認
      const url = result.data?.configs[0].webhookUrl ?? "";
      expect(url).toContain("****");
      expect(url).not.toContain("testtoken");
    });
  });

  // ─── slack:config:add ─────────────────────────────────────────

  describe("slack:config:add", () => {
    it("TC-H-08: 有効な設定を追加する", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_CONFIG_ADD);
      expect(handler).toBeDefined();

      const result = (await handler!(validEvent, {
        config: { webhookUrl: VALID_WEBHOOK_URL, label: "#alerts" },
      })) as { success: boolean; data?: { index: number } };

      expect(result.success).toBe(true);
      expect(result.data?.index).toBe(0);
      expect(deps.configStore.add).toHaveBeenCalledWith({
        webhookUrl: VALID_WEBHOOK_URL,
        label: "#alerts",
      });
    });

    it("TC-H-08a: 無効なWebhook URLを拒否する", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_CONFIG_ADD);

      const result = (await handler!(validEvent, {
        config: { webhookUrl: "https://example.com/bad", label: "#test" },
      })) as { success: boolean; error?: { code: string } };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  // ─── slack:config:remove ──────────────────────────────────────

  describe("slack:config:remove", () => {
    it("TC-H-09: 指定インデックスの設定を削除する", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_CONFIG_REMOVE);
      expect(handler).toBeDefined();

      const result = (await handler!(validEvent, { index: 0 })) as {
        success: boolean;
        data?: { removed: boolean };
      };

      expect(result.success).toBe(true);
      expect(result.data?.removed).toBe(true);
      expect(deps.configStore.remove).toHaveBeenCalledWith(0);
    });

    it("TC-H-09a: 無効なindexを拒否する", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_CONFIG_REMOVE);

      const result = (await handler!(validEvent, { index: -1 })) as {
        success: boolean;
        error?: { code: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("VALIDATION_ERROR");
    });
  });

  // ─── slack:config:set-default ─────────────────────────────────

  describe("slack:config:set-default", () => {
    it("TC-H-10: デフォルト設定を変更する", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_CONFIG_SET_DEFAULT);
      expect(handler).toBeDefined();

      const result = (await handler!(validEvent, { index: 0 })) as {
        success: boolean;
        data?: { updated: boolean };
      };

      expect(result.success).toBe(true);
      expect(result.data?.updated).toBe(true);
      expect(deps.configStore.setDefault).toHaveBeenCalledWith(0);
    });
  });

  // ─── slack:config:clear ───────────────────────────────────────

  describe("slack:config:clear", () => {
    it("TC-H-11: 全設定をクリアする", async () => {
      const handler = handlers.get(IPC_CHANNELS.SLACK_CONFIG_CLEAR);
      expect(handler).toBeDefined();

      const result = (await handler!(validEvent)) as {
        success: boolean;
        data?: { cleared: boolean };
      };

      expect(result.success).toBe(true);
      expect(result.data?.cleared).toBe(true);
      expect(deps.configStore.clear).toHaveBeenCalledOnce();
    });
  });
});

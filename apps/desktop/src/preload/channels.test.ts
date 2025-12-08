import { describe, it, expect } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "./channels";

describe("IPC Channels", () => {
  describe("IPC_CHANNELS", () => {
    it("ファイル操作チャネルが定義されている", () => {
      expect(IPC_CHANNELS.FILE_GET_TREE).toBe("file:get-tree");
      expect(IPC_CHANNELS.FILE_READ).toBe("file:read");
      expect(IPC_CHANNELS.FILE_WRITE).toBe("file:write");
      expect(IPC_CHANNELS.FILE_WATCH_START).toBe("file:watch-start");
      expect(IPC_CHANNELS.FILE_WATCH_STOP).toBe("file:watch-stop");
      expect(IPC_CHANNELS.FILE_CHANGED).toBe("file:changed");
    });

    it("ストア操作チャネルが定義されている", () => {
      expect(IPC_CHANNELS.STORE_GET).toBe("store:get");
      expect(IPC_CHANNELS.STORE_SET).toBe("store:set");
      expect(IPC_CHANNELS.STORE_GET_SECURE).toBe("store:get-secure");
      expect(IPC_CHANNELS.STORE_SET_SECURE).toBe("store:set-secure");
    });

    it("AI操作チャネルが定義されている", () => {
      expect(IPC_CHANNELS.AI_CHAT).toBe("ai:chat");
      expect(IPC_CHANNELS.AI_CHECK_CONNECTION).toBe("ai:check-connection");
      expect(IPC_CHANNELS.AI_INDEX).toBe("ai:index");
    });

    it("グラフ操作チャネルが定義されている", () => {
      expect(IPC_CHANNELS.GRAPH_GET).toBe("graph:get");
      expect(IPC_CHANNELS.GRAPH_REFRESH).toBe("graph:refresh");
    });

    it("ダッシュボード操作チャネルが定義されている", () => {
      expect(IPC_CHANNELS.DASHBOARD_GET_STATS).toBe("dashboard:get-stats");
      expect(IPC_CHANNELS.DASHBOARD_GET_ACTIVITY).toBe(
        "dashboard:get-activity",
      );
    });

    it("ウィンドウ操作チャネルが定義されている", () => {
      expect(IPC_CHANNELS.WINDOW_GET_STATE).toBe("window:get-state");
      expect(IPC_CHANNELS.WINDOW_RESIZED).toBe("window:resized");
    });

    it("アプリ操作チャネルが定義されている", () => {
      expect(IPC_CHANNELS.APP_GET_VERSION).toBe("app:get-version");
      expect(IPC_CHANNELS.APP_MENU_ACTION).toBe("app:menu-action");
    });
  });

  describe("ALLOWED_INVOKE_CHANNELS", () => {
    it("invokeで許可されるチャネルが含まれている", () => {
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.FILE_GET_TREE);
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.FILE_READ);
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.FILE_WRITE);
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.STORE_GET);
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.STORE_SET);
      expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AI_CHAT);
    });

    it("イベントリスナーチャネルは含まれない", () => {
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(IPC_CHANNELS.FILE_CHANGED);
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(
        IPC_CHANNELS.WINDOW_RESIZED,
      );
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(
        IPC_CHANNELS.APP_MENU_ACTION,
      );
    });
  });

  describe("ALLOWED_ON_CHANNELS", () => {
    it("onで許可されるチャネルが含まれている", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.FILE_CHANGED);
      expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.WINDOW_RESIZED);
      expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.APP_MENU_ACTION);
    });

    it("invokeチャネルは含まれない", () => {
      expect(ALLOWED_ON_CHANNELS).not.toContain(IPC_CHANNELS.FILE_GET_TREE);
      expect(ALLOWED_ON_CHANNELS).not.toContain(IPC_CHANNELS.STORE_GET);
      expect(ALLOWED_ON_CHANNELS).not.toContain(IPC_CHANNELS.AI_CHAT);
    });
  });

  describe("セキュリティ", () => {
    it("全てのinvokeチャネルが明示的に許可されている", () => {
      const invokeChannels = [
        IPC_CHANNELS.FILE_GET_TREE,
        IPC_CHANNELS.FILE_READ,
        IPC_CHANNELS.FILE_WRITE,
        IPC_CHANNELS.FILE_WATCH_START,
        IPC_CHANNELS.FILE_WATCH_STOP,
        IPC_CHANNELS.STORE_GET,
        IPC_CHANNELS.STORE_SET,
        IPC_CHANNELS.STORE_GET_SECURE,
        IPC_CHANNELS.STORE_SET_SECURE,
        IPC_CHANNELS.AI_CHAT,
        IPC_CHANNELS.AI_CHECK_CONNECTION,
        IPC_CHANNELS.AI_INDEX,
        IPC_CHANNELS.GRAPH_GET,
        IPC_CHANNELS.GRAPH_REFRESH,
        IPC_CHANNELS.DASHBOARD_GET_STATS,
        IPC_CHANNELS.DASHBOARD_GET_ACTIVITY,
        IPC_CHANNELS.WINDOW_GET_STATE,
        IPC_CHANNELS.APP_GET_VERSION,
      ];

      invokeChannels.forEach((channel) => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(channel);
      });
    });

    it("全てのonチャネルが明示的に許可されている", () => {
      const onChannels = [
        IPC_CHANNELS.FILE_CHANGED,
        IPC_CHANNELS.WINDOW_RESIZED,
        IPC_CHANNELS.APP_MENU_ACTION,
      ];

      onChannels.forEach((channel) => {
        expect(ALLOWED_ON_CHANNELS).toContain(channel);
      });
    });
  });
});

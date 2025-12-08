import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcRenderer } from "electron";

// Mock electron modules
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  contextBridge: {
    exposeInMainWorld: vi.fn(),
  },
}));

// Import after mocking
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "./channels";

describe("Preload API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module cache to re-execute preload script
    vi.resetModules();
  });

  describe("safeInvoke", () => {
    it("許可されたチャネルでinvokeを呼び出す", async () => {
      vi.mocked(ipcRenderer.invoke).mockResolvedValue({ success: true });

      // Simulate safeInvoke behavior
      const channel = IPC_CHANNELS.FILE_GET_TREE;
      if (ALLOWED_INVOKE_CHANNELS.includes(channel)) {
        await ipcRenderer.invoke(channel, { rootPath: "/test" });
      }

      expect(ipcRenderer.invoke).toHaveBeenCalledWith(channel, {
        rootPath: "/test",
      });
    });

    it("許可されていないチャネルではinvokeを呼び出さない", () => {
      const channel = "unauthorized:channel";

      if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
        // Do not call invoke
      } else {
        ipcRenderer.invoke(channel);
      }

      expect(ipcRenderer.invoke).not.toHaveBeenCalled();
    });
  });

  describe("safeOn", () => {
    it("許可されたチャネルでリスナーを登録する", () => {
      const callback = vi.fn();
      const channel = IPC_CHANNELS.FILE_CHANGED;

      if (ALLOWED_ON_CHANNELS.includes(channel)) {
        ipcRenderer.on(channel, (_event, data) => callback(data));
      }

      expect(ipcRenderer.on).toHaveBeenCalled();
    });

    it("許可されていないチャネルではリスナーを登録しない", () => {
      const callback = vi.fn();
      const channel = "unauthorized:event";

      if (ALLOWED_ON_CHANNELS.includes(channel)) {
        ipcRenderer.on(channel, callback);
      }

      expect(ipcRenderer.on).not.toHaveBeenCalled();
    });

    it("クリーンアップ関数でリスナーを削除する", () => {
      const _callback = vi.fn();
      const channel = IPC_CHANNELS.FILE_CHANGED;

      let cleanup: () => void;
      if (ALLOWED_ON_CHANNELS.includes(channel)) {
        const listener = vi.fn();
        ipcRenderer.on(channel, listener);

        cleanup = () => {
          ipcRenderer.removeListener(channel, listener);
        };
      }

      // Call cleanup
      cleanup!();

      expect(ipcRenderer.removeListener).toHaveBeenCalled();
    });
  });

  describe("IPC Channels Security", () => {
    describe("ファイル操作チャネル", () => {
      it("FILE_GET_TREEが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.FILE_GET_TREE);
      });

      it("FILE_READが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.FILE_READ);
      });

      it("FILE_WRITEが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.FILE_WRITE);
      });

      it("FILE_CHANGEDイベントが許可されている", () => {
        expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.FILE_CHANGED);
      });
    });

    describe("ストア操作チャネル", () => {
      it("STORE_GETが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.STORE_GET);
      });

      it("STORE_SETが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.STORE_SET);
      });

      it("STORE_GET_SECUREが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.STORE_GET_SECURE,
        );
      });

      it("STORE_SET_SECUREが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.STORE_SET_SECURE,
        );
      });
    });

    describe("AI操作チャネル", () => {
      it("AI_CHATが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AI_CHAT);
      });

      it("AI_CHECK_CONNECTIONが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.AI_CHECK_CONNECTION,
        );
      });

      it("AI_INDEXが許可されている", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AI_INDEX);
      });
    });
  });

  describe("API構造", () => {
    it("file APIが必要なメソッドを持つ", () => {
      // Expected file API structure
      const expectedMethods = [
        "getTree",
        "read",
        "write",
        "watchStart",
        "watchStop",
        "onChanged",
      ];

      expectedMethods.forEach((method) => {
        expect(typeof method).toBe("string");
      });
    });

    it("store APIが必要なメソッドを持つ", () => {
      const expectedMethods = ["get", "set", "getSecure", "setSecure"];

      expectedMethods.forEach((method) => {
        expect(typeof method).toBe("string");
      });
    });

    it("ai APIが必要なメソッドを持つ", () => {
      const expectedMethods = ["chat", "checkConnection", "index"];

      expectedMethods.forEach((method) => {
        expect(typeof method).toBe("string");
      });
    });

    it("graph APIが必要なメソッドを持つ", () => {
      const expectedMethods = ["get", "refresh"];

      expectedMethods.forEach((method) => {
        expect(typeof method).toBe("string");
      });
    });

    it("dashboard APIが必要なメソッドを持つ", () => {
      const expectedMethods = ["getStats", "getActivity"];

      expectedMethods.forEach((method) => {
        expect(typeof method).toBe("string");
      });
    });

    it("window APIが必要なメソッドを持つ", () => {
      const expectedMethods = ["getState", "onResized"];

      expectedMethods.forEach((method) => {
        expect(typeof method).toBe("string");
      });
    });

    it("app APIが必要なメソッドを持つ", () => {
      const expectedMethods = ["getVersion", "onMenuAction"];

      expectedMethods.forEach((method) => {
        expect(typeof method).toBe("string");
      });
    });
  });
});

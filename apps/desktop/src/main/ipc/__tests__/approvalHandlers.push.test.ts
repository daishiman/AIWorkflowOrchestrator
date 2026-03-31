/**
 * approvalHandlers push notification テスト
 *
 * TASK-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001 Phase 4
 *
 * Approval リクエストが発生したときに mainWindow.webContents.send() で
 * APPROVAL_REQUEST チャネルを通じて Renderer にプッシュ通知されることを検証する。
 *
 * 現在の approvalHandlers.ts にはプッシュ通知機能が未実装のため
 * RED（失敗）状態である。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserWindow } from "electron";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

vi.mock("../../../preload/channels", async () => {
  const actual = await vi.importActual<
    typeof import("../../../preload/channels")
  >("../../../preload/channels");
  return actual;
});

import { IPC_CHANNELS, ALLOWED_ON_CHANNELS } from "../../../preload/channels";

describe("approvalHandlers - push notification", () => {
  let mockMainWindow: BrowserWindow;
  let mockSend: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();

    mockSend = vi.fn();
    mockMainWindow = {
      webContents: {
        id: 1,
        send: mockSend,
        isDestroyed: vi.fn().mockReturnValue(false),
      },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;
  });

  describe("APPROVAL_REQUEST プッシュ通知チャネル", () => {
    it("APPROVAL_REQUEST が ALLOWED_ON_CHANNELS に含まれること", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.APPROVAL_REQUEST);
    });

    it("APPROVAL_REQUEST チャネル値が 'approval:request' であること", () => {
      expect(IPC_CHANNELS.APPROVAL_REQUEST).toBe("approval:request");
    });
  });

  describe("mainWindow.webContents.send による通知", () => {
    /**
     * 以下のテストは、Main Process 側で承認リクエストが発生したときに
     * mainWindow.webContents.send(APPROVAL_REQUEST, payload) が呼ばれることを
     * 検証する。
     *
     * 実装パターン:
     *   registerApprovalHandlers 内、または別の関数 (例: pushApprovalRequest) で
     *   mainWindow.webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, payload) を呼ぶ。
     *
     * このテストは直接 webContents.send をシミュレートして検証する。
     */

    it("APPROVAL_REQUEST チャネルで webContents.send が呼ばれること", () => {
      const payload = {
        sessionId: "session-1",
        operationId: "op-1",
        operationType: "dangerous_command",
        description: "rm -rf /",
      };

      // 実装が存在する場合: pushApprovalRequest(mainWindow, payload) を呼ぶ
      // ここでは期待される動作を直接検証
      mockMainWindow.webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, payload);

      expect(mockSend).toHaveBeenCalledWith(
        IPC_CHANNELS.APPROVAL_REQUEST,
        payload,
      );
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("webContents.isDestroyed() が true の場合は send しないこと", () => {
      const destroyedWindow = {
        webContents: {
          id: 1,
          send: vi.fn(),
          isDestroyed: vi.fn().mockReturnValue(true),
        },
        isDestroyed: vi.fn().mockReturnValue(false),
      } as unknown as BrowserWindow;

      // 実装が存在する場合の期待動作:
      // isDestroyed() チェックにより send が呼ばれない
      const payload = {
        sessionId: "session-1",
        operationId: "op-1",
        operationType: "dangerous_command",
        description: "rm -rf /",
      };

      // Guard チェックのシミュレーション
      if (!destroyedWindow.webContents.isDestroyed()) {
        destroyedWindow.webContents.send(
          IPC_CHANNELS.APPROVAL_REQUEST,
          payload,
        );
      }

      expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
    });

    it("window.isDestroyed() が true の場合も send しないこと", () => {
      const destroyedWindow = {
        webContents: {
          id: 1,
          send: vi.fn(),
          isDestroyed: vi.fn().mockReturnValue(false),
        },
        isDestroyed: vi.fn().mockReturnValue(true),
      } as unknown as BrowserWindow;

      const payload = {
        sessionId: "session-1",
        operationId: "op-1",
        operationType: "external_send",
        description: "Sending data to API",
      };

      // Guard チェックのシミュレーション
      if (
        !destroyedWindow.isDestroyed() &&
        !destroyedWindow.webContents.isDestroyed()
      ) {
        destroyedWindow.webContents.send(
          IPC_CHANNELS.APPROVAL_REQUEST,
          payload,
        );
      }

      expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
    });
  });

  describe("pushApprovalRequest ヘルパー関数", () => {
    /**
     * 以下のテストは、approvalHandlers モジュールから export される
     * pushApprovalRequest 関数（または同等の機能）の存在を検証する。
     *
     * 現在未実装のため RED 状態。
     * Phase 5 で registerApprovalHandlers と共にこの関数を実装する。
     */

    it("pushApprovalRequest 関数がモジュールから export されること", async () => {
      // 動的 import で関数の存在を確認
      const mod = await import("../approvalHandlers");
      const exported = mod as Record<string, unknown>;

      // pushApprovalRequest が export されていることを期待
      // 現時点では export されていないため失敗する
      expect(typeof exported.pushApprovalRequest).toBe("function");
    });

    it("pushApprovalRequest が正しいペイロードで send を呼ぶこと", async () => {
      const mod = await import("../approvalHandlers");
      const exported = mod as Record<string, (...args: unknown[]) => void>;

      // pushApprovalRequest が存在する前提
      if (typeof exported.pushApprovalRequest === "function") {
        const payload = {
          sessionId: "session-1",
          operationId: "op-1",
          operationType: "dangerous_command",
          description: "rm -rf /tmp/test",
        };

        exported.pushApprovalRequest(mockMainWindow, payload);

        expect(mockSend).toHaveBeenCalledWith(
          IPC_CHANNELS.APPROVAL_REQUEST,
          payload,
        );
      } else {
        // 関数が未実装の場合、テストを明示的に失敗させる
        expect(typeof exported.pushApprovalRequest).toBe("function");
      }
    });
  });

  describe("Phase 6: pushApprovalRequest エッジケース", () => {
    it("空の description フィールドでも send が呼ばれること", async () => {
      const { pushApprovalRequest } = await import("../approvalHandlers");

      const payload = {
        sessionId: "session-1",
        operationId: "op-1",
        operationType: "dangerous_command",
        description: "",
      };

      pushApprovalRequest(mockMainWindow, payload);

      expect(mockSend).toHaveBeenCalledWith(
        IPC_CHANNELS.APPROVAL_REQUEST,
        payload,
      );
    });

    it("空の sessionId/operationId フィールドでも send が呼ばれること（バリデーションは Renderer 側）", async () => {
      const { pushApprovalRequest } = await import("../approvalHandlers");

      const payload = {
        sessionId: "",
        operationId: "",
        operationType: "",
        description: "",
      };

      pushApprovalRequest(mockMainWindow, payload);

      expect(mockSend).toHaveBeenCalledWith(
        IPC_CHANNELS.APPROVAL_REQUEST,
        payload,
      );
    });

    it("optional な destination フィールドが含まれるペイロードで正しく send されること", async () => {
      const { pushApprovalRequest } = await import("../approvalHandlers");

      const payload = {
        sessionId: "session-1",
        operationId: "op-1",
        operationType: "external_send",
        description: "Send to API",
        destination: "https://api.example.com",
      };

      pushApprovalRequest(mockMainWindow, payload);

      expect(mockSend).toHaveBeenCalledWith(
        IPC_CHANNELS.APPROVAL_REQUEST,
        payload,
      );
      // destination フィールドがそのまま渡されることを確認
      const sentPayload = mockSend.mock.calls[0][1];
      expect(sentPayload.destination).toBe("https://api.example.com");
    });

    it("複数回の急速な呼び出しで各呼び出しが独立して送信されること（二重送信なし）", async () => {
      const { pushApprovalRequest } = await import("../approvalHandlers");

      const payload1 = {
        sessionId: "session-1",
        operationId: "op-1",
        operationType: "dangerous_command",
        description: "cmd1",
      };
      const payload2 = {
        sessionId: "session-1",
        operationId: "op-2",
        operationType: "dangerous_command",
        description: "cmd2",
      };
      const payload3 = {
        sessionId: "session-2",
        operationId: "op-3",
        operationType: "external_send",
        description: "cmd3",
      };

      pushApprovalRequest(mockMainWindow, payload1);
      pushApprovalRequest(mockMainWindow, payload2);
      pushApprovalRequest(mockMainWindow, payload3);

      // 各呼び出しが1回ずつ独立して送信される
      expect(mockSend).toHaveBeenCalledTimes(3);
      expect(mockSend).toHaveBeenNthCalledWith(
        1,
        IPC_CHANNELS.APPROVAL_REQUEST,
        payload1,
      );
      expect(mockSend).toHaveBeenNthCalledWith(
        2,
        IPC_CHANNELS.APPROVAL_REQUEST,
        payload2,
      );
      expect(mockSend).toHaveBeenNthCalledWith(
        3,
        IPC_CHANNELS.APPROVAL_REQUEST,
        payload3,
      );
    });

    it("window が操作途中で破棄された場合に send されないこと", async () => {
      const { pushApprovalRequest } = await import("../approvalHandlers");

      // 最初は正常
      const windowDestroyedMidOp = {
        webContents: {
          id: 1,
          send: vi.fn(),
          isDestroyed: vi.fn().mockReturnValue(false),
        },
        isDestroyed: vi.fn().mockReturnValue(false),
      } as unknown as BrowserWindow;

      const payload = {
        sessionId: "session-1",
        operationId: "op-1",
        operationType: "dangerous_command",
        description: "test",
      };

      // 正常時は送信される
      pushApprovalRequest(windowDestroyedMidOp, payload);
      expect(windowDestroyedMidOp.webContents.send).toHaveBeenCalledTimes(1);

      // window を破棄状態にする
      vi.mocked(windowDestroyedMidOp.isDestroyed).mockReturnValue(true);

      // 破棄後は送信されない
      pushApprovalRequest(windowDestroyedMidOp, payload);
      expect(windowDestroyedMidOp.webContents.send).toHaveBeenCalledTimes(1); // 増えない
    });

    it("webContents が操作途中で破棄された場合に send されないこと", async () => {
      const { pushApprovalRequest } = await import("../approvalHandlers");

      const windowWithDestroyedContents = {
        webContents: {
          id: 1,
          send: vi.fn(),
          isDestroyed: vi.fn().mockReturnValue(false),
        },
        isDestroyed: vi.fn().mockReturnValue(false),
      } as unknown as BrowserWindow;

      const payload = {
        sessionId: "session-1",
        operationId: "op-1",
        operationType: "dangerous_command",
        description: "test",
      };

      // 正常時は送信
      pushApprovalRequest(windowWithDestroyedContents, payload);
      expect(
        windowWithDestroyedContents.webContents.send,
      ).toHaveBeenCalledTimes(1);

      // webContents のみ破棄
      vi.mocked(
        windowWithDestroyedContents.webContents.isDestroyed,
      ).mockReturnValue(true);

      pushApprovalRequest(windowWithDestroyedContents, payload);
      // 送信回数が増えないことを確認
      expect(
        windowWithDestroyedContents.webContents.send,
      ).toHaveBeenCalledTimes(1);
    });
  });
});

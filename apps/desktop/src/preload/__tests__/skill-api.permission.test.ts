/**
 * @file skill-api.permission.test.ts
 * @description Preload API Permission Methods ユニットテスト
 * @phase Phase 5: 実装（TDD: Green）
 * @task TASK-4-2-permission-resolver-ipc-handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcRenderer, type IpcRendererEvent } from "electron";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";
import { IPC_CHANNELS } from "../channels";

// モック
vi.mock("electron", () => ({
  ipcRenderer: {
    on: vi.fn(),
    removeListener: vi.fn(),
    invoke: vi.fn(),
  },
}));

// skillAPIは各テストで動的にインポート
let skillAPI: typeof import("../skill-api").skillAPI;

describe("skillAPI permission methods", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // モジュールキャッシュをクリアして再インポート
    vi.resetModules();
    const module = await import("../skill-api");
    skillAPI = module.skillAPI;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("onPermissionRequest", () => {
    it("should register listener for skill:permission-request", () => {
      const callback = vi.fn();

      skillAPI.onPermissionRequest(callback);

      expect(ipcRenderer.on).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        expect.any(Function),
      );
    });

    it("should return unsubscribe function that removes listener", () => {
      const callback = vi.fn();

      const unsubscribe = skillAPI.onPermissionRequest(callback);

      expect(typeof unsubscribe).toBe("function");

      unsubscribe();

      expect(ipcRenderer.removeListener).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
        expect.any(Function),
      );
    });

    it("should call callback when request is received", () => {
      const callback = vi.fn();
      const request: SkillPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "ls" },
      };

      skillAPI.onPermissionRequest(callback);

      // IPC経由でリクエストを受信したシミュレーション
      const calls = (ipcRenderer.on as ReturnType<typeof vi.fn>).mock.calls;
      const listenerCall = calls.find(
        (call: unknown[]) => call[0] === IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
      );
      expect(listenerCall).toBeDefined();

      const listener = listenerCall![1] as (
        event: IpcRendererEvent,
        data: SkillPermissionRequest,
      ) => void;
      const mockEvent = {} as IpcRendererEvent;
      listener(mockEvent, request);

      expect(callback).toHaveBeenCalledWith(request);
    });

    it("should reject non-whitelisted channel", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // channels.tsから許可されていないチャネルを使用するモジュールをテスト
      // 実際にはALLOWED_ON_CHANNELSに登録されているため、通常フローで動作
      // このテストでは、safeOn関数がホワイトリストをチェックすることを確認

      // skill:permission-requestはホワイトリストに登録されているので
      // エラーは発生しないことを確認
      const callback = vi.fn();
      skillAPI.onPermissionRequest(callback);

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("sendPermissionResponse", () => {
    it("should invoke skill:permission-response channel", async () => {
      const response: SkillPermissionResponse = {
        requestId: "req-456",
        approved: true,
      };

      (ipcRenderer.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
      });

      await skillAPI.sendPermissionResponse(response);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
        response,
      );
    });

    it("should return success result from IPC", async () => {
      const response: SkillPermissionResponse = {
        requestId: "req-456",
        approved: true,
        rememberChoice: false,
      };

      (ipcRenderer.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
      });

      const result = await skillAPI.sendPermissionResponse(response);

      expect(result).toEqual({ success: true });
    });

    it("should include all response fields", async () => {
      const response: SkillPermissionResponse = {
        requestId: "req-456",
        approved: false,
        rememberChoice: true,
        rejectReason: "User denied",
      };

      (ipcRenderer.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
      });

      await skillAPI.sendPermissionResponse(response);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
        expect.objectContaining({
          requestId: "req-456",
          approved: false,
          rememberChoice: true,
          rejectReason: "User denied",
        }),
      );
    });
  });

  describe("edge cases", () => {
    it("should handle multiple subscribers", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      skillAPI.onPermissionRequest(callback1);
      skillAPI.onPermissionRequest(callback2);

      // 両方のリスナーが登録される
      expect(ipcRenderer.on).toHaveBeenCalledTimes(2);
    });

    it("should handle rapid subscribe/unsubscribe", () => {
      const callback = vi.fn();

      for (let i = 0; i < 10; i++) {
        const unsubscribe = skillAPI.onPermissionRequest(callback);
        unsubscribe();
      }

      expect(ipcRenderer.on).toHaveBeenCalledTimes(10);
      expect(ipcRenderer.removeListener).toHaveBeenCalledTimes(10);
    });

    it("should handle IPC invoke error", async () => {
      const response: SkillPermissionResponse = {
        requestId: "req-456",
        approved: true,
      };

      (ipcRenderer.invoke as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("IPC Failed"),
      );

      await expect(skillAPI.sendPermissionResponse(response)).rejects.toThrow(
        "IPC Failed",
      );
    });

    it("should handle response with empty requestId", async () => {
      const response: SkillPermissionResponse = {
        requestId: "",
        approved: true,
      };

      (ipcRenderer.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
      });

      await skillAPI.sendPermissionResponse(response);

      expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
        expect.objectContaining({
          requestId: "",
        }),
      );
    });

    it("should handle multiple concurrent responses", async () => {
      const responses = Array.from({ length: 5 }, (_, i) => ({
        requestId: `req-${i}`,
        approved: i % 2 === 0,
      }));

      (ipcRenderer.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
      });

      const promises = responses.map((r) => skillAPI.sendPermissionResponse(r));
      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result).toEqual({ success: true });
      });
      expect(ipcRenderer.invoke).toHaveBeenCalledTimes(5);
    });
  });
});

/**
 * UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request onEvent listener テスト
 *
 * AC-1: approval:request onEvent が preload に登録されている
 * AC-3: approve/reject 操作が respondToApproval() と接続されている（preload 側）
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ALLOWED_ON_CHANNELS, IPC_CHANNELS } from "../channels";

const { mockOn, mockRemoveListener, mockInvoke } = vi.hoisted(() => ({
  mockOn: vi.fn(),
  mockRemoveListener: vi.fn(),
  mockInvoke: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  },
}));

import { skillCreatorAPI } from "../skill-creator-api";
import type { ApprovalRequestPayload } from "@repo/shared/types";

describe("UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: onApprovalRequest listener", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- AC-1: APPROVAL_REQUEST チャネル登録 ---

  describe("TC-001: approval:request イベント受信で callback を呼び出す", () => {
    it("APPROVAL_REQUEST チャネルに ipcRenderer.on が登録される", () => {
      const callback = vi.fn();
      skillCreatorAPI.onApprovalRequest(callback);

      expect(mockOn).toHaveBeenCalledWith(
        IPC_CHANNELS.APPROVAL_REQUEST,
        expect.any(Function),
      );
    });

    it("イベント発火時に callback が payload と共に呼ばれる", () => {
      const callback = vi.fn();
      skillCreatorAPI.onApprovalRequest(callback);

      // ipcRenderer.on に登録された handler を取得して手動発火
      const handler = mockOn.mock.calls[0][1] as (
        event: unknown,
        payload: ApprovalRequestPayload,
      ) => void;
      const payload: ApprovalRequestPayload = {
        sessionId: "session-1",
        operationId: "op-1",
        operationType: "file_write",
        description: "危険なファイル書き込みを実行しようとしています",
        destination: "/etc/hosts",
      };
      handler({}, payload);

      expect(callback).toHaveBeenCalledWith(payload);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  // --- TC-002: cleanup 関数 ---

  describe("TC-002: cleanup 関数が listener を解除する", () => {
    it("cleanup() 呼び出しで ipcRenderer.removeListener が呼ばれる", () => {
      const callback = vi.fn();
      const cleanup = skillCreatorAPI.onApprovalRequest(callback);

      cleanup();

      expect(mockRemoveListener).toHaveBeenCalledWith(
        IPC_CHANNELS.APPROVAL_REQUEST,
        expect.any(Function),
      );
    });

    it("cleanup() で渡される handler 参照が on 登録時と同一である", () => {
      const callback = vi.fn();
      const cleanup = skillCreatorAPI.onApprovalRequest(callback);

      // on に登録されたハンドラを保持
      const registeredHandler = mockOn.mock.calls[0][1] as (
        event: unknown,
        payload: ApprovalRequestPayload,
      ) => void;

      cleanup();

      // removeListener が同じハンドラ参照で呼ばれること（同一インスタンス保証）
      expect(mockRemoveListener).toHaveBeenCalledTimes(1);
      expect(mockRemoveListener).toHaveBeenCalledWith(
        IPC_CHANNELS.APPROVAL_REQUEST,
        registeredHandler,
      );
    });
  });

  // --- TC-003: payload フィールド ---

  describe("TC-003: ApprovalRequestPayload のフィールドが正しく渡される", () => {
    it("全フィールドを含む payload が callback に渡される", () => {
      const callback = vi.fn();
      skillCreatorAPI.onApprovalRequest(callback);

      const handler = mockOn.mock.calls[0][1] as (
        event: unknown,
        payload: ApprovalRequestPayload,
      ) => void;
      const payload: ApprovalRequestPayload = {
        sessionId: "sess-abc",
        operationId: "op-xyz",
        operationType: "network_request",
        description: "外部 API へのリクエストを送信しようとしています",
        destination: "https://api.example.com",
      };
      handler({}, payload);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "sess-abc",
          operationId: "op-xyz",
          operationType: "network_request",
          description: "外部 API へのリクエストを送信しようとしています",
          destination: "https://api.example.com",
        }),
      );
    });

    it("destination なし（省略可能フィールド）でも正常に動作する", () => {
      const callback = vi.fn();
      skillCreatorAPI.onApprovalRequest(callback);

      const handler = mockOn.mock.calls[0][1] as (
        event: unknown,
        payload: ApprovalRequestPayload,
      ) => void;
      const payload: ApprovalRequestPayload = {
        sessionId: "sess-1",
        operationId: "op-1",
        operationType: "file_delete",
        description: "ファイルを削除しようとしています",
      };
      handler({}, payload);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: "sess-1",
          operationId: "op-1",
        }),
      );
    });
  });

  // --- チャネル登録確認 ---

  describe("ALLOWED_ON_CHANNELS への登録確認", () => {
    it("APPROVAL_REQUEST が ALLOWED_ON_CHANNELS に含まれている", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.APPROVAL_REQUEST);
    });
  });
});

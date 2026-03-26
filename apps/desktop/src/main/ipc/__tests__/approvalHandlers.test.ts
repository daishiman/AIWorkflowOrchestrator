/**
 * approvalHandlers テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

vi.mock("../../../preload/channels", () => ({
  IPC_CHANNELS: {
    APPROVAL_RESPOND: "approval:respond",
  },
}));

import { registerApprovalHandlers } from "../approvalHandlers";
import type { IApprovalGate } from "../../services/runtime/ApprovalGate";

describe("approvalHandlers", () => {
  let mockMainWindow: BrowserWindow;
  let mockApprovalGate: IApprovalGate;
  let handler: (
    event: IpcMainInvokeEvent,
    request: unknown,
  ) => Promise<unknown>;

  beforeEach(() => {
    vi.resetAllMocks();

    mockMainWindow = {
      webContents: { id: 1 },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;

    mockApprovalGate = {
      grantApproval: vi.fn().mockReturnValue({
        approved: true,
        token: "test-token",
        approvedAt: Date.now(),
      }),
      rejectApproval: vi.fn(),
      checkApproval: vi.fn(),
      revokeAll: vi.fn(),
    };

    registerApprovalHandlers(mockMainWindow, mockApprovalGate);

    const handleCall = vi.mocked(ipcMain.handle).mock.calls[0];
    handler = handleCall[1] as typeof handler;
  });

  it("rejects request from unknown sender", async () => {
    const event = {
      sender: { id: 999 },
    } as unknown as IpcMainInvokeEvent;

    const result = await handler(event, {
      sessionId: "s1",
      operationId: "op1",
      action: "approve",
    });
    expect(result).toEqual({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Unknown sender" },
    });
  });

  it("validates sessionId with P42 3-step validation", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    // empty string
    const r1 = await handler(event, {
      sessionId: "",
      operationId: "op1",
      action: "approve",
    });
    expect((r1 as { success: boolean }).success).toBe(false);

    // whitespace only
    const r2 = await handler(event, {
      sessionId: "   ",
      operationId: "op1",
      action: "approve",
    });
    expect((r2 as { success: boolean }).success).toBe(false);

    // non-string
    const r3 = await handler(event, {
      sessionId: 123,
      operationId: "op1",
      action: "approve",
    });
    expect((r3 as { success: boolean }).success).toBe(false);
  });

  it("calls grantApproval on approve action", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    const result = await handler(event, {
      sessionId: "s1",
      operationId: "op1",
      action: "approve",
    });
    expect(mockApprovalGate.grantApproval).toHaveBeenCalledWith("s1", "op1");
    expect((result as { success: boolean }).success).toBe(true);
  });

  it("calls rejectApproval on reject action", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    const result = await handler(event, {
      sessionId: "s1",
      operationId: "op1",
      action: "reject",
    });
    expect(mockApprovalGate.rejectApproval).toHaveBeenCalledWith("s1", "op1");
    expect((result as { success: boolean }).success).toBe(true);
  });

  it("rejects invalid action", async () => {
    const event = {
      sender: mockMainWindow.webContents,
    } as unknown as IpcMainInvokeEvent;

    const result = await handler(event, {
      sessionId: "s1",
      operationId: "op1",
      action: "invalid",
    });
    expect((result as { success: boolean }).success).toBe(false);
  });
});

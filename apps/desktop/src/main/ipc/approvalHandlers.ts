/**
 * approvalHandlers - Approval IPC handler
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * approval:respond の受信と ApprovalGate への委譲を行う。
 */

import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type { IApprovalGate } from "../services/runtime/ApprovalGate";

export interface ApprovalRespondRequest {
  sessionId: string;
  operationId: string;
  action: "approve" | "reject";
}

export function registerApprovalHandlers(
  mainWindow: BrowserWindow,
  approvalGate: IApprovalGate,
): void {
  ipcMain.handle(
    IPC_CHANNELS.APPROVAL_RESPOND,
    async (event: IpcMainInvokeEvent, request: unknown) => {
      // 送信元検証
      if (event.sender !== mainWindow.webContents) {
        return {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Unknown sender" },
        };
      }

      // P42 準拠 3段バリデーション
      if (request == null || typeof request !== "object") {
        return {
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Invalid request" },
        };
      }

      const req = request as Record<string, unknown>;

      if (
        typeof req.sessionId !== "string" ||
        req.sessionId === "" ||
        req.sessionId.trim() === ""
      ) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "sessionId must be a non-empty string",
          },
        };
      }

      if (
        typeof req.operationId !== "string" ||
        req.operationId === "" ||
        req.operationId.trim() === ""
      ) {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "operationId must be a non-empty string",
          },
        };
      }

      if (req.action !== "approve" && req.action !== "reject") {
        return {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: 'action must be "approve" or "reject"',
          },
        };
      }

      // ApprovalGate への委譲
      if (req.action === "approve") {
        const status = approvalGate.grantApproval(
          req.sessionId,
          req.operationId,
        );
        return { success: true, data: status };
      } else {
        approvalGate.rejectApproval(req.sessionId, req.operationId);
        return { success: true, data: { approved: false, reason: "rejected" } };
      }
    },
  );
}

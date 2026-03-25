/**
 * useApprovalFlow - Approval IPC 通信と state 管理 hook
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * Approval Sheet の表示制御と IPC 経由の承認/拒否を管理する。
 */

import { useState, useCallback } from "react";

export type ApprovalOperationType = "dangerous_operation" | "external_send";

export interface ApprovalRequest {
  operationType: ApprovalOperationType;
  operationId: string;
  description: string;
  destination?: string;
  dataSummary?: string;
}

export interface UseApprovalFlowReturn {
  /** 現在の承認要求（null の場合は Approval Sheet 非表示） */
  currentRequest: ApprovalRequest | null;
  /** 承認要求を開始する */
  requestApproval: (request: ApprovalRequest) => void;
  /** 承認を実行する */
  approve: () => Promise<void>;
  /** 拒否を実行する */
  reject: () => void;
  /** 処理中フラグ */
  isProcessing: boolean;
}

/**
 * Approval フローを管理する custom hook。
 * IPC 経由で Main Process の ApprovalGate と通信する。
 */
export function useApprovalFlow(sessionId: string): UseApprovalFlowReturn {
  const [currentRequest, setCurrentRequest] = useState<ApprovalRequest | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const requestApproval = useCallback((request: ApprovalRequest) => {
    setCurrentRequest(request);
  }, []);

  const approve = useCallback(async () => {
    if (!currentRequest) return;
    setIsProcessing(true);
    try {
      const electronAPI = (
        window as {
          electronAPI?: {
            invoke: <T>(channel: string, payload?: unknown) => Promise<T>;
          };
        }
      ).electronAPI;
      if (electronAPI) {
        await electronAPI.invoke("approval:respond", {
          sessionId,
          operationId: currentRequest.operationId,
          action: "approve",
        });
      }
    } finally {
      setIsProcessing(false);
      setCurrentRequest(null);
    }
  }, [currentRequest, sessionId]);

  const reject = useCallback(() => {
    if (!currentRequest) return;
    const electronAPI = (
      window as {
        electronAPI?: {
          invoke: <T>(channel: string, payload?: unknown) => Promise<T>;
        };
      }
    ).electronAPI;
    if (electronAPI) {
      void electronAPI.invoke("approval:respond", {
        sessionId,
        operationId: currentRequest.operationId,
        action: "reject",
      });
    }
    setCurrentRequest(null);
  }, [currentRequest, sessionId]);

  return {
    currentRequest,
    requestApproval,
    approve,
    reject,
    isProcessing,
  };
}

/**
 * useApprovalFlow - Approval IPC 通信と state 管理 hook
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * Approval Sheet の表示制御と IPC 経由の承認/拒否を管理する。
 */

import { useState, useCallback, useEffect } from "react";
import { getExecutionAPI } from "../utils/executionApi";

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

  // Main Process からの approval:request push 通知を購読
  useEffect(() => {
    const execution = getExecutionAPI();
    if (!execution) return;

    const unsubscribe = execution.onApprovalRequest((payload) => {
      const p = payload as {
        operationType: string;
        description: string;
        destination?: string;
        sessionId: string;
        operationId: string;
      };
      if (p.sessionId === sessionId) {
        setCurrentRequest({
          operationType: p.operationType as ApprovalOperationType,
          operationId: p.operationId,
          description: p.description,
          destination: p.destination,
        });
      }
    });

    return unsubscribe;
  }, [sessionId]);

  const requestApproval = useCallback((request: ApprovalRequest) => {
    setCurrentRequest(request);
  }, []);

  const approve = useCallback(async () => {
    if (!currentRequest) return;
    setIsProcessing(true);
    try {
      const execution = getExecutionAPI();
      if (execution) {
        await execution.respondApproval({
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
    const execution = getExecutionAPI();
    if (execution) {
      void execution.respondApproval({
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

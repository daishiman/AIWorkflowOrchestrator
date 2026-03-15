/**
 * useAgentExecution - エージェント実行用カスタムフック
 * @module useAgentExecution
 */
import { useEffect, useCallback } from "react";
import { useStore } from "@/renderer/store";
import {
  getAgentApi,
  startAgentExecution,
  stopAgentExecution,
  respondToAgentPermission,
} from "@/renderer/utils/agentApi";
import type { Skill } from "@repo/shared/types/skill";

/**
 * エージェント実行用フック
 *
 * - IPC通信のセットアップと管理
 * - ストリーミング受信処理
 * - 権限リクエスト処理
 */
export const useAgentExecution = (skill: Skill | null) => {
  const appendStreamingContent = useStore(
    (state) => state.appendStreamingContent,
  );
  const finalizeStreamingMessage = useStore(
    (state) => state.finalizeStreamingMessage,
  );
  const setExecutionError = useStore((state) => state.setExecutionError);
  const setPermissionRequest = useStore((state) => state.setPermissionRequest);
  const startExecution = useStore((state) => state.startExecution);
  const stopExecution = useStore((state) => state.stopExecution);
  const addUserMessage = useStore((state) => state.addUserMessage);
  const addAssistantMessage = useStore((state) => state.addAssistantMessage);

  // IPC event handlers setup
  useEffect(() => {
    const api = getAgentApi();
    if (!api) {
      return;
    }

    // Stream chunk handler
    const unsubStream = api.onStream((payload) => {
      if (payload.isComplete) {
        finalizeStreamingMessage();
      } else {
        appendStreamingContent(payload.chunk);
      }
    });

    // Status change handler
    const unsubStatus = api.onStatus((payload) => {
      if (payload.status === "completed") {
        finalizeStreamingMessage();
      } else if (payload.status === "error" && payload.error) {
        setExecutionError(payload.error);
      }
    });

    // Permission request handler
    const unsubPermission = api.onPermission((request) => {
      setPermissionRequest(request);
    });

    return () => {
      unsubStream();
      unsubStatus();
      unsubPermission();
    };
  }, [
    appendStreamingContent,
    finalizeStreamingMessage,
    setExecutionError,
    setPermissionRequest,
  ]);

  /**
   * エージェント実行開始
   */
  const start = useCallback(
    async (message: string) => {
      if (!skill || !message.trim()) return;

      // Add user message to store
      addUserMessage(message);

      // Generate execution ID
      const executionId = `exec-${Date.now()}`;
      startExecution(skill, executionId);

      // Start execution via IPC
      try {
        const result = await startAgentExecution({
          skillId: skill.id,
          prompt: message,
          executionId,
        });

        if (result?.handoff) {
          stopExecution();
          setExecutionError(
            result.error ||
              result.guidance?.reason ||
              "統合実行を開始できませんでした",
          );
        }
      } catch (error) {
        setExecutionError(
          error instanceof Error ? error.message : "実行に失敗しました",
        );
      }
    },
    [skill, addUserMessage, startExecution, setExecutionError, stopExecution],
  );

  /**
   * エージェント実行停止
   */
  const stop = useCallback(async () => {
    stopExecution();
    try {
      await stopAgentExecution();
    } catch (error) {
      console.error("Failed to stop execution:", error);
    }
  }, [stopExecution]);

  /**
   * 権限応答（共通処理）
   */
  const respondToPermission = useCallback(
    async (requestId: string, approved: boolean, rememberChoice: boolean) => {
      try {
        await respondToAgentPermission({
          requestId,
          approved,
          rememberChoice,
        });
      } catch (error) {
        console.error("Failed to respond to permission:", error);
      }
    },
    [],
  );

  /**
   * 権限許可
   */
  const approve = useCallback(
    async (requestId: string, rememberChoice: boolean) => {
      await respondToPermission(requestId, true, rememberChoice);
    },
    [respondToPermission],
  );

  /**
   * 権限拒否
   */
  const deny = useCallback(
    async (requestId: string, rememberChoice: boolean) => {
      await respondToPermission(requestId, false, rememberChoice);
    },
    [respondToPermission],
  );

  return {
    start,
    stop,
    approve,
    deny,
    respondToPermission,
    addAssistantMessage,
  };
};

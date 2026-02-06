/**
 * useSkillExecution - スキル実行を管理する React Hook
 *
 * TASK-3-2: SkillExecutor IPC Integration
 *
 * @module @repo/desktop/renderer/hooks/useSkillExecution
 */

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  SkillStreamMessage,
  SkillExecutionResponse,
  SkillExecutionError,
} from "@repo/shared/types/skill";

/**
 * 実行ステータス
 */
export type ExecutionStatus =
  | "idle"
  | "running"
  | "completed"
  | "error"
  | "aborted";

/**
 * 最大メッセージ数
 */
const MAX_MESSAGES = 1000;

/**
 * useSkillExecution の戻り値
 */
export interface UseSkillExecutionReturn {
  /** ストリームメッセージ一覧 */
  messages: SkillStreamMessage[];
  /** 現在のステータス */
  status: ExecutionStatus;
  /** 現在の実行ID */
  executionId: string | null;
  /** エラー情報 */
  error: SkillExecutionError | null;
  /** 中断処理中フラグ */
  isAborting: boolean;
  /** 実行を開始する */
  execute: (prompt: string) => Promise<SkillExecutionResponse | null>;
  /** 実行を中断する */
  abort: () => Promise<void>;
  /** 状態をリセットする */
  reset: () => void;
}

/**
 * スキル実行を管理する React Hook
 *
 * @param skillId - 実行対象のスキルID
 * @returns Hook の戻り値
 *
 * @example
 * ```typescript
 * const { messages, status, execute, abort } = useSkillExecution("my-skill");
 *
 * const handleExecute = async () => {
 *   await execute("Please analyze this code");
 * };
 * ```
 */
export function useSkillExecution(skillId: string): UseSkillExecutionReturn {
  const [messages, setMessages] = useState<SkillStreamMessage[]>([]);
  const [status, setStatus] = useState<ExecutionStatus>("idle");
  const [error, setError] = useState<SkillExecutionError | null>(null);
  const [isAborting, setIsAborting] = useState(false);

  const executionIdRef = useRef<string | null>(null);

  // ストリームメッセージのリスナー登録
  // Note: Empty deps array is intentional - we only want to register the listener once
  useEffect(() => {
    const unsubscribe = window.electronAPI.skill.onStream(
      (message: SkillStreamMessage) => {
        // 現在の実行IDと一致するメッセージのみ処理
        if (message.executionId !== executionIdRef.current) {
          return;
        }

        // メッセージを追加 (MAX_MESSAGESを超えたら古いメッセージを削除)
        setMessages((prev) => {
          const newMessages = [...prev, message];
          if (newMessages.length > MAX_MESSAGES) {
            return newMessages.slice(-MAX_MESSAGES);
          }
          return newMessages;
        });

        // メッセージタイプに応じてステータス更新
        if (
          message.type === "status" &&
          message.content.status === "completed"
        ) {
          setStatus("completed");
        } else if (message.type === "error") {
          // 中断メッセージの場合は aborted ステータス
          if (message.content.message.toLowerCase().includes("abort")) {
            setStatus("aborted");
            setIsAborting(false);
          } else {
            setStatus("error");
            setError({
              code: "EXECUTION_FAILED",
              message: message.content.message,
            });
          }
        }
      },
    );

    return unsubscribe;
  }, []);

  /**
   * スキルを実行する
   */
  const execute = useCallback(
    async (prompt: string): Promise<SkillExecutionResponse | null> => {
      // 状態リセット
      setMessages([]);
      setStatus("running");
      setError(null);
      setIsAborting(false);

      try {
        const response = await window.electronAPI.skill.execute({
          prompt,
          skillName: skillId,
        });

        if (response.success) {
          executionIdRef.current = response.executionId;
        } else {
          setStatus("error");
          const errorValue: SkillExecutionError =
            typeof response.error === "string"
              ? {
                  code: "EXECUTION_FAILED",
                  message: response.error,
                }
              : response.error || {
                  code: "EXECUTION_FAILED",
                  message: "Unknown error",
                };
          setError(errorValue);
        }

        return response;
      } catch (err) {
        setStatus("error");
        setError({
          code: "EXECUTION_FAILED",
          message: err instanceof Error ? err.message : "Unknown error",
        });
        return null;
      }
    },
    [skillId],
  );

  /**
   * 実行を中断する
   */
  const abort = useCallback(async (): Promise<void> => {
    if (!executionIdRef.current || status !== "running") {
      return;
    }

    setIsAborting(true);

    try {
      await window.electronAPI.skill.abort(executionIdRef.current);
      // isAborting は abort 確認メッセージ受信時にリセットされる
    } catch {
      // abort 失敗時は isAborting をリセット
      setIsAborting(false);
    }
  }, [status]);

  /**
   * 状態をリセットする
   */
  const reset = useCallback((): void => {
    setMessages([]);
    setStatus("idle");
    setError(null);
    setIsAborting(false);
    executionIdRef.current = null;
  }, []);

  return {
    messages,
    status,
    executionId: executionIdRef.current,
    error,
    isAborting,
    execute,
    abort,
    reset,
  };
}

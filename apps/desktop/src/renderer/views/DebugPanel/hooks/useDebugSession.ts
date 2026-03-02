/**
 * デバッグセッション管理Hook
 *
 * IPC経由でデバッグセッションの開始・コマンド実行・状態管理を行う。
 * セッション状態はローカルのuseStateで管理する。
 *
 * @module useDebugSession
 */

import { useState, useCallback } from "react";
import type {
  DebugSessionState,
  DebugCommand,
  DebugStartRequest,
} from "@repo/shared/types/skill-debug";

/** useDebugSession の戻り値型 */
export interface UseDebugSessionReturn {
  /** 現在のデバッグセッション状態（未開始時はnull） */
  session: DebugSessionState | null;
  /** セッション操作中のローディング状態 */
  isLoading: boolean;
  /** 最新のエラーメッセージ（正常時はnull） */
  error: string | null;
  /** デバッグセッションを開始する */
  startSession: (
    request: DebugStartRequest,
  ) => Promise<DebugSessionState | null>;
  /** デバッグコマンドを実行する */
  executeCommand: (command: DebugCommand) => Promise<void>;
  /** セッション状態を直接更新する（イベントハンドラ用） */
  setSession: React.Dispatch<React.SetStateAction<DebugSessionState | null>>;
  /** セッションを終了してリセットする */
  resetSession: () => void;
}

/**
 * デバッグセッション管理Hook
 *
 * 使用例:
 * ```tsx
 * const { session, startSession, executeCommand } = useDebugSession();
 * await startSession({ skillName: "my-skill", prompt: "テスト", breakpoints: [] });
 * await executeCommand("continue");
 * ```
 */
export function useDebugSession(): UseDebugSessionReturn {
  const [session, setSession] = useState<DebugSessionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    async (request: DebugStartRequest): Promise<DebugSessionState | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result =
          await window.electronAPI.skill.debug.startSession(request);
        setSession(result);
        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "デバッグセッション開始に失敗しました";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const executeCommand = useCallback(
    async (command: DebugCommand): Promise<void> => {
      if (!session) return;
      try {
        await window.electronAPI.skill.debug.executeCommand({
          sessionId: session.id,
          command,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "コマンド実行に失敗しました";
        setError(message);
      }
    },
    [session],
  );

  const resetSession = useCallback(() => {
    setSession(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    session,
    isLoading,
    error,
    startSession,
    executeCommand,
    setSession,
    resetSession,
  };
}

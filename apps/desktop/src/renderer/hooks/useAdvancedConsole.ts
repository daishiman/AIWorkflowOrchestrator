/**
 * useAdvancedConsole - Advanced Console IPC + state 管理 hook
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * Advanced Console Panel の開閉状態と IPC 経由のデータ取得を管理する。
 */

import { useState, useCallback, useEffect } from "react";
import { getExecutionAPI } from "../utils/executionApi";

export interface UseAdvancedConsoleReturn {
  /** パネル表示状態 */
  isOpen: boolean;
  /** toggle */
  toggle: () => void;
  /** raw terminal output */
  terminalOutput: string[];
  /** copy command（API key 非含有保証済み） */
  copyCommand: string | null;
  /** データ取得中 */
  isLoading: boolean;
}

/**
 * Advanced Console の state と IPC 通信を管理する custom hook。
 */
export function useAdvancedConsole(
  sessionId: string,
): UseAdvancedConsoleReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [copyCommand, setCopyCommand] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // パネルが開かれた時にデータを取得
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const execution = getExecutionAPI();
        if (!execution) return;

        const [logResult, cmdResult] = await Promise.all([
          execution.getTerminalLog(sessionId),
          execution.getCopyCommand(sessionId),
        ]);

        if (cancelled) return;
        if (logResult?.success && logResult.data) {
          setTerminalOutput(logResult.data);
        }
        if (cmdResult?.success && cmdResult.data !== undefined) {
          setCopyCommand(cmdResult.data);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [isOpen, sessionId]);

  return {
    isOpen,
    toggle,
    terminalOutput,
    copyCommand,
    isLoading,
  };
}

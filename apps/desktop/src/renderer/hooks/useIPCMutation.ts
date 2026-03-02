/**
 * useIPCMutation - IPC経由の更新操作共通Hook
 *
 * 4ビュー（SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard）で
 * 繰り返されるIPC更新パターン（mutate / isLoading / error）を共通化する。
 *
 * パターン:
 * 1. mutate呼び出し時にisLoadingをtrue
 * 2. エラー時にerrorメッセージをセット
 * 3. 成功時にデータを返す
 *
 * @module useIPCMutation
 */

import { useState, useCallback } from "react";

export interface UseIPCMutationReturn<TInput, TOutput> {
  /** 更新操作を実行する。成功時は結果を返し、失敗時はnullを返す */
  mutate: (input: TInput) => Promise<TOutput | null>;
  /** 操作中のローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ（正常時はnull） */
  error: string | null;
}

/**
 * IPC経由の更新操作共通Hook
 *
 * @param mutator - 更新関数（IPC呼び出し）
 * @returns mutate関数とローディング・エラー状態
 *
 * @example
 * ```tsx
 * const { mutate: saveChain, isLoading, error } = useIPCMutation(
 *   (chain: SkillChainDefinition) => window.electronAPI.skill.chainSave(chain)
 * );
 *
 * const result = await saveChain(myChain);
 * ```
 */
export function useIPCMutation<TInput, TOutput>(
  mutator: (input: TInput) => Promise<TOutput>,
): UseIPCMutationReturn<TInput, TOutput> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (input: TInput): Promise<TOutput | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await mutator(input);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "操作に失敗しました");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [mutator],
  );

  return { mutate, isLoading, error };
}

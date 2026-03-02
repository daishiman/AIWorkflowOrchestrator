/**
 * useChainList フック
 *
 * スキルチェーン一覧の取得・削除を管理するカスタムフック。
 * IPC経由でMain Processと通信し、ローカルステートで管理する。
 *
 * @module useChainList
 */

import { useState, useCallback, useEffect } from "react";
import type { SkillChainDefinition } from "@repo/shared/types/skill-chain";

export interface UseChainListReturn {
  /** チェーン一覧 */
  chains: SkillChainDefinition[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 一覧を再取得する */
  refetch: () => Promise<void>;
  /** チェーンを削除する */
  deleteChain: (chainId: string) => Promise<void>;
}

/**
 * スキルチェーン一覧管理フック
 *
 * - 初回マウント時にチェーン一覧を取得
 * - 削除後はローカルステートから即座に除外
 * - エラー時はメッセージをセット
 */
export function useChainList(): UseChainListReturn {
  const [chains, setChains] = useState<SkillChainDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChains = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.skill.chainList();
      setChains(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "チェーンの取得に失敗しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChains();
  }, [fetchChains]);

  const deleteChain = useCallback(async (chainId: string) => {
    await window.electronAPI.skill.chainDelete(chainId);
    setChains((prev) => prev.filter((c) => c.id !== chainId));
  }, []);

  return { chains, isLoading, error, refetch: fetchChains, deleteChain };
}

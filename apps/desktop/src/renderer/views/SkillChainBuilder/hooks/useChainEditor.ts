/**
 * useChainEditor フック
 *
 * スキルチェーンの編集状態を管理するカスタムフック。
 * ステップの追加・削除・並べ替え・保存・実行をサポート。
 *
 * @module useChainEditor
 */

import { useState, useCallback } from "react";
import type {
  SkillChainDefinition,
  SkillChainStep,
  SkillChainResult,
} from "@repo/shared/types/skill-chain";

export interface UseChainEditorReturn {
  /** 編集中のチェーン定義 */
  chain: SkillChainDefinition | null;
  /** 保存中かどうか */
  isSaving: boolean;
  /** 実行中かどうか */
  isExecuting: boolean;
  /** 実行結果 */
  executionResult: SkillChainResult | null;
  /** エラーメッセージ */
  error: string | null;
  /** チェーンを読み込む */
  loadChain: (chainId: string) => Promise<void>;
  /** チェーン名を更新する */
  updateName: (name: string) => void;
  /** チェーン説明を更新する */
  updateDescription: (description: string) => void;
  /** ステップを追加する */
  addStep: (step: SkillChainStep) => void;
  /** ステップを削除する */
  removeStep: (stepId: string) => void;
  /** ステップを並べ替える */
  moveStep: (fromIndex: number, toIndex: number) => void;
  /** 変数を更新する */
  updateVariable: (key: string, value: unknown) => void;
  /** 変数を削除する */
  removeVariable: (key: string) => void;
  /** チェーンを保存する */
  saveChain: () => Promise<void>;
  /** チェーンを実行する */
  executeChain: () => Promise<void>;
  /** 新規チェーンを初期化する */
  initNewChain: (name: string, description: string) => void;
}

/**
 * 空のチェーン定義を生成する
 */
function createEmptyChain(
  name: string,
  description: string,
): SkillChainDefinition {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    description,
    steps: [],
    variables: {},
    errorHandling: "stop",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * スキルチェーン編集管理フック
 */
export function useChainEditor(): UseChainEditorReturn {
  const [chain, setChain] = useState<SkillChainDefinition | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<SkillChainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadChain = useCallback(async (chainId: string) => {
    setError(null);
    try {
      const data = await window.electronAPI.skill.chainGet(chainId);
      setChain(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "チェーンの読み込みに失敗しました",
      );
    }
  }, []);

  const initNewChain = useCallback((name: string, description: string) => {
    setChain(createEmptyChain(name, description));
    setExecutionResult(null);
    setError(null);
  }, []);

  const updateName = useCallback((name: string) => {
    setChain((prev) => (prev ? { ...prev, name } : null));
  }, []);

  const updateDescription = useCallback((description: string) => {
    setChain((prev) => (prev ? { ...prev, description } : null));
  }, []);

  const addStep = useCallback((step: SkillChainStep) => {
    setChain((prev) =>
      prev ? { ...prev, steps: [...prev.steps, step] } : null,
    );
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setChain((prev) =>
      prev
        ? { ...prev, steps: prev.steps.filter((s) => s.stepId !== stepId) }
        : null,
    );
  }, []);

  const moveStep = useCallback((fromIndex: number, toIndex: number) => {
    setChain((prev) => {
      if (!prev) return null;
      const newSteps = [...prev.steps];
      const [moved] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, moved);
      return { ...prev, steps: newSteps };
    });
  }, []);

  const updateVariable = useCallback((key: string, value: unknown) => {
    setChain((prev) =>
      prev ? { ...prev, variables: { ...prev.variables, [key]: value } } : null,
    );
  }, []);

  const removeVariable = useCallback((key: string) => {
    setChain((prev) => {
      if (!prev) return null;
      const { [key]: _, ...rest } = prev.variables;
      return { ...prev, variables: rest };
    });
  }, []);

  const saveChain = useCallback(async () => {
    if (!chain) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await window.electronAPI.skill.chainSave({
        ...chain,
        updatedAt: new Date().toISOString(),
      });
      setChain(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "チェーンの保存に失敗しました",
      );
    } finally {
      setIsSaving(false);
    }
  }, [chain]);

  const executeChain = useCallback(async () => {
    if (!chain) return;
    setIsExecuting(true);
    setError(null);
    setExecutionResult(null);
    try {
      const result = await window.electronAPI.skill.chainExecute(chain.id);
      setExecutionResult(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "チェーンの実行に失敗しました",
      );
    } finally {
      setIsExecuting(false);
    }
  }, [chain]);

  return {
    chain,
    isSaving,
    isExecuting,
    executionResult,
    error,
    loadChain,
    updateName,
    updateDescription,
    addStep,
    removeStep,
    moveStep,
    updateVariable,
    removeVariable,
    saveChain,
    executeChain,
    initNewChain,
  };
}

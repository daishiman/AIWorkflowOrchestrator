/**
 * @file LLM設定プロバイダー
 * @description 選択されたLLMプロバイダー/モデル設定を取得する
 * @feature system-prompt-llm-api
 */

import type { LLMProviderId } from "@repo/shared/types/llm/schemas";

/**
 * 選択されたLLM設定
 */
export interface SelectedLLMConfig {
  /** プロバイダーID */
  providerId: LLMProviderId;
  /** モデルID */
  modelId: string;
}

// In-memory state for selected LLM config
let currentConfig: SelectedLLMConfig | null = null;

/**
 * 選択されたLLM設定を取得する
 * @returns 選択されたプロバイダーとモデルの設定、未選択の場合はnull
 */
export async function getSelectedLLMConfig(): Promise<SelectedLLMConfig | null> {
  return currentConfig;
}

/**
 * LLM設定を更新する
 * @param config 新しい設定
 */
export function setSelectedLLMConfig(config: SelectedLLMConfig | null): void {
  currentConfig = config;
}

/**
 * LLM設定をリセットする（主にテスト用）
 */
export function resetLLMConfig(): void {
  currentConfig = null;
}

/**
 * P62 対策: LLM Provider/Model 未選択時のカスタムエラー
 */
export class LLMConfigNotSelectedError extends Error {
  readonly code = "LLM_CONFIG_NOT_SELECTED" as const;

  constructor(message: string) {
    super(message);
    this.name = "LLMConfigNotSelectedError";
  }
}

/**
 * P62 対策: Provider/Model 未選択時に DEFAULT_CONFIG への暗黙 fallback を防止する。
 * LLM 呼び出し前の全エントリポイントで呼び出すこと。
 *
 * @throws {LLMConfigNotSelectedError} Provider/Model が未選択の場合
 * @returns 選択済みの LLM 設定（non-null 保証）
 */
export function assertNoSilentFallback(): SelectedLLMConfig {
  const config = currentConfig;
  if (config === null) {
    throw new LLMConfigNotSelectedError(
      "LLM Provider/Model が選択されていません。設定画面で選択してください。",
    );
  }
  return config;
}

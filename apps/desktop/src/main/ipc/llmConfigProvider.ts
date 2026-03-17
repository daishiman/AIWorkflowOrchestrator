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

// DEFAULT_CONFIG: 将来の参照用（現在は未使用）
// const DEFAULT_CONFIG: SelectedLLMConfig = {
//   providerId: "openai",
//   modelId: "gpt-4o",
// };

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

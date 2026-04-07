/**
 * buildHealthPolicy - LLMAdapterFactory から HealthPolicy を構築するユーティリティ
 *
 * UT-HEALTH-POLICY-RUNTIME-INJECTION-001
 *
 * 起動時に RuntimePolicyResolver へ注入する HealthPolicy を生成する。
 * HealthCheck 失敗時は unknown HealthPolicy にフォールバックし既存動作を維持する。
 */

import { resolveHealthPolicy, type HealthPolicy } from "@repo/shared/types";
import type { LLMProviderId } from "@repo/shared/types/llm/schemas";
import { LLMAdapterFactory } from "../../adapters/llm/LLMAdapterFactory";
import { getSelectedLLMConfig } from "../../ipc/llmConfigProvider";

/** HealthCheck 未実施時の unknown フォールバック */
const UNKNOWN_HEALTH_POLICY: HealthPolicy = resolveHealthPolicy({
  connectionStatus: "connected",
  isApiKeyValid: false,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: null,
});

/**
 * 現在選択中の LLM プロバイダーに対してヘルスチェックを実行し、
 * HealthPolicy を構築して返す。
 *
 * @param fallbackProviderId - LLM プロバイダー未選択時のフォールバック（デフォルト: "anthropic"）
 * @returns 構築した HealthPolicy（失敗時は unknown HealthPolicy）
 */
export async function buildHealthPolicy(
  fallbackProviderId: LLMProviderId = "anthropic",
): Promise<HealthPolicy> {
  try {
    const config = await getSelectedLLMConfig();
    const providerId = config?.providerId ?? fallbackProviderId;
    const adapter = await LLMAdapterFactory.getAdapter(providerId);
    const result = await adapter.checkHealth();

    return resolveHealthPolicy({
      connectionStatus: result.status,
      isApiKeyValid: result.status === "connected",
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: result,
    });
  } catch {
    return UNKNOWN_HEALTH_POLICY;
  }
}

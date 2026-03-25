import type { HealthCheckResult } from "@repo/shared/types/llm/schemas";
import type { HealthPolicy } from "@repo/shared/types";
import {
  resolveCapability,
  resolveCtaContract,
  resolveUiState,
  type AccessCapability,
  type BlockedInfo,
  type CtaContract,
  type UiState,
  type UiStateResult,
} from "@repo/shared/types/execution-capability";
import {
  MAINLINE_TERMINAL_COMMAND,
  getTerminalLauncherDisabledReason,
} from "../../utils/runtimeAccess";

export type MainlineHealthStatus = HealthCheckResult["status"] | null;

export interface MainlineExecutionAccessInput {
  apiKeyValid: boolean;
  subscriptionValid: boolean;
  /** @deprecated HealthPolicy.isDegraded を使用 */
  apiKeyDegraded?: boolean;
  isAuthenticated: boolean;
  hasResolutionAction?: boolean;
  selectedProviderName?: string;
  selectedModelName?: string;
  healthStatus?: HealthCheckResult;
  isLoading?: boolean;
  /** 統一 HealthPolicy（optional: 未指定時は既存動作を維持） */
  healthPolicy?: HealthPolicy;
}

export interface MainlineExecutionAccessState {
  capability: AccessCapability;
  uiState: UiState;
  blockedInfo?: BlockedInfo;
  ctaContract: CtaContract;
  isAuthenticated: boolean;
  selectedProviderName?: string;
  selectedModelName?: string;
  healthStatus: MainlineHealthStatus;
  suggestedTerminalCommand: string;
  launcherDisabled: boolean;
  launcherDisabledReason?: string;
  isLoading: boolean;
}

function toBlockedInfo(result: UiStateResult): BlockedInfo | undefined {
  if (result.uiState !== "blocked" || !result.blockedReason) {
    return undefined;
  }

  return {
    blockedReason: result.blockedReason,
    blockedAction: result.blockedAction?.label ?? "設定を開く",
  };
}

export function buildMainlineExecutionAccessState(
  input: MainlineExecutionAccessInput,
): MainlineExecutionAccessState {
  // HealthPolicy が渡された場合はそちらを優先（D-5）
  const isConnectionAvailable = input.healthPolicy
    ? input.healthPolicy.isConnectionAvailable
    : input.healthStatus?.status === "connected";

  const isDegraded = input.healthPolicy
    ? input.healthPolicy.isDegraded
    : (input.apiKeyDegraded ?? false);

  const capability = resolveCapability({
    apiKeyValid: input.apiKeyValid,
    subscriptionValid: input.subscriptionValid,
    apiKeyDegraded: isDegraded,
  });

  const uiResult = resolveUiState({
    capability,
    isConnectionAvailable: isConnectionAvailable ?? false,
    isTerminalAvailable:
      capability === "both" || capability === "terminalSurface",
    hasResolutionAction: input.hasResolutionAction ?? true,
  });
  const uiState = uiResult.uiState;
  const blockedInfo = toBlockedInfo(uiResult);
  const ctaContract = resolveCtaContract({
    capability,
    uiState,
    blockedAction:
      blockedInfo && uiResult.blockedAction
        ? uiResult.blockedAction
        : undefined,
  });

  const launcherDisabledReason = getTerminalLauncherDisabledReason(
    capability,
    input.isAuthenticated,
    input.isLoading ?? false,
  );
  const launcherDisabled = typeof launcherDisabledReason === "string";

  return {
    capability,
    uiState,
    blockedInfo,
    ctaContract,
    isAuthenticated: input.isAuthenticated,
    selectedProviderName: input.selectedProviderName,
    selectedModelName: input.selectedModelName,
    healthStatus: input.healthStatus?.status ?? null,
    suggestedTerminalCommand: MAINLINE_TERMINAL_COMMAND,
    launcherDisabled,
    launcherDisabledReason,
    isLoading: input.isLoading ?? false,
  };
}

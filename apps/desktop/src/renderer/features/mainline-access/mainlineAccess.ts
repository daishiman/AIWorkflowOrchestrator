import type { HealthCheckResult } from "@repo/shared/types/llm/schemas";
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
  apiKeyDegraded?: boolean;
  isAuthenticated: boolean;
  hasResolutionAction?: boolean;
  selectedProviderName?: string;
  selectedModelName?: string;
  healthStatus?: HealthCheckResult;
  isLoading?: boolean;
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
  const capability = resolveCapability({
    apiKeyValid: input.apiKeyValid,
    subscriptionValid: input.subscriptionValid,
    apiKeyDegraded: input.apiKeyDegraded,
  });

  const uiResult = resolveUiState({
    capability,
    isConnectionAvailable: input.healthStatus?.status === "connected",
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

import { useEffect, useRef, useState } from "react";
import { resolveHealthPolicy } from "@repo/shared/types";
import type { AuthMode } from "@repo/shared/types/auth-mode";
import {
  useCheckLLMHealth,
  useFetchProviders,
  useIsAuthenticated,
  useLLMHealthStatus,
  useSelectedLLMModel,
  useSelectedLLMProvider,
  useSelectedProviderId,
  useValidateAuthMode,
} from "../store";
import {
  buildMainlineExecutionAccessState,
  type MainlineExecutionAccessState,
} from "../features/mainline-access/mainlineAccess";

interface CredentialSnapshot {
  apiKeyValid: boolean;
  subscriptionValid: boolean;
  isLoading: boolean;
}

const INITIAL_CREDENTIAL_SNAPSHOT: CredentialSnapshot = {
  apiKeyValid: false,
  subscriptionValid: false,
  isLoading: true,
};

export interface UseMainlineExecutionAccessResult {
  access: MainlineExecutionAccessState;
  refreshHealth: () => void;
}

export function useMainlineExecutionAccess(): UseMainlineExecutionAccessResult {
  const isAuthenticated = useIsAuthenticated();
  const validateAuthMode = useValidateAuthMode();
  const fetchProviders = useFetchProviders();
  const selectedProviderId = useSelectedProviderId();
  const selectedProvider = useSelectedLLMProvider();
  const selectedModel = useSelectedLLMModel();
  const llmHealthStatus = useLLMHealthStatus();
  const checkHealth = useCheckLLMHealth();
  const [credentials, setCredentials] = useState<CredentialSnapshot>(
    INITIAL_CREDENTIAL_SNAPSHOT,
  );
  const previousProviderIdRef = useRef<string | null>(null);

  useEffect(() => {
    void fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    let isActive = true;

    const validateAllModes = async (): Promise<void> => {
      setCredentials((current) => ({ ...current, isLoading: true }));

      try {
        const modes: readonly AuthMode[] = ["api-key", "subscription"];
        const [apiKeyStatus, subscriptionStatus] = await Promise.all(
          modes.map((mode) => validateAuthMode(mode)),
        );

        if (!isActive) {
          return;
        }

        setCredentials({
          apiKeyValid: apiKeyStatus.hasCredentials,
          subscriptionValid: subscriptionStatus.hasCredentials,
          isLoading: false,
        });
      } catch {
        if (!isActive) {
          return;
        }

        setCredentials({
          apiKeyValid: false,
          subscriptionValid: false,
          isLoading: false,
        });
      }
    };

    void validateAllModes();

    return () => {
      isActive = false;
    };
  }, [validateAuthMode]);

  useEffect(() => {
    if (
      !selectedProviderId ||
      previousProviderIdRef.current === selectedProviderId
    ) {
      return;
    }

    previousProviderIdRef.current = selectedProviderId;
    void checkHealth(selectedProviderId);
  }, [checkHealth, selectedProviderId]);

  const refreshHealth = (): void => {
    if (!selectedProviderId) {
      return;
    }

    void checkHealth(selectedProviderId);
  };

  const selectedHealthStatus = selectedProviderId
    ? llmHealthStatus[selectedProviderId]
    : undefined;
  const healthPolicy = resolveHealthPolicy({
    connectionStatus: selectedHealthStatus?.status ?? "disconnected",
    isApiKeyValid: credentials.apiKeyValid,
    apiKeyDegraded: false,
    isRateLimited: false,
    lastHealthCheck: selectedHealthStatus ?? null,
  });

  return {
    access: buildMainlineExecutionAccessState({
      apiKeyValid: credentials.apiKeyValid,
      subscriptionValid: credentials.subscriptionValid,
      isAuthenticated,
      selectedProviderName: selectedProvider?.name,
      selectedModelName: selectedModel?.name,
      healthStatus: selectedHealthStatus,
      isLoading: credentials.isLoading,
      healthPolicy,
    }),
    refreshHealth,
  };
}

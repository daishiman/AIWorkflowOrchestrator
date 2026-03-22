import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMainlineExecutionAccess } from "./useMainlineExecutionAccess";

const mockValidateAuthMode = vi.fn();
const mockFetchProviders = vi.fn();
const mockCheckHealth = vi.fn();

let mockIsAuthenticated = true;
let mockSelectedProviderId: string | null = null;
let mockSelectedProvider: { name: string } | undefined;
let mockSelectedModel: { name: string } | undefined;
let mockLLMHealthStatus: Record<string, unknown> = {};

vi.mock("../store", () => ({
  useValidateAuthMode: () => mockValidateAuthMode,
  useFetchProviders: () => mockFetchProviders,
  useIsAuthenticated: () => mockIsAuthenticated,
  useLLMHealthStatus: () => mockLLMHealthStatus,
  useSelectedLLMModel: () => mockSelectedModel,
  useSelectedLLMProvider: () => mockSelectedProvider,
  useSelectedProviderId: () => mockSelectedProviderId,
  useCheckLLMHealth: () => mockCheckHealth,
}));

describe("useMainlineExecutionAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAuthenticated = true;
    mockSelectedProviderId = null;
    mockSelectedProvider = undefined;
    mockSelectedModel = undefined;
    mockLLMHealthStatus = {};
    mockFetchProviders.mockResolvedValue(undefined);
    mockCheckHealth.mockResolvedValue(undefined);
    mockValidateAuthMode.mockImplementation(async (mode: string) => ({
      hasCredentials: mode === "api-key" || mode === "subscription",
    }));
  });

  it("mount 時に provider 一覧を取得し、選択済み provider の health を再確認する", async () => {
    mockSelectedProviderId = "anthropic";
    mockSelectedProvider = { name: "Anthropic" };
    mockSelectedModel = { name: "Claude 3.7 Sonnet" };
    mockLLMHealthStatus = {
      anthropic: {
        status: "connected",
        providerId: "anthropic",
        checkedAt: new Date("2026-03-22T00:00:00Z"),
      },
    };

    const { result } = renderHook(() => useMainlineExecutionAccess());

    await waitFor(() => {
      expect(result.current.access.isLoading).toBe(false);
    });

    expect(mockFetchProviders).toHaveBeenCalledTimes(1);
    expect(mockCheckHealth).toHaveBeenCalledWith("anthropic");
    expect(result.current.access.capability).toBe("both");
    expect(result.current.access.healthStatus).toBe("connected");
  });

  it("API key provider が degraded なら subscription fallback を優先する", async () => {
    mockSelectedProviderId = "anthropic";
    mockSelectedProvider = { name: "Anthropic" };
    mockSelectedModel = { name: "Claude 3.7 Sonnet" };
    mockLLMHealthStatus = {
      anthropic: {
        status: "error",
        providerId: "anthropic",
        checkedAt: new Date("2026-03-22T00:00:00Z"),
      },
    };

    const { result } = renderHook(() => useMainlineExecutionAccess());

    await waitFor(() => {
      expect(result.current.access.isLoading).toBe(false);
    });

    expect(result.current.access.capability).toBe("terminalSurface");
    expect(result.current.access.launcherDisabled).toBe(false);

    result.current.refreshHealth();
    expect(mockCheckHealth).toHaveBeenCalledTimes(2);
  });
});

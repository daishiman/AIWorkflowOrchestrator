/**
 * LLMSelectorPanel Component Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-UI-004: LLMSelectorPanel - 統合パネル
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Component to be implemented
import { LLMSelectorPanel } from "../LLMSelectorPanel";

// Types
import type {
  LLMProvider,
  HealthCheckResult,
  LLMError,
} from "@repo/shared/types/llm";

// Mock functions
const mockFetchProviders = vi.fn();
const mockSelectProvider = vi.fn();
const mockSelectModel = vi.fn();
const mockCheckHealth = vi.fn();

// Mock data for providers
const defaultMockProviders: LLMProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    isAvailable: true,
    models: [
      { id: "gpt-4o", name: "GPT-4o", isDefault: true },
      { id: "gpt-4", name: "GPT-4", isDefault: false },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    isAvailable: true,
    models: [
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", isDefault: true },
    ],
  },
];

const defaultMockHealthStatus: Record<string, HealthCheckResult> = {
  openai: {
    status: "connected",
    providerId: "openai",
    latency: 150,
    checkedAt: new Date(),
  },
};

// Default mock state values
let mockProvidersValue = defaultMockProviders;
let mockSelectedProviderIdValue: string | null = null;
let mockSelectedModelIdValue: string | null = null;
let mockIsLoadingValue = false;
let mockErrorValue: LLMError | null = null;
let mockHealthStatusValue = defaultMockHealthStatus;

// Store mock - 個別セレクタ対応（P31対策）
vi.mock("@/renderer/store", () => ({
  // 状態セレクタ
  useLLMProviders: vi.fn(() => mockProvidersValue),
  useSelectedProviderId: vi.fn(() => mockSelectedProviderIdValue),
  useSelectedModelId: vi.fn(() => mockSelectedModelIdValue),
  useLLMIsLoading: vi.fn(() => mockIsLoadingValue),
  useLLMError: vi.fn(() => mockErrorValue),
  useLLMHealthStatus: vi.fn(() => mockHealthStatusValue),
  // アクションセレクタ
  useFetchProviders: vi.fn(() => mockFetchProviders),
  useSelectProvider: vi.fn(() => mockSelectProvider),
  useSelectModel: vi.fn(() => mockSelectModel),
  useCheckLLMHealth: vi.fn(() => mockCheckHealth),
  // 非推奨の合成Hook（後方互換性）
  useLLMStore: vi.fn(() => ({
    providers: mockProvidersValue,
    selectedProviderId: mockSelectedProviderIdValue,
    selectedModelId: mockSelectedModelIdValue,
    isLoading: mockIsLoadingValue,
    error: mockErrorValue,
    healthStatus: mockHealthStatusValue,
    fetchProviders: mockFetchProviders,
    selectProvider: mockSelectProvider,
    selectModel: mockSelectModel,
    checkHealth: mockCheckHealth,
  })),
}));

import {
  useLLMProviders,
  useSelectedProviderId,
  useLLMIsLoading,
  useLLMError,
  useLLMHealthStatus,
} from "@/renderer/store";

// Helper to update mock values
const setMockValues = (overrides: {
  providers?: LLMProvider[];
  selectedProviderId?: string | null;
  selectedModelId?: string | null;
  isLoading?: boolean;
  error?: LLMError | null;
  healthStatus?: Record<string, HealthCheckResult>;
}) => {
  if (overrides.providers !== undefined)
    mockProvidersValue = overrides.providers;
  if (overrides.selectedProviderId !== undefined)
    mockSelectedProviderIdValue = overrides.selectedProviderId;
  if (overrides.selectedModelId !== undefined)
    mockSelectedModelIdValue = overrides.selectedModelId;
  if (overrides.isLoading !== undefined)
    mockIsLoadingValue = overrides.isLoading;
  if (overrides.error !== undefined) mockErrorValue = overrides.error;
  if (overrides.healthStatus !== undefined)
    mockHealthStatusValue = overrides.healthStatus;

  // Update individual selector mocks
  vi.mocked(useLLMProviders).mockReturnValue(mockProvidersValue);
  vi.mocked(useSelectedProviderId).mockReturnValue(mockSelectedProviderIdValue);
  vi.mocked(useLLMIsLoading).mockReturnValue(mockIsLoadingValue);
  vi.mocked(useLLMError).mockReturnValue(mockErrorValue);
  vi.mocked(useLLMHealthStatus).mockReturnValue(mockHealthStatusValue);
};

describe("LLMSelectorPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default values
    mockProvidersValue = defaultMockProviders;
    mockSelectedProviderIdValue = null;
    mockSelectedModelIdValue = null;
    mockIsLoadingValue = false;
    mockErrorValue = null;
    mockHealthStatusValue = defaultMockHealthStatus;

    // Reset individual selector mocks
    vi.mocked(useLLMProviders).mockReturnValue(mockProvidersValue);
    vi.mocked(useSelectedProviderId).mockReturnValue(
      mockSelectedProviderIdValue,
    );
    vi.mocked(useLLMIsLoading).mockReturnValue(mockIsLoadingValue);
    vi.mocked(useLLMError).mockReturnValue(mockErrorValue);
    vi.mocked(useLLMHealthStatus).mockReturnValue(mockHealthStatusValue);
  });

  describe("UI-017: 統合パネルレンダリング", () => {
    it("should render all three components", () => {
      // Provider must be selected to show model combobox
      setMockValues({ selectedProviderId: "openai" });

      render(<LLMSelectorPanel />);

      // ProviderSelector
      expect(
        screen.getByRole("combobox", { name: /provider/i }),
      ).toBeInTheDocument();

      // ModelSelector (requires provider to be selected)
      expect(
        screen.getByRole("combobox", { name: /model/i }),
      ).toBeInTheDocument();

      // HealthIndicator
      expect(screen.getByTestId("health-indicator")).toBeInTheDocument();
    });
  });

  describe("UI-018: マウント時fetchProviders呼び出し", () => {
    it("should call fetchProviders on mount", async () => {
      render(<LLMSelectorPanel />);

      await waitFor(() => {
        expect(mockFetchProviders).toHaveBeenCalledTimes(1);
      });
    });

    it("should not call fetchProviders multiple times on re-render", async () => {
      const { rerender } = render(<LLMSelectorPanel />);

      await waitFor(() => {
        expect(mockFetchProviders).toHaveBeenCalledTimes(1);
      });

      rerender(<LLMSelectorPanel />);

      // Should still be 1
      expect(mockFetchProviders).toHaveBeenCalledTimes(1);
    });
  });

  describe("UI-019: ローディングオーバーレイ", () => {
    it("should display loading overlay when isLoading is true", () => {
      setMockValues({ isLoading: true });

      render(<LLMSelectorPanel />);

      expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
    });

    it("should disable all selectors during loading", () => {
      setMockValues({ selectedProviderId: "openai", isLoading: true });

      render(<LLMSelectorPanel />);

      const providerSelector = screen.getByRole("combobox", {
        name: /provider/i,
      });
      const modelSelector = screen.getByRole("combobox", { name: /model/i });

      expect(providerSelector).toBeDisabled();
      expect(modelSelector).toBeDisabled();
    });
  });

  describe("UI-020: エラー表示", () => {
    it("should display error message when error exists", () => {
      const error: LLMError = {
        code: "NETWORK_ERROR",
        message: "Failed to fetch providers",
        retryable: true,
      };

      setMockValues({ error });

      render(<LLMSelectorPanel />);

      expect(
        screen.getByText(/Failed to fetch providers/i),
      ).toBeInTheDocument();
    });
  });

  describe("UI-021: リトライボタン表示", () => {
    it("should display retry button when error is retryable", () => {
      const error: LLMError = {
        code: "NETWORK_ERROR",
        message: "Failed to fetch providers",
        retryable: true,
      };

      setMockValues({ error });

      render(<LLMSelectorPanel />);

      expect(
        screen.getByRole("button", { name: /リトライ/i }),
      ).toBeInTheDocument();
    });

    it("should not display retry button when error is not retryable", () => {
      const error: LLMError = {
        code: "API_KEY_INVALID",
        message: "Invalid API key",
        retryable: false,
      };

      setMockValues({ error });

      render(<LLMSelectorPanel />);

      expect(
        screen.queryByRole("button", { name: /リトライ/i }),
      ).not.toBeInTheDocument();
    });

    it("should call fetchProviders when retry button is clicked", async () => {
      const error: LLMError = {
        code: "NETWORK_ERROR",
        message: "Failed to fetch providers",
        retryable: true,
      };

      setMockValues({ error });

      render(<LLMSelectorPanel />);

      const retryButton = screen.getByRole("button", { name: /リトライ/i });
      await userEvent.click(retryButton);

      // Initial call + retry = 2 calls
      expect(mockFetchProviders).toHaveBeenCalledTimes(2);
    });
  });

  describe("Provider Selection Integration", () => {
    it("should call selectProvider when provider is selected", async () => {
      setMockValues({ selectedProviderId: null });

      render(<LLMSelectorPanel />);

      const providerSelector = screen.getByRole("combobox", {
        name: /provider/i,
      });
      await userEvent.click(providerSelector);
      await userEvent.click(screen.getByRole("option", { name: /openai/i }));

      expect(mockSelectProvider).toHaveBeenCalledWith("openai");
    });
  });

  describe("Model Selection Integration", () => {
    it("should disable ModelSelector when no provider selected", () => {
      setMockValues({ selectedProviderId: null });

      render(<LLMSelectorPanel />);

      // When no provider is selected, ModelSelector shows placeholder text instead of combobox
      expect(screen.getByText(/先にプロバイダーを選択/i)).toBeInTheDocument();
    });

    it("should enable ModelSelector when provider is selected", () => {
      setMockValues({ selectedProviderId: "openai" });

      render(<LLMSelectorPanel />);

      const modelSelector = screen.getByRole("combobox", { name: /model/i });
      expect(modelSelector).not.toBeDisabled();
    });

    it("should call selectModel when model is selected", async () => {
      setMockValues({ selectedProviderId: "openai" });

      render(<LLMSelectorPanel />);

      const modelSelector = screen.getByRole("combobox", { name: /model/i });
      await userEvent.click(modelSelector);
      await userEvent.click(screen.getByRole("option", { name: /gpt-4o/i }));

      expect(mockSelectModel).toHaveBeenCalledWith("gpt-4o");
    });
  });

  describe("Health Check Integration", () => {
    it("should call checkHealth when refresh is clicked", async () => {
      setMockValues({ selectedProviderId: "openai" });

      render(<LLMSelectorPanel />);

      const refreshButton = screen.getByRole("button", { name: /refresh/i });
      await userEvent.click(refreshButton);

      expect(mockCheckHealth).toHaveBeenCalledWith("openai");
    });

    it("should display health status for selected provider", () => {
      setMockValues({ selectedProviderId: "openai" });

      render(<LLMSelectorPanel />);

      const indicator = screen.getByTestId("health-indicator");
      expect(indicator).toHaveClass("bg-green-500");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA landmarks", () => {
      render(<LLMSelectorPanel />);

      expect(screen.getByRole("group", { name: /llm/i })).toBeInTheDocument();
    });
  });

  describe("無限ループ防止（P31対策）", () => {
    it("TC-LLM-004: propsの変更で再レンダリングしても無限ループしない", async () => {
      // Props を変更して再レンダリングしても fetchProviders は1回のみ
      const { rerender } = render(<LLMSelectorPanel compact={false} />);

      await waitFor(() => {
        expect(mockFetchProviders).toHaveBeenCalledTimes(1);
      });

      // compact プロパティを変更
      rerender(<LLMSelectorPanel compact={true} />);
      expect(mockFetchProviders).toHaveBeenCalledTimes(1);

      // className プロパティを変更
      rerender(<LLMSelectorPanel compact={true} className="custom-class" />);
      expect(mockFetchProviders).toHaveBeenCalledTimes(1);

      // isVisible プロパティを変更
      rerender(<LLMSelectorPanel isVisible={true} />);
      expect(mockFetchProviders).toHaveBeenCalledTimes(1);
    });

    it("TC-LLM-007: 同じプロバイダーを再選択してもcheckHealthは再呼び出しされない", async () => {
      // 最初から openai が選択されている状態
      setMockValues({ selectedProviderId: "openai" });

      const { rerender } = render(<LLMSelectorPanel />);

      // 初期レンダリングで checkHealth が呼ばれる
      await waitFor(() => {
        expect(mockCheckHealth).toHaveBeenCalledWith("openai");
      });
      const initialCallCount = mockCheckHealth.mock.calls.length;

      // 同じ selectedProviderId で再レンダリング
      rerender(<LLMSelectorPanel />);

      // checkHealth は追加で呼ばれない
      expect(mockCheckHealth).toHaveBeenCalledTimes(initialCallCount);

      // props が変わっても selectedProviderId が同じなら呼ばれない
      rerender(<LLMSelectorPanel compact={true} />);
      expect(mockCheckHealth).toHaveBeenCalledTimes(initialCallCount);
    });

    it("TC-LLM-008: providerIdが変わった場合のみcheckHealthが呼ばれる", async () => {
      // 最初は openai
      setMockValues({ selectedProviderId: "openai" });

      const { rerender } = render(<LLMSelectorPanel />);

      await waitFor(() => {
        expect(mockCheckHealth).toHaveBeenCalledWith("openai");
      });
      expect(mockCheckHealth).toHaveBeenCalledTimes(1);

      // anthropic に変更
      setMockValues({ selectedProviderId: "anthropic" });

      rerender(<LLMSelectorPanel />);

      await waitFor(() => {
        expect(mockCheckHealth).toHaveBeenCalledWith("anthropic");
      });
      expect(mockCheckHealth).toHaveBeenCalledTimes(2);
    });
  });
});

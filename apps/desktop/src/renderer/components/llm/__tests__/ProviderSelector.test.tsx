/**
 * ProviderSelector Component Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-UI-001: ProviderSelector - プロバイダー一覧表示
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Component to be implemented
import { ProviderSelector } from "../ProviderSelector";

// Types
import type { LLMProvider } from "@repo/shared/types/llm";

// Mock data
const mockProviders: LLMProvider[] = [
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
    isAvailable: false,
    models: [
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", isDefault: true },
    ],
  },
  {
    id: "google",
    name: "Google AI",
    isAvailable: true,
    models: [{ id: "gemini-pro", name: "Gemini Pro", isDefault: true }],
  },
];

describe("ProviderSelector", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UI-001: プロバイダー一覧表示", () => {
    it("should render all providers in the dropdown", async () => {
      render(
        <ProviderSelector
          providers={mockProviders}
          selectedProviderId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />,
      );

      // Open dropdown
      const selector = screen.getByRole("combobox", { name: /provider/i });
      await userEvent.click(selector);

      // Verify all providers are listed
      expect(screen.getByText("OpenAI")).toBeInTheDocument();
      expect(screen.getByText("Anthropic")).toBeInTheDocument();
      expect(screen.getByText("Google AI")).toBeInTheDocument();
    });
  });

  describe("UI-002: 有効プロバイダーのみ選択可能", () => {
    it("should disable unavailable providers", async () => {
      render(
        <ProviderSelector
          providers={mockProviders}
          selectedProviderId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /provider/i });
      await userEvent.click(selector);

      // OpenAI should be enabled (isAvailable: true)
      const openaiOption = screen.getByRole("option", { name: /openai/i });
      expect(openaiOption).not.toHaveAttribute("aria-disabled", "true");

      // Anthropic should be disabled (isAvailable: false)
      const anthropicOption = screen.getByRole("option", {
        name: /anthropic/i,
      });
      expect(anthropicOption).toHaveAttribute("aria-disabled", "true");
    });

    it("should not trigger onSelect for disabled providers", async () => {
      render(
        <ProviderSelector
          providers={mockProviders}
          selectedProviderId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /provider/i });
      await userEvent.click(selector);

      // Try to select disabled Anthropic
      const anthropicOption = screen.getByRole("option", {
        name: /anthropic/i,
      });
      await userEvent.click(anthropicOption);

      // onSelect should not be called
      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe("UI-003: プロバイダー選択イベント発火", () => {
    it("should call onSelect with providerId when selecting a provider", async () => {
      render(
        <ProviderSelector
          providers={mockProviders}
          selectedProviderId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /provider/i });
      await userEvent.click(selector);

      const openaiOption = screen.getByRole("option", { name: /openai/i });
      await userEvent.click(openaiOption);

      expect(mockOnSelect).toHaveBeenCalledWith("openai");
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("UI-004: 選択状態の表示", () => {
    it("should display the selected provider", () => {
      render(
        <ProviderSelector
          providers={mockProviders}
          selectedProviderId="openai"
          onSelect={mockOnSelect}
          isLoading={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /provider/i });
      expect(selector).toHaveTextContent("OpenAI");
    });
  });

  describe("UI-005: 空の状態表示", () => {
    it("should display empty message when no providers available", () => {
      render(
        <ProviderSelector
          providers={[]}
          selectedProviderId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />,
      );

      expect(screen.getByText(/プロバイダーがありません/i)).toBeInTheDocument();
    });
  });

  describe("UI-006: ローディング状態", () => {
    it("should show loading spinner when isLoading is true", () => {
      render(
        <ProviderSelector
          providers={mockProviders}
          selectedProviderId={null}
          onSelect={mockOnSelect}
          isLoading={true}
        />,
      );

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should disable selector when loading", () => {
      render(
        <ProviderSelector
          providers={mockProviders}
          selectedProviderId={null}
          onSelect={mockOnSelect}
          isLoading={true}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /provider/i });
      expect(selector).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible label", () => {
      render(
        <ProviderSelector
          providers={mockProviders}
          selectedProviderId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /provider/i });
      expect(selector).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      render(
        <ProviderSelector
          providers={mockProviders}
          selectedProviderId={null}
          onSelect={mockOnSelect}
          isLoading={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /provider/i });

      // Focus and open with Enter
      selector.focus();
      await userEvent.keyboard("{Enter}");

      // Navigate with arrow keys - skip disabled Anthropic (index 1) to Google (index 2)
      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{Enter}");

      // Should select Google (available provider at index 2)
      expect(mockOnSelect).toHaveBeenCalledWith("google");
    });
  });
});

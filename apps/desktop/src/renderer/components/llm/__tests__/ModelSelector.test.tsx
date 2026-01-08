/**
 * ModelSelector Component Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-UI-002: ModelSelector - モデル選択
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Component to be implemented
import { ModelSelector } from "../ModelSelector";

// Types
import type { LLMModel } from "@repo/shared/types/llm";

// Mock data
const mockModels: LLMModel[] = [
  { id: "gpt-4o", name: "GPT-4o", isDefault: true, contextWindow: 128000 },
  { id: "gpt-4", name: "GPT-4", isDefault: false, contextWindow: 8192 },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    isDefault: false,
    contextWindow: 16385,
  },
];

describe("ModelSelector", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("UI-007: モデル一覧表示", () => {
    it("should render all models in the dropdown", async () => {
      render(
        <ModelSelector
          models={mockModels}
          selectedModelId={null}
          onSelect={mockOnSelect}
          disabled={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /model/i });
      await userEvent.click(selector);

      // Model names appear in both button and dropdown, use getAllByText
      expect(screen.getAllByText("GPT-4o").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("GPT-4").length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByText("GPT-3.5 Turbo").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe("UI-008: デフォルトモデル選択", () => {
    it("should select the default model initially", () => {
      render(
        <ModelSelector
          models={mockModels}
          selectedModelId={null}
          onSelect={mockOnSelect}
          disabled={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /model/i });
      // Default model (GPT-4o) should be displayed
      expect(selector).toHaveTextContent("GPT-4o");
    });

    it("should display selectedModelId if provided", () => {
      render(
        <ModelSelector
          models={mockModels}
          selectedModelId="gpt-4"
          onSelect={mockOnSelect}
          disabled={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /model/i });
      expect(selector).toHaveTextContent("GPT-4");
    });
  });

  describe("UI-009: モデル選択イベント発火", () => {
    it("should call onSelect with modelId when selecting a model", async () => {
      render(
        <ModelSelector
          models={mockModels}
          selectedModelId="gpt-4o"
          onSelect={mockOnSelect}
          disabled={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /model/i });
      await userEvent.click(selector);

      const gpt4Option = screen.getByRole("option", { name: /gpt-4(?!o)/i });
      await userEvent.click(gpt4Option);

      expect(mockOnSelect).toHaveBeenCalledWith("gpt-4");
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe("UI-010: プロバイダー未選択時", () => {
    it("should be disabled when disabled prop is true", () => {
      render(
        <ModelSelector
          models={mockModels}
          selectedModelId={null}
          onSelect={mockOnSelect}
          disabled={true}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /model/i });
      expect(selector).toBeDisabled();
    });

    it("should show placeholder text when disabled", () => {
      render(
        <ModelSelector
          models={[]}
          selectedModelId={null}
          onSelect={mockOnSelect}
          disabled={true}
        />,
      );

      expect(screen.getByText(/先にプロバイダーを選択/i)).toBeInTheDocument();
    });
  });

  describe("UI-011: 空モデル一覧", () => {
    it("should display empty message when no models available", () => {
      render(
        <ModelSelector
          models={[]}
          selectedModelId={null}
          onSelect={mockOnSelect}
          disabled={false}
        />,
      );

      expect(screen.getByText(/モデルがありません/i)).toBeInTheDocument();
    });
  });

  describe("Model Information Display", () => {
    it("should display context window information if available", async () => {
      render(
        <ModelSelector
          models={mockModels}
          selectedModelId={null}
          onSelect={mockOnSelect}
          disabled={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /model/i });
      await userEvent.click(selector);

      // Check if context window is displayed (optional based on design)
      expect(screen.getByText(/128k/i)).toBeInTheDocument();
    });

    it("should mark default model with indicator", async () => {
      render(
        <ModelSelector
          models={mockModels}
          selectedModelId={null}
          onSelect={mockOnSelect}
          disabled={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /model/i });
      await userEvent.click(selector);

      // Default model should have visual indicator
      const defaultOption = screen.getByRole("option", { name: /gpt-4o/i });
      expect(defaultOption).toHaveAttribute("data-default", "true");
    });
  });

  describe("Accessibility", () => {
    it("should have accessible label", () => {
      render(
        <ModelSelector
          models={mockModels}
          selectedModelId={null}
          onSelect={mockOnSelect}
          disabled={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /model/i });
      expect(selector).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      render(
        <ModelSelector
          models={mockModels}
          selectedModelId={null}
          onSelect={mockOnSelect}
          disabled={false}
        />,
      );

      const selector = screen.getByRole("combobox", { name: /model/i });
      selector.focus();

      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{Enter}");

      expect(mockOnSelect).toHaveBeenCalled();
    });
  });
});

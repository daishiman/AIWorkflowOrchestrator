/**
 * LLMGuidanceBanner テスト
 *
 * TC-1: 表示/非表示制御
 * TC-2: バナーコンテンツ
 * TC-3: インタラクション
 *
 * P39 準拠: happy-dom 環境では fireEvent を使用（userEvent 使用禁止）
 * P31 準拠: 個別セレクタ（useSelectedModelId / useSelectedProviderId）を使用
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MODEL_SELECTION_GUIDANCE } from "@/renderer/guidance/modelSelectionGuidance";

// ---------------------------------------------------------------------------
// Mock: store 個別セレクタ
// ---------------------------------------------------------------------------
const mockUseSelectedModelId = vi.fn<[], string | null>(() => null);
const mockUseSelectedProviderId = vi.fn<[], string | null>(() => null);

vi.mock("@/renderer/store", () => ({
  useSelectedModelId: () => mockUseSelectedModelId(),
  useSelectedProviderId: () => mockUseSelectedProviderId(),
}));

// ---------------------------------------------------------------------------
// Import: テスト対象
// ---------------------------------------------------------------------------
import { LLMGuidanceBanner } from "../LLMGuidanceBanner";

describe("LLMGuidanceBanner", () => {
  const mockOnNavigateToSettings = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelectedModelId.mockReturnValue(null);
    mockUseSelectedProviderId.mockReturnValue(null);
  });

  // =========================================================================
  // TC-1: 表示/非表示制御
  // =========================================================================
  describe("TC-1: 表示/非表示制御", () => {
    it("TC-1-1: モデル未選択時にバナーが表示される", () => {
      mockUseSelectedModelId.mockReturnValue(null);
      mockUseSelectedProviderId.mockReturnValue(null);

      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("TC-1-2: modelIdのみ未選択でバナーが表示される", () => {
      mockUseSelectedModelId.mockReturnValue(null);
      mockUseSelectedProviderId.mockReturnValue("provider-1");

      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("TC-1-3: providerIdのみ未選択でバナーが表示される", () => {
      mockUseSelectedModelId.mockReturnValue("model-1");
      mockUseSelectedProviderId.mockReturnValue(null);

      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("TC-1-4: 両方選択済みの場合バナーが表示されない", () => {
      mockUseSelectedModelId.mockReturnValue("model-1");
      mockUseSelectedProviderId.mockReturnValue("provider-1");

      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("TC-1-5: 未選択→選択に変わった場合バナーが消える", () => {
      mockUseSelectedModelId.mockReturnValue(null);
      mockUseSelectedProviderId.mockReturnValue(null);

      const { rerender } = render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();

      mockUseSelectedModelId.mockReturnValue("model-1");
      mockUseSelectedProviderId.mockReturnValue("provider-1");

      rerender(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // TC-2: バナーコンテンツ
  // =========================================================================
  describe("TC-2: バナーコンテンツ", () => {
    it("TC-2-1: バナーに警告メッセージが表示される", () => {
      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(
        screen.getByText(MODEL_SELECTION_GUIDANCE.message),
      ).toBeInTheDocument();
    });

    it("TC-2-2: バナーに設定画面へのボタンが存在する", () => {
      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(
        screen.getByRole("button", {
          name: MODEL_SELECTION_GUIDANCE.actionAriaLabel,
        }),
      ).toBeInTheDocument();
    });

    it('TC-2-3: バナーに role="alert" が設定されている', () => {
      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // TC-3: インタラクション
  // =========================================================================
  describe("TC-3: インタラクション", () => {
    it("TC-3-1: 設定ボタンクリックで onNavigateToSettings が呼ばれる", () => {
      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      const button = screen.getByRole("button", {
        name: MODEL_SELECTION_GUIDANCE.actionAriaLabel,
      });
      fireEvent.click(button);
      expect(mockOnNavigateToSettings).toHaveBeenCalledTimes(1);
    });

    it("TC-3-2: ボタンがキーボードフォーカス可能である", () => {
      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      const button = screen.getByRole("button", {
        name: MODEL_SELECTION_GUIDANCE.actionAriaLabel,
      });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  // =========================================================================
  // TC-6: 境界値テスト
  // =========================================================================
  describe("TC-6: 境界値テスト", () => {
    it("TC-6-1: selectedModelId が空文字列の場合バナーが非表示（非null値として扱う）", () => {
      mockUseSelectedModelId.mockReturnValue("");
      mockUseSelectedProviderId.mockReturnValue("provider-1");

      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("TC-6-2: selectedModelId が undefined の場合バナーが表示される", () => {
      mockUseSelectedModelId.mockReturnValue(undefined as unknown as null);
      mockUseSelectedProviderId.mockReturnValue("provider-1");

      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("TC-6-3: 両方 undefined の場合バナーが表示される", () => {
      mockUseSelectedModelId.mockReturnValue(undefined as unknown as null);
      mockUseSelectedProviderId.mockReturnValue(undefined as unknown as null);

      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  // =========================================================================
  // TC-7: アクセシビリティ追加テスト
  // =========================================================================
  describe("TC-7: アクセシビリティ追加テスト", () => {
    it("TC-7-1: バナーのボタンに aria-label が設定されている", () => {
      render(
        <LLMGuidanceBanner onNavigateToSettings={mockOnNavigateToSettings} />,
      );
      const button = screen.getByRole("button", {
        name: MODEL_SELECTION_GUIDANCE.actionAriaLabel,
      });
      expect(button).toHaveAttribute("aria-label");
    });
  });
});

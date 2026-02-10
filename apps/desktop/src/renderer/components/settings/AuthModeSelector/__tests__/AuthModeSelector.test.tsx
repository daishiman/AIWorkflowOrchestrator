/**
 * AuthModeSelector コンポーネントテスト
 *
 * Phase 5: TDD Green - 認証方式選択UIのテスト
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/ui-wireframe.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthModeSelector } from "../index";

// =============================================================================
// テストスイート
// =============================================================================

describe("AuthModeSelector", () => {
  const defaultProps = {
    currentMode: "subscription" as const,
    onModeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // レンダリングテスト
  // ===========================================================================
  describe("Rendering", () => {
    it("サブスクリプションオプションがレンダリングされる", () => {
      render(<AuthModeSelector {...defaultProps} />);

      expect(screen.getByText("サブスクリプション")).toBeInTheDocument();
    });

    it("APIキーオプションがレンダリングされる", () => {
      render(<AuthModeSelector {...defaultProps} />);

      expect(screen.getByText("APIキー")).toBeInTheDocument();
    });

    it("radiogroupロールでレンダリングされる", () => {
      render(<AuthModeSelector {...defaultProps} />);

      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("各オプションにradioロールが設定される", () => {
      render(<AuthModeSelector {...defaultProps} />);

      const radios = screen.getAllByRole("radio");
      expect(radios).toHaveLength(2);
    });
  });

  // ===========================================================================
  // 選択状態テスト
  // ===========================================================================
  describe("Selection State", () => {
    it("currentModeがsubscriptionの場合、サブスクリプションが選択状態になる", () => {
      render(<AuthModeSelector {...defaultProps} currentMode="subscription" />);

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      expect(subscriptionButton).toHaveAttribute("aria-checked", "true");
    });

    it("currentModeがapi-keyの場合、APIキーが選択状態になる", () => {
      render(<AuthModeSelector {...defaultProps} currentMode="api-key" />);

      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");
      expect(apiKeyButton).toHaveAttribute("aria-checked", "true");
    });

    it("選択されているオプションはtabIndex=0", () => {
      render(<AuthModeSelector {...defaultProps} currentMode="subscription" />);

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");

      expect(subscriptionButton).toHaveAttribute("tabIndex", "0");
      expect(apiKeyButton).toHaveAttribute("tabIndex", "-1");
    });
  });

  // ===========================================================================
  // クリックインタラクションテスト
  // ===========================================================================
  describe("Click Interaction", () => {
    it("異なるオプションをクリックするとonModeChangeが呼ばれる", async () => {
      const onModeChange = vi.fn();
      render(
        <AuthModeSelector
          {...defaultProps}
          currentMode="subscription"
          onModeChange={onModeChange}
        />,
      );

      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");
      await userEvent.click(apiKeyButton);

      expect(onModeChange).toHaveBeenCalledWith("api-key");
    });

    it("同じオプションをクリックしてもonModeChangeは呼ばれない", async () => {
      const onModeChange = vi.fn();
      render(
        <AuthModeSelector
          {...defaultProps}
          currentMode="subscription"
          onModeChange={onModeChange}
        />,
      );

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      await userEvent.click(subscriptionButton);

      expect(onModeChange).not.toHaveBeenCalled();
    });

    it("disabled状態ではクリックしてもonModeChangeは呼ばれない", async () => {
      const onModeChange = vi.fn();
      render(
        <AuthModeSelector
          {...defaultProps}
          currentMode="subscription"
          onModeChange={onModeChange}
          disabled
        />,
      );

      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");
      await userEvent.click(apiKeyButton);

      expect(onModeChange).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // キーボードインタラクションテスト
  // ===========================================================================
  describe("Keyboard Interaction", () => {
    it("ArrowRightで次のオプションにフォーカスが移動する", async () => {
      render(<AuthModeSelector {...defaultProps} currentMode="subscription" />);

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      subscriptionButton.focus();

      fireEvent.keyDown(subscriptionButton, { key: "ArrowRight" });

      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");
      expect(document.activeElement).toBe(apiKeyButton);
    });

    it("ArrowLeftで前のオプションにフォーカスが移動する", async () => {
      render(<AuthModeSelector {...defaultProps} currentMode="api-key" />);

      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");
      apiKeyButton.focus();

      fireEvent.keyDown(apiKeyButton, { key: "ArrowLeft" });

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      expect(document.activeElement).toBe(subscriptionButton);
    });

    it("Enterで現在フォーカスしているオプションを選択する", async () => {
      const onModeChange = vi.fn();
      render(
        <AuthModeSelector
          {...defaultProps}
          currentMode="subscription"
          onModeChange={onModeChange}
        />,
      );

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      subscriptionButton.focus();

      // まずフォーカスを移動
      fireEvent.keyDown(subscriptionButton, { key: "ArrowRight" });

      // 次にEnterで選択
      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");
      fireEvent.keyDown(apiKeyButton, { key: "Enter" });

      expect(onModeChange).toHaveBeenCalledWith("api-key");
    });

    it("Spaceで現在フォーカスしているオプションを選択する", async () => {
      const onModeChange = vi.fn();
      render(
        <AuthModeSelector
          {...defaultProps}
          currentMode="subscription"
          onModeChange={onModeChange}
        />,
      );

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      subscriptionButton.focus();

      // まずフォーカスを移動
      fireEvent.keyDown(subscriptionButton, { key: "ArrowRight" });

      // 次にSpaceで選択
      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");
      fireEvent.keyDown(apiKeyButton, { key: " " });

      expect(onModeChange).toHaveBeenCalledWith("api-key");
    });

    it("フォーカスがラップアラウンドする（最後から最初へ）", async () => {
      render(<AuthModeSelector {...defaultProps} currentMode="api-key" />);

      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");
      apiKeyButton.focus();

      fireEvent.keyDown(apiKeyButton, { key: "ArrowRight" });

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      expect(document.activeElement).toBe(subscriptionButton);
    });
  });

  // ===========================================================================
  // アクセシビリティテスト
  // ===========================================================================
  describe("Accessibility", () => {
    it("各オプションにaria-labelが設定されている", () => {
      render(<AuthModeSelector {...defaultProps} />);

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");

      expect(subscriptionButton).toHaveAttribute(
        "aria-label",
        "サブスクリプション",
      );
      expect(apiKeyButton).toHaveAttribute("aria-label", "APIキー");
    });

    it("各オプションにaria-descriptionが設定されている", () => {
      render(<AuthModeSelector {...defaultProps} />);

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");

      expect(subscriptionButton).toHaveAttribute("aria-description");
      expect(apiKeyButton).toHaveAttribute("aria-description");
    });

    it("disabled状態でボタンが無効化される", () => {
      render(<AuthModeSelector {...defaultProps} disabled />);

      const subscriptionButton = screen.getByTestId(
        "auth-mode-option-subscription",
      );
      const apiKeyButton = screen.getByTestId("auth-mode-option-api-key");

      expect(subscriptionButton).toBeDisabled();
      expect(apiKeyButton).toBeDisabled();
    });
  });

  // ===========================================================================
  // スタイリングテスト
  // ===========================================================================
  describe("Styling", () => {
    it("カスタムclassNameが適用される", () => {
      render(<AuthModeSelector {...defaultProps} className="custom-class" />);

      const container = screen.getByRole("radiogroup");
      expect(container).toHaveClass("custom-class");
    });

    it("disabled状態で透明度スタイルが適用される", () => {
      render(<AuthModeSelector {...defaultProps} disabled />);

      const container = screen.getByRole("radiogroup");
      expect(container).toHaveClass("opacity-50");
    });
  });
});

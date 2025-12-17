/**
 * FileSelectorTrigger テスト
 *
 * @see docs/30-workflows/file-selector-integration/step01-design.md
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileSelectorTrigger } from "./index";

// =============================================================================
// Tests
// =============================================================================

describe("FileSelectorTrigger", () => {
  // ===========================================================================
  // Rendering Tests
  // ===========================================================================

  describe("Rendering", () => {
    it("renders with default props", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} />);

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toBeInTheDocument();
      expect(
        screen.getByTestId("file-selector-trigger-icon"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("file-selector-trigger-label"),
      ).toHaveTextContent("ファイルを追加");
    });

    it("renders with custom label", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} label="カスタムラベル" />);

      expect(
        screen.getByTestId("file-selector-trigger-label"),
      ).toHaveTextContent("カスタムラベル");
    });
  });

  // ===========================================================================
  // Variant Tests
  // ===========================================================================

  describe("Variants", () => {
    it("renders default variant with full label", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} variant="default" />);

      expect(
        screen.getByTestId("file-selector-trigger-label"),
      ).toHaveTextContent("ファイルを追加");
    });

    it("renders compact variant with shortened label", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} variant="compact" />);

      expect(
        screen.getByTestId("file-selector-trigger-label"),
      ).toHaveTextContent("追加");
    });

    it("renders icon-only variant without label", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} variant="icon-only" />);

      expect(
        screen.getByTestId("file-selector-trigger-icon"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("file-selector-trigger-label"),
      ).not.toBeInTheDocument();
    });

    it("icon-only variant has aria-label", () => {
      const onClick = vi.fn();
      render(
        <FileSelectorTrigger
          onClick={onClick}
          variant="icon-only"
          label="ファイル追加"
        />,
      );

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toHaveAttribute("aria-label", "ファイル追加");
    });
  });

  // ===========================================================================
  // Size Tests
  // ===========================================================================

  describe("Sizes", () => {
    it("renders small size", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} size="sm" />);

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toHaveClass("px-2", "py-1", "text-xs");
    });

    it("renders medium size (default)", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} size="md" />);

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toHaveClass("px-3", "py-2", "text-sm");
    });

    it("renders large size", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} size="lg" />);

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toHaveClass("px-4", "py-3", "text-base");
    });

    it("icon-only variant uses padding instead of px/py", () => {
      const onClick = vi.fn();
      render(
        <FileSelectorTrigger onClick={onClick} variant="icon-only" size="md" />,
      );

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toHaveClass("p-2");
    });
  });

  // ===========================================================================
  // State Tests
  // ===========================================================================

  describe("States", () => {
    it("renders disabled state", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} disabled />);

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    it("renders loading state", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} loading />);

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(
        screen.getByTestId("file-selector-trigger-loading-icon"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("file-selector-trigger-icon"),
      ).not.toBeInTheDocument();
    });

    it("loading state disables the button", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} loading />);

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toBeDisabled();
    });
  });

  // ===========================================================================
  // Interaction Tests
  // ===========================================================================

  describe("Interactions", () => {
    it("calls onClick when clicked", async () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} />);

      await userEvent.click(screen.getByTestId("file-selector-trigger"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} disabled />);

      // disabled状態のボタンはクリックイベントを発火しない
      const button = screen.getByTestId("file-selector-trigger");
      await userEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when loading", async () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} loading />);

      const button = screen.getByTestId("file-selector-trigger");
      await userEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Accessibility Tests
  // ===========================================================================

  describe("Accessibility", () => {
    it("has type button", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} />);

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toHaveAttribute("type", "button");
    });

    it("has accessible name for default variant", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} />);

      const button = screen.getByRole("button", { name: /ファイルを追加/i });
      expect(button).toBeInTheDocument();
    });

    it("has aria-label for icon-only variant", () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} variant="icon-only" />);

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toHaveAttribute("aria-label", "ファイルを追加");
    });

    it("supports custom className", () => {
      const onClick = vi.fn();
      render(
        <FileSelectorTrigger onClick={onClick} className="custom-class" />,
      );

      const button = screen.getByTestId("file-selector-trigger");
      expect(button).toHaveClass("custom-class");
    });

    it("forwards ref to button element", () => {
      const onClick = vi.fn();
      const ref = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} ref={ref} />);

      expect(ref).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Keyboard Navigation Tests
  // ===========================================================================

  describe("Keyboard Navigation", () => {
    it("can be activated with Enter key", async () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} />);

      const button = screen.getByTestId("file-selector-trigger");
      button.focus();

      await userEvent.keyboard("{Enter}");

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("can be activated with Space key", async () => {
      const onClick = vi.fn();
      render(<FileSelectorTrigger onClick={onClick} />);

      const button = screen.getByTestId("file-selector-trigger");
      button.focus();

      await userEvent.keyboard(" ");

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });
});

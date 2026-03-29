import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RetryButton } from "../index";

describe("RetryButton", () => {
  const defaultProps = {
    providerId: "openai-provider-1",
    isRetrying: false,
    onRetry: vi.fn(),
  };

  describe("レンダリング", () => {
    it('isRetrying=false で "再接続" テキストを表示する', () => {
      render(<RetryButton {...defaultProps} />);
      expect(screen.getByRole("button")).toHaveTextContent("再接続");
    });

    it('isRetrying=true で "リトライ中" テキストを表示する', () => {
      render(<RetryButton {...defaultProps} isRetrying={true} />);
      expect(screen.getByRole("button")).toHaveTextContent("リトライ中");
    });
  });

  describe("インタラクション", () => {
    it("クリック時に providerId を引数として onRetry を呼び出す", () => {
      const onRetry = vi.fn();
      render(
        <RetryButton
          providerId="anthropic-provider-2"
          isRetrying={false}
          onRetry={onRetry}
        />,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith("anthropic-provider-2");
    });

    it("isRetrying=true の場合、ボタンが disabled になる", () => {
      render(<RetryButton {...defaultProps} isRetrying={true} />);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("アクセシビリティ", () => {
    it('isRetrying=false で aria-label="アダプターを再接続" を持つ', () => {
      render(<RetryButton {...defaultProps} />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "アダプターを再接続",
      );
    });

    it('isRetrying=true で aria-label="リトライ中..." を持つ', () => {
      render(<RetryButton {...defaultProps} isRetrying={true} />);
      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "リトライ中...",
      );
    });
  });
});

/**
 * Toast コンポーネント テスト
 * UT-UI-05A-004: 保存成功 Toast
 *
 * Phase 4 - TDD Red
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toast } from "../components/Toast";

describe("Toast コンポーネント", () => {
  const defaultProps = {
    id: "toast-1",
    type: "success" as const,
    message: "保存しました",
    onDismiss: vi.fn(),
  };

  it("success Toast に role='status' が設定される", () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("error Toast に role='alert' が設定される", () => {
    render(
      <Toast {...defaultProps} type="error" message="エラーが発生しました" />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("閉じるボタンクリックで onDismiss が呼ばれる", () => {
    const onDismiss = vi.fn();
    render(<Toast {...defaultProps} onDismiss={onDismiss} />);

    const closeButton = screen.getByLabelText("閉じる");
    fireEvent.click(closeButton);

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("success Toast に CheckCircle アイコンが表示される", () => {
    render(<Toast {...defaultProps} />);
    // lucide-react icons render as SVG
    expect(screen.getByTestId("toast-icon-success")).toBeInTheDocument();
  });

  it("error Toast に XCircle アイコンが表示される", () => {
    render(<Toast {...defaultProps} type="error" message="エラー" />);
    expect(screen.getByTestId("toast-icon-error")).toBeInTheDocument();
  });

  it("メッセージテキストが正しく表示される", () => {
    render(<Toast {...defaultProps} />);
    expect(screen.getByText("保存しました")).toBeInTheDocument();
  });
});

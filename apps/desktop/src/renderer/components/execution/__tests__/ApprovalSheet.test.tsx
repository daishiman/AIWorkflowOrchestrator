/**
 * @vitest-environment happy-dom
 */

/**
 * ApprovalSheet テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: APR-01〜APR-09, APR-17〜APR-18
 *
 * 注意: happy-dom 環境では userEvent を使用しない。fireEvent + act() を使用する (P39)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, fireEvent, act, cleanup } from "@testing-library/react";
import { ApprovalSheet } from "../ApprovalSheet";

describe("ApprovalSheet", () => {
  const defaultProps = {
    operationType: "external_send" as const,
    description: "LLM API にデータを送信します",
    destination: "https://api.anthropic.com",
    onApprove: vi.fn(),
    onReject: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  // APR-01: 外部 API 呼び出し時に Approval Sheet 表示
  it("APR-01: renders with operationType=external_send", () => {
    const { getByTestId, getByText } = render(
      <ApprovalSheet {...defaultProps} />,
    );
    expect(getByTestId("approval-sheet")).toBeTruthy();
    expect(getByText("外部送信の確認")).toBeTruthy();
  });

  // APR-02: ファイル書き込み時に Approval Sheet 表示
  it("APR-02: renders with operationType=dangerous_operation", () => {
    const { getByText } = render(
      <ApprovalSheet {...defaultProps} operationType="dangerous_operation" />,
    );
    expect(getByText("操作の確認")).toBeTruthy();
  });

  // APR-05: Approval Sheet に送信先情報が表示される
  it("APR-05: displays destination when operationType=external_send", () => {
    const { getByText } = render(<ApprovalSheet {...defaultProps} />);
    expect(getByText("https://api.anthropic.com")).toBeTruthy();
  });

  // APR-06: Approval Sheet に停止方法が明示される
  it("APR-06: displays stop method guidance", () => {
    const { getByText } = render(<ApprovalSheet {...defaultProps} />);
    expect(getByText(/中止.*ボタンで停止できます/)).toBeTruthy();
  });

  // APR-07: 承認ボタンで onApprove が発火する
  it("APR-07: calls onApprove when approve button is clicked", () => {
    const { getByTestId } = render(<ApprovalSheet {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId("approval-approve"));
    });
    expect(defaultProps.onApprove).toHaveBeenCalledTimes(1);
  });

  // APR-08: 拒否ボタンで onReject が発火する
  it("APR-08: calls onReject when reject button is clicked", () => {
    const { getByTestId } = render(<ApprovalSheet {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId("approval-reject"));
    });
    expect(defaultProps.onReject).toHaveBeenCalledTimes(1);
  });

  // APR-09: 詳細ボタンで onShowDetails が発火する
  it("APR-09: calls onShowDetails when details button is clicked", () => {
    const onShowDetails = vi.fn();
    const { getByTestId } = render(
      <ApprovalSheet {...defaultProps} onShowDetails={onShowDetails} />,
    );
    act(() => {
      fireEvent.click(getByTestId("approval-details"));
    });
    expect(onShowDetails).toHaveBeenCalledTimes(1);
  });

  // APR-17: Approval Sheet がキーボードで操作可能（Escape で拒否）
  it("APR-17: Escape key triggers onReject", () => {
    const { getByTestId } = render(<ApprovalSheet {...defaultProps} />);
    act(() => {
      fireEvent.keyDown(getByTestId("approval-sheet"), { key: "Escape" });
    });
    expect(defaultProps.onReject).toHaveBeenCalledTimes(1);
  });

  // APR-18: 初期フォーカスが「拒否」ボタンにある
  it("APR-18: initial focus is on reject button (safe default)", () => {
    const { getByTestId } = render(<ApprovalSheet {...defaultProps} />);
    expect(document.activeElement).toBe(getByTestId("approval-reject"));
  });

  // DSC-R4: Approval Sheet 内 disclosure が dismiss 不可
  it("DSC-09: embedded disclosure has no dismiss button", () => {
    const { getByTestId } = render(<ApprovalSheet {...defaultProps} />);
    expect(getByTestId("approval-disclosure")).toBeTruthy();
    // 内蔵 disclosure には dismiss ボタンがない
    const disclosure = getByTestId("approval-disclosure");
    const dismissBtn = disclosure.querySelector(
      '[data-testid="disclosure-dismiss"]',
    );
    expect(dismissBtn).toBeNull();
  });
});

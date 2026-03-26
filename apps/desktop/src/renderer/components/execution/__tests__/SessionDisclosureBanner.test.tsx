/**
 * @vitest-environment happy-dom
 */

/**
 * SessionDisclosureBanner テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: DSC-01〜DSC-08
 *
 * 注意: happy-dom 環境では userEvent を使用しない。fireEvent + act() を使用する (P39)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, fireEvent, act, cleanup } from "@testing-library/react";
import { SessionDisclosureBanner } from "../SessionDisclosureBanner";

describe("SessionDisclosureBanner", () => {
  const defaultProps = {
    aiServiceName: "Claude (Sonnet 4.6)",
    externalDestinations: ["Anthropic API"],
    onDismiss: vi.fn(),
    canReopen: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  // DSC-01: Session open 時に Disclosure Banner が表示される
  it("DSC-01: renders disclosure banner", () => {
    const { getByTestId } = render(
      <SessionDisclosureBanner {...defaultProps} />,
    );
    expect(getByTestId("disclosure-banner")).toBeTruthy();
  });

  // DSC-02: Banner に AI モデル名が含まれる
  it("DSC-02: displays AI service name", () => {
    const { getByText } = render(<SessionDisclosureBanner {...defaultProps} />);
    expect(getByText(/Claude \(Sonnet 4\.6\)/)).toBeTruthy();
  });

  // DSC-03: Banner に外部送信先種別が含まれる
  it("DSC-03: displays external destinations", () => {
    const { getByText } = render(<SessionDisclosureBanner {...defaultProps} />);
    expect(getByText(/Anthropic API/)).toBeTruthy();
  });

  // DSC-04: Dismiss 後にバナーが非表示になる
  it("DSC-04: calls onDismiss when dismiss button is clicked", () => {
    const { getByTestId } = render(
      <SessionDisclosureBanner {...defaultProps} />,
    );
    act(() => {
      fireEvent.click(getByTestId("disclosure-dismiss"));
    });
    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  // DSC-05: Dismiss ボタンが存在する（再表示導線は親コンポーネントが管理）
  it("DSC-05: dismiss button exists", () => {
    const { getByTestId } = render(
      <SessionDisclosureBanner {...defaultProps} />,
    );
    expect(getByTestId("disclosure-dismiss")).toBeTruthy();
  });

  // DSC-08: guidance-only state で「AI 実行なし」が開示される
  it("DSC-08: shows guidance-only message when isGuidanceOnly=true", () => {
    const { getByText } = render(
      <SessionDisclosureBanner {...defaultProps} isGuidanceOnly={true} />,
    );
    expect(getByText(/AI による自動実行は行われません/)).toBeTruthy();
  });

  // 送信先が空の場合は「なし」と表示
  it("displays 'なし' when no external destinations", () => {
    const { getByText } = render(
      <SessionDisclosureBanner {...defaultProps} externalDestinations={[]} />,
    );
    expect(getByText(/なし/)).toBeTruthy();
  });

  // isEmbeddedInApproval=true の場合は dismiss ボタンが非表示
  it("DSC-R4: no dismiss button when embedded in approval", () => {
    const { queryByTestId } = render(
      <SessionDisclosureBanner {...defaultProps} isEmbeddedInApproval={true} />,
    );
    expect(queryByTestId("disclosure-dismiss")).toBeNull();
  });
});

/**
 * DebugToolbar テスト
 *
 * ボタン表示、状態別無効化、コマンド送信、停止確認のテスト。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DebugToolbar } from "../components/DebugToolbar";
import type { DebugSessionStatus } from "@repo/shared/types/skill-debug";

// --- テストヘルパー ---
const defaultProps = {
  status: "paused" as DebugSessionStatus,
  skillName: "test-skill",
  onCommand: vi.fn(),
  onStop: vi.fn(),
};

const renderToolbar = (overrides = {}) => {
  return render(<DebugToolbar {...defaultProps} {...overrides} />);
};

describe("DebugToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ツールバーが表示される", () => {
    renderToolbar();
    expect(screen.getByTestId("debug-toolbar")).toBeInTheDocument();
  });

  it("スキル名が表示される", () => {
    renderToolbar({ skillName: "my-skill" });
    expect(screen.getByText("my-skill")).toBeInTheDocument();
  });

  it("セッション状態がBadgeで表示される", () => {
    renderToolbar({ status: "running" });
    expect(screen.getByText("実行中")).toBeInTheDocument();
  });

  it("paused状態で続行・ステップ系ボタンが有効になる", () => {
    renderToolbar({ status: "paused" });

    expect(screen.getByTestId("debug-continue-btn")).not.toBeDisabled();
    expect(screen.getByTestId("debug-step-over-btn")).not.toBeDisabled();
    expect(screen.getByTestId("debug-step-into-btn")).not.toBeDisabled();
    expect(screen.getByTestId("debug-step-out-btn")).not.toBeDisabled();
  });

  it("paused状態で一時停止ボタンが無効になる", () => {
    renderToolbar({ status: "paused" });

    expect(screen.getByTestId("debug-pause-btn")).toBeDisabled();
  });

  it("running状態で一時停止ボタンが有効、ステップ系ボタンが無効になる", () => {
    renderToolbar({ status: "running" });

    expect(screen.getByTestId("debug-pause-btn")).not.toBeDisabled();
    expect(screen.getByTestId("debug-continue-btn")).toBeDisabled();
    expect(screen.getByTestId("debug-step-over-btn")).toBeDisabled();
    expect(screen.getByTestId("debug-step-into-btn")).toBeDisabled();
    expect(screen.getByTestId("debug-step-out-btn")).toBeDisabled();
  });

  it("idle状態で全操作ボタンが無効になる", () => {
    renderToolbar({ status: "idle" });

    expect(screen.getByTestId("debug-continue-btn")).toBeDisabled();
    expect(screen.getByTestId("debug-pause-btn")).toBeDisabled();
    expect(screen.getByTestId("debug-step-over-btn")).toBeDisabled();
    expect(screen.getByTestId("debug-stop-btn")).toBeDisabled();
  });

  it("completed状態で全操作ボタンが無効になる", () => {
    renderToolbar({ status: "completed" });

    expect(screen.getByTestId("debug-continue-btn")).toBeDisabled();
    expect(screen.getByTestId("debug-pause-btn")).toBeDisabled();
    expect(screen.getByTestId("debug-stop-btn")).toBeDisabled();
  });

  it("続行ボタンクリックでcontinueコマンドが送信される", () => {
    const onCommand = vi.fn();
    renderToolbar({ status: "paused", onCommand });

    fireEvent.click(screen.getByTestId("debug-continue-btn"));
    expect(onCommand).toHaveBeenCalledWith("continue");
  });

  it("一時停止ボタンクリックでpauseコマンドが送信される", () => {
    const onCommand = vi.fn();
    renderToolbar({ status: "running", onCommand });

    fireEvent.click(screen.getByTestId("debug-pause-btn"));
    expect(onCommand).toHaveBeenCalledWith("pause");
  });

  it("ステップオーバーボタンクリックでstepOverコマンドが送信される", () => {
    const onCommand = vi.fn();
    renderToolbar({ status: "paused", onCommand });

    fireEvent.click(screen.getByTestId("debug-step-over-btn"));
    expect(onCommand).toHaveBeenCalledWith("stepOver");
  });

  it("停止ボタンクリックでonStopが呼ばれる", () => {
    const onStop = vi.fn();
    renderToolbar({ status: "running", onStop });

    fireEvent.click(screen.getByTestId("debug-stop-btn"));
    expect(onStop).toHaveBeenCalled();
  });

  it("各ボタンにaria-labelが設定されている", () => {
    renderToolbar();

    expect(screen.getByLabelText("続行")).toBeInTheDocument();
    expect(screen.getByLabelText("一時停止")).toBeInTheDocument();
    expect(screen.getByLabelText("ステップオーバー")).toBeInTheDocument();
    expect(screen.getByLabelText("ステップイン")).toBeInTheDocument();
    expect(screen.getByLabelText("ステップアウト")).toBeInTheDocument();
    expect(screen.getByLabelText("停止")).toBeInTheDocument();
  });

  it("ツールバーにrole='toolbar'が設定されている", () => {
    renderToolbar();
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });
});

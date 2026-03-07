/**
 * ExecuteButton コンポーネントテスト（TASK-UI-03 Phase 4 - TDD Red）
 *
 * P39対策: happy-dom環境では userEvent 使用禁止。fireEvent のみ使用。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
// P39対策: userEvent は使用しない

// Red状態: コンポーネントはまだ実装されていない
import { ExecuteButton } from "../ExecuteButton";

describe("ExecuteButton", () => {
  const defaultProps = {
    selectedSkillName: "test-skill" as string | null,
    onExecute: vi.fn(),
    isExecuting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ツール未選択時の無効化（selectedSkillName=null -> disabled）", () => {
    render(<ExecuteButton {...defaultProps} selectedSkillName={null} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("ツール選択時のテキスト（「実行する」）", () => {
    render(<ExecuteButton {...defaultProps} selectedSkillName="my-skill" />);

    expect(screen.getByText("実行する")).toBeInTheDocument();
  });

  it("ツール未選択時のテキスト（「ツールを選んでください」）", () => {
    render(<ExecuteButton {...defaultProps} selectedSkillName={null} />);

    expect(screen.getByText("ツールを選んでください")).toBeInTheDocument();
  });

  it("クリックで onExecute 発火", async () => {
    const onExecute = vi.fn();
    render(
      <ExecuteButton
        {...defaultProps}
        selectedSkillName="my-skill"
        onExecute={onExecute}
      />,
    );

    const button = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(button);
    });

    expect(onExecute).toHaveBeenCalledTimes(1);
  });

  it("無効時にクリック不可", async () => {
    const onExecute = vi.fn();
    render(
      <ExecuteButton
        {...defaultProps}
        selectedSkillName={null}
        onExecute={onExecute}
      />,
    );

    const button = screen.getByRole("button");
    await act(async () => {
      fireEvent.click(button);
    });

    expect(onExecute).not.toHaveBeenCalled();
  });

  // === Phase 6: テスト拡充 ===

  describe("境界値テスト", () => {
    it("isExecuting=true でボタンが非表示（nullレンダリング）", () => {
      const { container } = render(
        <ExecuteButton {...defaultProps} isExecuting={true} />,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(container.innerHTML).toBe("");
    });

    it("selectedSkillName が空文字列の場合はdisabled", () => {
      render(<ExecuteButton {...defaultProps} selectedSkillName="" />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(screen.getByText("ツールを選んでください")).toBeInTheDocument();
    });
  });

  describe("エラー系テスト", () => {
    it("連続クリックでonExecuteが呼ばれる（ボタン自体は防止しない）", async () => {
      const onExecute = vi.fn();
      render(
        <ExecuteButton
          {...defaultProps}
          selectedSkillName="my-skill"
          onExecute={onExecute}
        />,
      );

      const button = screen.getByRole("button");
      await act(async () => {
        fireEvent.click(button);
        fireEvent.click(button);
      });

      expect(onExecute).toHaveBeenCalledTimes(2);
    });
  });
});

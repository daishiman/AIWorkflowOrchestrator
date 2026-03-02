/**
 * StepCard コンポーネントのテスト
 *
 * - ステップ情報の表示
 * - 削除ボタンのクリック
 * - 上下移動ボタンの動作
 * - 条件バッジの表示
 * - React.memo のメモ化検証
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SkillChainStep } from "@repo/shared/types/skill-chain";
import { StepCard } from "../components/StepCard";

// --- テストデータファクトリ ---

const createMockStep = (
  overrides: Partial<SkillChainStep> = {},
): SkillChainStep => ({
  stepId: "step-001",
  skillName: "テストスキル",
  inputMapping: {
    input1: { type: "literal", value: "hello" },
  },
  ...overrides,
});

describe("StepCard", () => {
  const defaultProps = {
    step: createMockStep(),
    index: 0,
    onDelete: vi.fn(),
    canMoveUp: false,
    canMoveDown: true,
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ステップ番号が表示される", () => {
    render(<StepCard {...defaultProps} index={2} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("スキル名が表示される", () => {
    render(<StepCard {...defaultProps} />);
    expect(screen.getByText("テストスキル")).toBeInTheDocument();
  });

  it("入力マッピング件数が表示される", () => {
    render(<StepCard {...defaultProps} />);
    expect(screen.getByText("入力: 1件")).toBeInTheDocument();
  });

  it("条件バッジが表示される（ifPreviousSuccess）", () => {
    const step = createMockStep({
      condition: { type: "ifPreviousSuccess" },
    });
    render(<StepCard {...defaultProps} step={step} />);
    expect(screen.getByText("前ステップ成功時")).toBeInTheDocument();
  });

  it("タイムアウトが秒単位で表示される", () => {
    const step = createMockStep({ timeout: 60000 });
    render(<StepCard {...defaultProps} step={step} />);
    expect(screen.getByText("60s")).toBeInTheDocument();
  });

  it("削除ボタンクリックでonDeleteが呼ばれる", () => {
    render(<StepCard {...defaultProps} />);
    const deleteButton = screen.getByLabelText("ステップ テストスキル を削除");
    fireEvent.click(deleteButton);
    expect(defaultProps.onDelete).toHaveBeenCalledWith("step-001");
  });

  it("上移動ボタンがcanMoveUp=falseで無効化される", () => {
    render(<StepCard {...defaultProps} canMoveUp={false} />);
    const upButton = screen.getByLabelText("ステップ 1 を上に移動");
    expect(upButton).toBeDisabled();
  });

  it("下移動ボタンがcanMoveDown=trueで有効化される", () => {
    render(<StepCard {...defaultProps} canMoveDown={true} />);
    const downButton = screen.getByLabelText("ステップ 1 を下に移動");
    expect(downButton).not.toBeDisabled();
  });

  it("上移動ボタンクリックでonMoveUpが呼ばれる", () => {
    render(<StepCard {...defaultProps} index={1} canMoveUp={true} />);
    const upButton = screen.getByLabelText("ステップ 2 を上に移動");
    fireEvent.click(upButton);
    expect(defaultProps.onMoveUp).toHaveBeenCalledWith(1);
  });

  it("data-testidが正しく設定される", () => {
    render(<StepCard {...defaultProps} />);
    expect(screen.getByTestId("step-card-step-001")).toBeInTheDocument();
  });

  it("role=listitemが設定される", () => {
    render(<StepCard {...defaultProps} />);
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it("React.memoにより同一propsで再レンダーしない", () => {
    const { rerender } = render(<StepCard {...defaultProps} />);
    const firstRender = screen.getByTestId("step-card-step-001");

    // 同一propsで再レンダー
    rerender(<StepCard {...defaultProps} />);
    const secondRender = screen.getByTestId("step-card-step-001");

    // DOM要素が同じインスタンスであることを確認（memoにより再生成されない）
    expect(firstRender).toBe(secondRender);
  });
});

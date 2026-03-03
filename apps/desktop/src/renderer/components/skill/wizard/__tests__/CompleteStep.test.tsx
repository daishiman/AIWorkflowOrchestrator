/**
 * @file CompleteStep.test.tsx
 * @description CompleteStep コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-C
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompleteStep } from "../CompleteStep";

describe("CompleteStep", () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnClose = vi.fn();
  });

  // ------------------------------------------
  // 1. 完了メッセージが表示される
  // ------------------------------------------
  it("完了メッセージが表示される", () => {
    render(<CompleteStep skillPath="/path/to/skill" onClose={mockOnClose} />);

    expect(screen.getByText("スキルが作成されました")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 2. 生成されたスキルパスが表示される
  // ------------------------------------------
  it("生成されたスキルパスが表示される", () => {
    render(<CompleteStep skillPath="/path/to/skill" onClose={mockOnClose} />);

    expect(screen.getByText("/path/to/skill")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 3. skillPath=nullでパス非表示
  // ------------------------------------------
  it("skillPathがnullのときパス表示がない", () => {
    render(<CompleteStep skillPath={null} onClose={mockOnClose} />);

    expect(screen.getByText("スキルが作成されました")).toBeInTheDocument();
    expect(screen.queryByText("/path/to/skill")).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 4. 「閉じる」ボタンが表示される
  // ------------------------------------------
  it("「閉じる」ボタンが表示される", () => {
    render(<CompleteStep skillPath="/path/to/skill" onClose={mockOnClose} />);

    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();
  });

  // ------------------------------------------
  // 5. 「閉じる」クリックでonClose呼出
  // ------------------------------------------
  it("「閉じる」ボタンクリックでonCloseが呼ばれる", () => {
    render(<CompleteStep skillPath="/path/to/skill" onClose={mockOnClose} />);

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 6. 長いパスも表示される
  // ------------------------------------------
  it("長いスキルパスも正しく表示される", () => {
    const longPath =
      "/Users/dm/.claude/skills/very-long-skill-name-with-many-words/SKILL.md";
    render(<CompleteStep skillPath={longPath} onClose={mockOnClose} />);

    expect(screen.getByText(longPath)).toBeInTheDocument();
  });

  // ==========================================================
  // Phase 6: パス表示パターン
  // ==========================================================
  describe("CompleteStep - パス表示パターン", () => {
    it("パスに特殊文字が含まれても表示される", () => {
      render(
        <CompleteStep
          skillPath="/path/to/skill with spaces & symbols!"
          onClose={mockOnClose}
        />,
      );
      expect(
        screen.getByText("/path/to/skill with spaces & symbols!"),
      ).toBeInTheDocument();
    });

    it("skillPath='' (空文字) のときパス表示がない", () => {
      render(<CompleteStep skillPath="" onClose={mockOnClose} />);
      expect(screen.getByText("スキルが作成されました")).toBeInTheDocument();
      // 空文字はReactのtruthy判定ではfalsyなので{skillPath && ...}でレンダリングされない
      const pathElements = document.querySelectorAll(".font-mono");
      expect(pathElements).toHaveLength(0);
    });
  });
});

/**
 * @file ConfigureStep.test.tsx
 * @description ConfigureStep コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-C
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfigureStep } from "../ConfigureStep";
import type { WizardOptions } from "../ConfigureStep";

describe("ConfigureStep", () => {
  let mockOnOptionsChange: ReturnType<typeof vi.fn>;
  let mockOnBack: ReturnType<typeof vi.fn>;
  let mockOnGenerate: ReturnType<typeof vi.fn>;
  let defaultOptions: WizardOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnOptionsChange = vi.fn();
    mockOnBack = vi.fn();
    mockOnGenerate = vi.fn();
    defaultOptions = {
      generateTasks: true,
      addAgents: false,
      addReferences: false,
    };
  });

  // ------------------------------------------
  // 1. 3つのチェックボックスが表示される
  // ------------------------------------------
  it("3つのチェックボックスが表示される", () => {
    render(
      <ConfigureStep
        options={defaultOptions}
        onOptionsChange={mockOnOptionsChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    expect(screen.getByText("タスク生成")).toBeInTheDocument();
    expect(screen.getByText("エージェント追加")).toBeInTheDocument();
    expect(screen.getByText("参照追加")).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
  });

  // ------------------------------------------
  // 2. options値でチェック初期化
  // ------------------------------------------
  it("options値でチェックボックスが初期化される", () => {
    render(
      <ConfigureStep
        options={defaultOptions}
        onOptionsChange={mockOnOptionsChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    // generateTasks: true
    expect(checkboxes[0]).toBeChecked();
    // addAgents: false
    expect(checkboxes[1]).not.toBeChecked();
    // addReferences: false
    expect(checkboxes[2]).not.toBeChecked();
  });

  // ------------------------------------------
  // 3. 全チェック状態での初期化
  // ------------------------------------------
  it("全てtrueのoptionsで全チェックボックスがチェック済み", () => {
    const allTrueOptions: WizardOptions = {
      generateTasks: true,
      addAgents: true,
      addReferences: true,
    };

    render(
      <ConfigureStep
        options={allTrueOptions}
        onOptionsChange={mockOnOptionsChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((cb) => {
      expect(cb).toBeChecked();
    });
  });

  // ------------------------------------------
  // 4. 「戻る」「スキルを生成」ボタン表示
  // ------------------------------------------
  it("「戻る」と「スキルを生成」ボタンが表示される", () => {
    render(
      <ConfigureStep
        options={defaultOptions}
        onOptionsChange={mockOnOptionsChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "スキルを生成" }),
    ).toBeInTheDocument();
  });

  // ------------------------------------------
  // 5. 「戻る」ボタンクリックでonBack呼出
  // ------------------------------------------
  it("「戻る」ボタンクリックでonBackが呼ばれる", () => {
    render(
      <ConfigureStep
        options={defaultOptions}
        onOptionsChange={mockOnOptionsChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 6. 「スキルを生成」ボタンクリックでonGenerate呼出
  // ------------------------------------------
  it("「スキルを生成」ボタンクリックでonGenerateが呼ばれる", () => {
    render(
      <ConfigureStep
        options={defaultOptions}
        onOptionsChange={mockOnOptionsChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "スキルを生成" }));
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 7. チェックボックス変更でonOptionsChange呼出
  // ------------------------------------------
  it("チェックボックス変更でonOptionsChangeが正しい値で呼ばれる", () => {
    render(
      <ConfigureStep
        options={defaultOptions}
        onOptionsChange={mockOnOptionsChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");

    // addAgents をチェック（false -> true）
    fireEvent.click(checkboxes[1]);
    expect(mockOnOptionsChange).toHaveBeenCalledWith({
      generateTasks: true,
      addAgents: true,
      addReferences: false,
    });
  });

  // ------------------------------------------
  // 8. generateTasksチェック解除でonOptionsChange呼出
  // ------------------------------------------
  it("generateTasksのチェック解除でonOptionsChangeが呼ばれる", () => {
    render(
      <ConfigureStep
        options={defaultOptions}
        onOptionsChange={mockOnOptionsChange}
        onBack={mockOnBack}
        onGenerate={mockOnGenerate}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");

    // generateTasks をチェック解除（true -> false）
    fireEvent.click(checkboxes[0]);
    expect(mockOnOptionsChange).toHaveBeenCalledWith({
      generateTasks: false,
      addAgents: false,
      addReferences: false,
    });
  });

  // ==========================================================
  // Phase 6: 組み合わせテスト
  // ==========================================================
  describe("ConfigureStep - 組み合わせテスト", () => {
    it("全チェックボックスが OFF のとき全て unchecked 表示される", () => {
      const allFalseOptions: WizardOptions = {
        generateTasks: false,
        addAgents: false,
        addReferences: false,
      };
      render(
        <ConfigureStep
          options={allFalseOptions}
          onOptionsChange={mockOnOptionsChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((cb) => {
        expect(cb).not.toBeChecked();
      });
    });

    it("addReferences を OFF→ON に変更すると他のオプションは変化しない", () => {
      render(
        <ConfigureStep
          options={defaultOptions}
          onOptionsChange={mockOnOptionsChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[2]);
      expect(mockOnOptionsChange).toHaveBeenCalledWith({
        generateTasks: true,
        addAgents: false,
        addReferences: true,
      });
    });

    it("複数チェックボックスを順に変更してもコールバックが正確に呼ばれる", () => {
      render(
        <ConfigureStep
          options={defaultOptions}
          onOptionsChange={mockOnOptionsChange}
          onBack={mockOnBack}
          onGenerate={mockOnGenerate}
        />,
      );
      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]); // addAgents ON
      fireEvent.click(checkboxes[2]); // addReferences ON
      expect(mockOnOptionsChange).toHaveBeenCalledTimes(2);
    });
  });
});

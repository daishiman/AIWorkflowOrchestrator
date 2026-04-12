/**
 * @file DescribeStep.test.tsx
 * @description DescribeStep コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-C
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DescribeStep } from "../DescribeStep";

describe("DescribeStep", () => {
  let mockOnDescriptionChange: ReturnType<typeof vi.fn>;
  let mockOnCategoryChange: ReturnType<typeof vi.fn>;
  let mockOnNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnDescriptionChange = vi.fn();
    mockOnCategoryChange = vi.fn();
    mockOnNext = vi.fn();
  });

  // ------------------------------------------
  // 1. textareaが表示される
  // ------------------------------------------
  it("textareaが表示される", () => {
    render(
      <DescribeStep
        description=""
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  // ------------------------------------------
  // 1.5 category セレクトが表示される
  // ------------------------------------------
  it("category選択が渡されたときカテゴリセレクトが表示される", () => {
    render(
      <DescribeStep
        description=""
        onDescriptionChange={mockOnDescriptionChange}
        category={null}
        onCategoryChange={mockOnCategoryChange}
        onNext={mockOnNext}
      />,
    );

    expect(screen.getByLabelText("スキルカテゴリ")).toBeInTheDocument();
  });

  it("カテゴリオプションに canonical label が表示される", () => {
    render(
      <DescribeStep
        description=""
        onDescriptionChange={mockOnDescriptionChange}
        category={null}
        onCategoryChange={mockOnCategoryChange}
        onNext={mockOnNext}
      />,
    );

    expect(
      screen.getByRole("option", { name: "コードサポート" }),
    ).toBeInTheDocument();
  });

  // ------------------------------------------
  // 2. description空で「次へ」disabled
  // ------------------------------------------
  it("description空で「次へ」ボタンがdisabled", () => {
    render(
      <DescribeStep
        description=""
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );

    const button = screen.getByRole("button", { name: "次へ" });
    expect(button).toBeDisabled();
  });

  // ------------------------------------------
  // 3. description入力済みで「次へ」enabled
  // ------------------------------------------
  it("description入力済みで「次へ」ボタンがenabled", () => {
    render(
      <DescribeStep
        description="テストスキル"
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );

    const button = screen.getByRole("button", { name: "次へ" });
    expect(button).toBeEnabled();
  });

  // ------------------------------------------
  // 4. fireEvent.changeでonDescriptionChangeが呼ばれる
  // ------------------------------------------
  it("textarea変更時にonDescriptionChangeが呼ばれる", () => {
    render(
      <DescribeStep
        description=""
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "新しい説明" } });

    expect(mockOnDescriptionChange).toHaveBeenCalledTimes(1);
    expect(mockOnDescriptionChange).toHaveBeenCalledWith("新しい説明");
  });

  // ------------------------------------------
  // 4.5 category変更でonCategoryChangeが呼ばれる
  // ------------------------------------------
  it("カテゴリ変更時にonCategoryChangeが呼ばれる", () => {
    render(
      <DescribeStep
        description=""
        onDescriptionChange={mockOnDescriptionChange}
        category={null}
        onCategoryChange={mockOnCategoryChange}
        onNext={mockOnNext}
      />,
    );

    fireEvent.change(screen.getByLabelText("スキルカテゴリ"), {
      target: { value: "external-integration" },
    });

    expect(mockOnCategoryChange).toHaveBeenCalledTimes(1);
    expect(mockOnCategoryChange).toHaveBeenCalledWith("external-integration");
  });

  // ------------------------------------------
  // 5. スペースのみで「次へ」disabled
  // ------------------------------------------
  it("スペースのみの説明で「次へ」ボタンがdisabled", () => {
    render(
      <DescribeStep
        description="   "
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );

    const button = screen.getByRole("button", { name: "次へ" });
    expect(button).toBeDisabled();
  });

  // ------------------------------------------
  // 6. 「次へ」クリックでonNext呼出
  // ------------------------------------------
  it("「次へ」クリックでonNextが呼ばれる", () => {
    render(
      <DescribeStep
        description="テストスキル"
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );

    const button = screen.getByRole("button", { name: "次へ" });
    fireEvent.click(button);

    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // 7. disabled時にonNext呼ばれない
  // ------------------------------------------
  it("disabled時にボタンをクリックしてもonNextが呼ばれない", () => {
    render(
      <DescribeStep
        description=""
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );

    const button = screen.getByRole("button", { name: "次へ" });
    fireEvent.click(button);

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // 8. placeholder表示
  // ------------------------------------------
  it("textareaにplaceholderが表示される", () => {
    render(
      <DescribeStep
        description=""
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );

    const textarea = screen.getByPlaceholderText(
      "このスキルが何をするか自然言語で説明してください...",
    );
    expect(textarea).toBeInTheDocument();
  });

  // ------------------------------------------
  // 9. ラベルがtextareaに関連付け
  // ------------------------------------------
  it("ラベルがtextareaに関連付けられている", () => {
    render(
      <DescribeStep
        description=""
        onDescriptionChange={mockOnDescriptionChange}
        onNext={mockOnNext}
      />,
    );

    const label = screen.getByText("スキルの説明");
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "skill-description");

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("id", "skill-description");
  });

  // ==========================================================
  // Phase 6: 境界値テスト
  // ==========================================================
  describe("DescribeStep - 境界値テスト", () => {
    it("1文字の説明で「次へ」ボタンが enabled になる", () => {
      render(
        <DescribeStep
          description="a"
          onDescriptionChange={mockOnDescriptionChange}
          onNext={mockOnNext}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });

    it("タブ文字のみでは「次へ」ボタンが disabled のまま", () => {
      render(
        <DescribeStep
          description={"\t"}
          onDescriptionChange={mockOnDescriptionChange}
          onNext={mockOnNext}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("改行のみでは「次へ」ボタンが disabled のまま", () => {
      render(
        <DescribeStep
          description={"\n"}
          onDescriptionChange={mockOnDescriptionChange}
          onNext={mockOnNext}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeDisabled();
    });

    it("空白 + 有効テキスト + 空白でも「次へ」ボタンが enabled", () => {
      render(
        <DescribeStep
          description="  hello  "
          onDescriptionChange={mockOnDescriptionChange}
          onNext={mockOnNext}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });

    it("非常に長い説明（1000文字以上）でも動作する", () => {
      const longText = "a".repeat(1000);
      render(
        <DescribeStep
          description={longText}
          onDescriptionChange={mockOnDescriptionChange}
          onNext={mockOnNext}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });

    it("日本語入力で動作する", () => {
      render(
        <DescribeStep
          description=""
          onDescriptionChange={mockOnDescriptionChange}
          onNext={mockOnNext}
        />,
      );
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "日本語のスキル説明" },
      });
      expect(mockOnDescriptionChange).toHaveBeenCalledWith(
        "日本語のスキル説明",
      );
    });

    it("特殊文字を含む入力でも動作する", () => {
      render(
        <DescribeStep
          description='<script>alert("xss")</script>'
          onDescriptionChange={mockOnDescriptionChange}
          onNext={mockOnNext}
        />,
      );
      expect(screen.getByRole("button", { name: "次へ" })).toBeEnabled();
    });
  });

  // ==========================================================
  // Phase 4 追加: TASK-SC-07 AC-1 - 生成モード選択UI
  // ==========================================================
  describe("生成モード選択UI（AC-1）", () => {
    let mockOnGenerationModeChange: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockOnGenerationModeChange = vi.fn();
    });

    it("generationMode='template' でテンプレートラジオが選択状態になる", () => {
      render(
        <DescribeStep
          description="テストスキル"
          onDescriptionChange={mockOnDescriptionChange}
          generationMode="template"
          onGenerationModeChange={mockOnGenerationModeChange}
          onNext={mockOnNext}
        />,
      );
      const templateRadio = screen.getByRole("radio", { name: /テンプレート/ });
      expect(templateRadio).toBeChecked();
    });

    it("generationMode='llm' でLLMラジオが選択状態になる", () => {
      render(
        <DescribeStep
          description="テストスキル"
          onDescriptionChange={mockOnDescriptionChange}
          generationMode="llm"
          onGenerationModeChange={mockOnGenerationModeChange}
          onNext={mockOnNext}
        />,
      );
      const llmRadio = screen.getByRole("radio", { name: /LLM/ });
      expect(llmRadio).toBeChecked();
    });

    it("LLMラジオ選択でonGenerationModeChangeが'llm'で呼ばれる", () => {
      render(
        <DescribeStep
          description="テストスキル"
          onDescriptionChange={mockOnDescriptionChange}
          generationMode="template"
          onGenerationModeChange={mockOnGenerationModeChange}
          onNext={mockOnNext}
        />,
      );
      const llmRadio = screen.getByRole("radio", { name: /LLM/ });
      fireEvent.click(llmRadio);
      expect(mockOnGenerationModeChange).toHaveBeenCalledWith("llm");
    });

    it("テンプレートラジオ選択でonGenerationModeChangeが'template'で呼ばれる", () => {
      render(
        <DescribeStep
          description="テストスキル"
          onDescriptionChange={mockOnDescriptionChange}
          generationMode="llm"
          onGenerationModeChange={mockOnGenerationModeChange}
          onNext={mockOnNext}
        />,
      );
      const templateRadio = screen.getByRole("radio", { name: /テンプレート/ });
      fireEvent.click(templateRadio);
      expect(mockOnGenerationModeChange).toHaveBeenCalledWith("template");
    });

    it("generationMode未指定時もonNextは動作する（後方互換）", () => {
      render(
        <DescribeStep
          description="テストスキル"
          onDescriptionChange={mockOnDescriptionChange}
          onNext={mockOnNext}
        />,
      );
      const button = screen.getByRole("button", { name: "次へ" });
      expect(button).toBeEnabled();
    });
  });
});

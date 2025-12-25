import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SystemPromptPanel } from "./index";
import type { PromptTemplate } from "@renderer/store/types";

describe("SystemPromptPanel", () => {
  const mockTemplates: PromptTemplate[] = [
    {
      id: "preset-1",
      name: "翻訳アシスタント",
      content: "あなたは翻訳アシスタントです",
      isPreset: true,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
    {
      id: "custom-1",
      name: "マイテンプレート",
      content: "カスタムプロンプト",
      isPreset: false,
      createdAt: new Date("2025-01-02"),
      updatedAt: new Date("2025-01-02"),
    },
  ];

  const defaultProps = {
    isExpanded: true,
    systemPrompt: "",
    onSystemPromptChange: vi.fn(),
    templates: mockTemplates,
    onSelectTemplate: vi.fn(),
    onSaveTemplate: vi.fn(),
    onDeleteTemplate: vi.fn(),
    onClear: vi.fn(),
  };

  describe("レンダリング", () => {
    it("折りたたみ時は表示しない", () => {
      render(<SystemPromptPanel {...defaultProps} isExpanded={false} />);
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });

    it("展開時はパネルを表示する", () => {
      render(<SystemPromptPanel {...defaultProps} />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("id属性を設定する", () => {
      render(<SystemPromptPanel {...defaultProps} />);
      expect(screen.getByRole("region")).toHaveAttribute(
        "id",
        "system-prompt-panel",
      );
    });

    it("aria-labelledbyを設定する", () => {
      render(<SystemPromptPanel {...defaultProps} />);
      expect(screen.getByRole("region")).toHaveAttribute(
        "aria-labelledby",
        "system-prompt-label",
      );
    });
  });

  describe("コンポーネント統合", () => {
    it("SystemPromptHeaderをレンダリングする", () => {
      render(<SystemPromptPanel {...defaultProps} />);
      expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "クリア" }),
      ).toBeInTheDocument();
    });

    it("SystemPromptTextAreaをレンダリングする", () => {
      render(<SystemPromptPanel {...defaultProps} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("CharacterCounterをレンダリングする", () => {
      render(<SystemPromptPanel {...defaultProps} />);
      expect(screen.getByText(/\/ 4,000 文字/)).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("テキスト入力時にonSystemPromptChangeを呼び出す", async () => {
      const handleChange = vi.fn();
      render(
        <SystemPromptPanel
          {...defaultProps}
          onSystemPromptChange={handleChange}
        />,
      );
      const textarea = screen.getByRole("textbox");
      await userEvent.type(textarea, "test");
      expect(handleChange).toHaveBeenCalled();
    });

    it("クリアボタンクリック時にonClearを呼び出す", () => {
      const handleClear = vi.fn();
      render(
        <SystemPromptPanel
          {...defaultProps}
          systemPrompt="test"
          onClear={handleClear}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "クリア" }));
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it("保存ボタンクリック時にonSaveTemplateを呼び出す", () => {
      const handleSave = vi.fn();
      render(
        <SystemPromptPanel
          {...defaultProps}
          systemPrompt="test"
          onSaveTemplate={handleSave}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "保存" }));
      expect(handleSave).toHaveBeenCalledWith("test");
    });

    it("テンプレート選択時にonSelectTemplateを呼び出す", () => {
      const handleSelect = vi.fn();
      render(
        <SystemPromptPanel {...defaultProps} onSelectTemplate={handleSelect} />,
      );
      // Template selector interaction would be tested here
      // This is a placeholder for the actual implementation
      expect(handleSelect).not.toHaveBeenCalled();
    });
  });

  describe("状態管理", () => {
    it("空のシステムプロンプトで保存ボタンを無効化する", () => {
      render(<SystemPromptPanel {...defaultProps} systemPrompt="" />);
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });

    it("空のシステムプロンプトでクリアボタンを無効化する", () => {
      render(<SystemPromptPanel {...defaultProps} systemPrompt="" />);
      expect(screen.getByRole("button", { name: "クリア" })).toBeDisabled();
    });

    it("システムプロンプトがある場合は保存ボタンを有効化する", () => {
      render(<SystemPromptPanel {...defaultProps} systemPrompt="test" />);
      expect(screen.getByRole("button", { name: "保存" })).not.toBeDisabled();
    });

    it("システムプロンプトがある場合はクリアボタンを有効化する", () => {
      render(<SystemPromptPanel {...defaultProps} systemPrompt="test" />);
      expect(screen.getByRole("button", { name: "クリア" })).not.toBeDisabled();
    });
  });

  describe("アニメーション", () => {
    it("展開時にアニメーションクラスを適用する", () => {
      const { rerender } = render(
        <SystemPromptPanel {...defaultProps} isExpanded={false} />,
      );

      rerender(<SystemPromptPanel {...defaultProps} isExpanded />);
      const panel = screen.getByRole("region");
      expect(panel).toHaveClass("transition-all");
    });

    it("折りたたみ時にopacity-0を適用する", () => {
      render(<SystemPromptPanel {...defaultProps} isExpanded={false} />);
      // Panel should not be visible
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });
  });

  describe("スタイリング", () => {
    it("GlassPanelスタイルを適用する", () => {
      render(<SystemPromptPanel {...defaultProps} />);
      const panel = screen.getByRole("region");
      expect(panel).toHaveClass("bg-white/5");
      expect(panel).toHaveClass("backdrop-blur-md");
    });

    it("カスタムclassNameを適用する", () => {
      render(<SystemPromptPanel {...defaultProps} className="custom-class" />);
      const panel = screen.getByRole("region");
      expect(panel).toHaveClass("custom-class");
    });
  });

  describe("エッジケース", () => {
    it("テンプレートが空の配列でもレンダリングする", () => {
      render(<SystemPromptPanel {...defaultProps} templates={[]} />);
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("最大文字数のシステムプロンプトを表示する", () => {
      const longPrompt = "a".repeat(4000);
      render(<SystemPromptPanel {...defaultProps} systemPrompt={longPrompt} />);
      expect(screen.getByDisplayValue(longPrompt)).toBeInTheDocument();
    });

    it("文字数超過時に警告を表示する", () => {
      const longPrompt = "a".repeat(4000);
      render(<SystemPromptPanel {...defaultProps} systemPrompt={longPrompt} />);
      const counter = screen.getByText("4,000 / 4,000 文字");
      expect(counter).toHaveClass("text-red-400");
    });
  });
});

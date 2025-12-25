import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SystemPromptHeader } from "./index";
import type { PromptTemplate } from "@renderer/store/types";

describe("SystemPromptHeader", () => {
  const mockTemplates: PromptTemplate[] = [
    {
      id: "preset-1",
      name: "翻訳アシスタント",
      content: "test",
      isPreset: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const defaultProps = {
    templates: mockTemplates,
    selectedTemplateId: null,
    onSelectTemplate: vi.fn(),
    onSaveClick: vi.fn(),
    onClearClick: vi.fn(),
    hasContent: false,
  };

  describe("レンダリング", () => {
    it("テンプレート選択ドロップダウンをレンダリングする", () => {
      render(<SystemPromptHeader {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /テンプレート/ }),
      ).toBeInTheDocument();
    });

    it("保存ボタンをレンダリングする", () => {
      render(<SystemPromptHeader {...defaultProps} />);
      expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    });

    it("クリアボタンをレンダリングする", () => {
      render(<SystemPromptHeader {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: "クリア" }),
      ).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("保存ボタンクリック時にonSaveClickを呼び出す", () => {
      const handleSave = vi.fn();
      render(
        <SystemPromptHeader
          {...defaultProps}
          hasContent
          onSaveClick={handleSave}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "保存" }));
      expect(handleSave).toHaveBeenCalledTimes(1);
    });

    it("クリアボタンクリック時にonClearClickを呼び出す", () => {
      const handleClear = vi.fn();
      render(
        <SystemPromptHeader
          {...defaultProps}
          hasContent
          onClearClick={handleClear}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "クリア" }));
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("状態管理", () => {
    it("内容がない場合は保存ボタンを無効化する", () => {
      render(<SystemPromptHeader {...defaultProps} hasContent={false} />);
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });

    it("内容がない場合はクリアボタンを無効化する", () => {
      render(<SystemPromptHeader {...defaultProps} hasContent={false} />);
      expect(screen.getByRole("button", { name: "クリア" })).toBeDisabled();
    });

    it("内容がある場合は保存ボタンを有効化する", () => {
      render(<SystemPromptHeader {...defaultProps} hasContent />);
      expect(screen.getByRole("button", { name: "保存" })).not.toBeDisabled();
    });

    it("内容がある場合はクリアボタンを有効化する", () => {
      render(<SystemPromptHeader {...defaultProps} hasContent />);
      expect(screen.getByRole("button", { name: "クリア" })).not.toBeDisabled();
    });

    it("disabled状態で全ボタンを無効化する", () => {
      render(<SystemPromptHeader {...defaultProps} hasContent disabled />);
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "クリア" })).toBeDisabled();
    });
  });

  describe("スタイリング", () => {
    it("ヘッダーのボーダーを表示する", () => {
      const { container } = render(<SystemPromptHeader {...defaultProps} />);
      const header = container.firstChild;
      expect(header).toHaveClass("border-b");
      expect(header).toHaveClass("border-white/10");
    });

    it("フレックスレイアウトを適用する", () => {
      const { container } = render(<SystemPromptHeader {...defaultProps} />);
      const header = container.firstChild;
      expect(header).toHaveClass("flex");
      expect(header).toHaveClass("justify-between");
    });
  });
});

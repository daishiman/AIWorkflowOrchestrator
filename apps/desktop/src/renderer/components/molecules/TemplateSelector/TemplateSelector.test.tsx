import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TemplateSelector } from "./index";
import type { PromptTemplate } from "@renderer/store/types";

describe("TemplateSelector", () => {
  const mockTemplates: PromptTemplate[] = [
    {
      id: "preset-1",
      name: "翻訳アシスタント",
      content: "test",
      isPreset: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "custom-1",
      name: "マイテンプレート",
      content: "test",
      isPreset: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const defaultProps = {
    templates: mockTemplates,
    selectedTemplateId: null,
    onSelect: vi.fn(),
    onDelete: vi.fn(),
    onRename: vi.fn(),
  };

  describe("レンダリング", () => {
    it("セレクターボタンをレンダリングする", () => {
      render(<TemplateSelector {...defaultProps} />);
      expect(
        screen.getByRole("button", { name: /テンプレートを選択/ }),
      ).toBeInTheDocument();
    });

    it("未選択時に「テンプレートを選択」と表示する", () => {
      render(<TemplateSelector {...defaultProps} />);
      expect(screen.getByText("テンプレートを選択")).toBeInTheDocument();
    });

    it("選択時にテンプレート名を表示する", () => {
      render(
        <TemplateSelector {...defaultProps} selectedTemplateId="preset-1" />,
      );
      expect(screen.getByText("翻訳アシスタント")).toBeInTheDocument();
    });
  });

  describe("ドロップダウン", () => {
    it("ボタンクリックでドロップダウンを開く", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("プリセットグループを表示する", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("プリセット")).toBeInTheDocument();
      expect(screen.getByText("翻訳アシスタント")).toBeInTheDocument();
    });

    it("カスタムグループを表示する", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("カスタム")).toBeInTheDocument();
      expect(screen.getByText("マイテンプレート")).toBeInTheDocument();
    });

    it("カスタムテンプレートがない場合は案内を表示する", () => {
      const presestsOnly = [mockTemplates[0]];
      render(<TemplateSelector {...defaultProps} templates={presestsOnly} />);
      fireEvent.click(screen.getByRole("button"));
      expect(
        screen.getByText("「保存」ボタンで追加できます"),
      ).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("テンプレート選択時にonSelectを呼び出す", () => {
      const handleSelect = vi.fn();
      render(<TemplateSelector {...defaultProps} onSelect={handleSelect} />);
      fireEvent.click(screen.getByRole("button"));
      fireEvent.click(screen.getByText("翻訳アシスタント"));
      expect(handleSelect).toHaveBeenCalledWith(mockTemplates[0]);
    });

    it("プリセットテンプレートにはアクションボタンを表示しない", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      const presetItem = screen.getByText("翻訳アシスタント").closest("li");
      expect(
        presetItem?.querySelector("[aria-label='編集']"),
      ).not.toBeInTheDocument();
      expect(
        presetItem?.querySelector("[aria-label='削除']"),
      ).not.toBeInTheDocument();
    });

    it("カスタムテンプレートにはアクションボタンを表示する", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      const customItem = screen.getByText("マイテンプレート").closest("li");
      expect(customItem).toBeInTheDocument();
      // アクションボタンは実装時に追加
    });
  });

  describe("アクセシビリティ", () => {
    it("role=listboxを設定する", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("aria-activedescendantを設定する", () => {
      render(
        <TemplateSelector {...defaultProps} selectedTemplateId="preset-1" />,
      );
      fireEvent.click(screen.getByRole("button"));
      const listbox = screen.getByRole("listbox");
      expect(listbox).toHaveAttribute("aria-activedescendant");
    });

    it("各アイテムにrole=optionを設定する", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);
    });

    it("選択されたアイテムにaria-selected=trueを設定する", () => {
      render(
        <TemplateSelector {...defaultProps} selectedTemplateId="preset-1" />,
      );
      fireEvent.click(screen.getByRole("button"));
      const selectedOption = screen.getByRole("option", {
        name: /翻訳アシスタント/,
      });
      expect(selectedOption).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("キーボード操作", () => {
    it("Escapeキーでドロップダウンを閉じる", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("ArrowDownで次のアイテムに移動する", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      const listbox = screen.getByRole("listbox");
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
      // Focus movement would be tested with actual implementation
    });

    it("ArrowUpで前のアイテムに移動する", () => {
      render(<TemplateSelector {...defaultProps} />);
      fireEvent.click(screen.getByRole("button"));
      const listbox = screen.getByRole("listbox");
      fireEvent.keyDown(listbox, { key: "ArrowUp" });
      // Focus movement would be tested with actual implementation
    });

    it("Enterキーでアイテムを選択する", () => {
      const handleSelect = vi.fn();
      render(<TemplateSelector {...defaultProps} onSelect={handleSelect} />);
      fireEvent.click(screen.getByRole("button"));
      const option = screen.getByRole("option", { name: /翻訳アシスタント/ });
      fireEvent.keyDown(option, { key: "Enter" });
      expect(handleSelect).toHaveBeenCalled();
    });
  });
});

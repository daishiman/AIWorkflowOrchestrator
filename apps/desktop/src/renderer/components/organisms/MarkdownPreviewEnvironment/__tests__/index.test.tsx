/**
 * MarkdownPreviewEnvironment Component Tests (TDD Green Phase)
 * @module MarkdownPreviewEnvironment.test
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownPreviewEnvironment } from "../index";

describe("MarkdownPreviewEnvironment", () => {
  describe("Markdownレンダリング", () => {
    it("見出しがレンダリングされる", () => {
      // Given: Markdown見出し
      render(<MarkdownPreviewEnvironment content="# Heading 1" />);

      // Then: h1要素として表示される
      expect(
        screen.getByRole("heading", { level: 1, name: "Heading 1" }),
      ).toBeInTheDocument();
    });

    it("複数レベルの見出しがレンダリングされる", () => {
      const content = "# H1\n## H2\n### H3";
      render(<MarkdownPreviewEnvironment content={content} />);

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    });

    it("段落がレンダリングされる", () => {
      render(<MarkdownPreviewEnvironment content="This is a paragraph." />);

      expect(screen.getByText("This is a paragraph.")).toBeInTheDocument();
    });

    it("リストがレンダリングされる", () => {
      const content = "- Item 1\n- Item 2\n- Item 3";
      render(<MarkdownPreviewEnvironment content={content} />);

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("番号付きリストがレンダリングされる", () => {
      const content = "1. First\n2. Second\n3. Third";
      render(<MarkdownPreviewEnvironment content={content} />);

      expect(screen.getByRole("list")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("コードブロックがレンダリングされる", () => {
      const content = "```typescript\nconst x = 1;\n```";
      render(<MarkdownPreviewEnvironment content={content} />);

      expect(
        screen.getByRole("code") || screen.getByText("const x = 1;"),
      ).toBeInTheDocument();
    });

    it("インラインコードがレンダリングされる", () => {
      render(
        <MarkdownPreviewEnvironment content="Use `const` for constants." />,
      );

      expect(screen.getByText("const")).toBeInTheDocument();
    });

    it("リンクがレンダリングされる", () => {
      render(
        <MarkdownPreviewEnvironment content="[Link](https://example.com)" />,
      );

      const link = screen.getByRole("link", { name: "Link" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("太字がレンダリングされる", () => {
      render(<MarkdownPreviewEnvironment content="**bold text**" />);

      expect(screen.getByText("bold text")).toBeInTheDocument();
      // 実装によってはstrong要素かem要素で囲まれる
    });

    it("イタリックがレンダリングされる", () => {
      render(<MarkdownPreviewEnvironment content="*italic text*" />);

      expect(screen.getByText("italic text")).toBeInTheDocument();
    });

    it("引用がレンダリングされる", () => {
      render(<MarkdownPreviewEnvironment content="> This is a quote" />);

      expect(
        screen.getByRole("blockquote") || screen.getByText("This is a quote"),
      ).toBeInTheDocument();
    });

    it("テーブルがレンダリングされる", () => {
      const content = "| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |";
      render(<MarkdownPreviewEnvironment content={content} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
    });
  });

  describe("セキュリティ", () => {
    it("HTMLタグがそのまま表示されない（エスケープ）", () => {
      render(
        <MarkdownPreviewEnvironment content='<script>alert("xss")</script>' />,
      );

      // HTMLタグはテキストとして表示されるか除去される
      expect(screen.queryByRole("script")).not.toBeInTheDocument();
    });

    it("javascript: URLリンクが無効化される", () => {
      render(
        <MarkdownPreviewEnvironment content="[Evil](javascript:alert('xss'))" />,
      );

      const link = screen.queryByRole("link", { name: "Evil" });
      if (link) {
        expect(link.getAttribute("href")).not.toContain("javascript:");
      }
    });
  });

  describe("空コンテンツ", () => {
    it("空文字列でもエラーにならない", () => {
      expect(() =>
        render(<MarkdownPreviewEnvironment content="" />),
      ).not.toThrow();
    });

    it("空白のみでもエラーにならない", () => {
      expect(() =>
        render(<MarkdownPreviewEnvironment content="   " />),
      ).not.toThrow();
    });
  });

  describe("スタイリング", () => {
    it("classNameが適用される", () => {
      const { container } = render(
        <MarkdownPreviewEnvironment
          content="# Test"
          className="custom-class"
        />,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("proseクラスが適用される（タイポグラフィスタイル）", () => {
      render(<MarkdownPreviewEnvironment content="# Test" />);

      // Tailwind Typography (prose) クラスが適用されていることを確認
      const markdownContent = screen.getByTestId("markdown-content");
      expect(markdownContent).toHaveClass("prose");
    });
  });

  describe("複雑なMarkdown", () => {
    it("複合的なMarkdownドキュメントがレンダリングされる", () => {
      const content = `# Title

This is a paragraph with **bold** and *italic* text.

## Section

- List item 1
- List item 2

\`\`\`javascript
const code = true;
\`\`\`

> A quote

| Col 1 | Col 2 |
|-------|-------|
| A     | B     |
`;

      expect(() =>
        render(<MarkdownPreviewEnvironment content={content} />),
      ).not.toThrow();

      // 主要な要素が存在することを確認
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole("list")).toBeInTheDocument();
    });
  });
});

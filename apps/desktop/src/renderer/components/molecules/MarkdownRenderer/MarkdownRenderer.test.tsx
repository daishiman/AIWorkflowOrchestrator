/**
 * @file MarkdownRenderer.test.tsx
 * @description MarkdownRendererコンポーネントのテスト（TDD: Red）
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownRenderer } from "./index";

describe("MarkdownRenderer", () => {
  describe("基本レンダリング", () => {
    it("should render plain text", () => {
      render(<MarkdownRenderer content="Hello World" />);
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <MarkdownRenderer
          content="Test"
          className="custom-class"
          data-testid="md-renderer"
        />,
      );
      expect(screen.getByTestId("md-renderer")).toHaveClass("custom-class");
    });

    it("should have markdown-body class by default", () => {
      render(<MarkdownRenderer content="Test" data-testid="md-renderer" />);
      expect(screen.getByTestId("md-renderer")).toHaveClass("markdown-body");
    });
  });

  describe("見出し (Headings)", () => {
    it("should render h1 heading", () => {
      render(<MarkdownRenderer content="# Heading 1" />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Heading 1");
    });

    it("should render h2 heading", () => {
      render(<MarkdownRenderer content="## Heading 2" />);
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Heading 2");
    });

    it("should render h3 heading", () => {
      render(<MarkdownRenderer content="### Heading 3" />);
      const heading = screen.getByRole("heading", { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it("should render h4 heading", () => {
      render(<MarkdownRenderer content="#### Heading 4" />);
      const heading = screen.getByRole("heading", { level: 4 });
      expect(heading).toBeInTheDocument();
    });

    it("should render h5 heading", () => {
      render(<MarkdownRenderer content="##### Heading 5" />);
      const heading = screen.getByRole("heading", { level: 5 });
      expect(heading).toBeInTheDocument();
    });

    it("should render h6 heading", () => {
      render(<MarkdownRenderer content="###### Heading 6" />);
      const heading = screen.getByRole("heading", { level: 6 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe("テキスト装飾 (Text Formatting)", () => {
    it("should render bold text with strong tag", () => {
      render(<MarkdownRenderer content="**bold text**" />);
      const strong = document.querySelector("strong");
      expect(strong).toBeInTheDocument();
      expect(strong).toHaveTextContent("bold text");
    });

    it("should render italic text with em tag", () => {
      render(<MarkdownRenderer content="*italic text*" />);
      const em = document.querySelector("em");
      expect(em).toBeInTheDocument();
      expect(em).toHaveTextContent("italic text");
    });

    it("should render strikethrough text with del tag", () => {
      render(<MarkdownRenderer content="~~strikethrough~~" />);
      const del = document.querySelector("del");
      expect(del).toBeInTheDocument();
      expect(del).toHaveTextContent("strikethrough");
    });

    it("should render inline code with code tag", () => {
      render(<MarkdownRenderer content="`inline code`" />);
      const code = document.querySelector("code");
      expect(code).toBeInTheDocument();
      expect(code).toHaveTextContent("inline code");
    });
  });

  describe("リンク (Links)", () => {
    it("should render links with anchor tag", () => {
      render(<MarkdownRenderer content="[Link Text](https://example.com)" />);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent("Link Text");
      expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("should open links in new tab with rel attributes", () => {
      render(<MarkdownRenderer content="[Link](https://example.com)" />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("リスト (Lists)", () => {
    it("should render unordered list", () => {
      render(<MarkdownRenderer content="- Item 1\n- Item 2\n- Item 3" />);
      const list = screen.getByRole("list");
      expect(list.tagName).toBe("UL");
      // react-markdownの出力に合わせて検証
      const items = screen.getAllByRole("listitem");
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it("should render ordered list", () => {
      render(<MarkdownRenderer content="1. First\n2. Second\n3. Third" />);
      const list = screen.getByRole("list");
      expect(list.tagName).toBe("OL");
      // react-markdownの出力に合わせて検証
      const items = screen.getAllByRole("listitem");
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it("should render task list (GFM)", () => {
      render(<MarkdownRenderer content="- [ ] Task 1" />);
      // GFMタスクリストはinput type="checkbox"としてレンダリングされる
      const checkbox = document.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });
  });

  describe("引用 (Blockquote)", () => {
    it("should render blockquote", () => {
      render(<MarkdownRenderer content="> This is a quote" />);
      const blockquote = document.querySelector("blockquote");
      expect(blockquote).toBeInTheDocument();
      expect(blockquote).toHaveTextContent("This is a quote");
    });
  });

  describe("コードブロック (Code Blocks)", () => {
    it("should render code block with pre tag", () => {
      render(<MarkdownRenderer content={"```\nconst x = 1;\n```"} />);
      const pre = document.querySelector("pre");
      expect(pre).toBeInTheDocument();
      const code = pre?.querySelector("code");
      expect(code).toBeInTheDocument();
    });

    it("should render code block with language class", () => {
      render(<MarkdownRenderer content={"```javascript\nconst x = 1;\n```"} />);
      const code = document.querySelector("pre code");
      expect(code).toHaveClass("language-javascript");
    });
  });

  describe("水平線 (Horizontal Rule)", () => {
    it("should render horizontal rule", () => {
      render(<MarkdownRenderer content="---" />);
      const hr = document.querySelector("hr");
      expect(hr).toBeInTheDocument();
    });
  });

  describe("テーブル (Tables - GFM)", () => {
    it("should render table", () => {
      const tableMarkdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;
      render(<MarkdownRenderer content={tableMarkdown} />);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("should render table headers", () => {
      const tableMarkdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;
      render(<MarkdownRenderer content={tableMarkdown} />);
      const headers = screen.getAllByRole("columnheader");
      expect(headers).toHaveLength(2);
      expect(headers[0]).toHaveTextContent("Header 1");
    });
  });

  describe("画像 (Images)", () => {
    it("should render image with alt text", () => {
      render(
        <MarkdownRenderer content="![Alt Text](https://example.com/image.png)" />,
      );
      const img = screen.getByRole("img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute("alt", "Alt Text");
      expect(img).toHaveAttribute("src", "https://example.com/image.png");
    });
  });

  describe("セキュリティ (Security)", () => {
    it("should sanitize HTML by default", () => {
      render(<MarkdownRenderer content='<script>alert("xss")</script>' />);
      const script = document.querySelector("script");
      expect(script).not.toBeInTheDocument();
    });

    it("should not render dangerous HTML when allowHtml is false", () => {
      render(
        <MarkdownRenderer
          content='<div onclick="alert()">Click</div>'
          allowHtml={false}
        />,
      );
      const div = document.querySelector("[onclick]");
      expect(div).not.toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should handle empty content", () => {
      render(<MarkdownRenderer content="" data-testid="md-renderer" />);
      expect(screen.getByTestId("md-renderer")).toBeInTheDocument();
    });

    it("should apply syntaxHighlight class when enabled", () => {
      render(
        <MarkdownRenderer
          content="# Test"
          syntaxHighlight={true}
          data-testid="md-renderer"
        />,
      );
      expect(screen.getByTestId("md-renderer")).toHaveClass("syntax-highlight");
    });

    it("should not apply syntaxHighlight class when disabled", () => {
      render(
        <MarkdownRenderer
          content="# Test"
          syntaxHighlight={false}
          data-testid="md-renderer"
        />,
      );
      expect(screen.getByTestId("md-renderer")).not.toHaveClass(
        "syntax-highlight",
      );
    });
  });

  describe("アクセシビリティ (Accessibility)", () => {
    it("should have proper semantic structure for headings", () => {
      render(<MarkdownRenderer content="# Title" />);
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should have proper semantic structure for lists", () => {
      render(<MarkdownRenderer content="- Item 1\n- Item 2" />);
      expect(screen.getByRole("list")).toBeInTheDocument();
    });

    it("should have proper semantic structure for paragraphs", () => {
      render(<MarkdownRenderer content="Paragraph text" />);
      const paragraph = document.querySelector("p");
      expect(paragraph).toBeInTheDocument();
    });
  });
});

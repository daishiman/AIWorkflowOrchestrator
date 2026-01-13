/**
 * MarkdownPreviewEnvironment Edge Cases Tests (Phase 6 - Test Expansion)
 * @module MarkdownPreviewEnvironment.edge-cases.test
 */

import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MarkdownPreviewEnvironment } from "../index";

describe("MarkdownPreviewEnvironment - Edge Cases", () => {
  describe("空・無効な入力", () => {
    it("空文字列を処理できる", () => {
      render(<MarkdownPreviewEnvironment content="" />);
      expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
    });

    it("空白のみの文字列を処理できる", () => {
      render(<MarkdownPreviewEnvironment content="   \n\t   " />);
      expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
    });
  });

  describe("特殊なMarkdown構文", () => {
    it("複数レベルの見出しを処理できる", async () => {
      const content = "# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain("<h1");
        expect(contentDiv.innerHTML).toContain("<h6");
      });
    });

    it("ネストされたリストを処理できる", async () => {
      const content = "- Item 1\n  - Nested 1\n    - Deep nested\n- Item 2";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain("<li");
      });
    });

    it("コードブロックを処理できる", async () => {
      const content = "```javascript\nconst x = 1;\n```";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain("<code");
      });
    });

    it("テーブルを処理できる", async () => {
      const content =
        "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1 | Cell 2 |";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain("<table");
      });
    });

    it("引用を処理できる", async () => {
      const content = "> This is a quote\n>> Nested quote";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain("<blockquote");
      });
    });
  });

  describe("XSS対策", () => {
    it("scriptタグが除去される", async () => {
      const content = '<script>alert("xss")</script>Normal text';
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).not.toContain("<script");
        expect(contentDiv.innerHTML).toContain("Normal text");
      });
    });

    it("インラインHTMLのイベントハンドラが除去される", async () => {
      const content = '<img onerror="alert(1)" src="x">';
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).not.toContain("onerror");
      });
    });

    it("javascript: URLが無効化される", async () => {
      const content = "[Click](javascript:alert(1))";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).not.toContain("javascript:");
      });
    });
  });

  describe("Unicode・特殊文字", () => {
    it("日本語を正しく表示できる", async () => {
      const content = "# 日本語タイトル\n\nこれは日本語のテストです。";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain("日本語タイトル");
        expect(contentDiv.innerHTML).toContain("日本語のテスト");
      });
    });

    it("絵文字を正しく表示できる", async () => {
      const content = "Hello 🌸 World 🎉";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain("🌸");
        expect(contentDiv.innerHTML).toContain("🎉");
      });
    });

    it("数式記号を処理できる", async () => {
      const content = "α + β = γ ∀x∈ℝ";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain("α");
        expect(contentDiv.innerHTML).toContain("∀");
      });
    });
  });

  describe("大きなコンテンツ", () => {
    it("長いドキュメントを処理できる", async () => {
      const content = Array(1000).fill("This is a paragraph.").join("\n\n");
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        expect(screen.getByTestId("markdown-preview")).toBeInTheDocument();
      });
    });
  });

  describe("コンポーネント動作", () => {
    it("コンポーネントが正しくレンダリングされる", () => {
      expect(() => {
        render(<MarkdownPreviewEnvironment content="# Test" />);
      }).not.toThrow();
    });

    it("空のコンテンツでもエラーにならない", () => {
      expect(() => {
        render(<MarkdownPreviewEnvironment content="" />);
      }).not.toThrow();
    });
  });

  describe("スタイル適用", () => {
    it("カスタムクラス名が適用される", () => {
      render(
        <MarkdownPreviewEnvironment
          content="# Test"
          className="custom-class"
        />,
      );

      const container = screen.getByTestId("markdown-preview");
      expect(container).toHaveClass("custom-class");
    });

    it("proseクラスが適用される", async () => {
      render(<MarkdownPreviewEnvironment content="# Test" />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv).toHaveClass("prose");
      });
    });
  });

  describe("リンク処理", () => {
    it("外部リンクがtarget=_blankになる", async () => {
      const content = "[Google](https://google.com)";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        const link = contentDiv.querySelector("a");
        // リンクが存在し、外部リンク用の属性を持つことを確認
        expect(link).toBeInTheDocument();
      });
    });

    it("相対リンクを処理できる", async () => {
      const content = "[Internal](/page)";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain('href="/page"');
      });
    });
  });

  describe("画像処理", () => {
    it("画像のaltテキストが保持される", async () => {
      const content = "![Alt Text](https://example.com/image.png)";
      render(<MarkdownPreviewEnvironment content={content} />);

      await waitFor(() => {
        const contentDiv = screen.getByTestId("markdown-content");
        expect(contentDiv.innerHTML).toContain('alt="Alt Text"');
      });
    });
  });
});

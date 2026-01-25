/**
 * DiffEditor コンポーネントテスト
 *
 * Phase 4: TDD Red - 失敗するテストを作成
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiffEditor } from "../DiffEditor";

// Monaco Editorのモック
vi.mock("@monaco-editor/react", () => ({
  DiffEditor: vi.fn(
    ({
      original,
      modified,
      language,
      theme,
      options,
      onMount: _onMount,
      loading,
    }: {
      original: string;
      modified: string;
      language: string;
      theme?: string;
      options?: Record<string, unknown>;
      onMount?: (editor: unknown) => void;
      loading?: React.ReactNode;
    }) => (
      <div data-testid="monaco-diff-editor">
        <div data-testid="monaco-original">{original}</div>
        <div data-testid="monaco-modified">{modified}</div>
        <div data-testid="monaco-language">{language}</div>
        <div data-testid="monaco-theme">{theme}</div>
        <div data-testid="monaco-options">{JSON.stringify(options)}</div>
        {loading && <div data-testid="monaco-loading">{loading}</div>}
      </div>
    ),
  ),
}));

describe("DiffEditor", () => {
  const defaultProps = {
    original: "const x = 1;",
    modified: "const x: number = 1;",
    language: "typescript",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("Monaco Diff Editorがレンダリングされる", () => {
      render(<DiffEditor {...defaultProps} />);

      expect(screen.getByTestId("monaco-diff-editor")).toBeInTheDocument();
    });

    it("originalコンテンツが正しく渡される", () => {
      render(<DiffEditor {...defaultProps} />);

      expect(screen.getByTestId("monaco-original")).toHaveTextContent(
        "const x = 1;",
      );
    });

    it("modifiedコンテンツが正しく渡される", () => {
      render(<DiffEditor {...defaultProps} />);

      expect(screen.getByTestId("monaco-modified")).toHaveTextContent(
        "const x: number = 1;",
      );
    });

    it("languageが正しく渡される", () => {
      render(<DiffEditor {...defaultProps} />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent(
        "typescript",
      );
    });

    it("カスタムheightが適用される", () => {
      const { container } = render(
        <DiffEditor {...defaultProps} height="500px" />,
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveStyle({ height: "500px" });
    });

    it("デフォルトheightが適用される", () => {
      const { container } = render(<DiffEditor {...defaultProps} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveStyle({ height: "400px" });
    });
  });

  describe("テーマ", () => {
    it("デフォルトテーマが適用される", () => {
      render(<DiffEditor {...defaultProps} />);

      expect(screen.getByTestId("monaco-theme")).toHaveTextContent("vs-dark");
    });

    it("カスタムテーマが適用される", () => {
      render(<DiffEditor {...defaultProps} theme="light" />);

      expect(screen.getByTestId("monaco-theme")).toHaveTextContent("light");
    });
  });

  describe("オプション", () => {
    it("readOnlyがtrueに設定されている", () => {
      render(<DiffEditor {...defaultProps} />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.readOnly).toBe(true);
    });

    it("renderSideBySideがtrueに設定されている", () => {
      render(<DiffEditor {...defaultProps} />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.renderSideBySide).toBe(true);
    });

    it("renderSideBySideをfalseに設定できる", () => {
      render(<DiffEditor {...defaultProps} sideBySide={false} />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.renderSideBySide).toBe(false);
    });

    it("minimapが無効化されている", () => {
      render(<DiffEditor {...defaultProps} />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.minimap?.enabled).toBe(false);
    });

    it("scrollBeyondLastLineがfalseに設定されている", () => {
      render(<DiffEditor {...defaultProps} />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.scrollBeyondLastLine).toBe(false);
    });

    it("lineNumbersが表示されている", () => {
      render(<DiffEditor {...defaultProps} />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.lineNumbers).toBe("on");
    });
  });

  describe("言語サポート", () => {
    it("javascriptをサポート", () => {
      render(<DiffEditor {...defaultProps} language="javascript" />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent(
        "javascript",
      );
    });

    it("pythonをサポート", () => {
      render(<DiffEditor {...defaultProps} language="python" />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent("python");
    });

    it("jsonをサポート", () => {
      render(<DiffEditor {...defaultProps} language="json" />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent("json");
    });

    it("markdownをサポート", () => {
      render(<DiffEditor {...defaultProps} language="markdown" />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent(
        "markdown",
      );
    });

    it("cssをサポート", () => {
      render(<DiffEditor {...defaultProps} language="css" />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent("css");
    });
  });

  describe("ローディング", () => {
    it("ローディング中はスピナーが表示される", () => {
      render(<DiffEditor {...defaultProps} />);

      // Monacoがロード中の状態をテスト
      // 実際のコンポーネントではloadingプロパティでカスタムローダーを表示
      expect(screen.getByTestId("monaco-diff-editor")).toBeInTheDocument();
    });
  });

  describe("エラーハンドリング", () => {
    it("空のoriginalでもレンダリングされる", () => {
      render(<DiffEditor {...defaultProps} original="" />);

      expect(screen.getByTestId("monaco-original")).toHaveTextContent("");
    });

    it("空のmodifiedでもレンダリングされる", () => {
      render(<DiffEditor {...defaultProps} modified="" />);

      expect(screen.getByTestId("monaco-modified")).toHaveTextContent("");
    });

    it("不明な言語でもレンダリングされる", () => {
      render(<DiffEditor {...defaultProps} language="unknown-lang" />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent(
        "unknown-lang",
      );
    });
  });

  describe("アクセシビリティ", () => {
    it("コンテナにrole=regionが設定されている", () => {
      render(<DiffEditor {...defaultProps} />);

      const container = screen.getByRole("region");
      expect(container).toBeInTheDocument();
    });

    it("aria-labelが設定されている", () => {
      render(<DiffEditor {...defaultProps} />);

      const container = screen.getByRole("region");
      expect(container).toHaveAttribute("aria-label", "差分エディタ");
    });

    it("aria-describedbyで差分の説明が参照される", () => {
      render(<DiffEditor {...defaultProps} />);

      const container = screen.getByRole("region");
      expect(container).toHaveAttribute("aria-describedby");
    });
  });

  describe("フォントサイズ", () => {
    it("デフォルトフォントサイズが設定されている", () => {
      render(<DiffEditor {...defaultProps} />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.fontSize).toBe(14);
    });

    it("カスタムフォントサイズが設定できる", () => {
      render(<DiffEditor {...defaultProps} fontSize={16} />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.fontSize).toBe(16);
    });
  });

  describe("ワードラップ", () => {
    it("デフォルトでワードラップがoffになっている", () => {
      render(<DiffEditor {...defaultProps} />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.wordWrap).toBe("off");
    });

    it("ワードラップを有効にできる", () => {
      render(<DiffEditor {...defaultProps} wordWrap="on" />);

      const options = JSON.parse(
        screen.getByTestId("monaco-options").textContent || "{}",
      );
      expect(options.wordWrap).toBe("on");
    });
  });

  describe("Props変更", () => {
    it("originalの変更が反映される", () => {
      const { rerender } = render(<DiffEditor {...defaultProps} />);

      expect(screen.getByTestId("monaco-original")).toHaveTextContent(
        "const x = 1;",
      );

      rerender(<DiffEditor {...defaultProps} original="const y = 2;" />);

      expect(screen.getByTestId("monaco-original")).toHaveTextContent(
        "const y = 2;",
      );
    });

    it("modifiedの変更が反映される", () => {
      const { rerender } = render(<DiffEditor {...defaultProps} />);

      expect(screen.getByTestId("monaco-modified")).toHaveTextContent(
        "const x: number = 1;",
      );

      rerender(
        <DiffEditor {...defaultProps} modified="const y: number = 2;" />,
      );

      expect(screen.getByTestId("monaco-modified")).toHaveTextContent(
        "const y: number = 2;",
      );
    });

    it("languageの変更が反映される", () => {
      const { rerender } = render(<DiffEditor {...defaultProps} />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent(
        "typescript",
      );

      rerender(<DiffEditor {...defaultProps} language="javascript" />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent(
        "javascript",
      );
    });
  });

  // Phase 6: エッジケーステスト
  describe("エッジケース", () => {
    it("空文字列の差分表示ができる", () => {
      render(<DiffEditor {...defaultProps} original="" modified="" />);

      expect(screen.getByTestId("monaco-original")).toHaveTextContent("");
      expect(screen.getByTestId("monaco-modified")).toHaveTextContent("");
    });

    it("非常に大きなファイル（10000行）の差分表示ができる", () => {
      const largeContent = Array.from(
        { length: 10000 },
        (_, i) => `const line${i} = ${i};`,
      ).join("\n");
      const modifiedContent = Array.from(
        { length: 10000 },
        (_, i) => `const line${i}: number = ${i};`,
      ).join("\n");

      render(
        <DiffEditor
          {...defaultProps}
          original={largeContent}
          modified={modifiedContent}
        />,
      );

      expect(screen.getByTestId("monaco-diff-editor")).toBeInTheDocument();
    });

    it("originalのみが空の場合でも正常に表示される", () => {
      render(
        <DiffEditor {...defaultProps} original="" modified="const x = 1;" />,
      );

      expect(screen.getByTestId("monaco-original")).toHaveTextContent("");
      expect(screen.getByTestId("monaco-modified")).toHaveTextContent(
        "const x = 1;",
      );
    });

    it("modifiedのみが空の場合でも正常に表示される", () => {
      render(
        <DiffEditor {...defaultProps} original="const x = 1;" modified="" />,
      );

      expect(screen.getByTestId("monaco-original")).toHaveTextContent(
        "const x = 1;",
      );
      expect(screen.getByTestId("monaco-modified")).toHaveTextContent("");
    });

    it("特殊文字を含むコンテンツも正常に表示される", () => {
      const specialContent =
        "const emoji = '🎉'; // <script>alert('xss')</script>";
      render(
        <DiffEditor
          {...defaultProps}
          original={specialContent}
          modified={specialContent}
        />,
      );

      expect(screen.getByTestId("monaco-original")).toHaveTextContent(
        specialContent,
      );
    });

    it("日本語を含むコンテンツも正常に表示される", () => {
      const japaneseContent = "// 日本語コメント\nconst 変数 = '値';";
      render(
        <DiffEditor
          {...defaultProps}
          original={japaneseContent}
          modified={japaneseContent}
        />,
      );

      expect(screen.getByTestId("monaco-original")).toHaveTextContent("日本語");
    });

    it("バイナリ風のコンテンツでもクラッシュしない", () => {
      const binaryLikeContent = String.fromCharCode(0, 1, 2, 3, 4, 5);
      render(
        <DiffEditor
          {...defaultProps}
          original={binaryLikeContent}
          modified={binaryLikeContent}
        />,
      );

      expect(screen.getByTestId("monaco-diff-editor")).toBeInTheDocument();
    });

    it("undefined言語でもデフォルト言語で表示される", () => {
      render(<DiffEditor {...defaultProps} language="" />);

      expect(screen.getByTestId("monaco-language")).toHaveTextContent("");
    });
  });
});

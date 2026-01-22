/**
 * SearchPanel アダプター統合テスト
 *
 * Phase 4: TDD Red - SearchPanel と EditorInstance アダプターの統合テスト
 *
 * このテストは TextAreaEditorAdapter を介した
 * SearchPanel と実際のDOM操作の統合を検証します。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useRef, useState } from "react";
import { SearchPanel } from "../../components/SearchPanel";
import {
  TextAreaEditorAdapter,
  createTextAreaEditorAdapter,
} from "../../adapters/TextAreaEditorAdapter";
import type { EditorInstance } from "../../types";

// モック設定
vi.mock("../../stores/useSearchStore", () => ({
  useSearchStore: vi.fn(() => ({
    caseSensitive: false,
    regex: false,
    wholeWord: false,
    setCaseSensitive: vi.fn(),
    setRegex: vi.fn(),
    setWholeWord: vi.fn(),
  })),
}));

describe("SearchPanel Adapter 統合", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    // getComputedStyle のモック（dom-accessibility-api で使用される getPropertyValue を含む）
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      lineHeight: "21px",
      fontSize: "14px",
      getPropertyValue: (prop: string) => {
        const values: Record<string, string> = {
          "line-height": "21px",
          "font-size": "14px",
          display: "block",
          visibility: "visible",
        };
        return values[prop] || "";
      },
    } as unknown as CSSStyleDeclaration);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("TextAreaEditorAdapter 基本動作", () => {
    it("TextArea から EditorInstance を作成できる", () => {
      const textArea = document.createElement("textarea");
      textArea.value = "test content";
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => textArea.value,
        setContent: (content) => {
          textArea.value = content;
        },
      });

      expect(adapter).toBeInstanceOf(TextAreaEditorAdapter);
      expect(adapter.getContent()).toBe("test content");
    });

    it("getContent() が TextArea の内容を返す", () => {
      const textArea = document.createElement("textarea");
      textArea.value = "line 1\nline 2\nline 3";
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => textArea.value,
        setContent: () => {},
      });

      expect(adapter.getContent()).toBe("line 1\nline 2\nline 3");
    });

    it("setHighlights() がコールバックを呼び出す", () => {
      const textArea = document.createElement("textarea");
      textArea.value = "test content";
      const ref = { current: textArea };
      const onHighlightsChange = vi.fn();

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => textArea.value,
        setContent: () => {},
        onHighlightsChange,
      });

      const highlights = [{ line: 1, column: 1, length: 4, isCurrent: true }];
      adapter.setHighlights(highlights);

      expect(onHighlightsChange).toHaveBeenCalledWith(highlights);
    });

    it("scrollToLine() が TextArea をフォーカスして位置を設定する", () => {
      const textArea = document.createElement("textarea");
      textArea.value = "line 1\nline 2\nline 3";
      textArea.focus = vi.fn();
      textArea.setSelectionRange = vi.fn();
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => textArea.value,
        setContent: () => {},
      });

      adapter.scrollToLine(2, 1);

      expect(textArea.focus).toHaveBeenCalled();
      expect(textArea.setSelectionRange).toHaveBeenCalled();
    });

    it("replaceText() がテキストを置換する", () => {
      let content = "hello world";
      const textArea = document.createElement("textarea");
      textArea.value = content;
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: (newContent) => {
          content = newContent;
          textArea.value = newContent;
        },
      });

      adapter.replaceText(1, 1, 5, "hi");

      expect(content).toBe("hi world");
    });

    it("replaceAllText() が複数箇所を置換する", () => {
      let content = "test test test";
      const textArea = document.createElement("textarea");
      textArea.value = content;
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: (newContent) => {
          content = newContent;
          textArea.value = newContent;
        },
      });

      const matches = [
        { line: 1, column: 1, length: 4 },
        { line: 1, column: 6, length: 4 },
        { line: 1, column: 11, length: 4 },
      ];

      adapter.replaceAllText(matches, "exam");

      expect(content).toBe("exam exam exam");
    });

    it("focus() が TextArea にフォーカスを当てる", () => {
      const textArea = document.createElement("textarea");
      textArea.focus = vi.fn();
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => "",
        setContent: () => {},
      });

      adapter.focus();

      expect(textArea.focus).toHaveBeenCalled();
    });
  });

  describe("SearchPanel との統合", () => {
    it("SearchPanel が EditorInstance アダプターと連携できる", async () => {
      let content = "hello world hello";
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.setSelectionRange = vi.fn();
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: (newContent) => {
          content = newContent;
        },
      });

      const editorRef = { current: adapter as EditorInstance };

      render(
        <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={editorRef} />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 検索結果が表示される
      expect(screen.getByText(/1.*\/.*2|1\s*of\s*2/)).toBeInTheDocument();
    });

    it("置換操作がアダプター経由でコンテンツを更新する", async () => {
      let content = "hello world";
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.setSelectionRange = vi.fn();
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: (newContent) => {
          content = newContent;
        },
      });

      const editorRef = { current: adapter as EditorInstance };

      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={editorRef}
          showReplace={true}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      const replaceInput = screen.getByPlaceholderText(/置換/);

      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.change(replaceInput, { target: { value: "hi" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "置換" }));
      });

      expect(content).toBe("hi world");
    });
  });

  describe("エッジケース", () => {
    it("TextArea ref が null でもエラーにならない", () => {
      const ref = { current: null };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => "",
        setContent: () => {},
      });

      // 各メソッドがエラーなく実行できる
      expect(() => adapter.getContent()).not.toThrow();
      expect(() => adapter.setHighlights([])).not.toThrow();
      expect(() => adapter.scrollToLine(1, 1)).not.toThrow();
      expect(() => adapter.focus()).not.toThrow();
    });

    it("空のコンテンツでも正しく動作する", async () => {
      const content = "";
      const textArea = document.createElement("textarea");
      textArea.value = content;
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: () => {},
      });

      const editorRef = { current: adapter as EditorInstance };

      render(
        <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={editorRef} />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "test" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 0件と表示される
      expect(screen.getByText(/0.*件|0.*of.*0|結果なし/)).toBeInTheDocument();
    });

    it("マルチバイト文字（日本語）を正しく処理する", async () => {
      let content = "こんにちは世界";
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.setSelectionRange = vi.fn();
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: (newContent) => {
          content = newContent;
        },
      });

      const editorRef = { current: adapter as EditorInstance };

      render(
        <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={editorRef} />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "こんにちは" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // マッチが見つかる
      expect(screen.getByText(/1.*\/.*1|1\s*of\s*1/)).toBeInTheDocument();
    });

    it("複数行にまたがる検索が正しく動作する", async () => {
      const content = "line 1 test\nline 2 test\nline 3 test";
      const textArea = document.createElement("textarea");
      textArea.value = content;
      textArea.setSelectionRange = vi.fn();
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: () => {},
      });

      const editorRef = { current: adapter as EditorInstance };

      render(
        <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={editorRef} />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "test" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 3つのマッチが見つかる
      expect(screen.getByText(/1.*\/.*3|1\s*of\s*3/)).toBeInTheDocument();
    });
  });

  describe("getCursorPosition と setCursorPosition", () => {
    it("getCursorPosition() が現在のカーソル位置を返す", () => {
      const textArea = document.createElement("textarea");
      textArea.value = "line 1\nline 2\nline 3";
      Object.defineProperty(textArea, "selectionStart", { value: 7 }); // line 2 の先頭
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => textArea.value,
        setContent: () => {},
      });

      const position = adapter.getCursorPosition();

      expect(position).toEqual({ line: 2, column: 1 });
    });

    it("setCursorPosition() がカーソル位置を設定する", () => {
      const textArea = document.createElement("textarea");
      textArea.value = "line 1\nline 2\nline 3";
      textArea.setSelectionRange = vi.fn();
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => textArea.value,
        setContent: () => {},
      });

      adapter.setCursorPosition(2, 3);

      // line 2, column 3 = "line 1\n" (7) + 2 = 9
      expect(textArea.setSelectionRange).toHaveBeenCalledWith(9, 9);
    });
  });

  describe("getHighlights", () => {
    it("設定したハイライトを取得できる", () => {
      const textArea = document.createElement("textarea");
      textArea.value = "test content";
      const ref = { current: textArea };

      const adapter = createTextAreaEditorAdapter({
        textAreaRef: ref as React.RefObject<HTMLTextAreaElement>,
        getContent: () => textArea.value,
        setContent: () => {},
      });

      const highlights = [
        { line: 1, column: 1, length: 4, isCurrent: true },
        { line: 1, column: 6, length: 7, isCurrent: false },
      ];

      adapter.setHighlights(highlights);

      expect(adapter.getHighlights()).toEqual(highlights);
    });
  });
});

describe("useEditorInstance フックとの統合", () => {
  // このテストは EditorView/hooks/useEditorInstance.ts との統合を検証
  // 実際のフックをテストするためのラッパーコンポーネントが必要

  it("フック経由で EditorInstance を取得できる", async () => {
    // useEditorInstance は EditorView 内で使用されるため、
    // ここではフックの基本動作を検証

    const TestComponent = () => {
      const [content, setContent] = useState("test content");
      const textAreaRef = useRef<HTMLTextAreaElement>(null);

      // 簡易的な EditorInstance 実装
      const editorInstance: EditorInstance = {
        getContent: () => content,
        setHighlights: vi.fn(),
        getHighlights: () => [],
        scrollToLine: vi.fn(),
        getCursorPosition: () => ({ line: 1, column: 1 }),
        setCursorPosition: vi.fn(),
        replaceText: (line, column, length, replacement) => {
          const lines = content.split("\n");
          let charPos = 0;
          for (let i = 0; i < line - 1; i++) {
            charPos += lines[i].length + 1;
          }
          charPos += column - 1;
          const newContent =
            content.substring(0, charPos) +
            replacement +
            content.substring(charPos + length);
          setContent(newContent);
        },
        replaceAllText: vi.fn(),
        focus: vi.fn(),
      };

      const editorRef = useRef(editorInstance);

      return (
        <div>
          <textarea ref={textAreaRef} value={content} onChange={() => {}} />
          <SearchPanel
            isOpen={true}
            onClose={vi.fn()}
            editorRef={editorRef}
            showReplace={true}
          />
          <div data-testid="content">{content}</div>
        </div>
      );
    };

    render(<TestComponent />);

    const searchbox = screen.getByRole("searchbox");
    const replaceInput = screen.getByPlaceholderText(/置換/);

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.change(replaceInput, { target: { value: "exam" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "置換" }));
    });

    // コンテンツが更新されている
    expect(screen.getByTestId("content")).toHaveTextContent("exam content");
  });
});

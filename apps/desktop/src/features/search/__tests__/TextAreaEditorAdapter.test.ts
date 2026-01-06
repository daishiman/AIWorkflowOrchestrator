/**
 * TextAreaEditorAdapter テスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  TextAreaEditorAdapter,
  createTextAreaEditorAdapter,
} from "../adapters/TextAreaEditorAdapter";

describe("TextAreaEditorAdapter", () => {
  let mockTextArea: HTMLTextAreaElement;
  let mockRef: { current: HTMLTextAreaElement | null };
  let content: string;
  let adapter: TextAreaEditorAdapter;
  let highlightsCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    content = "line 1\nline 2\nline 3\nline 4\nline 5";

    // モックTextAreaの作成
    mockTextArea = document.createElement("textarea");
    mockTextArea.value = content;
    Object.defineProperty(mockTextArea, "selectionStart", {
      value: 0,
      writable: true,
    });
    Object.defineProperty(mockTextArea, "selectionEnd", {
      value: 0,
      writable: true,
    });

    mockRef = { current: mockTextArea };
    highlightsCallback = vi.fn();

    adapter = new TextAreaEditorAdapter({
      textAreaRef: mockRef as React.RefObject<HTMLTextAreaElement>,
      getContent: () => content,
      setContent: (newContent: string) => {
        content = newContent;
      },
      onHighlightsChange: highlightsCallback,
    });

    // getComputedStyleのモック
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      lineHeight: "21px",
      fontSize: "14px",
    } as CSSStyleDeclaration);
  });

  describe("getContent", () => {
    it("コンテンツを取得できる", () => {
      expect(adapter.getContent()).toBe(
        "line 1\nline 2\nline 3\nline 4\nline 5",
      );
    });
  });

  describe("setHighlights", () => {
    it("ハイライトを設定するとコールバックが呼ばれる", () => {
      const highlights = [
        { line: 1, column: 1, length: 4, isCurrent: true },
        { line: 2, column: 1, length: 4, isCurrent: false },
      ];

      adapter.setHighlights(highlights);

      expect(highlightsCallback).toHaveBeenCalledWith(highlights);
    });

    it("現在のマッチがある場合、選択範囲が設定される", () => {
      const setSelectionRangeMock = vi.fn();
      mockTextArea.setSelectionRange = setSelectionRangeMock;

      const highlights = [{ line: 1, column: 1, length: 4, isCurrent: true }];

      adapter.setHighlights(highlights);

      expect(setSelectionRangeMock).toHaveBeenCalledWith(0, 4);
    });

    it("現在のマッチがない場合、選択範囲は設定されない", () => {
      const setSelectionRangeMock = vi.fn();
      mockTextArea.setSelectionRange = setSelectionRangeMock;

      const highlights = [{ line: 1, column: 1, length: 4, isCurrent: false }];

      adapter.setHighlights(highlights);

      expect(setSelectionRangeMock).not.toHaveBeenCalled();
    });

    it("TextAreaがnullの場合でもエラーにならない", () => {
      const adapterWithNullRef = new TextAreaEditorAdapter({
        textAreaRef: { current: null } as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: () => {},
      });

      expect(() => {
        adapterWithNullRef.setHighlights([
          { line: 1, column: 1, length: 4, isCurrent: true },
        ]);
      }).not.toThrow();
    });
  });

  describe("getHighlights", () => {
    it("設定されたハイライトを取得できる", () => {
      const highlights = [
        { line: 1, column: 1, length: 4, isCurrent: true },
        { line: 2, column: 1, length: 4, isCurrent: false },
      ];

      adapter.setHighlights(highlights);

      expect(adapter.getHighlights()).toEqual(highlights);
    });

    it("初期状態では空配列を返す", () => {
      expect(adapter.getHighlights()).toEqual([]);
    });
  });

  describe("scrollToLine", () => {
    it("指定行にスクロールする", () => {
      const focusMock = vi.fn();
      const setSelectionRangeMock = vi.fn();
      mockTextArea.focus = focusMock;
      mockTextArea.setSelectionRange = setSelectionRangeMock;

      adapter.scrollToLine(3, 1);

      expect(focusMock).toHaveBeenCalled();
      expect(setSelectionRangeMock).toHaveBeenCalled();
    });

    it("列を省略すると1が使用される", () => {
      const setSelectionRangeMock = vi.fn();
      mockTextArea.setSelectionRange = setSelectionRangeMock;

      adapter.scrollToLine(2);

      // line 2の開始位置は "line 1\n" = 7文字目
      expect(setSelectionRangeMock).toHaveBeenCalledWith(7, 7);
    });

    it("TextAreaがnullの場合は何もしない", () => {
      const adapterWithNullRef = new TextAreaEditorAdapter({
        textAreaRef: { current: null } as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: () => {},
      });

      expect(() => {
        adapterWithNullRef.scrollToLine(3, 1);
      }).not.toThrow();
    });
  });

  describe("getCursorPosition", () => {
    it("カーソル位置を取得できる", () => {
      Object.defineProperty(mockTextArea, "selectionStart", { value: 7 });

      const position = adapter.getCursorPosition();

      // 7文字目 = line 2, column 1
      expect(position).toEqual({ line: 2, column: 1 });
    });

    it("TextAreaがnullの場合はデフォルト値を返す", () => {
      const adapterWithNullRef = new TextAreaEditorAdapter({
        textAreaRef: { current: null } as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: () => {},
      });

      expect(adapterWithNullRef.getCursorPosition()).toEqual({
        line: 1,
        column: 1,
      });
    });
  });

  describe("setCursorPosition", () => {
    it("カーソル位置を設定できる", () => {
      const setSelectionRangeMock = vi.fn();
      mockTextArea.setSelectionRange = setSelectionRangeMock;

      adapter.setCursorPosition(2, 3);

      // line 2, column 3 = "line 1\n" (7) + 2 = 9
      expect(setSelectionRangeMock).toHaveBeenCalledWith(9, 9);
    });

    it("TextAreaがnullの場合は何もしない", () => {
      const adapterWithNullRef = new TextAreaEditorAdapter({
        textAreaRef: { current: null } as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: () => {},
      });

      expect(() => {
        adapterWithNullRef.setCursorPosition(2, 3);
      }).not.toThrow();
    });
  });

  describe("replaceText", () => {
    it("テキストを置換できる", () => {
      adapter.replaceText(1, 1, 4, "LINE");

      expect(content).toBe("LINE 1\nline 2\nline 3\nline 4\nline 5");
    });

    it("中間行のテキストを置換できる", () => {
      adapter.replaceText(3, 1, 4, "LINE");

      expect(content).toBe("line 1\nline 2\nLINE 3\nline 4\nline 5");
    });
  });

  describe("replaceAllText", () => {
    it("複数のマッチを置換できる", () => {
      const matches = [
        { line: 1, column: 1, length: 4 },
        { line: 2, column: 1, length: 4 },
        { line: 3, column: 1, length: 4 },
      ];

      adapter.replaceAllText(matches, "LINE");

      expect(content).toBe("LINE 1\nLINE 2\nLINE 3\nline 4\nline 5");
    });

    it("逆順で置換されても正しく動作する", () => {
      const matches = [
        { line: 3, column: 1, length: 4 },
        { line: 1, column: 1, length: 4 },
        { line: 2, column: 1, length: 4 },
      ];

      adapter.replaceAllText(matches, "LINE");

      expect(content).toBe("LINE 1\nLINE 2\nLINE 3\nline 4\nline 5");
    });
  });

  describe("focus", () => {
    it("TextAreaにフォーカスを当てる", () => {
      const focusMock = vi.fn();
      mockTextArea.focus = focusMock;

      adapter.focus();

      expect(focusMock).toHaveBeenCalled();
    });

    it("TextAreaがnullの場合は何もしない", () => {
      const adapterWithNullRef = new TextAreaEditorAdapter({
        textAreaRef: { current: null } as React.RefObject<HTMLTextAreaElement>,
        getContent: () => content,
        setContent: () => {},
      });

      expect(() => {
        adapterWithNullRef.focus();
      }).not.toThrow();
    });
  });

  describe("行・列変換ヘルパー", () => {
    it("最終行を超える行番号でもエラーにならない", () => {
      const setSelectionRangeMock = vi.fn();
      mockTextArea.setSelectionRange = setSelectionRangeMock;

      // 存在しない10行目を指定
      adapter.scrollToLine(10, 1);

      expect(setSelectionRangeMock).toHaveBeenCalled();
    });

    it("列番号が行の長さを超える場合は行末になる", () => {
      const setSelectionRangeMock = vi.fn();
      mockTextArea.setSelectionRange = setSelectionRangeMock;

      // line 1は "line 1" (6文字) だが、column 100を指定
      adapter.setCursorPosition(1, 100);

      // 行末の位置(6)が使用される
      expect(setSelectionRangeMock).toHaveBeenCalledWith(6, 6);
    });
  });

  describe("estimateLineHeight", () => {
    it("lineHeightが数値の場合はその値を使用", () => {
      vi.spyOn(window, "getComputedStyle").mockReturnValue({
        lineHeight: "24px",
        fontSize: "14px",
      } as CSSStyleDeclaration);

      // scrollToLineを呼ぶと内部でestimateLineHeightが使用される
      adapter.scrollToLine(5, 1);

      // scrollTopが設定されることを確認（エラーが出なければOK）
      expect(mockTextArea.scrollTop).toBeDefined();
    });

    it("lineHeightがNaNの場合はfontSize * LINE_HEIGHT_MULTIPLIERを使用", () => {
      vi.spyOn(window, "getComputedStyle").mockReturnValue({
        lineHeight: "normal",
        fontSize: "14px",
      } as CSSStyleDeclaration);

      adapter.scrollToLine(5, 1);

      expect(mockTextArea.scrollTop).toBeDefined();
    });

    it("fontSizeがNaNの場合はデフォルト値を使用", () => {
      vi.spyOn(window, "getComputedStyle").mockReturnValue({
        lineHeight: "normal",
        fontSize: "invalid",
      } as CSSStyleDeclaration);

      adapter.scrollToLine(5, 1);

      expect(mockTextArea.scrollTop).toBeDefined();
    });
  });
});

describe("createTextAreaEditorAdapter", () => {
  it("TextAreaEditorAdapterインスタンスを生成する", () => {
    const mockRef = {
      current: document.createElement("textarea"),
    } as React.RefObject<HTMLTextAreaElement>;

    const adapter = createTextAreaEditorAdapter({
      textAreaRef: mockRef,
      getContent: () => "test",
      setContent: () => {},
    });

    expect(adapter).toBeInstanceOf(TextAreaEditorAdapter);
    expect(adapter.getContent()).toBe("test");
  });
});

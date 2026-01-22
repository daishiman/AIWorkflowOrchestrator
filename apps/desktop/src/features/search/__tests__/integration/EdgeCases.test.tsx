/**
 * エッジケーステスト
 *
 * Phase 6: 境界値や特殊ケースをカバーするテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchPanel } from "../../components/SearchPanel";
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

// EditorInstance モックファクトリ
const createMockEditorInstance = (
  content: string,
): { current: EditorInstance } => ({
  current: {
    getContent: vi.fn(() => content),
    setHighlights: vi.fn(),
    getHighlights: vi.fn(() => []),
    scrollToLine: vi.fn(),
    getCursorPosition: vi.fn(() => ({ line: 1, column: 1 })),
    setCursorPosition: vi.fn(),
    replaceText: vi.fn((line, column, length, replacement) => {
      // 実際の置換をシミュレート
      const lines = content.split("\n");
      let charPos = 0;
      for (let i = 0; i < line - 1; i++) {
        charPos += lines[i].length + 1;
      }
      charPos += column - 1;
      content =
        content.substring(0, charPos) +
        replacement +
        content.substring(charPos + length);
    }),
    replaceAllText: vi.fn(),
    focus: vi.fn(),
  },
});

describe("Search edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("空の検索クエリでは検索しない", async () => {
    const mockEditorRef = createMockEditorInstance("test content");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");

    // 空のクエリで Enter
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 結果は 0 件
    expect(screen.queryByText(/1.*\/.*\d+/)).not.toBeInTheDocument();
  });

  it("空のエディタコンテンツでは結果が 0 件", async () => {
    const mockEditorRef = createMockEditorInstance("");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 結果なしと表示
    expect(screen.getByText(/結果なし/)).toBeInTheDocument();
  });

  it("非常に長い検索クエリでも正常動作", async () => {
    const longQuery = "a".repeat(1000);
    const mockEditorRef = createMockEditorInstance(longQuery + " more text");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: longQuery } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 1件のマッチ
    expect(screen.getByText(/1.*\/.*1|1\s*of\s*1/)).toBeInTheDocument();
  });

  it("特殊文字を含む検索クエリが正しく動作", async () => {
    const mockEditorRef = createMockEditorInstance(
      "test [special] (chars) *and* $more$",
    );

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "[special]" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 特殊文字がエスケープされてマッチ
    expect(screen.getByText(/1.*\/.*1|1\s*of\s*1/)).toBeInTheDocument();
  });

  it("Unicode 文字（日本語）の検索が正常動作", async () => {
    const mockEditorRef = createMockEditorInstance(
      "日本語テキスト\n日本語が含まれています",
    );

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "日本語" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 2件のマッチ
    expect(screen.getByText(/1.*\/.*2|1\s*of\s*2/)).toBeInTheDocument();
  });

  it("改行を含むテキストの検索が正常動作", async () => {
    const mockEditorRef = createMockEditorInstance(
      "line 1 test\nline 2 test\nline 3 test",
    );

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 3件のマッチ
    expect(screen.getByText(/1.*\/.*3|1\s*of\s*3/)).toBeInTheDocument();
  });

  it("タブ文字を含むテキストの検索が正常動作", async () => {
    const mockEditorRef = createMockEditorInstance("tab\there\ttab\tagain");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "tab" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 2件のマッチ
    expect(screen.getByText(/1.*\/.*2|1\s*of\s*2/)).toBeInTheDocument();
  });

  it("大文字小文字区別なしで検索が動作", async () => {
    const mockEditorRef = createMockEditorInstance("Test TEST test TeSt");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 4件のマッチ（大文字小文字を区別しない）
    expect(screen.getByText(/1.*\/.*4|1\s*of\s*4/)).toBeInTheDocument();
  });
});

describe("Replace edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("空の置換文字列での置換（削除）が動作", async () => {
    const mockEditorRef = createMockEditorInstance("hello world");

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={mockEditorRef}
        showReplace={true}
      />,
    );

    const searchbox = screen.getByRole("searchbox");
    const replaceInput = screen.getByPlaceholderText(/置換/);

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "hello " } });
      fireEvent.change(replaceInput, { target: { value: "" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "置換" }));
    });

    // replaceText が空文字列で呼ばれる
    expect(mockEditorRef.current.replaceText).toHaveBeenCalledWith(1, 1, 6, "");
  });

  it("同じ文字列への置換が動作", async () => {
    const mockEditorRef = createMockEditorInstance("test content");

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={mockEditorRef}
        showReplace={true}
      />,
    );

    const searchbox = screen.getByRole("searchbox");
    const replaceInput = screen.getByPlaceholderText(/置換/);

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.change(replaceInput, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "置換" }));
    });

    // replaceText が同じ文字列で呼ばれる
    expect(mockEditorRef.current.replaceText).toHaveBeenCalledWith(
      1,
      1,
      4,
      "test",
    );
  });

  it("置換文字列に検索パターンを含む場合", async () => {
    const mockEditorRef = createMockEditorInstance("ab ab ab");

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={mockEditorRef}
        showReplace={true}
      />,
    );

    const searchbox = screen.getByRole("searchbox");
    const replaceInput = screen.getByPlaceholderText(/置換/);

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "ab" } });
      fireEvent.change(replaceInput, { target: { value: "ab_new" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 3件のマッチ
    expect(screen.getByText(/1.*\/.*3|1\s*of\s*3/)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "置換" }));
    });

    expect(mockEditorRef.current.replaceText).toHaveBeenCalled();
  });

  it("大量のマッチを一括置換", async () => {
    const content = "test ".repeat(100);
    const mockEditorRef = createMockEditorInstance(content);

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={mockEditorRef}
        showReplace={true}
      />,
    );

    const searchbox = screen.getByRole("searchbox");
    const replaceInput = screen.getByPlaceholderText(/置換/);

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.change(replaceInput, { target: { value: "exam" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 100件のマッチ
    expect(screen.getByText(/1.*\/.*100|1\s*of\s*100/)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /すべて置換|全置換/ }),
      );
    });

    // replaceAllText が呼ばれる
    expect(mockEditorRef.current.replaceAllText).toHaveBeenCalled();
  });

  it("マルチバイト文字の置換が正しく動作", async () => {
    const mockEditorRef = createMockEditorInstance("こんにちは世界");

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={mockEditorRef}
        showReplace={true}
      />,
    );

    const searchbox = screen.getByRole("searchbox");
    const replaceInput = screen.getByPlaceholderText(/置換/);

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "こんにちは" } });
      fireEvent.change(replaceInput, { target: { value: "さようなら" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "置換" }));
    });

    expect(mockEditorRef.current.replaceText).toHaveBeenCalledWith(
      1,
      1,
      5,
      "さようなら",
    );
  });
});

describe("正規表現エッジケース", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("空マッチする正規表現でも無限ループしない", async () => {
    const mockEditorRef = createMockEditorInstance("test");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 正規表現モードをオン
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/正規表現/));
    });

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      // 空マッチする正規表現（任意の位置にマッチ）
      fireEvent.change(searchbox, { target: { value: ".*?" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // エラーにならずに結果が返る
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.queryByText(/エラー/)).not.toBeInTheDocument();
  });

  it("複雑な正規表現パターンが動作", async () => {
    const mockEditorRef = createMockEditorInstance(
      "email1@test.com, email2@test.org, not-email",
    );

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 正規表現モードをオン
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/正規表現/));
    });

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      // メールアドレスパターン
      fireEvent.change(searchbox, {
        target: { value: "\\w+@\\w+\\.\\w+" },
      });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 2件のマッチ
    expect(screen.getByText(/1.*\/.*2|1\s*of\s*2/)).toBeInTheDocument();
  });
});

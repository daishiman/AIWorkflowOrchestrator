/**
 * 異常系テスト
 *
 * Phase 6: エラーハンドリングをカバーするテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchPanel } from "../../components/SearchPanel";
import { WorkspaceSearchPanel } from "../../components/WorkspaceSearchPanel";
import type { EditorInstance, FileSearchResult } from "../../types";

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
    replaceText: vi.fn(),
    replaceAllText: vi.fn(),
    focus: vi.fn(),
  },
});

describe("Search error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("無効な正規表現でエラーまたは結果なしが表示される", async () => {
    const mockEditorRef = createMockEditorInstance("test content");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 正規表現モードをオン
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/正規表現/));
    });

    // 無効な正規表現を入力
    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "[invalid" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // エラーメッセージまたは結果なしが表示される
    const hasErrorOrNoResults =
      screen.queryByText(/無効な正規表現/) || screen.queryByText(/結果なし/);
    expect(hasErrorOrNoResults).toBeTruthy();
  });

  it("検索クエリをクリアすると状態がリセットされる", async () => {
    const mockEditorRef = createMockEditorInstance("test content");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 正規表現モードをオン
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/正規表現/));
    });

    // 無効な正規表現を入力
    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "[invalid" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 結果なしまたはエラーが表示される
    const hasErrorOrNoResults =
      screen.queryByText(/無効な正規表現/) || screen.queryByText(/結果なし/);
    expect(hasErrorOrNoResults).toBeTruthy();

    // クエリをクリア
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 結果なしメッセージも消える（ステータス領域に何も表示されない）
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");
  });

  it("正規表現モードをオフにすると通常の文字列検索になる", async () => {
    const mockEditorRef = createMockEditorInstance(
      "test content [invalid pattern",
    );

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 正規表現モードをオン
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/正規表現/));
    });

    // 無効な正規表現を入力
    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "[invalid" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 結果なしまたはエラーが表示される
    const hasErrorOrNoResults =
      screen.queryByText(/無効な正規表現/) || screen.queryByText(/結果なし/);
    expect(hasErrorOrNoResults).toBeTruthy();

    // 正規表現モードをオフ
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/正規表現/));
    });

    // 同じパターンを再検索（通常の文字列として）
    await act(async () => {
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // "[invalid" がリテラル文字列としてマッチする
    expect(screen.getByText(/1.*\/.*1|1\s*of\s*1/)).toBeInTheDocument();
  });
});

describe("Workspace search error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("検索プロバイダーエラー時にエラーメッセージを表示", async () => {
    // eslint-disable-next-line require-yield
    const errorProvider = async function* (): AsyncGenerator<FileSearchResult> {
      throw new Error("Search failed");
    };

    render(
      <WorkspaceSearchPanel
        isOpen={true}
        onClose={vi.fn()}
        searchProvider={errorProvider}
        onFileOpen={vi.fn()}
        onReplace={vi.fn()}
        workspaceRoot="/test"
      />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // エラーまたは結果なしが表示される
    const hasError =
      screen.queryByText(/エラー/) ||
      screen.queryByText(/結果なし/) ||
      screen.queryByText(/検索に失敗/);
    expect(hasError).toBeTruthy();
  });

  it("空の検索結果が正しくハンドリングされる", async () => {
    const emptyProvider = async function* (): AsyncGenerator<FileSearchResult> {
      // 何も yield しない
    };

    render(
      <WorkspaceSearchPanel
        isOpen={true}
        onClose={vi.fn()}
        searchProvider={emptyProvider}
        onFileOpen={vi.fn()}
        onReplace={vi.fn()}
        workspaceRoot="/test"
      />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "notfound" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // 結果なしが表示される
    expect(screen.getByText(/結果なし|0 件/)).toBeInTheDocument();
  });
});

describe("Adapter error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("EditorInstance が null でもエラーにならない", async () => {
    const nullRef = { current: null as EditorInstance | null };

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={nullRef as unknown as React.RefObject<EditorInstance>}
      />,
    );

    const searchbox = screen.getByRole("searchbox");

    // 検索を試みてもエラーにならない
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // パネルは表示されている
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("getContent がエラーを投げても処理される", async () => {
    const errorRef = {
      current: {
        getContent: vi.fn(() => {
          throw new Error("Content error");
        }),
        setHighlights: vi.fn(),
        getHighlights: vi.fn(() => []),
        scrollToLine: vi.fn(),
        getCursorPosition: vi.fn(() => ({ line: 1, column: 1 })),
        setCursorPosition: vi.fn(),
        replaceText: vi.fn(),
        replaceAllText: vi.fn(),
        focus: vi.fn(),
      },
    };

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={errorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");

    // 検索を試みる
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // エラーハンドリングされてパネルは表示されている
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Replace error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("マッチがない状態で置換ボタンを押してもエラーにならない", async () => {
    const mockEditorRef = createMockEditorInstance("test content");

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={mockEditorRef}
        showReplace={true}
      />,
    );

    const replaceButton = screen.getByRole("button", { name: "置換" });

    // マッチがない状態で置換ボタンを押す
    await act(async () => {
      fireEvent.click(replaceButton);
    });

    // エラーにならない
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // replaceText は呼ばれない
    expect(mockEditorRef.current.replaceText).not.toHaveBeenCalled();
  });

  it("マッチがない状態で全置換ボタンを押してもエラーにならない", async () => {
    const mockEditorRef = createMockEditorInstance("test content");

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={mockEditorRef}
        showReplace={true}
      />,
    );

    const replaceAllButton = screen.getByRole("button", {
      name: /すべて置換|全置換/,
    });

    // マッチがない状態で全置換ボタンを押す
    await act(async () => {
      fireEvent.click(replaceAllButton);
    });

    // エラーにならない
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // replaceAllText は呼ばれない
    expect(mockEditorRef.current.replaceAllText).not.toHaveBeenCalled();
  });
});

describe("State recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("無効な正規表現後に正常な検索が動作する", async () => {
    const mockEditorRef = createMockEditorInstance("test content test");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 正規表現モードをオン
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/正規表現/));
    });

    // 無効な正規表現を入力
    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "[invalid" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 結果なしまたはエラーが表示される
    const hasErrorOrNoResults =
      screen.queryByText(/無効な正規表現/) || screen.queryByText(/結果なし/);
    expect(hasErrorOrNoResults).toBeTruthy();

    // 正しい正規表現を入力
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 正常に検索結果が表示される
    expect(screen.getByText(/1.*\/.*2|1\s*of\s*2/)).toBeInTheDocument();
  });
});

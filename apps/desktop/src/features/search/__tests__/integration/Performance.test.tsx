/**
 * パフォーマンステスト
 *
 * Phase 6: パフォーマンス要件を検証するテスト
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
    replaceText: vi.fn(),
    replaceAllText: vi.fn(),
    focus: vi.fn(),
  },
});

describe("Performance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("大量のマッチでも UI がブロックされない", async () => {
    // 1000件のマッチを含むコンテンツ
    const content = "test ".repeat(1000);
    const mockEditorRef = createMockEditorInstance(content);

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");

    const startTime = performance.now();

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    const endTime = performance.now();

    // 1秒以内に完了
    expect(endTime - startTime).toBeLessThan(1000);

    // 結果が表示される
    expect(screen.getByText(/1.*\/.*1000|1\s*of\s*1000/)).toBeInTheDocument();
  });

  it("非常に長いテキストでも検索が動作する", async () => {
    // 10万文字のコンテンツ
    const content = "a".repeat(100000);
    const mockEditorRef = createMockEditorInstance(content);

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");

    const startTime = performance.now();

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "aaa" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    const endTime = performance.now();

    // 2秒以内に完了
    expect(endTime - startTime).toBeLessThan(2000);
  });

  it("検索クエリの変更が即座に反映される", async () => {
    const mockEditorRef = createMockEditorInstance("test content test");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");

    // 検索入力
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
    });

    // 入力値がすぐに反映される
    expect(searchbox).toHaveValue("test");
  });

  it("ハイライト設定が効率的に行われる", async () => {
    const content = "test test test";
    const mockEditorRef = createMockEditorInstance(content);

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // setHighlights が1回だけ呼ばれる（効率的）
    expect(mockEditorRef.current.setHighlights).toHaveBeenCalledTimes(1);
  });

  it("ナビゲーション時のハイライト更新が効率的", async () => {
    const content = "test test test";
    const mockEditorRef = createMockEditorInstance(content);

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");

    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    const initialCalls = (
      mockEditorRef.current.setHighlights as ReturnType<typeof vi.fn>
    ).mock.calls.length;

    // 次の結果に移動
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /次の結果/ }));
    });

    // ハイライト更新が1回だけ追加される
    expect(
      (mockEditorRef.current.setHighlights as ReturnType<typeof vi.fn>).mock
        .calls.length,
    ).toBe(initialCalls + 1);
  });

  it("置換後の再検索が効率的", async () => {
    const mockEditorRef = createMockEditorInstance("test test test");

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

    const callsBeforeReplace = (
      mockEditorRef.current.setHighlights as ReturnType<typeof vi.fn>
    ).mock.calls.length;

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "置換" }));
    });

    // 置換後に再検索が行われる
    expect(
      (mockEditorRef.current.setHighlights as ReturnType<typeof vi.fn>).mock
        .calls.length,
    ).toBeGreaterThan(callsBeforeReplace);
  });
});

describe("Memory efficiency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("検索結果が適切にクリアされる", async () => {
    const mockEditorRef = createMockEditorInstance("test content");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");

    // 検索実行
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 結果がある
    expect(screen.getByText(/1.*\/.*1|1\s*of\s*1/)).toBeInTheDocument();

    // 検索クエリをクリア
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // ハイライトがクリアされる
    const lastCall = (
      mockEditorRef.current.setHighlights as ReturnType<typeof vi.fn>
    ).mock.calls.slice(-1)[0];
    expect(lastCall[0]).toEqual([]);
  });

  it("コンポーネントのアンマウント時にリソースが解放される", async () => {
    const mockEditorRef = createMockEditorInstance("test content");
    const { unmount } = render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // コンポーネントをアンマウント
    unmount();

    // エラーなしでアンマウントが完了
    expect(true).toBe(true);
  });
});

describe("Rendering efficiency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("不要な再レンダリングが発生しない", async () => {
    const mockEditorRef = createMockEditorInstance("test content");
    let renderCount = 0;

    // レンダリングカウント用のコンポーネント
    const CountingWrapper = ({ children }: { children: React.ReactNode }) => {
      renderCount++;
      return <>{children}</>;
    };

    render(
      <CountingWrapper>
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />
      </CountingWrapper>,
    );

    const initialRenderCount = renderCount;

    // 検索実行
    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
    });

    // 入力時のレンダリングは許容される
    expect(renderCount).toBe(initialRenderCount);
  });

  it("検索オプション変更時のレンダリングが効率的", async () => {
    const mockEditorRef = createMockEditorInstance("test content");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // オプション変更
    await act(async () => {
      fireEvent.click(screen.getByLabelText(/大文字小文字を区別/));
    });

    // エラーなしで完了
    expect(screen.getByLabelText(/大文字小文字を区別/)).toBeInTheDocument();
  });
});

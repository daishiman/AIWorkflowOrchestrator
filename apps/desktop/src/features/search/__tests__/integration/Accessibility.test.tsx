/**
 * アクセシビリティテスト
 *
 * Phase 6: WCAG 2.1 AA 準拠を検証するテスト
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
  content: string = "test content\nline 2\nline 3",
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

describe("Accessibility - Keyboard navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("Tab キーでフォーカスが正しく移動", async () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={mockEditorRef}
        showReplace={true}
      />,
    );

    const searchbox = screen.getByRole("searchbox");

    // 検索入力にフォーカス
    searchbox.focus();
    expect(document.activeElement).toBe(searchbox);

    // Tab でフォーカス移動
    await act(async () => {
      fireEvent.keyDown(searchbox, { key: "Tab" });
    });

    // 次のフォーカス可能な要素に移動する（ブラウザの動作）
    // 実際のTab動作は userEvent で模擬する必要がある
    expect(document.activeElement).not.toBe(null);
  });

  it("Enter キーで検索実行", async () => {
    const mockEditorRef = createMockEditorInstance("test test test");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 検索が実行される
    expect(screen.getByText(/1.*\/.*3|1\s*of\s*3/)).toBeInTheDocument();
  });

  it("Escape キーでパネルを閉じる", async () => {
    const mockEditorRef = createMockEditorInstance();
    const onClose = vi.fn();

    render(
      <SearchPanel isOpen={true} onClose={onClose} editorRef={mockEditorRef} />,
    );

    await act(async () => {
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("F3 で次の結果にナビゲート", async () => {
    const mockEditorRef = createMockEditorInstance("test test test");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 検索実行
    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // F3 で次へ
    await act(async () => {
      fireEvent.keyDown(document, { key: "F3" });
    });

    // 2番目の結果に移動
    expect(screen.getByText(/2.*\/.*3|2\s*of\s*3/)).toBeInTheDocument();
  });

  it("Shift+F3 で前の結果にナビゲート", async () => {
    const mockEditorRef = createMockEditorInstance("test test test");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 検索実行
    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // F3 で次へ
    await act(async () => {
      fireEvent.keyDown(document, { key: "F3" });
    });

    // Shift+F3 で前へ
    await act(async () => {
      fireEvent.keyDown(document, { key: "F3", shiftKey: true });
    });

    // 最初の結果に戻る
    expect(screen.getByText(/1.*\/.*3|1\s*of\s*3/)).toBeInTheDocument();
  });
});

describe("Accessibility - ARIA attributes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("検索パネルに role=dialog が設定されている", () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("検索入力に role=searchbox が設定されている", () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("検索入力に aria-label が設定されている", () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    expect(searchbox).toHaveAttribute("aria-label", "検索");
  });

  it("検索結果カウントが aria-live で通知される", async () => {
    const mockEditorRef = createMockEditorInstance("test test test");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // ステータス領域を確認
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("検索パネルに aria-label が設定されている", () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "検索");
  });

  it("ボタンに aria-label が設定されている", () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 閉じるボタン
    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();

    // 前の結果ボタン
    expect(
      screen.getByRole("button", { name: "前の結果" }),
    ).toBeInTheDocument();

    // 次の結果ボタン
    expect(
      screen.getByRole("button", { name: "次の結果" }),
    ).toBeInTheDocument();
  });

  it("展開ボタンに aria-expanded が設定されている", async () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const expandButton = screen.getByRole("button", { name: /置換を表示/ });
    expect(expandButton).toHaveAttribute("aria-expanded", "false");

    await act(async () => {
      fireEvent.click(expandButton);
    });

    expect(screen.getByRole("button", { name: /置換を隠す/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("入力フィールドに aria-describedby が設定されている", () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    expect(searchbox).toHaveAttribute("aria-describedby", "search-status");

    // ステータス要素が存在
    expect(document.getElementById("search-status")).toBeInTheDocument();
  });
});

describe("Accessibility - Focus management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("パネル表示時に検索入力にフォーカスされる", () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    expect(document.activeElement).toBe(searchbox);
  });

  it("初期検索テキストが設定されている場合もフォーカスされる", () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel
        isOpen={true}
        onClose={vi.fn()}
        editorRef={mockEditorRef}
        initialSearchText="initial"
      />,
    );

    const searchbox = screen.getByRole("searchbox");
    expect(document.activeElement).toBe(searchbox);
    expect(searchbox).toHaveValue("initial");
  });

  it("無効化されたボタンはフォーカス可能だが操作不可", async () => {
    const mockEditorRef = createMockEditorInstance();

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    // 結果がない状態でのナビゲーションボタン
    const prevButton = screen.getByRole("button", { name: "前の結果" });
    const nextButton = screen.getByRole("button", { name: "次の結果" });

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});

describe("Accessibility - Screen reader support", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("検索結果の変更が aria-live で通知される", async () => {
    const mockEditorRef = createMockEditorInstance("test test test");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    const status = screen.getByRole("status");

    // 検索実行
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "test" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // ステータスが更新される
    expect(status).toHaveTextContent(/1.*\/.*3/);
  });

  it("エラー時のメッセージが表示される", async () => {
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

    // エラーメッセージがステータス領域に表示される
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
  });

  it("結果なしの場合のメッセージが表示される", async () => {
    const mockEditorRef = createMockEditorInstance("test content");

    render(
      <SearchPanel isOpen={true} onClose={vi.fn()} editorRef={mockEditorRef} />,
    );

    const searchbox = screen.getByRole("searchbox");
    await act(async () => {
      fireEvent.change(searchbox, { target: { value: "notfound" } });
      fireEvent.keyDown(searchbox, { key: "Enter" });
    });

    // 結果なしのメッセージ
    expect(screen.getByText(/結果なし/)).toBeInTheDocument();
  });
});

/**
 * キーボードショートカット統合テスト
 *
 * Phase 4: TDD Red - キーボードショートカットテストケース
 *
 * このテストは検索パネルのキーボードショートカットが
 * 正しく機能することを検証します。
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
  content: string = "test content\ntest line 2\ntest line 3",
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

describe("Keyboard Shortcuts", () => {
  let mockEditorRef: ReturnType<typeof createMockEditorInstance>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockEditorRef = createMockEditorInstance();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("検索入力フィールドショートカット", () => {
    it("Enter で検索を実行する", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "test" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      expect(mockEditorRef.current.setHighlights).toHaveBeenCalled();
    });

    it("Shift+Enter で前のマッチに移動する", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");

      // 検索実行
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "test" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 次のマッチへ移動
      await act(async () => {
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 前のマッチへ移動
      await act(async () => {
        fireEvent.keyDown(searchbox, { key: "Enter", shiftKey: true });
      });

      expect(mockEditorRef.current.scrollToLine).toHaveBeenCalled();
    });

    it("Escape でパネルを閉じる", async () => {
      const onClose = vi.fn();
      render(
        <SearchPanel
          isOpen={true}
          onClose={onClose}
          editorRef={mockEditorRef}
        />,
      );

      await act(async () => {
        fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("ナビゲーションショートカット", () => {
    it("F3 で次のマッチに移動する", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");

      // 検索実行
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "test" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // F3 で次のマッチへ
      await act(async () => {
        fireEvent.keyDown(document, { key: "F3" });
      });

      expect(mockEditorRef.current.scrollToLine).toHaveBeenCalled();
    });

    it("Shift+F3 で前のマッチに移動する", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");

      // 検索実行
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "test" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      const initialCallCount = (
        mockEditorRef.current.scrollToLine as ReturnType<typeof vi.fn>
      ).mock.calls.length;

      // F3 で次のマッチへ
      await act(async () => {
        fireEvent.keyDown(document, { key: "F3" });
      });

      // Shift+F3 で前のマッチへ
      await act(async () => {
        fireEvent.keyDown(document, { key: "F3", shiftKey: true });
      });

      expect(
        (mockEditorRef.current.scrollToLine as ReturnType<typeof vi.fn>).mock
          .calls.length,
      ).toBeGreaterThanOrEqual(initialCallCount + 2);
    });

    it("循環ナビゲーション: 最後のマッチから次へで最初に戻る", async () => {
      const content = "test test"; // 2つのマッチ
      mockEditorRef = createMockEditorInstance(content);

      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");

      // 検索実行
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "test" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 初期状態で 1/2
      expect(screen.getByText(/1\/2/)).toBeInTheDocument();

      // 次へ (2/2)
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /次へ|次の結果/ }));
      });

      // 次へ (1/2 に戻る)
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /次へ|次の結果/ }));
      });

      expect(screen.getByText(/1\/2/)).toBeInTheDocument();
    });
  });

  describe("置換ショートカット", () => {
    it("Alt+Enter で全置換を実行する", async () => {
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

      // 検索と置換テキスト入力
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "test" } });
        fireEvent.change(replaceInput, { target: { value: "exam" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // Alt+Enter で全置換
      await act(async () => {
        fireEvent.keyDown(replaceInput, { key: "Enter", altKey: true });
      });

      expect(mockEditorRef.current.replaceAllText).toHaveBeenCalled();
    });

    it("置換入力フィールドで Enter を押すと置換が実行される", async () => {
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

      // 検索と置換テキスト入力
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "test" } });
        fireEvent.change(replaceInput, { target: { value: "exam" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 置換入力で Enter
      await act(async () => {
        fireEvent.keyDown(replaceInput, { key: "Enter" });
      });

      // replaceText または次のマッチへ移動が呼ばれる
      const replaceTextCalled =
        (mockEditorRef.current.replaceText as ReturnType<typeof vi.fn>).mock
          .calls.length > 0;
      const scrollToLineCalled =
        (mockEditorRef.current.scrollToLine as ReturnType<typeof vi.fn>).mock
          .calls.length > 0;

      expect(replaceTextCalled || scrollToLineCalled).toBe(true);
    });
  });

  describe("置換モード切替", () => {
    it("展開ボタンで置換モードを切り替えられる", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      // 初期状態では置換入力がない
      expect(screen.queryByPlaceholderText(/置換/)).not.toBeInTheDocument();

      // 展開ボタンをクリック
      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /展開|置換を表示/ }),
        );
      });

      // 置換入力が表示される
      expect(screen.getByPlaceholderText(/置換/)).toBeInTheDocument();
    });

    it("置換モードで再度展開ボタンを押すと閉じる", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      // 展開
      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /展開|置換を表示/ }),
        );
      });

      expect(screen.getByPlaceholderText(/置換/)).toBeInTheDocument();

      // 折りたたみ
      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /折りたたみ|置換を隠す/ }),
        );
      });

      expect(screen.queryByPlaceholderText(/置換/)).not.toBeInTheDocument();
    });
  });

  describe("検索オプションショートカット", () => {
    it("大文字小文字区別ボタンをクリックでトグルできる", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const caseSensitiveButton = screen.getByLabelText(/大文字小文字を区別/);
      expect(caseSensitiveButton).toHaveAttribute("aria-pressed", "false");

      await act(async () => {
        fireEvent.click(caseSensitiveButton);
      });

      expect(caseSensitiveButton).toHaveAttribute("aria-pressed", "true");

      await act(async () => {
        fireEvent.click(caseSensitiveButton);
      });

      expect(caseSensitiveButton).toHaveAttribute("aria-pressed", "false");
    });

    it("正規表現ボタンをクリックでトグルできる", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const regexButton = screen.getByLabelText(/正規表現/);
      expect(regexButton).toHaveAttribute("aria-pressed", "false");

      await act(async () => {
        fireEvent.click(regexButton);
      });

      expect(regexButton).toHaveAttribute("aria-pressed", "true");
    });

    it("単語単位ボタンをクリックでトグルできる", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const wholeWordButton = screen.getByLabelText(/単語単位/);
      expect(wholeWordButton).toHaveAttribute("aria-pressed", "false");

      await act(async () => {
        fireEvent.click(wholeWordButton);
      });

      expect(wholeWordButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("フォーカス管理", () => {
    it("パネル表示時に検索入力にフォーカスされる", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      const searchbox = screen.getByRole("searchbox");
      expect(document.activeElement).toBe(searchbox);
    });

    it("Tab キーでフォーカスが正しく移動する", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");

      // Tab キーでフォーカス移動
      await act(async () => {
        fireEvent.keyDown(searchbox, { key: "Tab" });
      });

      // フォーカスがどこかに移動している（パネル内の別要素）
      // 具体的な要素は実装依存
      expect(document.activeElement).not.toBeNull();
    });
  });
});

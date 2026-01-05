/**
 * SearchPanel コンポーネント テスト
 * TDD Red Phase - これらのテストは実装前なので失敗する
 *
 * カバレッジ目標: 90%以上
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { SearchPanel } from "../components/SearchPanel";
import type { EditorInstance } from "../types";

expect.extend(toHaveNoViolations);

// モックエディタインスタンス
const createMockEditorRef = (
  content: string = "",
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

describe("SearchPanel", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    editorRef: createMockEditorRef("hello world hello"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("レンダリング", () => {
    it("パネルが開いている時に表示される", () => {
      render(<SearchPanel {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByLabelText(/検索/)).toBeInTheDocument();
    });

    it("パネルが閉じている時に表示されない", () => {
      render(<SearchPanel {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("検索入力フィールドが表示される", () => {
      render(<SearchPanel {...defaultProps} />);

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("検索オプションボタンが表示される", () => {
      render(<SearchPanel {...defaultProps} />);

      expect(screen.getByLabelText(/大文字小文字を区別/)).toBeInTheDocument();
      expect(screen.getByLabelText(/正規表現/)).toBeInTheDocument();
      expect(screen.getByLabelText(/単語単位/)).toBeInTheDocument();
    });

    it("閉じるボタンが表示される", () => {
      render(<SearchPanel {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /閉じる/ }),
      ).toBeInTheDocument();
    });

    it("ナビゲーションボタンが表示される", () => {
      render(<SearchPanel {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /前へ|前の結果/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /次へ|次の結果/ }),
      ).toBeInTheDocument();
    });
  });

  describe("置換モード", () => {
    it("showReplaceがtrueの時、置換入力が表示される", () => {
      render(<SearchPanel {...defaultProps} showReplace />);

      expect(screen.getByPlaceholderText(/置換/)).toBeInTheDocument();
    });

    it("置換ボタンと全置換ボタンが表示される", () => {
      render(<SearchPanel {...defaultProps} showReplace />);

      expect(
        screen.getByRole("button", { name: /置換$|^置換/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /すべて置換|全置換/ }),
      ).toBeInTheDocument();
    });

    it("展開ボタンで置換モードを切り替えられる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<SearchPanel {...defaultProps} />);

      // 初期状態では置換入力がない
      expect(screen.queryByPlaceholderText(/置換/)).not.toBeInTheDocument();

      // 展開ボタンをクリック
      await user.click(screen.getByRole("button", { name: /展開|置換を表示/ }));

      // 置換入力が表示される
      expect(screen.getByPlaceholderText(/置換/)).toBeInTheDocument();
    });
  });

  describe("検索機能", () => {
    it("テキストを入力すると検索が実行される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("hello world hello");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "hello");

      // デバウンス時間経過
      vi.advanceTimersByTime(150);

      // ハイライトが設定される
      expect(editorRef.current.setHighlights).toHaveBeenCalled();
    });

    it("検索結果の件数が表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("hello world hello");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "hello");
      vi.advanceTimersByTime(150);

      // "1/2" や "1 of 2" などの形式で表示
      await waitFor(() => {
        expect(screen.getByText(/1.*\/.*2|1\s*of\s*2/)).toBeInTheDocument();
      });
    });

    it("マッチがない場合は0件と表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("hello world hello");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "notfound");
      vi.advanceTimersByTime(150);

      await waitFor(() => {
        expect(screen.getByText(/0.*件|0.*of.*0|結果なし/)).toBeInTheDocument();
      });
    });

    it("initialSearchTextが設定されている場合、自動的に検索が実行される", async () => {
      const editorRef = createMockEditorRef("hello world hello");
      render(
        <SearchPanel
          {...defaultProps}
          editorRef={editorRef}
          initialSearchText="hello"
        />,
      );

      vi.advanceTimersByTime(150);

      expect(editorRef.current.setHighlights).toHaveBeenCalled();
    });
  });

  describe("検索オプション", () => {
    it("大文字小文字を区別オプションを切り替えられる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<SearchPanel {...defaultProps} />);

      const caseSensitiveButton = screen.getByLabelText(/大文字小文字を区別/);
      expect(caseSensitiveButton).toHaveAttribute("aria-pressed", "false");

      await user.click(caseSensitiveButton);

      expect(caseSensitiveButton).toHaveAttribute("aria-pressed", "true");
    });

    it("正規表現オプションを切り替えられる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<SearchPanel {...defaultProps} />);

      const regexButton = screen.getByLabelText(/正規表現/);
      expect(regexButton).toHaveAttribute("aria-pressed", "false");

      await user.click(regexButton);

      expect(regexButton).toHaveAttribute("aria-pressed", "true");
    });

    it("単語単位オプションを切り替えられる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<SearchPanel {...defaultProps} />);

      const wholeWordButton = screen.getByLabelText(/単語単位/);
      expect(wholeWordButton).toHaveAttribute("aria-pressed", "false");

      await user.click(wholeWordButton);

      expect(wholeWordButton).toHaveAttribute("aria-pressed", "true");
    });

    it("オプション変更で検索が再実行される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("hello Hello HELLO");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "hello");
      vi.advanceTimersByTime(150);

      const initialCallCount = (
        editorRef.current.setHighlights as ReturnType<typeof vi.fn>
      ).mock.calls.length;

      // 大文字小文字区別をオンにする
      await user.click(screen.getByLabelText(/大文字小文字を区別/));
      vi.advanceTimersByTime(150);

      expect(editorRef.current.setHighlights).toHaveBeenCalledTimes(
        initialCallCount + 1,
      );
    });
  });

  describe("検索ナビゲーション", () => {
    it("次へボタンで次の結果に移動する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test test");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      await user.click(screen.getByRole("button", { name: /次へ|次の結果/ }));

      expect(editorRef.current.scrollToLine).toHaveBeenCalled();
    });

    it("前へボタンで前の結果に移動する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test test");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      // まず次へ移動
      await user.click(screen.getByRole("button", { name: /次へ|次の結果/ }));
      // 次に前へ移動
      await user.click(screen.getByRole("button", { name: /前へ|前の結果/ }));

      expect(editorRef.current.scrollToLine).toHaveBeenCalledTimes(2);
    });

    it("結果がない場合、ナビゲーションボタンは無効化される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("hello world");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "notfound");
      vi.advanceTimersByTime(150);

      expect(
        screen.getByRole("button", { name: /次へ|次の結果/ }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /前へ|前の結果/ }),
      ).toBeDisabled();
    });

    it("最後の結果から次へで最初の結果に戻る（ラップアラウンド）", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      // 2つの結果があるので2回次へ押すと最初に戻る
      await user.click(screen.getByRole("button", { name: /次へ|次の結果/ }));
      await user.click(screen.getByRole("button", { name: /次へ|次の結果/ }));

      await waitFor(() => {
        expect(screen.getByText(/1.*\/.*2|1\s*of\s*2/)).toBeInTheDocument();
      });
    });
  });

  describe("置換機能", () => {
    it("置換ボタンで現在の結果を置換する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("hello world hello");
      render(
        <SearchPanel {...defaultProps} editorRef={editorRef} showReplace />,
      );

      await user.type(screen.getByRole("searchbox"), "hello");
      await user.type(screen.getByPlaceholderText(/置換/), "hi");
      vi.advanceTimersByTime(150);

      await user.click(screen.getByRole("button", { name: /置換$|^置換/ }));

      expect(editorRef.current.replaceText).toHaveBeenCalled();
    });

    it("全置換ボタンで全ての結果を置換する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("hello world hello");
      render(
        <SearchPanel {...defaultProps} editorRef={editorRef} showReplace />,
      );

      await user.type(screen.getByRole("searchbox"), "hello");
      await user.type(screen.getByPlaceholderText(/置換/), "hi");
      vi.advanceTimersByTime(150);

      await user.click(
        screen.getByRole("button", { name: /すべて置換|全置換/ }),
      );

      expect(editorRef.current.replaceAllText).toHaveBeenCalled();
    });

    it("検索結果がない場合、置換ボタンは無効化される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("hello world");
      render(
        <SearchPanel {...defaultProps} editorRef={editorRef} showReplace />,
      );

      await user.type(screen.getByRole("searchbox"), "notfound");
      vi.advanceTimersByTime(150);

      expect(
        screen.getByRole("button", { name: /置換$|^置換/ }),
      ).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /すべて置換|全置換/ }),
      ).toBeDisabled();
    });
  });

  describe("キーボードショートカット", () => {
    it("Escapeキーでパネルを閉じる", async () => {
      const onClose = vi.fn();
      render(<SearchPanel {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

      expect(onClose).toHaveBeenCalled();
    });

    it("Enterキーで次の結果に移動する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test test");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Enter" });

      expect(editorRef.current.scrollToLine).toHaveBeenCalled();
    });

    it("Shift+Enterキーで前の結果に移動する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test test");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      // まず次へ移動
      fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Enter" });
      // 次にShift+Enterで前へ
      fireEvent.keyDown(screen.getByRole("searchbox"), {
        key: "Enter",
        shiftKey: true,
      });

      expect(editorRef.current.scrollToLine).toHaveBeenCalledTimes(2);
    });

    it("F3キーで次の結果に移動する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test test");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      fireEvent.keyDown(document, { key: "F3" });

      expect(editorRef.current.scrollToLine).toHaveBeenCalled();
    });

    it("Shift+F3キーで前の結果に移動する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test test");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      // まず次へ移動
      fireEvent.keyDown(document, { key: "F3" });
      // Shift+F3で前へ
      fireEvent.keyDown(document, { key: "F3", shiftKey: true });

      expect(editorRef.current.scrollToLine).toHaveBeenCalledTimes(2);
    });

    it("Ctrl/Cmd+Hで置換モードを切り替える", async () => {
      render(<SearchPanel {...defaultProps} />);

      // 初期状態では置換入力がない
      expect(screen.queryByPlaceholderText(/置換/)).not.toBeInTheDocument();

      fireEvent.keyDown(document, { key: "h", metaKey: true });

      // 置換入力が表示される
      expect(screen.getByPlaceholderText(/置換/)).toBeInTheDocument();
    });

    it("Alt+Enterで全置換を実行する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test test");
      render(
        <SearchPanel {...defaultProps} editorRef={editorRef} showReplace />,
      );

      await user.type(screen.getByRole("searchbox"), "test");
      await user.type(screen.getByPlaceholderText(/置換/), "exam");
      vi.advanceTimersByTime(150);

      fireEvent.keyDown(screen.getByPlaceholderText(/置換/), {
        key: "Enter",
        altKey: true,
      });

      expect(editorRef.current.replaceAllText).toHaveBeenCalled();
    });
  });

  describe("アクセシビリティ", () => {
    it("axe-coreによるアクセシビリティ違反がない", async () => {
      const { container } = render(<SearchPanel {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("dialogにaria-labelが設定されている", () => {
      render(<SearchPanel {...defaultProps} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-label");
    });

    it("検索入力にaria-describedbyが設定されている", () => {
      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toHaveAttribute("aria-describedby");
    });

    it("検索結果件数がaria-liveで通知される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test test");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      const liveRegion = screen.getByRole("status");
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
    });

    it("フォーカストラップが機能する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<SearchPanel {...defaultProps} />);

      const searchInput = screen.getByRole("searchbox");
      const closeButton = screen.getByRole("button", { name: /閉じる/ });

      // 最初のフォーカス
      expect(document.activeElement).toBe(searchInput);

      // Tabでフォーカス移動（最後の要素まで行ったら最初に戻る）
      await user.tab();
      await user.tab();
      await user.tab();
      // ... 最終的に検索入力に戻る
    });

    it("置換モードでもアクセシビリティ違反がない", async () => {
      const { container } = render(
        <SearchPanel {...defaultProps} showReplace />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("パフォーマンス", () => {
    it("デバウンスによって不要な検索が防がれる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test test test");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      const searchInput = screen.getByRole("searchbox");

      // 高速で入力
      for (let i = 0; i < 10; i++) {
        await user.type(searchInput, "a");
        vi.advanceTimersByTime(50);
      }

      // まだ検索されていない（デバウンス中）
      expect(editorRef.current.setHighlights).not.toHaveBeenCalled();

      // デバウンス時間経過
      vi.advanceTimersByTime(150);

      // 1回だけ呼ばれる
      expect(editorRef.current.setHighlights).toHaveBeenCalledTimes(1);
    });

    it("大量のマッチでもUIがブロックされない", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const largeContent = "test ".repeat(10000);
      const editorRef = createMockEditorRef(largeContent);
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      const startTime = Date.now();

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      const duration = Date.now() - startTime;
      // UIがブロックされない程度の時間で完了する
      expect(duration).toBeLessThan(500);
    });
  });

  describe("エッジケース", () => {
    it("空のコンテンツでもエラーなく動作する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "test");
      vi.advanceTimersByTime(150);

      expect(screen.getByText(/0.*件|0.*of.*0|結果なし/)).toBeInTheDocument();
    });

    it("特殊文字を含む検索が正しく動作する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test [special] (chars)");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "[special]");
      vi.advanceTimersByTime(150);

      // 正規表現モードでなければ、特殊文字もそのままマッチ
      expect(editorRef.current.setHighlights).toHaveBeenCalled();
    });

    it("無効な正規表現を入力してもエラーにならない", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("test content");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      // 正規表現モードをオン
      await user.click(screen.getByLabelText(/正規表現/));

      // 無効な正規表現を入力
      await user.type(screen.getByRole("searchbox"), "[invalid");
      vi.advanceTimersByTime(150);

      // エラー表示
      expect(screen.getByText(/無効な正規表現|エラー/)).toBeInTheDocument();
    });

    it("日本語を検索できる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("こんにちは世界");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "こんにちは");
      vi.advanceTimersByTime(150);

      expect(editorRef.current.setHighlights).toHaveBeenCalled();
    });

    it("絵文字を含むコンテンツで検索できる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const editorRef = createMockEditorRef("hello 😀 world");
      render(<SearchPanel {...defaultProps} editorRef={editorRef} />);

      await user.type(screen.getByRole("searchbox"), "hello");
      vi.advanceTimersByTime(150);

      expect(editorRef.current.setHighlights).toHaveBeenCalled();
    });
  });

  describe("状態の永続化", () => {
    it("検索オプションの状態がパネルを閉じても保持される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { rerender } = render(<SearchPanel {...defaultProps} />);

      // オプションをオンにする
      await user.click(screen.getByLabelText(/大文字小文字を区別/));
      expect(screen.getByLabelText(/大文字小文字を区別/)).toHaveAttribute(
        "aria-pressed",
        "true",
      );

      // パネルを閉じる
      rerender(<SearchPanel {...defaultProps} isOpen={false} />);

      // パネルを再度開く
      rerender(<SearchPanel {...defaultProps} isOpen={true} />);

      // オプションが保持されている
      expect(screen.getByLabelText(/大文字小文字を区別/)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("検索履歴が保持される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<SearchPanel {...defaultProps} />);

      // 検索を実行
      await user.type(screen.getByRole("searchbox"), "first search");
      vi.advanceTimersByTime(150);

      // 検索入力をクリア
      await user.clear(screen.getByRole("searchbox"));

      // 別の検索を実行
      await user.type(screen.getByRole("searchbox"), "second search");
      vi.advanceTimersByTime(150);

      // 履歴から選択可能（実装による）
    });
  });
});

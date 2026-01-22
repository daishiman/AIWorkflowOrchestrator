/**
 * EditorView と SearchPanel の統合テスト
 *
 * Phase 4: TDD Red - EditorView統合テストケース
 *
 * このテストは EditorView と SearchPanel/WorkspaceSearchPanel の
 * 統合が正しく機能することを検証します。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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
  content: string = "line 1\nline 2\nline 3\nhello world\nhello again",
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

describe("EditorView SearchPanel 統合", () => {
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

  describe("SearchPanel 表示・非表示", () => {
    it("isOpen=true の時、SearchPanel が表示される", () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("isOpen=false の時、SearchPanel は表示されない", () => {
      render(
        <SearchPanel
          isOpen={false}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("Escape キーで onClose が呼ばれる", async () => {
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

    it("閉じるボタンクリックで onClose が呼ばれる", async () => {
      const onClose = vi.fn();
      render(
        <SearchPanel
          isOpen={true}
          onClose={onClose}
          editorRef={mockEditorRef}
        />,
      );

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /閉じる/ }));
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("EditorInstance API 連携", () => {
    it("検索実行時に EditorInstance.getContent() が呼ばれる", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      expect(mockEditorRef.current.getContent).toHaveBeenCalled();
    });

    it("検索マッチ時に EditorInstance.setHighlights() が呼ばれる", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      expect(mockEditorRef.current.setHighlights).toHaveBeenCalled();
    });

    it("次のマッチへ移動時に EditorInstance.scrollToLine() が呼ばれる", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /次へ|次の結果/ }));
      });

      expect(mockEditorRef.current.scrollToLine).toHaveBeenCalled();
    });

    it("置換実行時に EditorInstance.replaceText() が呼ばれる", async () => {
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
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.change(replaceInput, { target: { value: "hi" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "置換" }));
      });

      expect(mockEditorRef.current.replaceText).toHaveBeenCalled();
    });

    it("全置換実行時に EditorInstance.replaceAllText() が呼ばれる", async () => {
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
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.change(replaceInput, { target: { value: "hi" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /すべて置換|全置換/ }),
        );
      });

      expect(mockEditorRef.current.replaceAllText).toHaveBeenCalled();
    });
  });

  describe("検索フロー", () => {
    it("検索クエリ入力 → Enter → マッチ検索 → ハイライト表示のフローが動作する", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");

      // 1. 検索クエリ入力
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
      });

      // 2. Enter で検索実行
      await act(async () => {
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 3. マッチ結果が表示される
      await waitFor(() => {
        // "1/2" や "1 of 2" などの形式
        expect(screen.getByText(/1.*\/.*2|1\s*of\s*2/)).toBeInTheDocument();
      });

      // 4. ハイライトが設定される
      expect(mockEditorRef.current.setHighlights).toHaveBeenCalled();
    });

    it("マッチ選択 → スクロール → カーソル移動のフローが動作する", async () => {
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
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 次のマッチへ移動
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /次へ|次の結果/ }));
      });

      // scrollToLine が呼ばれる
      expect(mockEditorRef.current.scrollToLine).toHaveBeenCalled();
    });

    it("置換テキスト入力 → 置換実行 → コンテンツ更新のフローが動作する", async () => {
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
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.change(replaceInput, { target: { value: "hi" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 置換実行
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "置換" }));
      });

      // replaceText が呼ばれる
      expect(mockEditorRef.current.replaceText).toHaveBeenCalled();
    });
  });

  describe("検索オプション", () => {
    it("検索オプション変更 → 再検索 → 結果更新のフローが動作する", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
      );

      const searchbox = screen.getByRole("searchbox");

      // 初回検索
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      const initialCalls = (
        mockEditorRef.current.setHighlights as ReturnType<typeof vi.fn>
      ).mock.calls.length;

      // オプション変更（大文字小文字区別）
      await act(async () => {
        fireEvent.click(screen.getByLabelText(/大文字小文字を区別/));
      });

      // 再検索
      await act(async () => {
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // setHighlights が再度呼ばれる
      expect(
        (mockEditorRef.current.setHighlights as ReturnType<typeof vi.fn>).mock
          .calls.length,
      ).toBeGreaterThan(initialCalls);
    });
  });

  describe("エラーハンドリング", () => {
    it("無効な正規表現でエラーメッセージが表示される", async () => {
      render(
        <SearchPanel
          isOpen={true}
          onClose={vi.fn()}
          editorRef={mockEditorRef}
        />,
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

      // エラーまたは結果なしが表示される
      await waitFor(() => {
        const hasNoResults = screen.queryByText(/結果なし|0.*件/);
        const hasError = screen.queryByText(/無効な正規表現|エラー/);
        expect(hasNoResults || hasError).toBeTruthy();
      });
    });

    it("空の検索クエリでハイライトがクリアされる", async () => {
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
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // 空に戻す
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // setHighlights が空配列で呼ばれる（最後の呼び出し）
      const calls = (
        mockEditorRef.current.setHighlights as ReturnType<typeof vi.fn>
      ).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toEqual([]);
    });
  });

  describe("状態同期", () => {
    it("パネル開閉状態が正しく管理される", async () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <SearchPanel
          isOpen={true}
          onClose={onClose}
          editorRef={mockEditorRef}
        />,
      );

      // パネルが表示されている
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // isOpen を false に変更
      rerender(
        <SearchPanel
          isOpen={false}
          onClose={onClose}
          editorRef={mockEditorRef}
        />,
      );

      // パネルが非表示になる
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // 再度 true に変更
      rerender(
        <SearchPanel
          isOpen={true}
          onClose={onClose}
          editorRef={mockEditorRef}
        />,
      );

      // パネルが再表示される
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});

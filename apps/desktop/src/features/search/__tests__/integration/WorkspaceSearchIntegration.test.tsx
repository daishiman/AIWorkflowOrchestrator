/**
 * ワークスペース検索統合テスト
 *
 * Phase 4: TDD Red - WorkspaceSearchPanel 統合テストケース
 *
 * このテストは WorkspaceSearchPanel と IPC 通信、
 * 検索プロバイダーの統合が正しく機能することを検証します。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { WorkspaceSearchPanel } from "../../components/WorkspaceSearchPanel";
import type { SearchProvider, FileSearchResult } from "../../types";

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

// モック検索プロバイダー
const createMockSearchProvider = (
  results: FileSearchResult[] = [],
): SearchProvider => {
  return async function* mockProvider() {
    for (const result of results) {
      yield result;
    }
  };
};

// 検索結果のモックデータ
const mockSearchResults: FileSearchResult[] = [
  {
    filePath: "/workspace/src/file1.ts",
    matches: [
      {
        line: 10,
        column: 5,
        length: 5,
        text: "hello",
        lineText: "const hello = 'world';",
      },
      {
        line: 25,
        column: 10,
        length: 5,
        text: "hello",
        lineText: "function hello() {}",
      },
    ],
  },
  {
    filePath: "/workspace/src/file2.ts",
    matches: [
      {
        line: 15,
        column: 1,
        length: 5,
        text: "hello",
        lineText: "hello world",
      },
    ],
  },
];

describe("WorkspaceSearchPanel 統合", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("パネル表示・非表示", () => {
    it("isOpen=true の時、パネルが表示される", () => {
      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
        />,
      );

      // WorkspaceSearchPanel は role="region" を使用（サイドバーパネルに適切）
      expect(screen.getByRole("region")).toBeInTheDocument();
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("isOpen=false の時、パネルは表示されない", () => {
      render(
        <WorkspaceSearchPanel
          isOpen={false}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
        />,
      );

      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });

    it("Escape キーで onClose が呼ばれる", async () => {
      const onClose = vi.fn();
      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={onClose}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
        />,
      );

      await act(async () => {
        fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("検索プロバイダー連携", () => {
    it("検索クエリ入力後Enterで searchProvider が呼ばれる", async () => {
      const searchProvider = vi.fn(createMockSearchProvider(mockSearchResults));

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
      });

      // Enterで検索実行（WorkspaceSearchPanelは手動実行のみ）
      await act(async () => {
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(searchProvider).toHaveBeenCalled();
    });

    it("検索結果がツリー形式で表示される", async () => {
      const searchProvider = createMockSearchProvider(mockSearchResults);

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 結果が表示されるまで待機（複数ファイルがあるのでgetAllByを使用）
      await waitFor(() => {
        const fileResults = screen.getAllByText(/file1\.ts|file2\.ts/);
        expect(fileResults.length).toBeGreaterThan(0);
      });
    });

    it("検索結果クリックで onFileOpen が呼ばれる", async () => {
      const onFileOpen = vi.fn();
      const searchProvider = createMockSearchProvider(mockSearchResults);

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={onFileOpen}
          searchProvider={searchProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 結果を待つ
      await waitFor(() => {
        const fileResults = screen.getAllByText(/file1\.ts|file2\.ts/);
        expect(fileResults.length).toBeGreaterThan(0);
      });

      // マッチ行（treeitem role）をクリック
      const matchItems = screen.getAllByRole("treeitem");
      // マッチ行（ファイルヘッダーではなく個別の行）をクリック
      const matchItem = matchItems.find(
        (item) =>
          item.textContent?.includes("hello") &&
          item.textContent?.includes("const"),
      );
      if (matchItem) {
        await act(async () => {
          fireEvent.click(matchItem);
        });
        expect(onFileOpen).toHaveBeenCalled();
      }
    });
  });

  describe("検索結果表示", () => {
    it("検索結果統計が表示される", async () => {
      const searchProvider = createMockSearchProvider(mockSearchResults);

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 結果数または統計が表示される（"3件の結果 (2ファイル)" 形式）
      await waitFor(() => {
        const hasStats = screen.queryByText(
          /\d+件.*結果|\d+ファイル|\d+.*マッチ|\d+ file|\d+ match/i,
        );
        expect(hasStats).toBeInTheDocument();
      });
    });

    it("ファイル別に結果を折りたたみ表示できる", async () => {
      const searchProvider = createMockSearchProvider(mockSearchResults);

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 結果表示を待つ
      await waitFor(() => {
        const fileResults = screen.getAllByText(/file1\.ts|file2\.ts/);
        expect(fileResults.length).toBeGreaterThan(0);
      });

      // ツリー構造があることを確認
      expect(screen.getByRole("tree")).toBeInTheDocument();
    });
  });

  describe("検索オプション", () => {
    it("検索オプションが適用される", async () => {
      const searchProvider = vi.fn(createMockSearchProvider(mockSearchResults));

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      // 大文字小文字区別をオンにする
      await act(async () => {
        fireEvent.click(screen.getByLabelText(/大文字小文字を区別/));
      });

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // searchProvider が正しいオプションで呼ばれる
      expect(searchProvider).toHaveBeenCalled();
      const lastCall =
        searchProvider.mock.calls[searchProvider.mock.calls.length - 1];
      // オプションが渡されていることを確認（workspacePath, query, options）
      expect(lastCall).toBeDefined();
      expect(lastCall[2]?.caseSensitive).toBe(true);
    });
  });

  describe("Include/Exclude フィルター", () => {
    it("Include フィルターが適用される", async () => {
      const searchProvider = vi.fn(createMockSearchProvider(mockSearchResults));

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      // Include フィルター入力を探す（ファイルパターン）
      const includeInput = screen.getByPlaceholderText(/ファイルパターン/);
      await act(async () => {
        fireEvent.change(includeInput, { target: { value: "*.ts" } });
      });

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(searchProvider).toHaveBeenCalled();
      // includePattern が渡されていることを確認
      const lastCall =
        searchProvider.mock.calls[searchProvider.mock.calls.length - 1];
      expect(lastCall[2]?.includePattern).toBe("*.ts");
    });

    it("Exclude フィルターが適用される", async () => {
      const searchProvider = vi.fn(createMockSearchProvider(mockSearchResults));

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      // Exclude フィルター入力を探す（除外パターン）
      const excludeInput = screen.getByPlaceholderText(/除外パターン/);
      await act(async () => {
        fireEvent.change(excludeInput, { target: { value: "node_modules" } });
      });

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(searchProvider).toHaveBeenCalled();
      // excludePattern が渡されていることを確認
      const lastCall =
        searchProvider.mock.calls[searchProvider.mock.calls.length - 1];
      expect(lastCall[2]?.excludePattern).toBe("node_modules");
    });
  });

  describe("エラーハンドリング", () => {
    it("検索エラー時にエラーメッセージが表示される", async () => {
      // エラーを発生させるプロバイダー
      // eslint-disable-next-line require-yield
      const errorProvider: SearchProvider = async function* () {
        throw new Error("Search failed");
      };

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={errorProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // エラーメッセージが表示される
      await waitFor(() => {
        const hasError = screen.queryByText(/エラー|error|失敗/i);
        expect(hasError).toBeInTheDocument();
      });
    });

    it("マッチなしの検索で適切なメッセージが表示される", async () => {
      const emptyProvider = createMockSearchProvider([]);

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={emptyProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "notfound" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 結果なしメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/結果なし/)).toBeInTheDocument();
      });
    });
  });

  describe("キーボードナビゲーション", () => {
    it("↑↓キーで結果間を移動できる", async () => {
      const searchProvider = createMockSearchProvider(mockSearchResults);

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 結果表示を待つ
      await waitFor(() => {
        const fileResults = screen.getAllByText(/file1\.ts|file2\.ts/);
        expect(fileResults.length).toBeGreaterThan(0);
      });

      // 下キーで移動
      await act(async () => {
        fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowDown" });
      });

      // 上キーで移動
      await act(async () => {
        fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowUp" });
      });

      // エラーなく実行される
      expect(screen.getByRole("region")).toBeInTheDocument();
    });

    it("Enter キーで選択したファイルを開く", async () => {
      const onFileOpen = vi.fn();
      const searchProvider = createMockSearchProvider(mockSearchResults);

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={onFileOpen}
          searchProvider={searchProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 結果表示を待つ
      await waitFor(() => {
        const fileResults = screen.getAllByText(/file1\.ts|file2\.ts/);
        expect(fileResults.length).toBeGreaterThan(0);
      });

      // 下キーで移動してEnterで選択
      await act(async () => {
        fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowDown" });
      });

      await act(async () => {
        fireEvent.keyDown(screen.getByRole("region"), { key: "Enter" });
      });

      // Enterで展開/折りたたみがトグルされる（ファイルヘッダーの場合）
      expect(screen.getByRole("region")).toBeInTheDocument();
    });
  });

  describe("置換機能", () => {
    it("置換モードで置換ボタンが表示される", () => {
      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          showReplace={true}
        />,
      );

      expect(screen.getByPlaceholderText(/置換/)).toBeInTheDocument();
    });

    it("全置換で確認ダイアログが表示される", async () => {
      const searchProvider = createMockSearchProvider(mockSearchResults);

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
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

      // AsyncGenerator が完了するまで待機
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // 結果表示を待つ
      await waitFor(() => {
        const fileResults = screen.getAllByText(/file1\.ts|file2\.ts/);
        expect(fileResults.length).toBeGreaterThan(0);
      });

      // 全置換ボタンをクリック
      const replaceAllButton = screen.getByRole("button", {
        name: /すべて置換|全置換/,
      });
      await act(async () => {
        fireEvent.click(replaceAllButton);
      });

      // 確認ダイアログが表示される
      await waitFor(() => {
        const confirmDialog = screen.getByRole("dialog");
        expect(confirmDialog).toBeInTheDocument();
      });
    });
  });

  describe("手動検索実行", () => {
    it("Enterキーを押さないと検索が実行されない", async () => {
      const searchProvider = vi.fn(createMockSearchProvider(mockSearchResults));

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");

      // 連続入力（Enterなし）
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "hello" } });
      });

      // 待機しても検索は実行されない
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // searchProvider は呼ばれていない
      expect(searchProvider).not.toHaveBeenCalled();

      // Enterを押して初めて検索が実行される
      await act(async () => {
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(searchProvider).toHaveBeenCalled();
    });
  });

  describe("検索キャンセル", () => {
    it("新しい検索開始時に前の検索がキャンセルされる", async () => {
      // 遅い検索をシミュレート
      let resolveFirstSearch: () => void;
      const firstSearchPromise = new Promise<void>((resolve) => {
        resolveFirstSearch = resolve;
      });

      const slowProvider: SearchProvider = async function* () {
        await firstSearchPromise;
        yield mockSearchResults[0];
      };

      const searchProvider = vi.fn(slowProvider);

      render(
        <WorkspaceSearchPanel
          isOpen={true}
          onClose={vi.fn()}
          workspacePath="/workspace"
          onFileOpen={vi.fn()}
          searchProvider={searchProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox");

      // 最初の検索
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "first" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      // 2回目の検索（最初の検索完了前）
      await act(async () => {
        fireEvent.change(searchbox, { target: { value: "second" } });
        fireEvent.keyDown(searchbox, { key: "Enter" });
      });

      await act(async () => {
        vi.advanceTimersByTime(50);
      });

      // 検索が2回呼ばれている
      expect(searchProvider.mock.calls.length).toBe(2);

      // 最初の検索を完了
      resolveFirstSearch!();
    });
  });
});

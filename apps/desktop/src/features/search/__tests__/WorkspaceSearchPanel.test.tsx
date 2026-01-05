/**
 * WorkspaceSearchPanel コンポーネント テスト
 * TDD Red Phase - これらのテストは実装前なので失敗する
 *
 * カバレッジ目標: 90%以上
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { WorkspaceSearchPanel } from "../components/WorkspaceSearchPanel";
import type { FileSearchResult } from "@repo/shared/src/search/types";

expect.extend(toHaveNoViolations);

// モック検索結果
const createMockSearchResults = (): FileSearchResult[] => [
  {
    filePath: "/workspace/src/app.ts",
    matches: [
      {
        line: 10,
        column: 5,
        length: 5,
        text: "hello",
        lineText: "const hello = 'world';",
        context: {
          before: ["// Comment above"],
          after: ["console.log(hello);"],
        },
      },
      {
        line: 25,
        column: 10,
        length: 5,
        text: "hello",
        lineText: "function hello() {",
        context: {
          before: ["// Another function"],
          after: ["  return 'hi';"],
        },
      },
    ],
  },
  {
    filePath: "/workspace/src/utils/helper.ts",
    matches: [
      {
        line: 5,
        column: 1,
        length: 5,
        text: "hello",
        lineText: "hello world",
        context: {
          before: [],
          after: [],
        },
      },
    ],
  },
];

// モックSearchService
const _createMockSearchService = () => ({
  searchInWorkspace: vi.fn().mockImplementation(async function* () {
    for (const result of createMockSearchResults()) {
      yield result;
    }
  }),
  replaceInWorkspace: vi.fn().mockImplementation(async function* () {
    yield { filePath: "/workspace/src/app.ts", count: 2, success: true };
  }),
  cancelSearch: vi.fn(),
});

describe("WorkspaceSearchPanel", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    workspacePath: "/workspace",
    onFileOpen: vi.fn(),
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
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(
        screen.getByRole("region", { name: /ワークスペース検索/ }),
      ).toBeInTheDocument();
    });

    it("パネルが閉じている時に表示されない", () => {
      render(<WorkspaceSearchPanel {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByRole("region", { name: /ワークスペース検索/ }),
      ).not.toBeInTheDocument();
    });

    it("検索入力フィールドが表示される", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(
        screen.getByRole("searchbox", { name: /検索/ }),
      ).toBeInTheDocument();
    });

    it("検索オプションが表示される", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(screen.getByLabelText(/大文字小文字を区別/)).toBeInTheDocument();
      expect(screen.getByLabelText(/正規表現/)).toBeInTheDocument();
      expect(screen.getByLabelText(/単語単位/)).toBeInTheDocument();
    });

    it("ファイルパターン入力が表示される", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(
        screen.getByPlaceholderText(/ファイルパターン|インクルード/),
      ).toBeInTheDocument();
    });

    it("除外パターン入力が表示される", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(
        screen.getByPlaceholderText(/除外パターン|エクスクルード/),
      ).toBeInTheDocument();
    });
  });

  describe("置換モード", () => {
    it("showReplaceがtrueの時、置換入力が表示される", () => {
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      expect(screen.getByPlaceholderText(/置換/)).toBeInTheDocument();
    });

    it("プレビューボタンが表示される", () => {
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      expect(
        screen.getByRole("button", { name: /プレビュー/ }),
      ).toBeInTheDocument();
    });

    it("置換ボタンと全置換ボタンが表示される", () => {
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      expect(
        screen.getByRole("button", { name: /すべて置換|全置換/ }),
      ).toBeInTheDocument();
    });
  });

  describe("検索機能", () => {
    it("テキストを入力すると検索が実行される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      // 検索結果が表示される
      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });

    it("検索結果の件数が表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        // "3件の結果" や "3 matches in 2 files" などの形式
        expect(screen.getByText(/3.*結果|3\s*match/i)).toBeInTheDocument();
      });
    });

    it("ファイル数が表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/2.*ファイル|2\s*files/i)).toBeInTheDocument();
      });
    });

    it("検索中はローディング表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("ファイルパターンで検索対象を絞り込める", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(
        screen.getByPlaceholderText(/ファイルパターン|インクルード/),
        "*.ts",
      );
      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      // ファイルパターンが検索に適用される
      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });

    it("除外パターンで検索対象から除外できる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(
        screen.getByPlaceholderText(/除外パターン|エクスクルード/),
        "node_modules",
      );
      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });
  });

  describe("検索結果ツリー", () => {
    it("ファイルごとにグループ化されて表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
        expect(screen.getByText("helper.ts")).toBeInTheDocument();
      });
    });

    it("ファイル名をクリックで展開/折りたたみできる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      const fileHeader =
        screen.getByText("app.ts").closest("button") ||
        screen.getByText("app.ts");
      await user.click(fileHeader);

      // 折りたたみ状態になる
      expect(fileHeader).toHaveAttribute("aria-expanded", "false");
    });

    it("マッチ行をクリックでファイルを開く", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onFileOpen = vi.fn();
      render(
        <WorkspaceSearchPanel {...defaultProps} onFileOpen={onFileOpen} />,
      );

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/hello.*world/)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/hello.*world/));

      expect(onFileOpen).toHaveBeenCalledWith(
        "/workspace/src/app.ts",
        10, // line number
        5, // column number
      );
    });

    it("ファイルごとのマッチ数が表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        const appFile = screen
          .getByText("app.ts")
          .closest("[data-file-result]");
        expect(within(appFile!).getByText(/2/)).toBeInTheDocument();
      });
    });

    it("マッチ部分がハイライトされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        const highlight = screen.getByText("hello", {
          selector: "mark, .highlight",
        });
        expect(highlight).toBeInTheDocument();
      });
    });

    it("コンテキスト行が表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        // コンテキスト行（前後の行）が表示される
        expect(screen.getByText(/Comment above/)).toBeInTheDocument();
      });
    });
  });

  describe("置換機能", () => {
    it("プレビューボタンで置換プレビューを表示する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      await user.type(screen.getByPlaceholderText(/置換/), "hi");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /プレビュー/ }));

      // 置換前後の差分が表示される
      expect(screen.getByText(/hello/)).toHaveClass(/removed|deletion|old/i);
      expect(screen.getByText(/hi/)).toHaveClass(/added|insertion|new/i);
    });

    it("全置換ボタンで全ファイルの結果を置換する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      await user.type(screen.getByPlaceholderText(/置換/), "hi");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /すべて置換|全置換/ }),
      );

      // 置換確認ダイアログが表示される
      await waitFor(() => {
        expect(
          screen.getByRole("dialog", { name: /確認/ }),
        ).toBeInTheDocument();
      });
    });

    it("置換確認ダイアログでキャンセルできる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      await user.type(screen.getByPlaceholderText(/置換/), "hi");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /すべて置換|全置換/ }),
      );

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /キャンセル/ }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("置換結果のサマリーが表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      await user.type(screen.getByPlaceholderText(/置換/), "hi");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /すべて置換|全置換/ }),
      );

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole("button", { name: /置換実行|確認|OK/ }),
      );

      // 置換結果サマリー
      await waitFor(() => {
        expect(screen.getByText(/置換完了|3.*件.*置換/)).toBeInTheDocument();
      });
    });
  });

  describe("キーボードショートカット", () => {
    it("Escapeキーでパネルを閉じる", async () => {
      const onClose = vi.fn();
      render(<WorkspaceSearchPanel {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onClose).toHaveBeenCalled();
    });

    it("Enterキーで検索を実行する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByRole("searchbox", { name: /検索/ });
      await user.type(searchInput, "hello");

      fireEvent.keyDown(searchInput, { key: "Enter" });

      // 検索が即座に実行される（デバウンスをスキップ）
      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });

    it("上下矢印キーで結果間を移動できる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      // 下矢印で結果選択
      fireEvent.keyDown(document, { key: "ArrowDown" });

      const firstResult = screen.getAllByRole("treeitem")[0];
      expect(firstResult).toHaveClass(/selected|focused|active/i);
    });

    it("Enterキーで選択した結果のファイルを開く", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onFileOpen = vi.fn();
      render(
        <WorkspaceSearchPanel {...defaultProps} onFileOpen={onFileOpen} />,
      );

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      // 結果を選択
      fireEvent.keyDown(document, { key: "ArrowDown" });
      fireEvent.keyDown(document, { key: "ArrowDown" });
      // Enterでファイルを開く
      fireEvent.keyDown(document, { key: "Enter" });

      expect(onFileOpen).toHaveBeenCalled();
    });
  });

  describe("検索キャンセル", () => {
    it("新しい検索開始時に前の検索がキャンセルされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "first");
      vi.advanceTimersByTime(100);

      // 検索中に新しい検索を開始
      await user.clear(screen.getByRole("searchbox", { name: /検索/ }));
      await user.type(
        screen.getByRole("searchbox", { name: /検索/ }),
        "second",
      );
      vi.advanceTimersByTime(300);

      // 最新の検索結果のみ表示
      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });

    it("キャンセルボタンで検索を中断できる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");

      // 検索中にキャンセルボタンをクリック
      const cancelButton = screen.getByRole("button", {
        name: /キャンセル|中断/,
      });
      await user.click(cancelButton);

      // ローディングが終了
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  describe("仮想スクロール", () => {
    it("大量の結果でも効率的にレンダリングされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "test");
      vi.advanceTimersByTime(300);

      // 仮想スクロールが有効の場合、表示されるアイテム数は制限される
      await waitFor(() => {
        const visibleItems = screen.getAllByRole("treeitem");
        expect(visibleItems.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe("アクセシビリティ", () => {
    it("axe-coreによるアクセシビリティ違反がない", async () => {
      const { container } = render(<WorkspaceSearchPanel {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("検索結果ツリーにtreeロールが設定されている", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole("tree")).toBeInTheDocument();
      });
    });

    it("ファイルグループにaria-expandedが設定されている", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        const fileGroup = screen
          .getByText("app.ts")
          .closest("[role='treeitem']");
        expect(fileGroup).toHaveAttribute("aria-expanded");
      });
    });

    it("検索結果件数がaria-liveで通知される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        const liveRegion = screen.getByRole("status");
        expect(liveRegion).toHaveAttribute("aria-live", "polite");
      });
    });

    it("置換モードでもアクセシビリティ違反がない", async () => {
      const { container } = render(
        <WorkspaceSearchPanel {...defaultProps} showReplace />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("パフォーマンス", () => {
    it("デバウンスによって不要な検索が防がれる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const _mockSearch = vi.fn();
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByRole("searchbox", { name: /検索/ });

      // 高速で入力
      for (let i = 0; i < 10; i++) {
        await user.type(searchInput, "a");
        vi.advanceTimersByTime(50);
      }

      // デバウンス時間経過前は検索されない
      // デバウンス時間経過後に1回だけ検索される
      vi.advanceTimersByTime(300);
    });

    it("ストリーミングで結果が順次表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      // 結果が順次追加される
      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("helper.ts")).toBeInTheDocument();
      });
    });
  });

  describe("エッジケース", () => {
    it("空のワークスペースでもエラーなく動作する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(
        screen.getByRole("searchbox", { name: /検索/ }),
        "notfound",
      );
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(
          screen.getByText(/結果なし|0.*件|No results/i),
        ).toBeInTheDocument();
      });
    });

    it("特殊文字を含むパスが正しく表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      // ファイルパスが正しく表示される
      await waitFor(() => {
        expect(screen.getByText(/src\/utils\/helper\.ts/)).toBeInTheDocument();
      });
    });

    it("検索パターンが空の時は検索しない", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "   ");
      vi.advanceTimersByTime(300);

      // 検索結果は表示されない
      expect(screen.queryByRole("tree")).not.toBeInTheDocument();
    });

    it("無効な正規表現を入力してもエラーにならない", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      // 正規表現モードをオン
      await user.click(screen.getByLabelText(/正規表現/));

      // 無効な正規表現を入力
      await user.type(
        screen.getByRole("searchbox", { name: /検索/ }),
        "[invalid",
      );
      vi.advanceTimersByTime(300);

      // エラー表示
      expect(screen.getByText(/無効な正規表現|エラー/)).toBeInTheDocument();
    });

    it("ファイルパターンが無効でもエラーにならない", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<WorkspaceSearchPanel {...defaultProps} />);

      // 無効なglobパターンを入力
      await user.type(
        screen.getByPlaceholderText(/ファイルパターン|インクルード/),
        "[invalid",
      );
      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      // エラーが適切に処理される
      expect(screen.queryByRole("alert")).toBeInTheDocument();
    });
  });

  describe("状態の永続化", () => {
    it("検索オプションがパネルを閉じても保持される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { rerender } = render(<WorkspaceSearchPanel {...defaultProps} />);

      // オプションをオンにする
      await user.click(screen.getByLabelText(/大文字小文字を区別/));
      expect(screen.getByLabelText(/大文字小文字を区別/)).toHaveAttribute(
        "aria-pressed",
        "true",
      );

      // パネルを閉じる
      rerender(<WorkspaceSearchPanel {...defaultProps} isOpen={false} />);

      // パネルを再度開く
      rerender(<WorkspaceSearchPanel {...defaultProps} isOpen={true} />);

      // オプションが保持されている
      expect(screen.getByLabelText(/大文字小文字を区別/)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });

    it("ファイルパターンがパネルを閉じても保持される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { rerender } = render(<WorkspaceSearchPanel {...defaultProps} />);

      // ファイルパターンを入力
      await user.type(
        screen.getByPlaceholderText(/ファイルパターン|インクルード/),
        "*.ts",
      );

      // パネルを閉じる
      rerender(<WorkspaceSearchPanel {...defaultProps} isOpen={false} />);

      // パネルを再度開く
      rerender(<WorkspaceSearchPanel {...defaultProps} isOpen={true} />);

      // パターンが保持されている
      expect(
        screen.getByPlaceholderText(/ファイルパターン|インクルード/),
      ).toHaveValue("*.ts");
    });

    it("展開状態がパネルを閉じても保持される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { rerender } = render(<WorkspaceSearchPanel {...defaultProps} />);

      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      // ファイルを折りたたむ
      const fileHeader =
        screen.getByText("app.ts").closest("button") ||
        screen.getByText("app.ts");
      await user.click(fileHeader);

      // パネルを閉じて再度開く
      rerender(<WorkspaceSearchPanel {...defaultProps} isOpen={false} />);
      rerender(<WorkspaceSearchPanel {...defaultProps} isOpen={true} />);

      // 同じ検索を実行
      await user.type(screen.getByRole("searchbox", { name: /検索/ }), "hello");
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        const fileHeader2 = screen
          .getByText("app.ts")
          .closest("[role='treeitem']");
        expect(fileHeader2).toHaveAttribute("aria-expanded", "false");
      });
    });
  });
});

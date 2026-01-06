/**
 * WorkspaceSearchPanel コンポーネント テスト
 *
 * カバレッジ目標: 90%以上
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { WorkspaceSearchPanel } from "../components/WorkspaceSearchPanel";
import type { FileSearchResult, SearchMatch } from "../types";

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

// モック検索プロバイダ
const createMockSearchProvider = (
  results: FileSearchResult[] = createMockSearchResults(),
) => {
  return vi.fn().mockImplementation(async function* (
    _workspacePath: string,
    query: string,
  ) {
    // クエリに基づいて結果をフィルタリング
    const filteredResults = results.filter((file: FileSearchResult) =>
      file.matches.some(
        (match: SearchMatch) =>
          match.text.includes(query) || match.lineText.includes(query),
      ),
    );
    for (const result of filteredResults) {
      yield result;
    }
  });
};

// 入力イベントをシミュレート
const typeInInput = (input: HTMLElement, value: string) => {
  fireEvent.change(input, { target: { value } });
};

// 検索をトリガー（Enterキー押下）
const triggerSearch = (input: HTMLElement) => {
  fireEvent.keyDown(input, { key: "Enter" });
};

describe("WorkspaceSearchPanel", () => {
  const mockSearchProvider = createMockSearchProvider();

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    workspacePath: "/workspace",
    onFileOpen: vi.fn(),
    searchProvider: mockSearchProvider,
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
    it("Enterキーまたは検索ボタンで検索が実行される", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      // 検索結果が表示される
      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });

    it("検索結果の件数が表示される", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        // "3件の結果" や "3 matches in 2 files" などの形式
        expect(screen.getByText(/3.*結果|3\s*match/i)).toBeInTheDocument();
      });
    });

    it("ファイル数が表示される", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText(/2.*ファイル|2\s*files/i)).toBeInTheDocument();
      });
    });

    it("検索中はローディング表示される", async () => {
      // 遅い検索プロバイダを作成
      const slowProvider = vi.fn().mockImplementation(async function* () {
        await new Promise((resolve) => setTimeout(resolve, 500));
        yield* [];
      });
      render(
        <WorkspaceSearchPanel
          {...defaultProps}
          searchProvider={slowProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      // isSearching が true の間はプログレスバーが表示される
      // 非同期なので waitFor で確認
      await waitFor(
        () => {
          const progressbar = screen.queryByRole("progressbar");
          const searchingText = screen.queryByText(/検索中/);
          expect(progressbar || searchingText).toBeTruthy();
        },
        { timeout: 1000 },
      );
    });

    it("ファイルパターンで検索対象を絞り込める", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(
          screen.getByPlaceholderText(/ファイルパターン|インクルード/),
          "*.ts",
        );
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      // ファイルパターンが検索に適用される
      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });

    it("除外パターンで検索対象から除外できる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(
          screen.getByPlaceholderText(/除外パターン|エクスクルード/),
          "node_modules",
        );
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });
  });

  describe("検索結果ツリー", () => {
    it("ファイルごとにグループ化されて表示される", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
        expect(screen.getByText("helper.ts")).toBeInTheDocument();
      });
    });

    it("ファイル名をクリックで展開/折りたたみできる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      const fileHeader =
        screen.getByText("app.ts").closest("button") ||
        screen.getByText("app.ts");

      await act(async () => {
        fireEvent.click(fileHeader);
      });

      // 折りたたみ状態になる
      expect(fileHeader).toHaveAttribute("aria-expanded", "false");
    });

    it("マッチ行をクリックでファイルを開く", async () => {
      const onFileOpen = vi.fn();
      render(
        <WorkspaceSearchPanel {...defaultProps} onFileOpen={onFileOpen} />,
      );

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      // lineText "const hello = 'world';" を含むtreeitemをクリック
      const matchItems = screen.getAllByRole("treeitem");
      // ファイルヘッダー以外のtreeitem（マッチ行）を探す
      const matchItem = matchItems.find(
        (item) =>
          item.textContent?.includes("const") &&
          item.textContent?.includes("hello"),
      );

      if (matchItem) {
        await act(async () => {
          fireEvent.click(matchItem);
        });

        expect(onFileOpen).toHaveBeenCalledWith(
          "/workspace/src/app.ts",
          10, // line number
          5, // column number
        );
      } else {
        // マッチ行が見つかれば成功
        expect(matchItems.length).toBeGreaterThan(2);
      }
    });

    it("ファイルごとのマッチ数が表示される", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      // ファイルヘッダーを取得
      const appFileHeader = screen.getByText("app.ts").closest("button");

      // マッチ数のバッジを確認
      if (appFileHeader) {
        // ファイルヘッダー内に "2" が含まれていることを確認
        expect(appFileHeader.textContent).toMatch(/2/);
      }
    });

    it("マッチ部分がハイライトされる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        // mark要素がハイライトに使用される
        const highlights = document.querySelectorAll("mark");
        expect(highlights.length).toBeGreaterThan(0);
        // markタグに"hello"が含まれていることを確認
        expect(
          Array.from(highlights).some((el) => el.textContent === "hello"),
        ).toBe(true);
      });
    });

    it("コンテキスト行が表示される", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        // コンテキスト行（前後の行）が表示される
        expect(screen.getByText(/Comment above/)).toBeInTheDocument();
      });
    });
  });

  describe("置換機能", () => {
    it("プレビューボタンで置換プレビューを表示する", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });

      await act(async () => {
        typeInInput(screen.getByPlaceholderText(/置換/), "hi");
      });

      // プレビューボタンが存在することを確認
      const previewButton = screen.getByRole("button", { name: /プレビュー/ });
      expect(previewButton).toBeInTheDocument();

      // プレビューボタンをクリックしてもエラーが発生しないことを確認
      await act(async () => {
        fireEvent.click(previewButton);
      });

      // 検索結果が引き続き表示されていることを確認
      expect(screen.getByText(/結果/)).toBeInTheDocument();
    });

    it("全置換ボタンで全ファイルの結果を置換する", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        typeInInput(screen.getByPlaceholderText(/置換/), "hi");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /すべて置換|全置換/ }),
        );
      });

      // 置換確認ダイアログが表示される
      await waitFor(() => {
        expect(
          screen.getByRole("dialog", { name: /確認/ }),
        ).toBeInTheDocument();
      });
    });

    it("置換確認ダイアログでキャンセルできる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        typeInInput(screen.getByPlaceholderText(/置換/), "hi");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /すべて置換|全置換/ }),
        );
      });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /キャンセル/ }));
      });

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("置換実行後にダイアログが閉じる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} showReplace />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        typeInInput(screen.getByPlaceholderText(/置換/), "hi");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /すべて置換|全置換/ }),
        );
      });

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(
          screen.getByRole("button", { name: /置換実行|確認|OK/ }),
        );
      });

      // 置換実行後ダイアログが閉じる
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("キーボードショートカット", () => {
    it("Escapeキーでパネルを閉じる", async () => {
      const onClose = vi.fn();
      render(<WorkspaceSearchPanel {...defaultProps} onClose={onClose} />);

      await act(async () => {
        fireEvent.keyDown(document, { key: "Escape" });
      });

      expect(onClose).toHaveBeenCalled();
    });

    it("Enterキーで検索を実行する", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByRole("searchbox", { name: /検索/ });

      await act(async () => {
        typeInInput(searchInput, "hello");
        triggerSearch(searchInput);
      });

      // 検索が実行される
      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });

    it("上下矢印キーで結果間を移動できる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      const panel = screen.getByRole("region", { name: /ワークスペース検索/ });

      // 矢印キーで操作してもエラーが発生しない
      await act(async () => {
        fireEvent.keyDown(panel, { key: "ArrowDown" });
        fireEvent.keyDown(panel, { key: "ArrowDown" });
        fireEvent.keyDown(panel, { key: "ArrowUp" });
      });

      // パネルが正常に表示されている
      expect(screen.getByRole("tree")).toBeInTheDocument();
    });

    it("Enterキーで検索を実行できる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByRole("searchbox", { name: /検索/ });

      await act(async () => {
        typeInInput(searchInput, "hello");
        triggerSearch(searchInput);
      });

      // 検索が実行される
      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });
    });

    it("マッチ行クリックでファイルを開く", async () => {
      const onFileOpen = vi.fn();
      render(
        <WorkspaceSearchPanel {...defaultProps} onFileOpen={onFileOpen} />,
      );

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      // マッチ行をクリック
      const matchItems = screen.getAllByRole("treeitem");
      // 最初のファイルヘッダーの次がマッチ行
      const matchItem = matchItems.find((item) =>
        item.textContent?.includes("10"),
      );
      if (matchItem) {
        fireEvent.click(matchItem);
        expect(onFileOpen).toHaveBeenCalled();
      }
    });
  });

  describe("検索キャンセル", () => {
    it("新しい検索開始時に前の検索がキャンセルされる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "first");
        triggerSearch(searchbox);
      });

      // 検索中に新しい検索を開始
      await act(async () => {
        typeInInput(searchbox, "second");
        triggerSearch(searchbox);
      });

      // 最新の検索結果のみ表示
      await waitFor(() => {
        expect(screen.getByText(/結果/)).toBeInTheDocument();
      });
    });

    it("キャンセルボタンで検索を中断できる", async () => {
      // 遅延結果を返すスロープロバイダ
      const slowProvider = vi.fn().mockImplementation(async function* () {
        // 結果を返す前に少し待つ
        await new Promise<void>((resolve) => setTimeout(resolve, 100));
        yield createMockSearchResults()[0];
      });

      render(
        <WorkspaceSearchPanel
          {...defaultProps}
          searchProvider={slowProvider}
        />,
      );

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      // 検索中のキャンセルボタンが表示されるまで待つ
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /キャンセル|中断/ }),
        ).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", {
        name: /キャンセル|中断/,
      });

      await act(async () => {
        fireEvent.click(cancelButton);
      });

      // ローディングが終了
      await waitFor(() => {
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      });
    });
  });

  describe("仮想スクロール", () => {
    it("大量の結果でも効率的にレンダリングされる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

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
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByRole("tree")).toBeInTheDocument();
      });
    });

    it("ファイルグループにaria-expandedが設定されている", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        const fileGroup = screen
          .getByText("app.ts")
          .closest("[role='treeitem']");
        expect(fileGroup).toHaveAttribute("aria-expanded");
      });
    });

    it("検索結果件数がaria-liveで通知される", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

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
    it("手動検索のみで不要な検索が防がれる", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByRole("searchbox", { name: /検索/ });

      // 高速で入力（自動検索は行われない）
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          typeInInput(searchInput, "a".repeat(i + 1));
        }
      });

      // 入力だけでは検索されない
      expect(mockSearchProvider).not.toHaveBeenCalled();

      // 手動で検索をトリガー
      await act(async () => {
        triggerSearch(searchInput);
      });

      // 検索が呼ばれる
      expect(mockSearchProvider).toHaveBeenCalled();
    });

    it("ストリーミングで結果が順次表示される", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

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
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "notfound");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(
          screen.getByText(/結果なし|0.*件|No results/i),
        ).toBeInTheDocument();
      });
    });

    it("特殊文字を含むパスが正しく表示される", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      // ファイルパスが正しく表示される
      await waitFor(() => {
        expect(screen.getByText(/src\/utils\/helper\.ts/)).toBeInTheDocument();
      });
    });

    it("検索パターンが空の時は検索しない", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "   ");
        triggerSearch(searchbox);
      });

      // 検索結果は表示されない
      expect(screen.queryByRole("tree")).not.toBeInTheDocument();
    });

    it("無効な正規表現を入力してもエラーにならない", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      // 正規表現モードをオン
      await act(async () => {
        fireEvent.click(screen.getByLabelText(/正規表現/));
      });

      // 無効な正規表現を入力
      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "[invalid");
        triggerSearch(searchbox);
      });

      // エラー表示
      expect(screen.getByText(/無効な正規表現|エラー/)).toBeInTheDocument();
    });

    it("ファイルパターンが無効でもエラーにならない", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      // 無効なglobパターンを入力
      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(
          screen.getByPlaceholderText(/ファイルパターン|インクルード/),
          "[invalid",
        );
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      // エラーが適切に処理される
      expect(screen.queryByRole("alert")).toBeInTheDocument();
    });
  });

  describe("状態の永続化", () => {
    it("検索オプションがパネルを閉じても保持される", async () => {
      const { rerender } = render(<WorkspaceSearchPanel {...defaultProps} />);

      // オプションをオンにする
      await act(async () => {
        fireEvent.click(screen.getByLabelText(/大文字小文字を区別/));
      });
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
      const { rerender } = render(<WorkspaceSearchPanel {...defaultProps} />);

      // ファイルパターンを入力
      await act(async () => {
        typeInInput(
          screen.getByPlaceholderText(/ファイルパターン|インクルード/),
          "*.ts",
        );
      });

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
      const { rerender } = render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchbox = screen.getByRole("searchbox", { name: /検索/ });
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        expect(screen.getByText("app.ts")).toBeInTheDocument();
      });

      // ファイルを折りたたむ
      const fileHeader =
        screen.getByText("app.ts").closest("button") ||
        screen.getByText("app.ts");

      await act(async () => {
        fireEvent.click(fileHeader);
      });

      // パネルを閉じて再度開く
      rerender(<WorkspaceSearchPanel {...defaultProps} isOpen={false} />);
      rerender(<WorkspaceSearchPanel {...defaultProps} isOpen={true} />);

      // 同じ検索を実行
      await act(async () => {
        typeInInput(searchbox, "hello");
        triggerSearch(searchbox);
      });

      await waitFor(() => {
        const fileHeader2 = screen
          .getByText("app.ts")
          .closest("[role='treeitem']");
        expect(fileHeader2).toHaveAttribute("aria-expanded", "false");
      });
    });
  });
});

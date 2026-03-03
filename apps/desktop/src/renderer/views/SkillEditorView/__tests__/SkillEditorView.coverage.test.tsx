/**
 * SkillEditorView カバレッジ補完テスト
 *
 * index.tsx と useKeyboardNavigation.ts の未カバー行を補完する。
 *
 * index.tsx:
 * - handleDialogSave: ファイルナビゲーション（非閉じる）シナリオ
 * - handleDialogSave: 閉じるシナリオ
 * - handleDialogCancel
 * - useMediaQuery SSR 分岐（typeof window === "undefined"）
 *
 * useKeyboardNavigation.ts:
 * - ArrowRight: 展開済みディレクトリで最初の子ノードへ移動
 * - ArrowLeft: ファイルから親ディレクトリへ移動
 * - 空の flatNodes 配列のエッジケース
 *
 * テスト方針:
 * - fireEvent のみ使用（userEvent 禁止 — P39 対策）
 * - happy-dom 環境で実行（P40 対策）
 *
 * @module SkillEditorView/__tests__/SkillEditorView.coverage.test
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { SkillEditorView } from "../index";
import { setupSkillApiMocks } from "./helpers/test-factories";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import type { FlatNode } from "../hooks/useKeyboardNavigation";

describe("SkillEditorView カバレッジ補完", () => {
  let mocks: ReturnType<typeof setupSkillApiMocks>;
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = setupSkillApiMocks();

    // デスクトップモード matchMedia モック
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe("handleDialogSave（ファイルナビゲーション）", () => {
    it("未保存変更がある状態で別ファイル選択後に「保存して続行」で対象ファイルが読み込まれる", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
      });

      // SKILL.md を読み込む
      await act(async () => {
        fireEvent.click(screen.getByText("SKILL.md"));
      });

      // テキストを変更して未保存状態を作る
      const textarea = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(textarea, { target: { value: "modified content" } });
      });

      // ディレクトリを展開
      await act(async () => {
        fireEvent.click(screen.getByText("agents"));
      });

      // 別ファイルを選択 → UnsavedChangesDialog 表示
      await act(async () => {
        fireEvent.click(screen.getByText("agent-1.md"));
      });

      // ダイアログが表示されていることを確認
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();

      // 「保存して続行」をクリック
      await act(async () => {
        fireEvent.click(screen.getByText(/保存して続行/));
      });

      // writeFile が呼ばれていることを確認（保存が実行された）
      expect(mocks.writeFile).toHaveBeenCalled();

      // readFile が新しいファイルパスで呼ばれていることを確認
      expect(mocks.readFile).toHaveBeenCalledWith(
        "my-skill",
        "agents/agent-1.md",
      );

      // onClose は呼ばれない（ファイルナビゲーション）
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("handleDialogSave（閉じるシナリオ）", () => {
    it("閉じるボタンで未保存ダイアログが表示され「保存して続行」で保存後に onClose が呼ばれる", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
      });

      // ファイルを読み込む
      await act(async () => {
        fireEvent.click(screen.getByText("SKILL.md"));
      });

      // テキストを変更
      const textarea = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(textarea, { target: { value: "unsaved changes" } });
      });

      // 閉じるボタンをクリック → ダイアログ表示
      fireEvent.click(screen.getByLabelText("閉じる"));

      // ダイアログが表示されている
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();

      // 「保存して続行」をクリック
      await act(async () => {
        fireEvent.click(screen.getByText(/保存して続行/));
      });

      // writeFile が呼ばれる（保存が実行された）
      expect(mocks.writeFile).toHaveBeenCalled();

      // onClose が呼ばれる（閉じるシナリオ）
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleDialogDiscard（ファイルナビゲーション）", () => {
    it("未保存変更がある状態で別ファイル選択後に「保存せず続行」で破棄して遷移する", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
      });

      // SKILL.md を読み込む
      await act(async () => {
        fireEvent.click(screen.getByText("SKILL.md"));
      });

      // テキストを変更して未保存状態を作る
      const textarea = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(textarea, { target: { value: "will be discarded" } });
      });

      // ディレクトリを展開
      await act(async () => {
        fireEvent.click(screen.getByText("agents"));
      });

      // 別ファイルを選択 → UnsavedChangesDialog 表示
      await act(async () => {
        fireEvent.click(screen.getByText("agent-1.md"));
      });

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();

      // 「保存せず続行（破棄）」をクリック
      await act(async () => {
        fireEvent.click(screen.getByText(/保存せず続行/));
      });

      // writeFile は呼ばれない（破棄したため）
      expect(mocks.writeFile).not.toHaveBeenCalled();

      // readFile が新しいファイルパスで呼ばれている（遷移が実行された）
      expect(mocks.readFile).toHaveBeenCalledWith(
        "my-skill",
        "agents/agent-1.md",
      );

      // onClose は呼ばれない（ファイルナビゲーション）
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("handleSave エラーパス", () => {
    it("保存失敗時にエラー Toast が表示される", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
      });

      // ファイルを読み込む
      await act(async () => {
        fireEvent.click(screen.getByText("SKILL.md"));
      });

      // テキストを変更
      const textarea = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(textarea, { target: { value: "will fail save" } });
      });

      // writeFile を失敗させる
      mocks.writeFile.mockRejectedValueOnce(new Error("Save failed"));

      // 保存ボタンをクリック
      await act(async () => {
        fireEvent.click(screen.getByLabelText("保存"));
      });

      // エラー Toast が表示されるまで待つ
      await waitFor(() => {
        expect(screen.getByText("保存に失敗しました")).toBeInTheDocument();
      });
    });
  });

  describe("handleDialogCancel", () => {
    it("未保存ダイアログで「キャンセル」を選択するとダイアログが閉じて遷移が中止される", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
      });

      // ファイルを読み込む
      await act(async () => {
        fireEvent.click(screen.getByText("SKILL.md"));
      });

      // テキストを変更
      const textarea = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(textarea, { target: { value: "modified" } });
      });

      // ディレクトリを展開して別ファイルを選択 → ダイアログ表示
      await act(async () => {
        fireEvent.click(screen.getByText("agents"));
      });
      await act(async () => {
        fireEvent.click(screen.getByText("agent-1.md"));
      });

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();

      // 「キャンセル」をクリック
      fireEvent.click(screen.getByText(/キャンセル/));

      // ダイアログが閉じる
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

      // onClose は呼ばれない
      expect(mockOnClose).not.toHaveBeenCalled();

      // readFile は最初のファイル読み込み以外では呼ばれない
      // （別ファイルへのナビゲーションがキャンセルされた）
      expect(mocks.readFile).toHaveBeenCalledTimes(1);
    });

    it("閉じる操作のキャンセルで isPendingClose がリセットされる", async () => {
      await act(async () => {
        render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
      });

      // ファイルを読み込む
      await act(async () => {
        fireEvent.click(screen.getByText("SKILL.md"));
      });

      // テキストを変更
      const textarea = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(textarea, { target: { value: "modified" } });
      });

      // 閉じるボタンクリック → ダイアログ表示
      fireEvent.click(screen.getByLabelText("閉じる"));
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();

      // キャンセル
      fireEvent.click(screen.getByText(/キャンセル/));

      // ダイアログが閉じる
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

      // onClose は呼ばれない
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});

describe("useKeyboardNavigation カバレッジ補完", () => {
  /** 展開済みディレクトリと子ノードを含むフラット配列 */
  const nodesWithExpandedDir: FlatNode[] = [
    {
      path: "SKILL.md",
      name: "SKILL.md",
      type: "file",
      depth: 0,
    },
    {
      path: "agents/",
      name: "agents",
      type: "directory",
      depth: 0,
      isExpanded: true,
      parentPath: undefined,
    },
    {
      path: "agents/agent-1.md",
      name: "agent-1.md",
      type: "file",
      depth: 1,
      parentPath: "agents/",
    },
    {
      path: "agents/sub/",
      name: "sub",
      type: "directory",
      depth: 1,
      isExpanded: false,
      parentPath: "agents/",
    },
    {
      path: "references/",
      name: "references",
      type: "directory",
      depth: 0,
      isExpanded: false,
    },
  ];

  it("ArrowRight: 展開済みディレクトリで最初の子ノードへフォーカスが移動する", () => {
    const onSelect = vi.fn();
    const onToggleExpand = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect,
        onToggleExpand,
      }),
    );

    // focusedIndex を agents/（index=1、展開済みディレクトリ）に設定
    act(() => {
      result.current.setFocusedIndex(1);
    });

    // ArrowRight を押す → 展開済みなので最初の子ノード（index=2）へ移動
    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    // onToggleExpand は呼ばれない（既に展開済み）
    expect(onToggleExpand).not.toHaveBeenCalled();

    // onSelect は呼ばれない（子ノードへの移動）
    expect(onSelect).not.toHaveBeenCalled();

    // focusedIndex が 2（最初の子ノード）に移動
    expect(result.current.focusedIndex).toBe(2);
  });

  it("ArrowLeft: ファイルノードから親ディレクトリへフォーカスが移動する", () => {
    const onSelect = vi.fn();
    const onToggleExpand = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect,
        onToggleExpand,
      }),
    );

    // focusedIndex を agents/agent-1.md（index=2、parentPath="agents/"）に設定
    act(() => {
      result.current.setFocusedIndex(2);
    });

    // ArrowLeft を押す → 親ディレクトリ agents/（index=1）へ移動
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    // onToggleExpand は呼ばれない（ファイルノードのため折りたたみではない）
    expect(onToggleExpand).not.toHaveBeenCalled();

    // focusedIndex が 1（親ディレクトリ）に移動
    expect(result.current.focusedIndex).toBe(1);
  });

  it("ArrowLeft: 展開済みディレクトリで onToggleExpand が呼ばれる", () => {
    const onSelect = vi.fn();
    const onToggleExpand = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect,
        onToggleExpand,
      }),
    );

    // focusedIndex を agents/（index=1、展開済みディレクトリ）に設定
    act(() => {
      result.current.setFocusedIndex(1);
    });

    // ArrowLeft を押す → 展開済みディレクトリなので折りたたみ
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    // onToggleExpand が agents/ のパスで呼ばれる
    expect(onToggleExpand).toHaveBeenCalledWith("agents/");
  });

  it("空の flatNodes 配列で moveFocus が安全に動作する", () => {
    const onSelect = vi.fn();
    const onToggleExpand = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: [],
        onSelect,
        onToggleExpand,
      }),
    );

    // 初期値は -1
    expect(result.current.focusedIndex).toBe(-1);

    // 空配列で moveFocus しても安全
    act(() => {
      result.current.moveFocus("down");
    });
    expect(result.current.focusedIndex).toBe(-1);

    act(() => {
      result.current.moveFocus("up");
    });
    expect(result.current.focusedIndex).toBe(-1);

    act(() => {
      result.current.moveFocus("home");
    });
    expect(result.current.focusedIndex).toBe(-1);

    act(() => {
      result.current.moveFocus("end");
    });
    expect(result.current.focusedIndex).toBe(-1);
  });

  it("空の flatNodes 配列で handleKeyDown が安全に動作する", () => {
    const onSelect = vi.fn();
    const onToggleExpand = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: [],
        onSelect,
        onToggleExpand,
      }),
    );

    // ArrowDown/ArrowUp/Enter/Space で例外が発生しない
    const keys = [
      "ArrowDown",
      "ArrowUp",
      "ArrowRight",
      "ArrowLeft",
      "Enter",
      " ",
      "Home",
      "End",
      "Escape",
    ];
    for (const key of keys) {
      const event = new KeyboardEvent("keydown", { key });
      act(() => {
        result.current.handleKeyDown(event);
      });
    }

    // onSelect/onToggleExpand は呼ばれない（currentNode が null のため）
    expect(onSelect).not.toHaveBeenCalled();
    expect(onToggleExpand).not.toHaveBeenCalled();
  });

  it("Home キーで最初のノードへ移動する", () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect: vi.fn(),
        onToggleExpand: vi.fn(),
      }),
    );

    // まず末尾に移動
    act(() => {
      result.current.setFocusedIndex(4);
    });

    // Home キー
    const event = new KeyboardEvent("keydown", { key: "Home" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(result.current.focusedIndex).toBe(0);
  });

  it("End キーで最後のノードへ移動する", () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect: vi.fn(),
        onToggleExpand: vi.fn(),
      }),
    );

    // 先頭に移動
    act(() => {
      result.current.setFocusedIndex(0);
    });

    // End キー
    const event = new KeyboardEvent("keydown", { key: "End" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(result.current.focusedIndex).toBe(nodesWithExpandedDir.length - 1);
  });

  it("Enter キーで onSelect が呼ばれる", () => {
    const onSelect = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect,
        onToggleExpand: vi.fn(),
      }),
    );

    // ファイルノード（index=0）にフォーカス
    act(() => {
      result.current.setFocusedIndex(0);
    });

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onSelect).toHaveBeenCalledWith("SKILL.md");
  });

  it("Space キーで onSelect が呼ばれる", () => {
    const onSelect = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect,
        onToggleExpand: vi.fn(),
      }),
    );

    act(() => {
      result.current.setFocusedIndex(0);
    });

    const event = new KeyboardEvent("keydown", { key: " " });
    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onSelect).toHaveBeenCalledWith("SKILL.md");
  });

  it("ArrowRight: 未展開ディレクトリで onToggleExpand が呼ばれる", () => {
    const onToggleExpand = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect: vi.fn(),
        onToggleExpand,
      }),
    );

    // references/（index=4、未展開ディレクトリ）にフォーカス
    act(() => {
      result.current.setFocusedIndex(4);
    });

    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onToggleExpand).toHaveBeenCalledWith("references/");
  });

  it("ArrowRight: ファイルノードで onSelect が呼ばれる", () => {
    const onSelect = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect,
        onToggleExpand: vi.fn(),
      }),
    );

    // SKILL.md（index=0、ファイル）にフォーカス
    act(() => {
      result.current.setFocusedIndex(0);
    });

    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onSelect).toHaveBeenCalledWith("SKILL.md");
  });

  it("ArrowLeft: 親パスが存在しないトップレベルファイルでは移動しない", () => {
    const onToggleExpand = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect: vi.fn(),
        onToggleExpand,
      }),
    );

    // SKILL.md（index=0、parentPath 未設定のトップレベルファイル）にフォーカス
    act(() => {
      result.current.setFocusedIndex(0);
    });

    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    // onToggleExpand は呼ばれない（ファイルノードのため）
    expect(onToggleExpand).not.toHaveBeenCalled();

    // focusedIndex は変化しない（親がないため）
    expect(result.current.focusedIndex).toBe(0);
  });

  it("認識されないキーでは何も起こらない", () => {
    const onSelect = vi.fn();
    const onToggleExpand = vi.fn();

    const { result } = renderHook(() =>
      useKeyboardNavigation({
        flatNodes: nodesWithExpandedDir,
        onSelect,
        onToggleExpand,
      }),
    );

    act(() => {
      result.current.setFocusedIndex(0);
    });

    const event = new KeyboardEvent("keydown", { key: "Tab" });
    act(() => {
      result.current.handleKeyDown(event);
    });

    expect(onSelect).not.toHaveBeenCalled();
    expect(onToggleExpand).not.toHaveBeenCalled();
    expect(result.current.focusedIndex).toBe(0);
  });
});

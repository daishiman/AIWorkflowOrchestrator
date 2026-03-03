/**
 * SkillEditorView マイクロアニメーション テスト
 * UT-UI-05A-007: マイクロアニメーション
 *
 * Phase 4 - TDD Red
 *
 * テスト対象:
 * - ファイル選択時の transition-colors トランジション
 * - ディレクトリ展開/折り畳みの高さアニメーション
 * - エディターコンテンツ切り替え時の opacity トランジション
 * - prefers-reduced-motion: reduce 設定時の無効化
 * - ツールバーボタンのホバートランジション
 *
 * テスト方針:
 * - fireEvent のみ使用（userEvent 禁止 — P39 対策）
 * - CSS クラス名の存在確認で検証（P47 対策: variantStyles パターン）
 * - prefers-reduced-motion テストは matchMedia モックで実施
 *
 * @module SkillEditorView/__tests__/SkillEditorView.animation.test
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileTreeNode } from "../components/FileTreePanel/FileTreeNode";
import { EditorPanel } from "../components/EditorPanel/EditorPanel";
import { EditorToolBar } from "../components/EditorToolBar";
import { createFileNode, createDirectoryNode } from "./helpers/test-factories";

describe("SkillEditorView マイクロアニメーション", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // デフォルトの matchMedia モック（アニメーション有効）
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

  it("ファイル選択時に transition-colors が適用される", () => {
    const node = createFileNode({ name: "test.md", path: "test.md" });
    render(
      <FileTreeNode
        node={node}
        depth={1}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    );

    const treeItem = screen.getByRole("treeitem");
    // FileTreeNode の className に transition-colors が含まれることを検証
    expect(treeItem.className).toMatch(/transition-colors/);
  });

  it("ディレクトリ展開にアニメーションクラスが適用される", () => {
    // Phase 5 で実装予定: ディレクトリ展開時に高さアニメーションを追加する
    // 現在の実装では role="group" コンテナに transition クラスがない
    const dirNode = createDirectoryNode({
      name: "test-dir",
      path: "test-dir/",
      children: [
        createFileNode({ name: "child.md", path: "test-dir/child.md" }),
      ],
    });

    render(
      <FileTreeNode
        node={dirNode}
        depth={1}
        isSelected={false}
        expandedDirs={new Set(["test-dir/"])}
        onSelect={vi.fn()}
        onToggleExpand={vi.fn()}
      />,
    );

    // 子要素のコンテナ（role="group"）にアニメーション関連クラスがあることを検証
    const group = screen.getByRole("group");
    expect(group.className).toMatch(/transition|overflow-hidden/);
  });

  it("エディター切り替え時に transition-opacity が適用される", () => {
    // Phase 5 で実装予定: エディターパネルの切り替え時に
    // transition-opacity クラスを適用してフェード効果を付与する
    // 現在の EditorPanel には transition-opacity がない

    // EditorPanel を直接インポートして transition-opacity の存在を検証
    render(
      <EditorPanel
        content="test content"
        language="markdown"
        isLoading={false}
        isReadOnly={false}
        onChange={vi.fn()}
      />,
    );

    const textarea = screen.getByRole("textbox");
    // textarea またはその親コンテナに transition-opacity が適用されていることを検証
    const editorContainer = textarea.closest("[class*='transition-opacity']");
    expect(editorContainer).not.toBeNull();
  });

  it("prefers-reduced-motion: reduce で全アニメーションが無効化される", () => {
    // prefers-reduced-motion: reduce をシミュレート
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("prefers-reduced-motion") ? true : false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Phase 5 で実装予定: motion-reduce:transition-none クラスを
    // トランジション対象要素に追加する
    const node = createFileNode({ name: "test.md", path: "test.md" });
    render(
      <FileTreeNode
        node={node}
        depth={1}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    );

    const treeItem = screen.getByRole("treeitem");
    // Tailwind の motion-reduce ユーティリティが適用されていることを検証
    expect(treeItem.className).toMatch(/motion-reduce:transition-none/);
  });

  it("ツールバーボタンにホバートランジションが適用される", () => {
    render(
      <EditorToolBar
        selectedFile="test.md"
        hasChanges={false}
        isSaving={false}
        isReadOnly={false}
        onSave={vi.fn()}
        onClose={vi.fn()}
        onOpenBackups={vi.fn()}
      />,
    );

    const buttons = screen.getAllByRole("button");
    // 全ボタンに transition-colors クラスが適用されていることを検証
    buttons.forEach((button) => {
      expect(button.className).toMatch(/transition-colors/);
    });
  });
});

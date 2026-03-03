/**
 * Phase 4 テストユーティリティ
 * UT-UI-05A-IMPLEMENTATION-CLOSURE-001
 *
 * 7課題共通で使用するモック定義とテストヘルパー。
 * 既存の helpers/test-factories.ts を拡張し、キーボードナビゲーション・
 * レスポンシブ・アニメーション等のテストに必要なユーティリティを提供する。
 *
 * @module SkillEditorView/__tests__/test-utils
 */
import { vi } from "vitest";
import type { SkillFileTreeNode } from "../types";
import { sampleFileTree, setupSkillApiMocks } from "./helpers/test-factories";

// ---- FlatNode 型定義（キーボードナビゲーション用） ----

/** ツリーをフラット化した際のノード表現 */
export interface FlatNode {
  path: string;
  name: string;
  type: "file" | "directory";
  depth: number;
  isExpanded?: boolean;
}

// ---- ツリーフラット化ヘルパー ----

/**
 * SkillFileTreeNode[] をフラットなノード配列に変換する。
 * 展開されたディレクトリの子ノードのみ結果に含める。
 *
 * @param nodes - ツリーノード配列
 * @param depth - 現在のネスト深さ（デフォルト: 0）
 * @param expandedDirs - 展開中ディレクトリパスの Set
 * @returns フラット化されたノード配列
 */
export const flattenTree = (
  nodes: SkillFileTreeNode[],
  depth: number = 0,
  expandedDirs: Set<string> = new Set(),
): FlatNode[] => {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    const isExpanded = expandedDirs.has(node.path);
    result.push({
      path: node.path,
      name: node.name,
      type: node.type,
      depth,
      isExpanded: node.type === "directory" ? isExpanded : undefined,
    });
    if (node.type === "directory" && isExpanded && node.children) {
      result.push(...flattenTree(node.children, depth + 1, expandedDirs));
    }
  }
  return result;
};

// ---- メディアクエリモック（レスポンシブテスト用） ----

/**
 * window.matchMedia をモック化する。
 * モバイルドロワー（UT-UI-05A-002）およびアニメーション無効化
 * （UT-UI-05A-007 prefers-reduced-motion）のテストで使用する。
 *
 * @param matches - メディアクエリの一致結果
 */
export const mockMatchMedia = (matches: boolean): void => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// ---- Re-exports from test-factories ----

export { sampleFileTree, setupSkillApiMocks };
export {
  createFileNode,
  createDirectoryNode,
  sampleContent,
} from "./helpers/test-factories";

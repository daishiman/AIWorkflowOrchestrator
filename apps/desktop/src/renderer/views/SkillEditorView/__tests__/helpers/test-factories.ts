/**
 * テストデータファクトリとIPCモック設定
 *
 * SkillEditorView 全テストで共有するヘルパー。
 *
 * @module SkillEditorView/__tests__/helpers/test-factories
 */

import { vi } from "vitest";
import type { SkillFileTreeNode } from "../../types";

// ---- ファクトリ関数 ----

export const createFileNode = (
  overrides: Partial<SkillFileTreeNode> = {},
): SkillFileTreeNode => ({
  name: "SKILL.md",
  path: "SKILL.md",
  type: "file",
  ...overrides,
});

export const createDirectoryNode = (
  overrides: Partial<SkillFileTreeNode> = {},
): SkillFileTreeNode => ({
  name: "agents",
  path: "agents/",
  type: "directory",
  children: [],
  ...overrides,
});

// ---- サンプルデータ ----

/**
 * 3階層ツリー（ファイル5個 + ディレクトリ3個）
 *
 * ```
 * SKILL.md
 * agents/
 *   agent-1.md
 *   sub/
 *     deep.md
 * references/
 *   ref-1.md
 *   ref-2.md
 * ```
 */
export const sampleFileTree: SkillFileTreeNode[] = [
  createFileNode({ name: "SKILL.md", path: "SKILL.md" }),
  createDirectoryNode({
    name: "agents",
    path: "agents/",
    children: [
      createFileNode({ name: "agent-1.md", path: "agents/agent-1.md" }),
      createDirectoryNode({
        name: "sub",
        path: "agents/sub/",
        children: [
          createFileNode({ name: "deep.md", path: "agents/sub/deep.md" }),
        ],
      }),
    ],
  }),
  createDirectoryNode({
    name: "references",
    path: "references/",
    children: [
      createFileNode({ name: "ref-1.md", path: "references/ref-1.md" }),
      createFileNode({ name: "ref-2.md", path: "references/ref-2.md" }),
    ],
  }),
];

/** サンプルコンテンツ（50行のMarkdown） */
export const sampleContent = Array.from(
  { length: 50 },
  (_, i) => `Line ${i + 1}: This is sample content for testing.`,
).join("\n");

// ---- IPCモックセットアップ ----

export function setupSkillApiMocks(): {
  readFile: ReturnType<typeof vi.fn>;
  writeFile: ReturnType<typeof vi.fn>;
  createFile: ReturnType<typeof vi.fn>;
  deleteFile: ReturnType<typeof vi.fn>;
  listBackups: ReturnType<typeof vi.fn>;
  restoreBackup: ReturnType<typeof vi.fn>;
  getFileTree: ReturnType<typeof vi.fn>;
} {
  const mocks = {
    readFile: vi.fn().mockResolvedValue(sampleContent),
    writeFile: vi.fn().mockResolvedValue(undefined),
    createFile: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    listBackups: vi.fn().mockResolvedValue([]),
    restoreBackup: vi.fn().mockResolvedValue(undefined),
    getFileTree: vi.fn().mockResolvedValue({ tree: sampleFileTree }),
  };

  // window.electronAPI.skill をモック化
  Object.defineProperty(window, "electronAPI", {
    value: {
      skill: mocks,
    },
    writable: true,
    configurable: true,
  });

  return mocks;
}

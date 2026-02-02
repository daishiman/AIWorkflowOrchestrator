/**
 * fileTreeUtils テスト
 *
 * @description FileNodeツリーからファイル一覧を抽出するユーティリティのテスト
 */

import { describe, it, expect } from "vitest";
import type { FileNode } from "../../../../store/types";
import type { FolderId } from "../../../../store/types/workspace";
import {
  extractFilesFromTree,
  flattenFileTrees,
  isFileNode,
} from "../fileTreeUtils";

describe("fileTreeUtils", () => {
  describe("isFileNode", () => {
    it("typeがfileのノードはtrueを返す", () => {
      const node: FileNode = {
        id: "1",
        name: "test.ts",
        type: "file",
        path: "/test.ts",
      };
      expect(isFileNode(node)).toBe(true);
    });

    it("typeがfolderのノードはfalseを返す", () => {
      const node: FileNode = {
        id: "1",
        name: "src",
        type: "folder",
        path: "/src",
        children: [],
      };
      expect(isFileNode(node)).toBe(false);
    });
  });

  describe("extractFilesFromTree", () => {
    it("空の配列を渡すと空配列を返す", () => {
      const result = extractFilesFromTree([]);
      expect(result).toEqual([]);
    });

    it("ファイルのみの配列から正しく抽出する", () => {
      const nodes: FileNode[] = [
        { id: "1", name: "a.ts", type: "file", path: "/a.ts" },
        { id: "2", name: "b.ts", type: "file", path: "/b.ts" },
      ];

      const result = extractFilesFromTree(nodes);

      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { path: "/a.ts", name: "a.ts" },
        { path: "/b.ts", name: "b.ts" },
      ]);
    });

    it("ディレクトリのみの配列は空配列を返す", () => {
      const nodes: FileNode[] = [
        { id: "1", name: "src", type: "folder", path: "/src", children: [] },
        { id: "2", name: "lib", type: "folder", path: "/lib", children: [] },
      ];

      const result = extractFilesFromTree(nodes);

      expect(result).toEqual([]);
    });

    it("ネストされたディレクトリからファイルを再帰的に抽出する", () => {
      const nodes: FileNode[] = [
        {
          id: "1",
          name: "src",
          type: "folder",
          path: "/src",
          children: [
            { id: "2", name: "index.ts", type: "file", path: "/src/index.ts" },
            {
              id: "3",
              name: "lib",
              type: "folder",
              path: "/src/lib",
              children: [
                {
                  id: "4",
                  name: "utils.ts",
                  type: "file",
                  path: "/src/lib/utils.ts",
                },
              ],
            },
          ],
        },
      ];

      const result = extractFilesFromTree(nodes);

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({
        path: "/src/index.ts",
        name: "index.ts",
      });
      expect(result).toContainEqual({
        path: "/src/lib/utils.ts",
        name: "utils.ts",
      });
    });

    it("特殊文字を含むパスを正しく処理する", () => {
      const nodes: FileNode[] = [
        {
          id: "1",
          name: "test file (1).ts",
          type: "file",
          path: "/src/test file (1).ts",
        },
        {
          id: "2",
          name: "日本語ファイル.ts",
          type: "file",
          path: "/src/日本語ファイル.ts",
        },
      ];

      const result = extractFilesFromTree(nodes);

      expect(result).toHaveLength(2);
      expect(result[0].path).toBe("/src/test file (1).ts");
      expect(result[1].path).toBe("/src/日本語ファイル.ts");
    });

    it("深くネストされたツリーから全ファイルを抽出する", () => {
      const nodes: FileNode[] = [
        {
          id: "1",
          name: "level1",
          type: "folder",
          path: "/level1",
          children: [
            {
              id: "2",
              name: "level2",
              type: "folder",
              path: "/level1/level2",
              children: [
                {
                  id: "3",
                  name: "level3",
                  type: "folder",
                  path: "/level1/level2/level3",
                  children: [
                    {
                      id: "4",
                      name: "deep.ts",
                      type: "file",
                      path: "/level1/level2/level3/deep.ts",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const result = extractFilesFromTree(nodes);

      expect(result).toHaveLength(1);
      expect(result[0].path).toBe("/level1/level2/level3/deep.ts");
    });
  });

  describe("flattenFileTrees", () => {
    it("空のMapを渡すと空配列を返す", () => {
      const trees = new Map<FolderId, FileNode[]>();
      const result = flattenFileTrees(trees);
      expect(result).toEqual([]);
    });

    it("単一フォルダのツリーからファイルを抽出する", () => {
      const trees = new Map<FolderId, FileNode[]>();
      trees.set("folder-1" as FolderId, [
        { id: "1", name: "a.ts", type: "file", path: "/folder1/a.ts" },
      ]);

      const result = flattenFileTrees(trees);

      expect(result).toHaveLength(1);
      expect(result[0].path).toBe("/folder1/a.ts");
    });

    it("複数フォルダのツリーを統合する", () => {
      const trees = new Map<FolderId, FileNode[]>();
      trees.set("folder-1" as FolderId, [
        { id: "1", name: "a.ts", type: "file", path: "/folder1/a.ts" },
        { id: "2", name: "b.ts", type: "file", path: "/folder1/b.ts" },
      ]);
      trees.set("folder-2" as FolderId, [
        { id: "3", name: "c.ts", type: "file", path: "/folder2/c.ts" },
      ]);

      const result = flattenFileTrees(trees);

      expect(result).toHaveLength(3);
      expect(result.map((f) => f.path)).toContain("/folder1/a.ts");
      expect(result.map((f) => f.path)).toContain("/folder1/b.ts");
      expect(result.map((f) => f.path)).toContain("/folder2/c.ts");
    });

    it("ネストされたツリーを持つ複数フォルダを正しく処理する", () => {
      const trees = new Map<FolderId, FileNode[]>();
      trees.set("folder-1" as FolderId, [
        {
          id: "1",
          name: "src",
          type: "folder",
          path: "/folder1/src",
          children: [
            {
              id: "2",
              name: "index.ts",
              type: "file",
              path: "/folder1/src/index.ts",
            },
          ],
        },
      ]);
      trees.set("folder-2" as FolderId, [
        { id: "3", name: "main.ts", type: "file", path: "/folder2/main.ts" },
      ]);

      const result = flattenFileTrees(trees);

      expect(result).toHaveLength(2);
      expect(result.map((f) => f.path)).toContain("/folder1/src/index.ts");
      expect(result.map((f) => f.path)).toContain("/folder2/main.ts");
    });
  });
});

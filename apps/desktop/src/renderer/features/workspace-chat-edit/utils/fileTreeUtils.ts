/**
 * fileTreeUtils - ファイルツリー操作ユーティリティ
 *
 * @description FileNodeツリーからファイル一覧を抽出するユーティリティ関数群
 */

import type { FileNode } from "../../../store/types";
import type { FolderId } from "../../../store/types/workspace";

/**
 * ファイル情報
 */
export interface FileInfo {
  /** ファイルの絶対パス */
  path: string;
  /** ファイル名 */
  name: string;
}

/**
 * ノードがファイルかどうかを判定
 * @param node FileNode
 * @returns ファイルの場合true
 */
export function isFileNode(node: FileNode): boolean {
  return node.type === "file";
}

/**
 * FileNodeツリーからファイル一覧を抽出
 * @param nodes FileNodeの配列
 * @returns ファイル情報の配列
 */
export function extractFilesFromTree(nodes: FileNode[]): FileInfo[] {
  const files: FileInfo[] = [];

  const traverse = (nodeList: FileNode[]): void => {
    for (const node of nodeList) {
      if (isFileNode(node)) {
        files.push({
          path: node.path,
          name: node.name,
        });
      } else if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };

  traverse(nodes);
  return files;
}

/**
 * 複数のファイルツリーを統合してフラット化
 * @param trees FolderIdをキーとするファイルツリーのMap
 * @returns 全ファイル情報の配列
 */
export function flattenFileTrees(trees: Map<FolderId, FileNode[]>): FileInfo[] {
  const allFiles: FileInfo[] = [];

  for (const [, nodes] of trees) {
    const files = extractFilesFromTree(nodes);
    allFiles.push(...files);
  }

  return allFiles;
}

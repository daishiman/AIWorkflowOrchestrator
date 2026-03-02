/**
 * SkillEditorView 共有型定義
 *
 * @module SkillEditorView/types
 */

/** ファイルツリーのノード型 */
export interface SkillFileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: SkillFileTreeNode[];
}

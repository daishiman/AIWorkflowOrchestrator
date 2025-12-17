/**
 * WorkspaceFileSelector 型定義
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import type { FileNode } from "../../../store/types";
import type { FolderId } from "../../../store/types/workspace";

/**
 * 選択されたワークスペースファイル
 */
export interface WorkspaceSelectedFile {
  /** ファイルの一意ID（パス） */
  id: string;

  /** ファイル名 */
  name: string;

  /** 絶対パス */
  path: string;

  /** 所属フォルダID */
  folderId: string;

  /** ファイルサイズ（バイト） */
  size?: number;

  /** 最終更新日時 */
  modifiedAt?: Date;
}

/**
 * WorkspaceFileSelector のProps
 */
export interface WorkspaceFileSelectorProps {
  /** 選択モード: single | multiple */
  selectionMode?: "single" | "multiple";

  /** ファイルタイプフィルター（拡張子） */
  allowedExtensions?: string[];

  /** 最大選択数（0 = 無制限） */
  maxSelection?: number;

  /** 選択変更コールバック */
  onSelectionChange?: (files: WorkspaceSelectedFile[]) => void;

  /** 追加のCSSクラス */
  className?: string;
}

/**
 * WorkspaceSearchInput のProps
 */
export interface WorkspaceSearchInputProps {
  /** 検索クエリ */
  value: string;

  /** 検索クエリ変更コールバック */
  onChange: (query: string) => void;

  /** クリアボタン押下コールバック */
  onClear: () => void;

  /** プレースホルダーテキスト */
  placeholder?: string;
}

/**
 * WorkspaceFileTree のProps
 */
export interface WorkspaceFileTreeProps {
  /** 表示するファイルツリー（フィルタリング済み） */
  fileTrees: Map<FolderId, FileNode[]>;

  /** フォルダ情報 */
  folders: Array<{
    id: FolderId;
    displayName: string;
    path: string;
    isExpanded: boolean;
    expandedPaths: Set<string>;
  }>;

  /** 選択されているファイルパスのSet */
  selectedPaths: Set<string>;

  /** 展開されているパスのSet（全フォルダ統合） */
  expandedPaths: Set<string>;

  /** 選択モード */
  selectionMode: "single" | "multiple";

  /** ファイル選択/選択解除コールバック */
  onFileToggle: (filePath: string, file: FileNode) => void;

  /** フォルダ展開/折りたたみコールバック */
  onFolderToggle: (folderId: FolderId, path: string) => void;
}

/**
 * SelectableFileTreeItem のProps
 */
export interface SelectableFileTreeItemProps {
  node: FileNode;
  folderId: FolderId;
  expandedPaths: Set<string>;
  selectedPaths: Set<string>;
  selectionMode: "single" | "multiple";
  onFileToggle: (filePath: string, file: FileNode) => void;
  onFolderToggle: (path: string) => void;
  depth: number;
  /** ファイルのみ選択可能にする（フォルダは選択不可） */
  fileOnly?: boolean;
}

/**
 * SelectedFilesPanel のProps
 */
export interface SelectedFilesPanelProps {
  /** 選択されたファイル */
  selectedFiles: WorkspaceSelectedFile[];

  /** ファイル削除コールバック */
  onRemove: (filePath: string) => void;

  /** 全てクリアコールバック */
  onClearAll: () => void;
}

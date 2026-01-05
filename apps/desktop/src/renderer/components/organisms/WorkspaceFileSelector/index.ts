/**
 * WorkspaceFileSelector コンポーネント
 *
 * ワークスペース内のファイルを選択するためのUIコンポーネント群。
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

// Main component
export { WorkspaceFileSelector } from "./WorkspaceFileSelector";

// Sub-components
export { WorkspaceSearchInput } from "./WorkspaceSearchInput";
export { SelectableFileTreeItem } from "./SelectableFileTreeItem";
export { SelectedFilesPanel } from "./SelectedFilesPanel";

// Hooks
export {
  useWorkspaceFileSelection,
  useFileSearch,
  type UseWorkspaceFileSelectionOptions,
  type UseWorkspaceFileSelectionReturn,
  type UseFileSearchOptions,
  type UseFileSearchReturn,
} from "./hooks";

// Types
export type {
  WorkspaceSelectedFile,
  WorkspaceFileSelectorProps,
  WorkspaceSearchInputProps,
  WorkspaceFileTreeProps,
  SelectableFileTreeItemProps,
  SelectedFilesPanelProps,
} from "./types";

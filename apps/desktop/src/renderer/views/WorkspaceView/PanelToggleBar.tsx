import { FolderTree, Eye } from "lucide-react";

export interface PanelToggleBarProps {
  isFilePanelOpen: boolean;
  isPreviewOpen: boolean;
  onToggleFilePanel: () => void;
  onTogglePreview: () => void;
}

function getButtonClass(isActive: boolean): string {
  return [
    "inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]",
    isActive
      ? "border-[var(--border-default)] bg-[var(--bg-tertiary)] text-[var(--status-primary)]"
      : "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-primary)] opacity-75 hover:bg-[var(--bg-tertiary)] hover:opacity-100",
  ].join(" ");
}

export function PanelToggleBar({
  isFilePanelOpen,
  isPreviewOpen,
  onToggleFilePanel,
  onTogglePreview,
}: PanelToggleBarProps): JSX.Element {
  return (
    <div
      className="flex flex-wrap items-center gap-3"
      data-testid="workspace-toggle-bar"
    >
      <button
        type="button"
        role="switch"
        aria-checked={isFilePanelOpen}
        aria-label="ファイルサイドバーの表示切替"
        data-testid="workspace-toggle-file"
        className={getButtonClass(isFilePanelOpen)}
        onClick={onToggleFilePanel}
      >
        <FolderTree size={18} aria-hidden="true" />
        <span>ファイル</span>
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={isPreviewOpen}
        aria-label="プレビューサイドバーの表示切替"
        data-testid="workspace-toggle-preview"
        className={getButtonClass(isPreviewOpen)}
        onClick={onTogglePreview}
      >
        <Eye size={18} aria-hidden="true" />
        <span>プレビュー</span>
      </button>
    </div>
  );
}

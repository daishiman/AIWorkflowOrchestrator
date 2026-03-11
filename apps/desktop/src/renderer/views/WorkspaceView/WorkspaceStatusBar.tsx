export interface WorkspaceStatusBarProps {
  selectedFilePath: string | null;
  fileSize?: number | null;
  extension?: string | null;
  layoutMode: string;
  watchState: string;
  error?: string | null;
}

function formatFileSize(size?: number | null): string {
  if (!size) {
    return "-";
  }
  if (size < 1024) {
    return `${size} B`;
  }
  return `${(size / 1024).toFixed(1)} KB`;
}

export function WorkspaceStatusBar({
  selectedFilePath,
  fileSize,
  extension,
  layoutMode,
  watchState,
  error,
}: WorkspaceStatusBarProps): JSX.Element {
  const statusText = error
    ? `watch error: ${error}`
    : selectedFilePath
      ? selectedFilePath
      : "ファイル未選択";

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="workspace-status-bar"
      className="flex min-h-10 items-center justify-between gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-xs text-[var(--text-primary)]"
    >
      <div className="min-w-0 truncate opacity-80">{statusText}</div>
      <div className="flex shrink-0 items-center gap-3 opacity-70">
        <span data-testid="workspace-status-layout">{layoutMode}</span>
        <span data-testid="workspace-status-extension">{extension ?? "-"}</span>
        <span data-testid="workspace-status-size">
          {formatFileSize(fileSize)}
        </span>
        <span data-testid="workspace-status-watch">{watchState}</span>
      </div>
    </div>
  );
}

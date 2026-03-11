import type { SelectedFile } from "@repo/shared/schemas";

interface WorkspaceFileContextChipsProps {
  selectedFiles: SelectedFile[];
  onRemove: (id: string) => void;
}

export function WorkspaceFileContextChips({
  selectedFiles,
  onRemove,
}: WorkspaceFileContextChipsProps): JSX.Element | null {
  if (selectedFiles.length === 0) {
    return null;
  }

  const primaryFiles = selectedFiles.slice(0, 3);
  const restCount = Math.max(0, selectedFiles.length - primaryFiles.length);

  return (
    <div className="space-y-2" data-testid="workspace-file-context-chips">
      <div className="flex flex-wrap items-center gap-2">
        {primaryFiles.map((file) => (
          <div
            key={file.id}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1 text-xs text-[var(--text-primary)]"
            data-testid={`workspace-chip-${file.id}`}
          >
            <span className="rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5 text-[10px]">
              添付
            </span>
            <span className="max-w-48 truncate">{file.name}</span>
            <button
              type="button"
              className="rounded-full px-1 text-[var(--text-primary)] opacity-70 transition hover:bg-[var(--bg-tertiary)] hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)]"
              onClick={() => onRemove(file.id)}
              aria-label="ファイル背景情報を削除"
            >
              ×
            </button>
          </div>
        ))}

        {restCount > 0 ? (
          <div className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 py-1 text-xs text-[var(--text-primary)] opacity-80">
            +{restCount}件
          </div>
        ) : null}
      </div>
      <p className="text-xs text-[var(--text-primary)] opacity-70">
        ファイルの背景情報をAIに伝えています
      </p>
    </div>
  );
}

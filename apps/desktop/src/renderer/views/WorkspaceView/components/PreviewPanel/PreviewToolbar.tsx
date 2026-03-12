import type { PreviewMode } from "./preview-utils";

export interface PreviewToolbarProps {
  mode: PreviewMode;
  canPreview: boolean;
  isWrap: boolean;
  onModeChange: (mode: PreviewMode) => void;
  onRefresh: () => void;
  onWrapToggle: () => void;
}

export function PreviewToolbar({
  mode,
  canPreview,
  isWrap,
  onModeChange,
  onRefresh,
  onWrapToggle,
}: PreviewToolbarProps): JSX.Element {
  const tabBaseClass =
    "rounded-full px-3 py-1 text-xs transition-colors duration-150";

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3 py-2"
      data-testid="preview-toolbar"
    >
      <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1">
        <button
          type="button"
          className={`${tabBaseClass} ${
            mode === "source"
              ? "bg-[var(--status-primary)] text-white"
              : "text-[var(--text-secondary)]"
          }`}
          onClick={() => onModeChange("source")}
          data-testid="preview-tab-source"
        >
          コード表示
        </button>
        <button
          type="button"
          className={`${tabBaseClass} ${
            mode === "preview"
              ? "bg-[var(--status-primary)] text-white"
              : "text-[var(--text-secondary)]"
          }`}
          onClick={() => onModeChange("preview")}
          disabled={!canPreview}
          aria-disabled={!canPreview}
          data-testid="preview-tab-preview"
        >
          プレビュー
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)]"
          data-testid="preview-refresh"
        >
          再読み込み
        </button>
        <button
          type="button"
          onClick={onWrapToggle}
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)]"
          data-testid="preview-wrap-toggle"
        >
          Wrap: {isWrap ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}

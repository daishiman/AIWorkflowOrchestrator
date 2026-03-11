export function PreviewEmptyState(): JSX.Element {
  return (
    <div
      className="flex h-full min-h-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] p-6 text-center"
      data-testid="preview-empty-state"
    >
      <p className="text-base font-semibold text-[var(--text-primary)]">
        まだ表示するファイルがありません
      </p>
      <p className="text-sm text-[var(--text-secondary)]">
        左のファイル一覧か「ファイルをすばやく探す」で対象を選択してください。
      </p>
    </div>
  );
}

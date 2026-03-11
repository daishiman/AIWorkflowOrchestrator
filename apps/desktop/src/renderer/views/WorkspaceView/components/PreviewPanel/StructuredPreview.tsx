export interface StructuredPreviewProps {
  formatted: string;
  format: "json" | "yaml";
}

export function StructuredPreview({
  formatted,
  format,
}: StructuredPreviewProps): JSX.Element {
  return (
    <section
      className="h-full min-h-0 overflow-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]"
      data-testid="structured-preview"
    >
      <header className="border-b border-[var(--border-subtle)] px-3 py-2 text-xs uppercase tracking-wide text-[var(--text-secondary)]">
        {format} structured preview
      </header>
      <pre
        className="m-0 whitespace-pre-wrap break-words p-3 text-xs leading-6 text-[var(--text-primary)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {formatted}
      </pre>
    </section>
  );
}

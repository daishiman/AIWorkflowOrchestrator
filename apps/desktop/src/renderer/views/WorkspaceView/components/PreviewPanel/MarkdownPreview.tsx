import { MarkdownRenderer } from "@/renderer/components/molecules/MarkdownRenderer";

export interface MarkdownPreviewProps {
  markdown: string;
}

export function MarkdownPreview({
  markdown,
}: MarkdownPreviewProps): JSX.Element {
  return (
    <div
      className="h-full min-h-0 overflow-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2"
      data-testid="markdown-preview"
    >
      <MarkdownRenderer
        content={markdown}
        data-testid="preview-markdown-content"
      />
    </div>
  );
}

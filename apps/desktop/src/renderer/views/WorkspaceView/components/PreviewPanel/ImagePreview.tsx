import { useMemo, useState } from "react";
import { toImageMimeType } from "./preview-utils";

export interface ImagePreviewProps {
  content: string;
  extension: string | null;
  size: number | null;
}

function toImageSource(content: string, extension: string | null): string {
  if (content.startsWith("data:")) {
    return content;
  }

  const mime = toImageMimeType(extension);
  return `data:${mime};base64,${content}`;
}

export function ImagePreview({
  content,
  extension,
  size,
}: ImagePreviewProps): JSX.Element {
  const [showMeta, setShowMeta] = useState(false);
  const src = useMemo(
    () => toImageSource(content, extension),
    [content, extension],
  );

  return (
    <section
      className="flex h-full min-h-0 flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3"
      data-testid="image-preview"
    >
      <div className="flex items-center justify-end">
        <button
          type="button"
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-secondary)]"
          onClick={() => setShowMeta((prev) => !prev)}
          data-testid="image-meta-toggle"
        >
          {showMeta ? "メタ情報を隠す" : "メタ情報を表示"}
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-[var(--bg-secondary)]">
        <img
          src={src}
          alt="選択中ファイルのプレビュー"
          className="h-full w-full object-contain"
          data-testid="image-preview-content"
        />
      </div>

      {showMeta ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs text-[var(--text-secondary)]">
          <dt>拡張子</dt>
          <dd>{extension ?? "-"}</dd>
          <dt>サイズ</dt>
          <dd>{size === null ? "-" : `${size.toLocaleString()} bytes`}</dd>
        </dl>
      ) : null}
    </section>
  );
}

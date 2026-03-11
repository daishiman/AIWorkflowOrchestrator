import { useMemo } from "react";
import { sanitizeHTML } from "@/renderer/utils/sanitize";
import { PREVIEW_CSP } from "./preview-utils";

export interface HtmlPreviewProps {
  html: string;
}

function buildSrcDoc(sanitizedHtml: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}" />
<style>body{margin:0;padding:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#111827;background:#ffffff;} img{max-width:100%;height:auto;}</style>
</head>
<body>${sanitizedHtml}</body>
</html>`;
}

export function HtmlPreview({ html }: HtmlPreviewProps): JSX.Element {
  const srcDoc = useMemo(() => buildSrcDoc(sanitizeHTML(html)), [html]);

  return (
    <div
      className="h-full min-h-0 overflow-hidden rounded-2xl border border-[var(--border-subtle)]"
      data-testid="html-preview"
    >
      <iframe
        title="HTML preview"
        className="h-full w-full border-0"
        sandbox="allow-same-origin"
        referrerPolicy="no-referrer"
        srcDoc={srcDoc}
        data-testid="preview-html-iframe"
      />
    </div>
  );
}

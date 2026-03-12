export type PreviewMode = "source" | "preview";

export type PreviewKind =
  | "html"
  | "markdown"
  | "image"
  | "structured"
  | "source-only";

const HTML_EXTENSIONS = new Set([".html", ".htm"]);
const MARKDOWN_EXTENSIONS = new Set([".md", ".markdown"]);
const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".bmp",
  ".svg",
]);
const STRUCTURED_EXTENSIONS = new Set([".json", ".yaml", ".yml"]);

export const PREVIEW_CSP =
  "default-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; script-src 'none'; object-src 'none'; frame-src 'none'";

export function detectPreviewKind(extension: string | null): PreviewKind {
  const normalized = extension?.toLowerCase() ?? "";
  if (HTML_EXTENSIONS.has(normalized)) {
    return "html";
  }

  if (MARKDOWN_EXTENSIONS.has(normalized)) {
    return "markdown";
  }

  if (IMAGE_EXTENSIONS.has(normalized)) {
    return "image";
  }

  if (STRUCTURED_EXTENSIONS.has(normalized)) {
    return "structured";
  }

  return "source-only";
}

export function isPreviewAvailable(extension: string | null): boolean {
  return detectPreviewKind(extension) !== "source-only";
}

export function normalizeExtension(filePath: string | null): string | null {
  if (!filePath || !filePath.includes(".")) {
    return null;
  }

  const ext = filePath.split(".").pop();
  if (!ext) {
    return null;
  }

  return `.${ext.toLowerCase()}`;
}

export function guessLanguage(extension: string | null): string {
  switch (extension) {
    case ".ts":
    case ".tsx":
      return "typescript";
    case ".js":
    case ".jsx":
      return "javascript";
    case ".json":
      return "json";
    case ".yaml":
    case ".yml":
      return "yaml";
    case ".md":
      return "markdown";
    case ".html":
    case ".htm":
      return "html";
    case ".css":
    case ".scss":
      return "css";
    default:
      return "text";
  }
}

export function toImageMimeType(extension: string | null): string {
  switch (extension) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".bmp":
      return "image/bmp";
    default:
      return "image/png";
  }
}

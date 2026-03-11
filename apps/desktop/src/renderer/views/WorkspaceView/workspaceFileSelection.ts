import type { SelectedFile } from "@repo/shared/schemas";

function guessMimeType(extension: string): string {
  if (extension === ".ts" || extension === ".tsx") {
    return "text/typescript";
  }
  if (extension === ".js" || extension === ".jsx") {
    return "text/javascript";
  }
  if (extension === ".json") {
    return "application/json";
  }
  if (extension === ".md") {
    return "text/markdown";
  }
  return "text/plain";
}

function normalizeExtension(fileName: string): string {
  if (!fileName.includes(".")) {
    return ".txt";
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? `.${extension}` : ".txt";
}

function getFileName(filePath: string): string {
  const fileName = filePath.split(/[\\/]/).pop();
  return fileName && fileName.length > 0 ? fileName : filePath;
}

export function createSelectedFile(params: {
  filePath: string;
  size: number;
  lastModified: Date;
}): SelectedFile {
  const fileName = getFileName(params.filePath);
  const extension = normalizeExtension(fileName);

  return {
    id: crypto.randomUUID(),
    path: params.filePath,
    name: fileName,
    extension,
    size: params.size,
    mimeType: guessMimeType(extension),
    lastModified: params.lastModified.toISOString(),
    createdAt: new Date().toISOString(),
  };
}

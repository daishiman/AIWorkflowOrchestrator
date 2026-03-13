export const FILE_READ_TIMEOUT_MS = 5000;
export const FILE_READ_RETRY_DELAY_MS = 1000;
export const FILE_READ_MAX_RETRIES = 3;

export type PreviewSurfaceErrorCategory =
  | "transport"
  | "parse"
  | "crash"
  | "no-match";

export type PreviewSurfaceErrorCode =
  | "file-api-unavailable"
  | "file-read-timeout"
  | "file-read-failure"
  | "structured-preview-parse"
  | "preview-render-crash"
  | "quick-search-no-match";

export interface PreviewSurfaceError {
  category: PreviewSurfaceErrorCategory;
  code: PreviewSurfaceErrorCode;
  summary: string;
  detail: string;
  retryable: boolean;
  attempts?: number;
  timeoutMs?: number;
}

export interface PreviewReadSuccessData {
  content: string;
  size: number;
}

export type PreviewReadResult =
  | {
      success: true;
      data: PreviewReadSuccessData;
    }
  | {
      success: false;
      error: PreviewSurfaceError;
    };

type FileReadResponse = {
  success: boolean;
  data?: {
    content: string;
    metadata: {
      size: number;
      lastModified: Date | string;
      encoding: string;
    };
  };
  error?: unknown;
};

type FileReadFn = (args: { filePath: string }) => Promise<FileReadResponse>;

interface ReadPreviewFileOptions {
  filePath: string;
  readFile: FileReadFn;
  timeoutMs?: number;
  retryDelayMs?: number;
  maxRetries?: number;
  wait?: (ms: number) => Promise<void>;
}

class PreviewTimeoutError extends Error {
  readonly code = "file-read-timeout";
}

function waitDefault(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}

function extractErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "ファイル読み込みに失敗しました";
}

async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timeoutId = globalThis.setTimeout(() => {
          reject(
            new PreviewTimeoutError(
              `ファイル読み込みが ${timeoutMs / 1000} 秒でタイムアウトしました`,
            ),
          );
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) {
      globalThis.clearTimeout(timeoutId);
    }
  }
}

function createTransportError(params: {
  code: "file-api-unavailable" | "file-read-timeout" | "file-read-failure";
  message: string;
  attempts?: number;
  timeoutMs?: number;
}): PreviewSurfaceError {
  const { code, message, attempts, timeoutMs } = params;

  switch (code) {
    case "file-api-unavailable":
      return {
        category: "transport",
        code,
        summary: "file API が利用できません",
        detail:
          "Renderer から file.read を呼び出せないため、プレビューを表示できません。",
        retryable: false,
      };
    case "file-read-timeout":
      return {
        category: "transport",
        code,
        summary: "ファイル読み込みがタイムアウトしました",
        detail: `${Math.max((timeoutMs ?? FILE_READ_TIMEOUT_MS) / 1000, 0)}秒 timeout / ${attempts ?? FILE_READ_MAX_RETRIES}回再試行済み`,
        retryable: true,
        attempts,
        timeoutMs,
      };
    default:
      return {
        category: "transport",
        code,
        summary: "ファイル読み込みに失敗しました",
        detail: `${message} / ${attempts ?? FILE_READ_MAX_RETRIES}回再試行済み`,
        retryable: true,
        attempts,
      };
  }
}

export function createStructuredPreviewParseError(
  message: string,
): PreviewSurfaceError {
  return {
    category: "parse",
    code: "structured-preview-parse",
    summary: "JSON/YAML を整形できなかったため、コード表示へ切り替えました",
    detail: message,
    retryable: false,
  };
}

export function createPreviewRenderCrashError(
  message: string,
): PreviewSurfaceError {
  return {
    category: "crash",
    code: "preview-render-crash",
    summary: "プレビューの描画でエラーが発生しました",
    detail: message,
    retryable: false,
  };
}

export function formatPreviewStatusText(error: PreviewSurfaceError): string {
  if (!error.detail) {
    return error.summary;
  }

  return `${error.summary}: ${error.detail}`;
}

export function getPreviewErrorHeading(error: PreviewSurfaceError): string {
  switch (error.category) {
    case "parse":
      return "整形プレビューに失敗したため、コード表示に切り替えました";
    case "crash":
      return "プレビューの描画でエラーが発生しました";
    case "no-match":
      return "一致するファイルは見つかりませんでした";
    default:
      return "プレビューの取得に失敗しました";
  }
}

export async function readPreviewFileWithResilience({
  filePath,
  readFile,
  timeoutMs = FILE_READ_TIMEOUT_MS,
  retryDelayMs = FILE_READ_RETRY_DELAY_MS,
  maxRetries = FILE_READ_MAX_RETRIES,
  wait = waitDefault,
}: ReadPreviewFileOptions): Promise<PreviewReadResult> {
  let lastMessage = "ファイル読み込みに失敗しました";
  let lastCode: "file-read-timeout" | "file-read-failure" = "file-read-failure";

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await withTimeout(readFile({ filePath }), timeoutMs);

      if (!response.success || !response.data) {
        throw new Error(extractErrorMessage(response.error));
      }

      return {
        success: true,
        data: {
          content: response.data.content,
          size: response.data.metadata.size,
        },
      };
    } catch (error) {
      lastMessage = extractErrorMessage(error);
      lastCode =
        error instanceof PreviewTimeoutError
          ? "file-read-timeout"
          : "file-read-failure";

      if (attempt < maxRetries) {
        await wait(retryDelayMs);
      }
    }
  }

  return {
    success: false,
    error: createTransportError({
      code: lastCode,
      message: lastMessage,
      attempts: maxRetries,
      timeoutMs,
    }),
  };
}

export function createPreviewApiUnavailableError(): PreviewSurfaceError {
  return createTransportError({
    code: "file-api-unavailable",
    message: "file API が利用できません",
  });
}

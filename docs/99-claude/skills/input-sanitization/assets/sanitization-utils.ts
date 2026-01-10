/**
 * サニタイズユーティリティ
 *
 * ユーザー入力のサニタイズとバリデーションのためのユーティリティ関数集です。
 * 各関数は単体で使用でき、プロジェクトに合わせてカスタマイズできます。
 *
 * @example
 * // このファイルをコピーして、プロジェクトのユーティリティに追加
 * cp templates/sanitization-utils.ts src/utils/sanitization.ts
 */

// ============================================================
// 1. HTMLサニタイズ
// ============================================================

/**
 * HTMLエスケープ - XSS対策の基本
 */
export function escapeHtml(unsafe: string): string {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return unsafe.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char);
}

/**
 * HTML属性値のエスケープ
 */
export function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "&#x0a;")
    .replace(/\r/g, "&#x0d;");
}

/**
 * HTMLタグを除去（プレーンテキスト抽出）
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * 許可されたHTMLタグのみ保持
 */
export function sanitizeHtml(
  html: string,
  allowedTags: string[] = ["b", "i", "em", "strong"],
): string {
  const tagPattern = new RegExp(
    `<(?!/?(?:${allowedTags.join("|")})\\b)[^>]*>`,
    "gi",
  );
  return html.replace(tagPattern, "");
}

// ============================================================
// 2. URLサニタイズ
// ============================================================

/**
 * URLが安全かチェック（javascript:, data: などを拒否）
 */
export function isSafeUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase().trim();
  const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
  return !dangerousProtocols.some((protocol) => lowerUrl.startsWith(protocol));
}

/**
 * 安全なURLを返す（危険なURLは空文字列）
 */
export function sanitizeUrl(url: string, fallback = ""): string {
  if (!isSafeUrl(url)) {
    return fallback;
  }
  return url;
}

/**
 * URLパラメータをエンコード
 */
export function encodeUrlParam(value: string): string {
  return encodeURIComponent(value);
}

/**
 * URLを検証してパース
 */
export function parseUrl(url: string): URL | null {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// ============================================================
// 3. ファイルパスサニタイズ
// ============================================================

/**
 * ファイル名をサニタイズ（危険な文字を除去）
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_") // 英数字、ドット、アンダースコア、ハイフンのみ
    .replace(/\.{2,}/g, ".") // 連続ドットを単一に
    .replace(/^\.+|\.+$/g, "") // 先頭・末尾のドット除去
    .substring(0, 255); // 長さ制限
}

/**
 * パストラバーサルをチェック
 */
export function hasPathTraversal(path: string): boolean {
  const normalizedPath = path.replace(/\\/g, "/");
  return normalizedPath.includes("../") || normalizedPath.includes("..");
}

/**
 * 安全なファイルパスを生成
 */
export function safePath(baseDir: string, userPath: string): string | null {
  // Node.js環境でのみ使用可能
  if (typeof process === "undefined") {
    throw new Error("This function requires Node.js environment");
  }

  const path = require("path");
  const normalizedBase = path.resolve(baseDir);
  const sanitizedName = sanitizeFilename(path.basename(userPath));
  const fullPath = path.join(normalizedBase, sanitizedName);

  // ベースディレクトリ外への移動を検出
  if (!fullPath.startsWith(normalizedBase + path.sep)) {
    return null;
  }

  return fullPath;
}

// ============================================================
// 4. 入力バリデーション
// ============================================================

/**
 * 文字列の長さを検証
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
): { valid: boolean; error?: string } {
  if (value.length < min) {
    return { valid: false, error: `最小${min}文字以上必要です` };
  }
  if (value.length > max) {
    return { valid: false, error: `最大${max}文字までです` };
  }
  return { valid: true };
}

/**
 * メールアドレスを検証
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 電話番号を検証（日本形式）
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^0\d{9,10}$/;
  const cleanPhone = phone.replace(/[-\s]/g, "");
  return phoneRegex.test(cleanPhone);
}

/**
 * 英数字のみかチェック
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * 整数かチェック
 */
export function isInteger(value: string): boolean {
  return /^-?\d+$/.test(value);
}

// ============================================================
// 5. SQLインジェクション対策
// ============================================================

/**
 * SQL特殊文字をエスケープ（緊急時のみ使用、パラメータ化クエリ推奨）
 */
export function escapeSqlString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\x00/g, "\\0")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\x1a/g, "\\Z");
}

/**
 * LIKE句のワイルドカードをエスケープ
 */
export function escapeLikePattern(pattern: string): string {
  return pattern.replace(/[%_\\]/g, "\\$&");
}

// ============================================================
// 6. コマンドインジェクション対策
// ============================================================

/**
 * シェルメタ文字が含まれているかチェック
 */
export function hasShellMetachars(input: string): boolean {
  const shellMetachars = /[;&|`$(){}[\]<>!\\*?#~\n\r]/;
  return shellMetachars.test(input);
}

/**
 * シェル引数をエスケープ（Unix系）
 */
export function escapeShellArg(arg: string): string {
  // シングルクォートで囲み、内部のシングルクォートをエスケープ
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

// ============================================================
// 7. 汎用サニタイズ関数
// ============================================================

/**
 * 制御文字を除去
 */
export function removeControlChars(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x1F\x7F]/g, "");
}

/**
 * Unicode正規化
 */
export function normalizeUnicode(value: string): string {
  return value.normalize("NFC");
}

/**
 * 空白文字をトリムして正規化
 */
export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * 複合サニタイズ - 一般的なテキスト入力用
 */
export function sanitizeTextInput(
  value: string,
  options: {
    maxLength?: number;
    trimWhitespace?: boolean;
    removeHtml?: boolean;
    removeControlChars?: boolean;
  } = {},
): string {
  const {
    maxLength = 1000,
    trimWhitespace = true,
    removeHtml = true,
    removeControlChars: removeCtrl = true,
  } = options;

  let result = value;

  if (removeCtrl) {
    result = removeControlChars(result);
  }

  if (removeHtml) {
    result = stripHtmlTags(result);
  }

  if (trimWhitespace) {
    result = normalizeWhitespace(result);
  }

  if (maxLength > 0) {
    result = result.substring(0, maxLength);
  }

  return result;
}

// ============================================================
// 8. 出力コンテキスト別エンコード
// ============================================================

/**
 * コンテキスト別エンコーダー
 */
export const encoder = {
  /** HTMLコンテンツ用 */
  html: escapeHtml,

  /** HTML属性用 */
  htmlAttr: escapeHtmlAttribute,

  /** URL用 */
  url: encodeURIComponent,

  /** JavaScript文字列用 */
  js: (value: string): string => JSON.stringify(value).slice(1, -1),

  /** CSS用 */
  css: (value: string): string => {
    return value.replace(/[^a-zA-Z0-9_-]/g, (char) => {
      return `\\${char.charCodeAt(0).toString(16)} `;
    });
  },
};

// ============================================================
// 9. 型ガード
// ============================================================

/**
 * 文字列型ガード
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * 非空文字列チェック
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

/**
 * 安全にunknownから文字列を取得
 */
export function safeString(value: unknown, defaultValue = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return defaultValue;
}

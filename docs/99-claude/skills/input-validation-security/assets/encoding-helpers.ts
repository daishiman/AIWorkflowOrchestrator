/**
 * Context-aware Encoding Helpers
 *
 * コンテキストに応じた適切なエンコーディング関数を提供します。
 * 出力先（HTML, JavaScript, URL, SQL）に応じて正しい関数を使用してください。
 */

// =============================================================================
// HTML Encoding
// =============================================================================

/**
 * HTMLテキストコンテンツ用エンコーディング
 *
 * 使用場所: HTML要素のテキストコンテンツ
 * 例: <p>${encodeHTML(userInput)}</p>
 */
export function encodeHTML(str: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return str.replace(/[&<>"']/g, (char) => entities[char]);
}

/**
 * HTML属性値用エンコーディング
 *
 * 使用場所: HTML属性値（必ずクォートで囲むこと）
 * 例: <input value="${encodeHTMLAttr(userInput)}">
 */
export function encodeHTMLAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`/g, "&#x60;")
    .replace(/=/g, "&#x3D;");
}

// =============================================================================
// JavaScript Encoding
// =============================================================================

/**
 * JavaScript文字列リテラル用エンコーディング
 *
 * 使用場所: JavaScript文字列内
 * 例: <script>const name = "${encodeJS(userInput)}";</script>
 *
 * 注意: 可能な限りDOM APIを使用し、インラインスクリプトを避けてください
 */
export function encodeJS(str: string): string {
  return JSON.stringify(str).slice(1, -1);
}

/**
 * JavaScriptデータ埋め込み用
 *
 * 使用場所: script要素内のJSON
 * 例: <script>const data = ${encodeJSData(userData)};</script>
 */
export function encodeJSData(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

// =============================================================================
// URL Encoding
// =============================================================================

/**
 * URLパラメータ用エンコーディング
 *
 * 使用場所: URLクエリパラメータの値
 * 例: /search?q=${encodeURLParam(userInput)}
 */
export function encodeURLParam(str: string): string {
  return encodeURIComponent(str);
}

/**
 * URLパスセグメント用エンコーディング
 *
 * 使用場所: URLパスの一部
 * 例: /users/${encodeURLPath(userId)}
 */
export function encodeURLPath(str: string): string {
  return encodeURIComponent(str).replace(/%2F/g, "/");
}

// =============================================================================
// CSS Encoding
// =============================================================================

/**
 * CSS用エンコーディング
 *
 * 使用場所: CSSプロパティ値
 * 例: style="background-image: url('${encodeCSS(userInput)}')"
 *
 * 注意: ユーザー入力をCSSに含めることは推奨されません
 */
export function encodeCSS(str: string): string {
  return str.replace(
    /[^a-zA-Z0-9]/g,
    (char) => `\\${char.charCodeAt(0).toString(16)} `,
  );
}

// =============================================================================
// SQL (使用禁止 - パラメータ化クエリを使用)
// =============================================================================

/**
 * SQL識別子のエスケープ
 *
 * 注意: これは最後の手段です。
 * 可能な限りallowlistを使用してください。
 *
 * @throws 許可されていない文字が含まれる場合
 */
export function escapeSQLIdentifier(identifier: string): string {
  // Allowlist: 英数字とアンダースコアのみ
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error(
      "Invalid SQL identifier. Use allowlist validation instead.",
    );
  }
  return `"${identifier}"`;
}

/**
 * LIKEパターンのエスケープ
 *
 * 使用場所: LIKE検索のパターン部分
 * 例: WHERE name LIKE $1 with [`%${escapeLikePattern(search)}%`]
 */
export function escapeLikePattern(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * URLの安全性を検証
 *
 * HTTP/HTTPSのみを許可し、javascript:やdata:を拒否
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * メールアドレスの簡易検証
 *
 * 注意: 完全な検証はメール送信で行う
 */
export function isValidEmail(email: string): boolean {
  // RFC 5322 simplified
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/**
 * パスの安全性を検証（パストラバーサル防止）
 */
export function isSafePath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/");
  return (
    !normalized.includes("..") &&
    !normalized.startsWith("/") &&
    !/^[a-zA-Z]:/.test(normalized)
  );
}

// =============================================================================
// Type Guards
// =============================================================================

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

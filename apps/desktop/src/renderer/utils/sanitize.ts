/**
 * HTMLサニタイズユーティリティ
 * DOMPurifyを使用して悪意のあるコンテンツを除去
 * @module sanitize
 */

import DOMPurify from "dompurify";
import type { Config } from "dompurify";

/**
 * 許可されるタグ一覧
 */
const ALLOWED_TAGS = [
  // テキスト系
  "p",
  "br",
  "span",
  "div",
  "a",
  // ヘッダー系
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  // リスト系
  "ul",
  "ol",
  "li",
  // テーブル系
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  // インライン系
  "strong",
  "em",
  "b",
  "i",
  "u",
  "s",
  "code",
  "pre",
  "blockquote",
  // メディア系（安全なもののみ）
  "img",
  // その他
  "hr",
  "article",
  "section",
  "header",
  "footer",
  "nav",
  "main",
  "aside",
];

/**
 * 禁止されるタグ一覧（明示的に除去）
 */
const FORBID_TAGS = [
  "script",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "button",
  "select",
  "textarea",
  "style",
  "link",
  "meta",
  "base",
  "frame",
  "frameset",
  "applet",
  "svg",
  "math",
];

/**
 * 禁止される属性一覧（イベントハンドラ等）
 */
const FORBID_ATTR = [
  // イベントハンドラ
  "onerror",
  "onload",
  "onclick",
  "onmouseover",
  "onmouseout",
  "onmousedown",
  "onmouseup",
  "onkeydown",
  "onkeyup",
  "onkeypress",
  "onfocus",
  "onblur",
  "onchange",
  "onsubmit",
  "onreset",
  "onselect",
  "ondblclick",
  "ondrag",
  "ondragend",
  "ondragenter",
  "ondragleave",
  "ondragover",
  "ondragstart",
  "ondrop",
  "onscroll",
  "onwheel",
  "oncopy",
  "oncut",
  "onpaste",
  "onbeforeunload",
  "onunload",
  "onhashchange",
  "onpopstate",
  "onresize",
  "oncontextmenu",
  "oninput",
  "oninvalid",
  "onsearch",
  "ontouchstart",
  "ontouchmove",
  "ontouchend",
  "ontouchcancel",
  "onanimationstart",
  "onanimationend",
  "onanimationiteration",
  "ontransitionend",
  // 危険な属性
  "formaction",
  "xlink:href",
  "data",
  "srcdoc",
];

/**
 * 許可されるURIスキーム（将来の拡張用）
 */
const _ALLOWED_URI_SCHEMES = ["https", "http", "mailto", "tel"];

/**
 * data: URLで許可されるMIMEタイプ
 */
const ALLOWED_DATA_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

/**
 * DOMPurify設定
 */
const DOMPURIFY_CONFIG: Config = {
  ALLOWED_TAGS,
  FORBID_TAGS,
  FORBID_ATTR,
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: true,
  USE_PROFILES: { html: true },
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  KEEP_CONTENT: false,
};

/**
 * javascript: URLパターン
 * 空白、大文字小文字、HTMLエンティティ対応
 */
const JAVASCRIPT_URL_PATTERN =
  /^\s*(?:j|&#[xX]?(?:0*106|0*74);?)(?:a|&#[xX]?(?:0*97|0*61);?)(?:v|&#[xX]?(?:0*118|0*76);?)(?:a|&#[xX]?(?:0*97|0*61);?)(?:s|&#[xX]?(?:0*115|0*73);?)(?:c|&#[xX]?(?:0*99|0*63);?)(?:r|&#[xX]?(?:0*114|0*72);?)(?:i|&#[xX]?(?:0*105|0*69);?)(?:p|&#[xX]?(?:0*112|0*70);?)(?:t|&#[xX]?(?:0*116|0*74);?)\s*:/i;

/**
 * 簡易javascript:URLチェック（大文字小文字、空白対応）
 */
const isJavaScriptUrl = (url: string): boolean => {
  const normalizedUrl = url
    .toLowerCase()
    // eslint-disable-next-line no-control-regex -- intentionally checking for control characters as security measure
    .replace(/[\s\u0000-\u001f\u007f-\u009f]/g, "");
  return (
    normalizedUrl.startsWith("javascript:") || JAVASCRIPT_URL_PATTERN.test(url)
  );
};

/**
 * data: URLの検証
 * 画像タイプのみ許可
 */
const isAllowedDataUrl = (url: string): boolean => {
  if (!url.toLowerCase().startsWith("data:")) {
    return true; // data: URL以外は許可
  }

  const mimeMatch = url.match(/^data:([^;,]+)/i);
  if (!mimeMatch) {
    return false;
  }

  const mimeType = mimeMatch[1].toLowerCase();
  return ALLOWED_DATA_MIME_TYPES.includes(mimeType);
};

/**
 * URL属性の検証
 */
const validateUrlAttribute = (value: string): boolean => {
  // javascript: URLは禁止
  if (isJavaScriptUrl(value)) {
    return false;
  }

  // data: URLは画像タイプのみ許可
  if (!isAllowedDataUrl(value)) {
    return false;
  }

  return true;
};

/**
 * DOMPurifyフック: 属性フィルタリング
 */
const setupDomPurifyHooks = (): void => {
  // 属性処理フック
  DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
    // href, src属性のURLチェック
    if (data.attrName === "href" || data.attrName === "src") {
      if (!validateUrlAttribute(data.attrValue)) {
        data.attrValue = "";
        data.keepAttr = false;
      }
    }

    // action属性は常に除去（フォーム送信防止）
    if (data.attrName === "action") {
      data.attrValue = "";
      data.keepAttr = false;
    }
  });
};

// フックを初期化
setupDomPurifyHooks();

/**
 * HTMLをサニタイズ
 * XSS攻撃を防ぐために危険なタグと属性を除去
 *
 * @param html - サニタイズするHTML文字列
 * @returns サニタイズ済みHTML
 *
 * @example
 * ```ts
 * const unsafe = '<script>alert("xss")</script><p>Hello</p>';
 * const safe = sanitizeHTML(unsafe);
 * // safe = '<p>Hello</p>'
 * ```
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== "string") {
    return "";
  }

  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG) as string;
};

/**
 * CSPディレクティブ定義
 */
export const CSP_DIRECTIVES = {
  "default-src": "'self'",
  "script-src": "'none'",
  "style-src": "'self' 'unsafe-inline'",
  "img-src": "'self' data: https:",
  "font-src": "'self' https:",
  "connect-src": "'none'",
  "frame-ancestors": "'none'",
  "base-uri": "'none'",
  "form-action": "'none'",
  "object-src": "'none'",
} as const;

/**
 * CSP文字列を構築
 *
 * @returns CSPディレクティブ文字列
 */
export const buildCSPString = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, value]) => `${directive} ${value}`)
    .join("; ");
};

/**
 * CSPメタタグを生成
 *
 * @returns CSP meta tag HTML
 */
export const buildCSPMetaTag = (): string => {
  return `<meta http-equiv="Content-Security-Policy" content="${buildCSPString()}">`;
};

/**
 * サンドボックス属性のデフォルト値
 * allow-same-originのみ許可
 */
export const DEFAULT_SANDBOX_FLAGS = "allow-same-origin";

/**
 * 禁止されるサンドボックスフラグ
 * セキュリティ上の理由から、以下のフラグは許可しない
 */
export const FORBIDDEN_SANDBOX_FLAGS = [
  "allow-scripts",
  "allow-popups",
  "allow-top-navigation",
  "allow-forms",
  "allow-modals",
  "allow-pointer-lock",
  "allow-downloads",
];

/**
 * 危険なsandboxフラグをフィルタリング
 * FORBIDDEN_SANDBOX_FLAGSに含まれるフラグを除去
 *
 * @param flags - フィルタリングするsandboxフラグ配列
 * @returns 安全なフラグのみを含むスペース区切り文字列
 *
 * @example
 * ```ts
 * const safe = filterSandboxFlags(['allow-same-origin', 'allow-scripts']);
 * // safe = 'allow-same-origin'
 * ```
 */
export const filterSandboxFlags = (flags: string[]): string => {
  const safeFlags = flags.filter(
    (flag) => !FORBIDDEN_SANDBOX_FLAGS.includes(flag),
  );
  return safeFlags.join(" ");
};

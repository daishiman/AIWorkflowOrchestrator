/**
 * CSPモジュール
 *
 * Content Security Policy (CSP) の生成と管理を行うモジュール。
 * Electronアプリケーションのセキュリティを強化するために、
 * 環境に応じた適切なCSPポリシーを生成する。
 *
 * @see https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy
 */

// ============================================================================
// 型定義
// ============================================================================

/**
 * CSP設定オプション
 */
export interface CSPOptions {
  /** 開発モードかどうか */
  isDev: boolean;
  /** Supabase API URL（環境変数から取得） */
  supabaseUrl?: string;
}

/**
 * CSPディレクティブ
 */
export type CSPDirective =
  | "default-src"
  | "script-src"
  | "style-src"
  | "img-src"
  | "font-src"
  | "connect-src"
  | "object-src"
  | "frame-src"
  | "frame-ancestors"
  | "base-uri"
  | "form-action"
  | "upgrade-insecure-requests";

/**
 * CSPディレクティブマップ
 */
export type CSPDirectiveMap = Partial<
  Record<CSPDirective, string[] | undefined>
>;

/**
 * CSP生成結果
 */
export interface CSPResult {
  /** CSPポリシー文字列 */
  policy: string;
  /** 使用されたディレクティブ */
  directives: CSPDirectiveMap;
}

// ============================================================================
// 定数定義
// ============================================================================

/**
 * CSPソース値の定数
 */
const CSP_SOURCES = {
  SELF: "'self'",
  NONE: "'none'",
  UNSAFE_INLINE: "'unsafe-inline'",
  UNSAFE_EVAL: "'unsafe-eval'",
  DATA: "data:",
  HTTPS: "https:",
  WS: "ws:",
  WSS: "wss:",
  SUPABASE_WILDCARD: "https://*.supabase.co",
} as const;

/**
 * 共通の基本ディレクティブ（本番/開発共通）
 */
const BASE_DIRECTIVES: CSPDirectiveMap = {
  /** デフォルトは自身のオリジンのみ許可 */
  "default-src": [CSP_SOURCES.SELF],
  /** フォント: 自身のオリジンのみ */
  "font-src": [CSP_SOURCES.SELF],
  /** オブジェクト: 禁止（Flash等のプラグイン対策） */
  "object-src": [CSP_SOURCES.NONE],
  /** フレーム: 禁止 */
  "frame-src": [CSP_SOURCES.NONE],
  /** フレーム祖先: 禁止（クリックジャッキング対策） */
  "frame-ancestors": [CSP_SOURCES.NONE],
  /** ベースURI: 自身のオリジンのみ */
  "base-uri": [CSP_SOURCES.SELF],
  /** フォーム送信先: 自身のオリジンのみ */
  "form-action": [CSP_SOURCES.SELF],
};

// ============================================================================
// ヘルパー関数
// ============================================================================

/**
 * Supabase URLからconnect-src用のオリジンリストを生成
 *
 * @param supabaseUrl - Supabase API URL
 * @returns connect-src用のオリジン配列
 */
function buildSupabaseConnectSources(supabaseUrl?: string): string[] {
  if (!supabaseUrl) {
    return [];
  }

  try {
    const url = new URL(supabaseUrl);
    return [url.origin, CSP_SOURCES.SUPABASE_WILDCARD];
  } catch {
    console.warn("[CSP] Invalid SUPABASE_URL:", supabaseUrl);
    return [];
  }
}

// ============================================================================
// ディレクティブ生成関数
// ============================================================================

/**
 * 本番環境用CSPディレクティブを生成
 *
 * @param supabaseUrl - Supabase API URL
 * @returns CSPディレクティブマップ
 *
 * @example
 * ```typescript
 * const directives = getProductionDirectives("https://myproject.supabase.co");
 * // directives["connect-src"] には Supabase URL が含まれる
 * ```
 */
export function getProductionDirectives(supabaseUrl?: string): CSPDirectiveMap {
  const supabaseSources = buildSupabaseConnectSources(supabaseUrl);

  return {
    ...BASE_DIRECTIVES,
    "script-src": [CSP_SOURCES.SELF],
    "style-src": [CSP_SOURCES.SELF, CSP_SOURCES.UNSAFE_INLINE], // Tailwind CSS/shadcn/ui用
    "img-src": [CSP_SOURCES.SELF, CSP_SOURCES.DATA, CSP_SOURCES.HTTPS], // OAuthアバター画像用
    "connect-src": [CSP_SOURCES.SELF, ...supabaseSources],
    "upgrade-insecure-requests": [], // HTTPリクエストを自動でHTTPSに
  };
}

/**
 * 開発環境用CSPディレクティブを生成
 *
 * 開発環境では以下の追加許可が必要:
 * - 'unsafe-inline' / 'unsafe-eval': HMR、React DevTools用
 * - ws: / wss:: WebSocket (HMR用)
 * - https:: 開発時の外部API接続用
 *
 * @returns CSPディレクティブマップ
 *
 * @example
 * ```typescript
 * const directives = getDevelopmentDirectives();
 * // directives["script-src"] には 'unsafe-eval' が含まれる
 * ```
 */
export function getDevelopmentDirectives(): CSPDirectiveMap {
  return {
    ...BASE_DIRECTIVES,
    "script-src": [
      CSP_SOURCES.SELF,
      CSP_SOURCES.UNSAFE_INLINE,
      CSP_SOURCES.UNSAFE_EVAL,
    ], // HMR用
    "style-src": [CSP_SOURCES.SELF, CSP_SOURCES.UNSAFE_INLINE],
    "img-src": [CSP_SOURCES.SELF, CSP_SOURCES.DATA, CSP_SOURCES.HTTPS],
    "connect-src": [
      CSP_SOURCES.SELF,
      CSP_SOURCES.HTTPS,
      CSP_SOURCES.WS,
      CSP_SOURCES.WSS,
    ], // HMR、外部API用
    // 開発環境では upgrade-insecure-requests は省略
  };
}

// ============================================================================
// ポリシー文字列生成
// ============================================================================

/**
 * CSPディレクティブマップをポリシー文字列に変換
 *
 * @param directives - CSPディレクティブマップ
 * @returns CSPポリシー文字列
 *
 * @example
 * ```typescript
 * const policy = buildCSPString({
 *   "default-src": ["'self'"],
 *   "script-src": ["'self'"],
 * });
 * // "default-src 'self'; script-src 'self'"
 * ```
 */
export function buildCSPString(directives: CSPDirectiveMap): string {
  return Object.entries(directives)
    .filter(([, values]) => values !== undefined)
    .map(([directive, values]) => {
      // upgrade-insecure-requests のような値なしディレクティブ
      if (!values || values.length === 0) {
        return directive;
      }
      return `${directive} ${values.join(" ")}`;
    })
    .join("; ");
}

// ============================================================================
// メインエントリーポイント
// ============================================================================

/**
 * CSPポリシーを生成
 *
 * 環境に応じた適切なCSPポリシーを生成する。
 * - 本番環境: 厳格なポリシー（unsafe-evalなし）
 * - 開発環境: 緩和されたポリシー（HMR、DevTools対応）
 *
 * @param options - CSP設定オプション
 * @returns CSP生成結果
 *
 * @example
 * ```typescript
 * const { policy, directives } = generateCSP({
 *   isDev: false,
 *   supabaseUrl: process.env.SUPABASE_URL,
 * });
 * // policy: "default-src 'self'; script-src 'self'; ..."
 * ```
 */
export function generateCSP(options: CSPOptions): CSPResult {
  const directives = options.isDev
    ? getDevelopmentDirectives()
    : getProductionDirectives(options.supabaseUrl);

  return {
    policy: buildCSPString(directives),
    directives,
  };
}

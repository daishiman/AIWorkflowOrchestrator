/**
 * CORS設定テンプレート
 *
 * 用途: Express.jsアプリケーションのCORS（Cross-Origin Resource Sharing）設定
 *
 * 使用方法:
 *   const cors = require('cors');
 *   app.use(cors(corsConfig));
 */

// 本番環境用（厳格）
const productionCorsConfig = {
  // 許可オリジンをホワイトリストで指定
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "https://app.example.com",
    "https://www.example.com",
  ],

  // 許可HTTPメソッド
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

  // 許可ヘッダー
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-CSRF-Token",
  ],

  // 認証情報（Cookie、Authorization header）を含むリクエストを許可
  credentials: true,

  // レスポンスに公開するヘッダー
  exposedHeaders: [
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],

  // プリフライトリクエストのキャッシュ時間（秒）
  maxAge: 86400, // 24時間

  // プリフライトリクエストの成功ステータスコード
  optionsSuccessStatus: 204,
};

// 開発環境用（柔軟）
const developmentCorsConfig = {
  origin: true, // すべてのオリジンを許可（開発のみ）
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: "*",
  credentials: true,
  maxAge: 86400,
};

// 動的オリジン検証（高度な使用法）
const dynamicOriginCorsConfig = {
  origin: (origin, callback) => {
    // 許可オリジンリスト
    const allowlist = [
      "https://app.example.com",
      "https://staging.example.com",
      /^https:\/\/.*\.example\.com$/, // サブドメイン許可
    ];

    // オリジンなし（同一オリジン）またはホワイトリスト内
    if (
      !origin ||
      allowlist.some((allowed) => {
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return allowed === origin;
      })
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// API別CORS設定
const apiSpecificCorsConfig = {
  // 公開API（認証不要）
  publicApi: {
    origin: "*",
    credentials: false,
    methods: ["GET"],
    allowedHeaders: ["Content-Type"],
  },

  // 認証付きAPI
  authenticatedApi: {
    origin: process.env.ALLOWED_ORIGINS?.split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  },

  // 管理者API（最も厳格）
  adminApi: {
    origin: ["https://admin.example.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    maxAge: 3600, // 1時間（短め）
  },
};

// 環境別設定取得
const getCorsConfig = (env = process.env.NODE_ENV) => {
  if (env === "production") {
    return productionCorsConfig;
  } else if (env === "development") {
    return developmentCorsConfig;
  }
  return productionCorsConfig; // デフォルトは厳格に
};

module.exports = {
  productionCorsConfig,
  developmentCorsConfig,
  dynamicOriginCorsConfig,
  apiSpecificCorsConfig,
  getCorsConfig,
};

/**
 * 使用例1: 基本設定
 *
 * const cors = require('cors');
 * const { getCorsConfig } = require('./config/cors-config');
 *
 * app.use(cors(getCorsConfig()));
 */

/**
 * 使用例2: API別設定
 *
 * const { apiSpecificCorsConfig } = require('./config/cors-config');
 *
 * app.use('/api/public', cors(apiSpecificCorsConfig.publicApi));
 * app.use('/api/auth', cors(apiSpecificCorsConfig.authenticatedApi));
 * app.use('/api/admin', cors(apiSpecificCorsConfig.adminApi));
 */

/**
 * 使用例3: Next.js API Routes
 *
 * // pages/api/[...].js
 * import Cors from 'cors';
 * import { productionCorsConfig } from '@/config/cors-config';
 *
 * const cors = Cors(productionCorsConfig);
 *
 * function runMiddleware(req, res, fn) {
 *   return new Promise((resolve, reject) => {
 *     fn(req, res, (result) => {
 *       if (result instanceof Error) {
 *         return reject(result);
 *       }
 *       return resolve(result);
 *     });
 *   });
 * }
 *
 * export default async function handler(req, res) {
 *   await runMiddleware(req, res, cors);
 *   // API logic...
 * }
 */

/**
 * セキュリティチェックリスト:
 *
 * ❌ 危険な設定:
 *   - origin: '*' with credentials: true
 *   - 動的オリジン検証なしで req.headers.origin を許可
 *   - 不要なHTTPメソッド許可（TRACE、CONNECT等）
 *
 * ✅ 安全な設定:
 *   - ホワイトリストでオリジン制限
 *   - credentials使用時はorigin: '*'を避ける
 *   - 必要最小限のメソッドとヘッダーのみ許可
 *   - プリフライトキャッシュ設定（maxAge）
 */

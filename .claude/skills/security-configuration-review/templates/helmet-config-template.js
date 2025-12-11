/**
 * Helmet.js セキュリティヘッダー設定テンプレート
 *
 * 用途: Express.jsアプリケーションのHTTPセキュリティヘッダー設定
 *
 * 使用方法:
 *   const helmet = require('helmet');
 *   app.use(helmet(helmetConfig));
 */

const helmetConfig = {
  // Content Security Policy (CSP)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        // 本番環境では'unsafe-inline'を削除推奨
        // nonceまたはhash使用を検討
        // "'nonce-{random}'"
      ],
      styleSrc: [
        "'self'",
        // 本番環境では'unsafe-inline'を削除推奨
        // "'nonce-{random}'"
      ],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      // HTTPS強制
      upgradeInsecureRequests: [],
    },
    // CSP違反レポート収集
    reportOnly: false, // 開発環境: true、本番環境: false
  },

  // HTTP Strict Transport Security (HSTS)
  hsts: {
    maxAge: 31536000, // 1年（秒単位）
    includeSubDomains: true,
    preload: true, // hstspreload.org に登録する場合
  },

  // X-Frame-Options (Clickjacking対策)
  frameguard: {
    action: "deny", // または 'sameorigin'
  },

  // X-Content-Type-Options
  noSniff: true,

  // X-DNS-Prefetch-Control
  dnsPrefetchControl: {
    allow: false,
  },

  // X-Download-Options (IE8専用、レガシー)
  ieNoOpen: true,

  // Referrer-Policy
  referrerPolicy: {
    policy: "no-referrer", // または 'strict-origin-when-cross-origin'
  },

  // Permissions-Policy (旧Feature-Policy)
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
      payment: ["'self'"],
      usb: ["'none'"],
      magnetometer: ["'none'"],
      gyroscope: ["'none'"],
    },
  },

  // X-Powered-By ヘッダー削除（情報漏洩防止）
  hidePoweredBy: true,

  // Expect-CT (Certificate Transparency)
  expectCt: {
    enforce: true,
    maxAge: 86400, // 24時間
  },
};

// 環境別設定
const getHelmetConfig = (env = process.env.NODE_ENV) => {
  if (env === "development") {
    return {
      ...helmetConfig,
      contentSecurityPolicy: {
        ...helmetConfig.contentSecurityPolicy,
        reportOnly: true, // 開発環境ではreport-onlyモード
        directives: {
          ...helmetConfig.contentSecurityPolicy.directives,
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // 開発時は緩く
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
      hsts: false, // localhost ではHSTS無効
    };
  }

  return helmetConfig;
};

module.exports = {
  helmetConfig,
  getHelmetConfig,
};

/**
 * 使用例:
 *
 * const express = require('express');
 * const helmet = require('helmet');
 * const { getHelmetConfig } = require('./config/helmet-config');
 *
 * const app = express();
 * app.use(helmet(getHelmetConfig()));
 */

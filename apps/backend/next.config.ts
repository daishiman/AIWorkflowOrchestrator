import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 本番環境ではスタンドアロンモードでビルド
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // 実験的機能
  experimental: {
    // サーバーアクション有効化
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // 環境変数の公開設定
  env: {
    NEXT_PUBLIC_API_VERSION: "1.0.0",
  },

  // ヘッダー設定（CORS等）
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

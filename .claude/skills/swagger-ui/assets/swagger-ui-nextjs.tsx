/**
 * Next.js App Router 用 Swagger UI コンポーネント
 *
 * 使用方法:
 * 1. このファイルを app/api-docs/page.tsx にコピー
 * 2. pnpm install swagger-ui-react
 * 3. public/openapi.yaml に仕様書を配置
 */

"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// SSR無効化でSwagger UIを読み込み
const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading API Documentation...</p>
      </div>
    </div>
  ),
});

interface ApiDocsPageProps {
  // カスタムプロパティ（必要に応じて追加）
}

export default function ApiDocsPage({}: ApiDocsPageProps) {
  return (
    <div className="swagger-container">
      {/* カスタムスタイル */}
      <style jsx global>{`
        /* トップバー非表示 */
        .swagger-ui .topbar {
          display: none;
        }

        /* カスタムカラー */
        .swagger-ui .info .title {
          color: #1e40af;
        }

        /* レスポンシブ対応 */
        @media (max-width: 768px) {
          .swagger-ui .opblock-section-header {
            flex-direction: column;
          }
        }
      `}</style>

      <SwaggerUI
        url="/openapi.yaml"
        docExpansion="list"
        defaultModelsExpandDepth={1}
        displayOperationId={false}
        displayRequestDuration={true}
        filter={true}
        persistAuthorization={true}
        tryItOutEnabled={true}
        deepLinking={true}
        // 認証プリセット（開発環境のみ）
        onComplete={(swaggerUi) => {
          if (process.env.NODE_ENV === "development") {
            // 開発用トークンをプリセット（実際の値に置き換え）
            // swaggerUi.preauthorizeApiKey('BearerAuth', 'dev-token');
          }
        }}
      />
    </div>
  );
}

/**
 * メタデータ設定（App Router用）
 */
export const metadata = {
  title: "API Documentation",
  description: "Interactive API documentation powered by Swagger UI",
};

/**
 * カスタム設定が必要な場合の高度な例
 */
export function AdvancedApiDocsPage() {
  const handleComplete = (swaggerUi: any) => {
    console.log("Swagger UI loaded");

    // カスタムインターセプター
    swaggerUi.getConfigs().requestInterceptor = (request: any) => {
      // リクエストIDを追加
      request.headers["X-Request-ID"] = crypto.randomUUID();

      // ログ出力
      if (process.env.NODE_ENV === "development") {
        console.log("API Request:", request);
      }

      return request;
    };
  };

  return (
    <SwaggerUI
      url="/openapi.yaml"
      docExpansion="none"
      defaultModelsExpandDepth={-1}
      filter={true}
      persistAuthorization={true}
      validatorUrl={null}
      onComplete={handleComplete}
      requestInterceptor={(req) => {
        // グローバルヘッダー追加
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;

        if (token) {
          req.headers["Authorization"] = `Bearer ${token}`;
        }

        return req;
      }}
      responseInterceptor={(res) => {
        // レート制限警告
        const remaining = res.headers?.["x-rate-limit-remaining"];
        if (remaining && parseInt(remaining) < 10) {
          console.warn("Rate limit approaching:", remaining);
        }
        return res;
      }}
    />
  );
}

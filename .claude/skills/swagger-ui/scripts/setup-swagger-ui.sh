#!/bin/bash
# Swagger UI セットアップスクリプト
# Next.js または Express プロジェクトに Swagger UI を統合

set -e

echo "🚀 Swagger UI セットアップを開始します..."

# プロジェクトタイプを検出
if [ -f "package.json" ]; then
  if grep -q "next" package.json; then
    PROJECT_TYPE="nextjs"
    echo "✅ Next.js プロジェクトを検出しました"
  elif grep -q "express" package.json; then
    PROJECT_TYPE="express"
    echo "✅ Express プロジェクトを検出しました"
  else
    echo "⚠️  Next.js または Express プロジェクトではありません"
    PROJECT_TYPE="unknown"
  fi
else
  echo "❌ package.json が見つかりません"
  exit 1
fi

# 依存関係のインストール
echo "📦 依存関係をインストール中..."

if [ "$PROJECT_TYPE" = "nextjs" ]; then
  pnpm add swagger-ui-react
  pnpm add -D @types/swagger-ui-react
  echo "✅ swagger-ui-react をインストールしました"

elif [ "$PROJECT_TYPE" = "express" ]; then
  pnpm add swagger-ui-express yamljs
  pnpm add -D @types/swagger-ui-express @types/yamljs
  echo "✅ swagger-ui-express と yamljs をインストールしました"
fi

# OpenAPI 仕様ファイルの確認
if [ ! -f "openapi.yaml" ] && [ ! -f "public/openapi.yaml" ]; then
  echo "⚠️  openapi.yaml が見つかりません。サンプルファイルを作成します..."

  cat > openapi.yaml << 'EOF'
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
  description: サンプルAPI仕様書
servers:
  - url: /api
    description: API Server
paths:
  /health:
    get:
      summary: ヘルスチェック
      responses:
        '200':
          description: 正常
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok
EOF

  if [ "$PROJECT_TYPE" = "nextjs" ]; then
    mkdir -p public
    mv openapi.yaml public/openapi.yaml
    echo "✅ public/openapi.yaml を作成しました"
  else
    echo "✅ openapi.yaml を作成しました"
  fi
fi

# Next.js 用のセットアップ
if [ "$PROJECT_TYPE" = "nextjs" ]; then
  echo "📝 Next.js 用の API ドキュメントページを作成中..."

  mkdir -p app/api-docs

  cat > app/api-docs/page.tsx << 'EOF'
'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <p>API Documentation を読み込み中...</p>,
});

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      <SwaggerUI url="/openapi.yaml" />
    </div>
  );
}
EOF

  echo "✅ app/api-docs/page.tsx を作成しました"
  echo "📍 URL: http://localhost:3000/api-docs"
fi

# Express 用のセットアップ
if [ "$PROJECT_TYPE" = "express" ]; then
  echo "📝 Express 用の Swagger UI ルートを追加してください:"
  echo ""
  echo "import swaggerUi from 'swagger-ui-express';"
  echo "import YAML from 'yamljs';"
  echo ""
  echo "const swaggerDocument = YAML.load('./openapi.yaml');"
  echo "app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));"
  echo ""
  echo "📍 URL: http://localhost:3000/api-docs"
fi

echo ""
echo "✨ Swagger UI のセットアップが完了しました！"
echo ""
echo "次のステップ:"
echo "1. openapi.yaml を編集して API 仕様を定義"
echo "2. npm run dev でサーバーを起動"
echo "3. /api-docs にアクセスして確認"

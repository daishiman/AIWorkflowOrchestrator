#!/usr/bin/env bash
# Swagger UI セットアップスクリプト
# Next.js または Express プロジェクトに Swagger UI を統合

set -euo pipefail

EXIT_SUCCESS=0
EXIT_ERROR=1
EXIT_ARGS_ERROR=2
EXIT_FILE_NOT_FOUND=3

show_help() {
  cat <<'HELP'
Swagger UI Setup Script

Usage:
  ./setup-swagger-ui.sh [--type nextjs|express] [--no-install] [--dry-run]

Options:
  --type <type>    Project type override (nextjs|express)
  --no-install     Skip dependency installation
  --dry-run        Show commands without executing
  -h, --help       Show this help
HELP
}

PROJECT_TYPE=""
NO_INSTALL=0
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --type)
      PROJECT_TYPE="${2:-}"
      shift 2
      ;;
    --no-install)
      NO_INSTALL=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      show_help
      exit "$EXIT_SUCCESS"
      ;;
    *)
      echo "Error: unknown argument $1" >&2
      show_help >&2
      exit "$EXIT_ARGS_ERROR"
      ;;
  esac
done

run_cmd() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] $*"
  else
    "$@"
  fi
}

if [[ -z "$PROJECT_TYPE" ]]; then
  if [[ -f "package.json" ]]; then
    if grep -q '"next"' package.json; then
      PROJECT_TYPE="nextjs"
    elif grep -q '"express"' package.json; then
      PROJECT_TYPE="express"
    else
      PROJECT_TYPE="unknown"
    fi
  else
    echo "Error: package.json が見つかりません" >&2
    exit "$EXIT_FILE_NOT_FOUND"
  fi
fi

if [[ "$PROJECT_TYPE" != "nextjs" && "$PROJECT_TYPE" != "express" ]]; then
  echo "Error: Next.js または Express プロジェクトを指定してください" >&2
  exit "$EXIT_ARGS_ERROR"
fi

echo "Swagger UI セットアップを開始します (type=$PROJECT_TYPE)"

if [[ "$NO_INSTALL" -eq 0 ]]; then
  if [[ "$PROJECT_TYPE" == "nextjs" ]]; then
    run_cmd pnpm add swagger-ui-react
    run_cmd pnpm add -D @types/swagger-ui-react
  else
    run_cmd pnpm add swagger-ui-express yamljs
    run_cmd pnpm add -D @types/swagger-ui-express @types/yamljs
  fi
else
  echo "依存関係のインストールをスキップします"
fi

if [[ ! -f "openapi.yaml" && ! -f "public/openapi.yaml" ]]; then
  echo "openapi.yaml が見つかりません。サンプルファイルを作成します"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] create openapi.yaml"
  else
    cat > openapi.yaml << 'YAML'
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
YAML
  fi

  if [[ "$PROJECT_TYPE" == "nextjs" ]]; then
    run_cmd mkdir -p public
    run_cmd mv openapi.yaml public/openapi.yaml
  fi
fi

if [[ "$PROJECT_TYPE" == "nextjs" ]]; then
  echo "Next.js 用の API ドキュメントページを作成します"
  run_cmd mkdir -p app/api-docs
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] create app/api-docs/page.tsx"
  else
    cat > app/api-docs/page.tsx << 'TSX'
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
TSX
  fi
  echo "URL: http://localhost:3000/api-docs"
else
  echo "Express 用の設定例:"
  echo "import swaggerUi from 'swagger-ui-express';"
  echo "import YAML from 'yamljs';"
  echo "const swaggerDocument = YAML.load('./openapi.yaml');"
  echo "app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));"
  echo "URL: http://localhost:3000/api-docs"
fi

echo "セットアップ完了"
exit "$EXIT_SUCCESS"

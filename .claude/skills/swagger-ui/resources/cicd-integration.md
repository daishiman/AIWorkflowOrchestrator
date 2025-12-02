# CI/CD パイプライン統合ガイド

## GitHub Actions

### OpenAPI検証ワークフロー

```yaml
# .github/workflows/openapi-validate.yml
name: OpenAPI Validation

on:
  pull_request:
    paths:
      - 'openapi.yaml'
      - 'openapi/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install Redocly CLI
        run: pnpm install -g @redocly/cli

      - name: Lint OpenAPI spec
        run: redocly lint openapi.yaml

      - name: Bundle OpenAPI spec
        run: redocly bundle openapi.yaml -o bundled-openapi.yaml

      - name: Upload bundled spec
        uses: actions/upload-artifact@v4
        with:
          name: openapi-spec
          path: bundled-openapi.yaml
```

### ドキュメント自動生成ワークフロー

```yaml
# .github/workflows/docs-deploy.yml
name: Deploy API Docs

on:
  push:
    branches: [main]
    paths:
      - 'openapi.yaml'
      - 'openapi/**'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Redocly CLI
        run: pnpm install -g @redocly/cli

      - name: Build docs
        run: |
          mkdir -p docs
          redocly build-docs openapi.yaml -o docs/index.html

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Swagger UI + ReDoc両方生成

```yaml
# .github/workflows/api-docs-full.yml
name: Build API Documentation

on:
  push:
    branches: [main]
    paths:
      - 'openapi.yaml'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          pnpm install -g @redocly/cli
          pnpm install -g swagger-ui-dist

      - name: Create docs directory
        run: mkdir -p docs/{swagger,redoc}

      - name: Build ReDoc
        run: redocly build-docs openapi.yaml -o docs/redoc/index.html

      - name: Build Swagger UI
        run: |
          cp -r $(pnpm root -g)/swagger-ui-dist/* docs/swagger/
          cat > docs/swagger/index.html << 'EOF'
          <!DOCTYPE html>
          <html>
          <head>
            <title>API Documentation - Swagger UI</title>
            <link rel="stylesheet" type="text/css" href="./swagger-ui.css">
          </head>
          <body>
            <div id="swagger-ui"></div>
            <script src="./swagger-ui-bundle.js"></script>
            <script src="./swagger-ui-standalone-preset.js"></script>
            <script>
              window.onload = function() {
                SwaggerUIBundle({
                  url: "../openapi.yaml",
                  dom_id: '#swagger-ui',
                  presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                  layout: "StandaloneLayout"
                });
              }
            </script>
          </body>
          </html>
          EOF

      - name: Copy OpenAPI spec
        run: cp openapi.yaml docs/

      - name: Create index page
        run: |
          cat > docs/index.html << 'EOF'
          <!DOCTYPE html>
          <html>
          <head>
            <title>API Documentation</title>
          </head>
          <body>
            <h1>API Documentation</h1>
            <ul>
              <li><a href="./swagger/">Swagger UI</a> - Interactive API explorer</li>
              <li><a href="./redoc/">ReDoc</a> - Beautiful API reference</li>
            </ul>
          </body>
          </html>
          EOF

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

---

## Redocly CLI設定

### redocly.yaml

```yaml
# redocly.yaml
extends:
  - recommended

rules:
  # 必須ルール
  info-contact: error
  info-license: error
  operation-operationId: error
  operation-summary: error
  operation-description: warn
  operation-2xx-response: error
  no-empty-servers: error

  # スキーマルール
  spec-components-invalid-map-name: error
  paths-kebab-case: warn
  no-path-trailing-slash: error

  # セキュリティルール
  security-defined: error

  # 無効化するルール（プロジェクトに応じて）
  # tag-description: off

theme:
  openapi:
    hideDownloadButton: false
    expandResponses: '200,201'
    requiredPropsFirst: true
    sortPropsAlphabetically: false
    nativeScrollbars: true
    theme:
      colors:
        primary:
          main: '#32329f'
      typography:
        fontSize: '14px'
        fontFamily: 'system-ui, sans-serif'
        headings:
          fontFamily: 'system-ui, sans-serif'
          fontWeight: '600'
```

### 複数ファイル管理

```yaml
# redocly.yaml
apis:
  main:
    root: openapi/main.yaml
    output: dist/main-docs.html
  admin:
    root: openapi/admin.yaml
    output: dist/admin-docs.html

decorators:
  main:
    - info-override:
        title: "Main API v1"
  admin:
    - info-override:
        title: "Admin API v1"
```

---

## Vercel デプロイ

### vercel.json

```json
{
  "buildCommand": "pnpm run build:docs",
  "outputDirectory": "docs",
  "rewrites": [
    { "source": "/api-docs", "destination": "/docs/index.html" },
    { "source": "/swagger", "destination": "/docs/swagger/index.html" },
    { "source": "/redoc", "destination": "/docs/redoc/index.html" }
  ],
  "headers": [
    {
      "source": "/openapi.yaml",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Content-Type", "value": "application/yaml" }
      ]
    }
  ]
}
```

### package.json scripts

```json
{
  "scripts": {
    "build:docs": "pnpm run build:redoc && pnpm run build:swagger",
    "build:redoc": "redocly build-docs openapi.yaml -o docs/redoc/index.html",
    "build:swagger": "scripts/build-swagger.sh",
    "lint:openapi": "redocly lint openapi.yaml",
    "preview:docs": "redocly preview-docs openapi.yaml"
  }
}
```

---

## Railway デプロイ

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY openapi.yaml .
COPY redocly.yaml .

RUN pnpm install -g @redocly/cli
RUN mkdir -p docs && redocly build-docs openapi.yaml -o docs/index.html

FROM nginx:alpine
COPY --from=builder /app/docs /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /openapi.yaml {
        add_header Access-Control-Allow-Origin *;
        add_header Content-Type application/yaml;
    }

    # キャッシュ設定
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 自動バージョニング

### バージョン同期スクリプト

```bash
#!/bin/bash
# scripts/sync-version.sh

# package.jsonからバージョン取得
VERSION=$(node -p "require('./package.json').version")

# OpenAPI仕様のバージョンを更新
sed -i "s/version: .*/version: \"$VERSION\"/" openapi.yaml

echo "Updated OpenAPI version to $VERSION"
```

### Semantic Release統合

```yaml
# .releaserc.yml
branches:
  - main

plugins:
  - '@semantic-release/commit-analyzer'
  - '@semantic-release/release-notes-generator'
  - '@semantic-release/changelog'
  - - '@semantic-release/exec'
    - prepareCmd: 'pnpm run sync-version'
  - '@semantic-release/pnpm'
  - '@semantic-release/git'
```

---

## 品質ゲート

### PRチェック

```yaml
# .github/workflows/pr-check.yml
name: PR Check

on: pull_request

jobs:
  openapi-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Redocly CLI
        run: pnpm install -g @redocly/cli

      - name: Lint OpenAPI
        run: redocly lint openapi.yaml

      - name: Check for breaking changes
        run: |
          git fetch origin main
          redocly bundle openapi.yaml -o new-spec.yaml
          git show origin/main:openapi.yaml > old-spec.yaml
          # 破壊的変更の検出（要: openapi-diff等のツール）
          npx openapi-diff old-spec.yaml new-spec.yaml || echo "Breaking changes detected"
```

### 通知設定

```yaml
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1.24.0
  with:
    channel-id: 'api-docs'
    slack-message: |
      :warning: OpenAPI validation failed
      PR: ${{ github.event.pull_request.html_url }}
  env:
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```

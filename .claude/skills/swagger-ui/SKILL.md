---
name: swagger-ui
description: |
  Swagger UI / ReDocなどのインタラクティブAPIドキュメントツールの設定と統合を専門とするスキル。

  核心知識:
  - Swagger UIの設定とカスタマイズ
  - ReDocによる美しいドキュメント生成
  - Next.js/Express等への統合パターン
  - CI/CDパイプラインでの自動デプロイ

  使用タイミング:
  - インタラクティブなAPIドキュメントを設定する時
  - Swagger UI/ReDocをプロジェクトに統合する時
  - ドキュメントのブランディングやカスタマイズ時
  - CI/CDでのドキュメント自動生成設定時

version: 1.0.0
---

# Swagger UI スキル

## 概要

Swagger UI、ReDoc、その他のインタラクティブAPIドキュメントツールの設定と統合に関する専門知識を提供します。

## コマンドリファレンス

```bash
# リソース参照
cat .claude/skills/swagger-ui/resources/swagger-ui-configuration.md
cat .claude/skills/swagger-ui/resources/redoc-configuration.md
cat .claude/skills/swagger-ui/resources/cicd-integration.md

# テンプレート参照
cat .claude/skills/swagger-ui/templates/swagger-ui-nextjs.tsx
cat .claude/skills/swagger-ui/templates/swagger-config.json
```

---

## 知識領域1: ツール選択

### Swagger UI vs ReDoc

| 観点 | Swagger UI | ReDoc |
|------|-----------|-------|
| **インタラクティブ性** | ✅ 高（Try it out） | ❌ 低（閲覧のみ） |
| **可読性** | 中 | ✅ 高（美しいレイアウト） |
| **カスタマイズ** | 中 | ✅ 高 |
| **パフォーマンス** | 中 | ✅ 高速 |
| **バンドルサイズ** | 大きい | 中程度 |
| **推奨用途** | 開発者テスト | 公開ドキュメント |

### 選択基準

- **Swagger UI**: 開発者が直接APIをテストする必要がある場合
- **ReDoc**: 外部公開ドキュメントで可読性を重視する場合
- **両方**: 開発環境はSwagger UI、本番環境はReDoc

---

## 知識領域2: Swagger UI設定

### 基本設定オプション

| オプション | 説明 | デフォルト |
|----------|------|-----------|
| `url` | OpenAPI仕様ファイルのURL | - |
| `dom_id` | マウント先のDOM ID | `#swagger-ui` |
| `deepLinking` | URLハッシュでの操作リンク | `true` |
| `presets` | プリセット配列 | APIs, Standalone |
| `layout` | レイアウト | `StandaloneLayout` |
| `docExpansion` | 初期展開状態 | `list` |
| `defaultModelsExpandDepth` | モデル展開深度 | `1` |
| `filter` | フィルター機能 | `false` |
| `persistAuthorization` | 認証情報保持 | `false` |

### docExpansion オプション

| 値 | 説明 |
|-----|------|
| `none` | すべて折りたたみ |
| `list` | タグのみ展開 |
| `full` | すべて展開 |

### 認証プリセット

開発環境での認証情報プリセット:

```javascript
const ui = SwaggerUIBundle({
  url: '/openapi.yaml',
  requestInterceptor: (req) => {
    req.headers['Authorization'] = 'Bearer dev-token';
    return req;
  },
  persistAuthorization: true
});
```

---

## 知識領域3: ReDoc設定

### 基本設定オプション

| オプション | 説明 | デフォルト |
|----------|------|-----------|
| `specUrl` | OpenAPI仕様ファイルのURL | - |
| `nativeScrollbars` | ネイティブスクロールバー | `false` |
| `hideDownloadButton` | ダウンロードボタン非表示 | `false` |
| `hideHostname` | ホスト名非表示 | `false` |
| `expandResponses` | 展開するレスポンスコード | `"200,201"` |
| `requiredPropsFirst` | 必須プロパティ優先表示 | `false` |
| `sortPropsAlphabetically` | プロパティアルファベット順 | `false` |
| `pathInMiddlePanel` | パス表示位置 | `false` |

### テーマカスタマイズ

```html
<redoc
  spec-url='/openapi.yaml'
  theme='{
    "colors": {
      "primary": { "main": "#32329f" }
    },
    "typography": {
      "fontSize": "14px",
      "fontFamily": "system-ui"
    },
    "sidebar": {
      "width": "260px"
    }
  }'
></redoc>
```

---

## 知識領域4: フレームワーク統合

### Next.js App Router統合

```typescript
// app/api-docs/page.tsx
'use client';

import dynamic from 'next/dynamic';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <p>Loading API Documentation...</p>
});

export default function ApiDocs() {
  return <SwaggerUI url="/openapi.yaml" />;
}
```

### Express統合

```typescript
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDocument = YAML.load('./openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Documentation'
}));
```

---

## 知識領域5: カスタマイズ

### CSSカスタマイズ

```css
/* Swagger UIトップバー非表示 */
.swagger-ui .topbar {
  display: none;
}

/* カスタムカラー */
.swagger-ui .info .title {
  color: #32329f;
}

/* フォントカスタマイズ */
.swagger-ui {
  font-family: 'Inter', system-ui, sans-serif;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .swagger-ui .opblock-section-header {
    flex-direction: column;
  }
}
```

### ブランディング

| 要素 | カスタマイズ方法 |
|-----|-----------------|
| ロゴ | `customSiteTitle`、カスタムCSS |
| カラー | CSS変数、テーマ設定 |
| フォント | Google Fonts、カスタムCSS |
| ファビコン | HTML head要素 |

---

## 知識領域6: セキュリティ考慮

### 本番環境での注意点

| 項目 | 推奨事項 |
|-----|----------|
| **認証プリセット** | 本番では無効化 |
| **Try it out** | 必要に応じて無効化 |
| **機密情報** | example値から除外 |
| **アクセス制限** | 認証付きページに配置 |
| **CORS** | 適切に設定 |

### Try it out無効化

```javascript
SwaggerUIBundle({
  url: '/openapi.yaml',
  supportedSubmitMethods: [] // すべてのメソッドで無効化
});
```

---

## 判断基準チェックリスト

### 設定品質
- [ ] OpenAPI仕様ファイルが正しく読み込まれるか？
- [ ] Try it out機能が動作するか？（Swagger UI）
- [ ] 認証設定が適切か？

### カスタマイズ品質
- [ ] ブランディングが適用されているか？
- [ ] モバイルでも適切に表示されるか？
- [ ] パフォーマンスに問題がないか？

### セキュリティ品質
- [ ] 本番環境で機密情報が露出していないか？
- [ ] 適切なアクセス制限がかかっているか？

---

## 関連スキル

- `.claude/skills/openapi-specification/SKILL.md`: OpenAPI仕様書作成
- `.claude/skills/api-versioning/SKILL.md`: バージョニング戦略
- `.claude/skills/ci-cd-pipelines/SKILL.md`: CI/CD統合

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-27 | 初版リリース |

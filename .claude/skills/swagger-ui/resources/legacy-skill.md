---
name: .claude/skills/swagger-ui/SKILL.md
description: |
  Swagger UI / ReDocなどのインタラクティブAPIドキュメントツールの設定と統合を専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/swagger-ui/resources/cicd-integration.md`: Cicd Integrationリソース
  - `.claude/skills/swagger-ui/resources/redoc-configuration.md`: Redoc Configurationリソース
  - `.claude/skills/swagger-ui/resources/swagger-ui-configuration.md`: Swagger Ui Configurationリソース

  - `.claude/skills/swagger-ui/templates/swagger-config.json`: Swagger Configテンプレート
  - `.claude/skills/swagger-ui/templates/swagger-ui-nextjs.tsx`: Swagger Ui Nextjsテンプレート

  - `.claude/skills/swagger-ui/scripts/setup-swagger-ui.sh`: Setup Swagger Uiスクリプト
  - `.claude/skills/swagger-ui/scripts/validate-swagger-config.js`: Validate Swagger Configスクリプト

version: 1.0.0
---

# Swagger UI スキル

## 概要

Swagger UI、ReDoc、その他のインタラクティブ API ドキュメントツールの設定と統合に関する専門知識を提供します。

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

## 知識領域 1: ツール選択

### Swagger UI vs ReDoc

| 観点                   | Swagger UI          | ReDoc                     |
| ---------------------- | ------------------- | ------------------------- |
| **インタラクティブ性** | ✅ 高（Try it out） | ❌ 低（閲覧のみ）         |
| **可読性**             | 中                  | ✅ 高（美しいレイアウト） |
| **カスタマイズ**       | 中                  | ✅ 高                     |
| **パフォーマンス**     | 中                  | ✅ 高速                   |
| **バンドルサイズ**     | 大きい              | 中程度                    |
| **推奨用途**           | 開発者テスト        | 公開ドキュメント          |

### 選択基準

- **Swagger UI**: 開発者が直接 API をテストする必要がある場合
- **ReDoc**: 外部公開ドキュメントで可読性を重視する場合
- **両方**: 開発環境は Swagger UI、本番環境は ReDoc

---

## 知識領域 2: Swagger UI 設定

### 基本設定オプション

| オプション                 | 説明                       | デフォルト         |
| -------------------------- | -------------------------- | ------------------ |
| `url`                      | OpenAPI 仕様ファイルの URL | -                  |
| `dom_id`                   | マウント先の DOM ID        | `#.claude/skills/swagger-ui/SKILL.md`      |
| `deepLinking`              | URL ハッシュでの操作リンク | `true`             |
| `presets`                  | プリセット配列             | APIs, Standalone   |
| `layout`                   | レイアウト                 | `StandaloneLayout` |
| `docExpansion`             | 初期展開状態               | `list`             |
| `defaultModelsExpandDepth` | モデル展開深度             | `1`                |
| `filter`                   | フィルター機能             | `false`            |
| `persistAuthorization`     | 認証情報保持               | `false`            |

### docExpansion オプション

| 値     | 説明             |
| ------ | ---------------- |
| `none` | すべて折りたたみ |
| `list` | タグのみ展開     |
| `full` | すべて展開       |

### 認証プリセット

開発環境での認証情報プリセット:

```javascript
const ui = SwaggerUIBundle({
  url: "/openapi.yaml",
  requestInterceptor: (req) => {
    req.headers["Authorization"] = "Bearer dev-token";
    return req;
  },
  persistAuthorization: true,
});
```

---

## 知識領域 3: ReDoc 設定

### 基本設定オプション

| オプション                | 説明                       | デフォルト  |
| ------------------------- | -------------------------- | ----------- |
| `specUrl`                 | OpenAPI 仕様ファイルの URL | -           |
| `nativeScrollbars`        | ネイティブスクロールバー   | `false`     |
| `hideDownloadButton`      | ダウンロードボタン非表示   | `false`     |
| `hideHostname`            | ホスト名非表示             | `false`     |
| `expandResponses`         | 展開するレスポンスコード   | `"200,201"` |
| `requiredPropsFirst`      | 必須プロパティ優先表示     | `false`     |
| `sortPropsAlphabetically` | プロパティアルファベット順 | `false`     |
| `pathInMiddlePanel`       | パス表示位置               | `false`     |

### テーマカスタマイズ

```html
<redoc
  spec-url="/openapi.yaml"
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

## 知識領域 4: フレームワーク統合

### Next.js App Router 統合

```typescript
// app/api-docs/page.tsx
"use client";

import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <p>Loading API Documentation...</p>,
});

export default function ApiDocs() {
  return <SwaggerUI url="/openapi.yaml" />;
}
```

### Express 統合

```typescript
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerDocument = YAML.load("./openapi.yaml");

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "API Documentation",
  }),
);
```

---

## 知識領域 5: カスタマイズ

### CSS カスタマイズ

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
  font-family: "Inter", system-ui, sans-serif;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .swagger-ui .opblock-section-header {
    flex-direction: column;
  }
}
```

### ブランディング

| 要素       | カスタマイズ方法                |
| ---------- | ------------------------------- |
| ロゴ       | `customSiteTitle`、カスタム CSS |
| カラー     | CSS 変数、テーマ設定            |
| フォント   | Google Fonts、カスタム CSS      |
| ファビコン | HTML head 要素                  |

---

## 知識領域 6: セキュリティ考慮

### 本番環境での注意点

| 項目               | 推奨事項             |
| ------------------ | -------------------- |
| **認証プリセット** | 本番では無効化       |
| **Try it out**     | 必要に応じて無効化   |
| **機密情報**       | example 値から除外   |
| **アクセス制限**   | 認証付きページに配置 |
| **CORS**           | 適切に設定           |

### Try it out 無効化

```javascript
SwaggerUIBundle({
  url: "/openapi.yaml",
  supportedSubmitMethods: [], // すべてのメソッドで無効化
});
```

---

## 判断基準チェックリスト

### 設定品質

- [ ] OpenAPI 仕様ファイルが正しく読み込まれるか？
- [ ] Try it out 機能が動作するか？（Swagger UI）
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

- `.claude/skills/openapi-specification/SKILL.md`: OpenAPI 仕様書作成
- `.claude/skills/api-versioning/SKILL.md`: バージョニング戦略
- `.claude/skills/ci-cd-pipelines/SKILL.md`: CI/CD 統合

---

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-27 | 初版リリース |

# Swagger UI 詳細設定ガイド

## 基本セットアップ

### CDN方式

```html
<!DOCTYPE html>
<html>
  <head>
    <title>API Documentation</title>
    <link
      rel="stylesheet"
      type="text/css"
      href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        const ui = SwaggerUIBundle({
          url: "/openapi.yaml",
          dom_id: "#swagger-ui",
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: "StandaloneLayout",
        });
        window.ui = ui;
      };
    </script>
  </body>
</html>
```

### npm方式

```bash
pnpm install swagger-ui-react
# または
pnpm install swagger-ui-express  # Express用
```

---

## 設定オプション詳細

### 表示設定

```javascript
const config = {
  // OpenAPI仕様
  url: "/openapi.yaml",
  // または spec オブジェクトを直接指定
  // spec: openapiSpec,

  // DOM要素
  dom_id: "#swagger-ui",

  // 初期展開状態
  docExpansion: "list", // 'none' | 'list' | 'full'

  // モデルセクション
  defaultModelsExpandDepth: 1, // -1で非表示、0で折りたたみ
  defaultModelExpandDepth: 1,
  displayModels: true,

  // 操作の表示
  displayOperationId: false,
  displayRequestDuration: true,

  // フィルタリング
  filter: true, // 検索フィルター表示
  filterString: "", // 初期フィルター値

  // ソート
  operationsSorter: "alpha", // 'alpha' | 'method' | function

  // タグのソート
  tagsSorter: "alpha",

  // 深いリンク
  deepLinking: true, // URLハッシュでの操作リンク
};
```

### インタラクション設定

```javascript
const interactionConfig = {
  // Try it out
  tryItOutEnabled: true, // 初期状態でTry it outを有効
  supportedSubmitMethods: ["get", "post", "put", "patch", "delete"],

  // 認証
  persistAuthorization: true, // 認証情報をlocalStorageに保存
  oauth2RedirectUrl: window.location.origin + "/oauth2-redirect.html",

  // リクエスト設定
  validatorUrl: null, // バリデーターURL（nullで無効）
  showMutatedRequest: true, // 変更後のリクエストを表示

  // レスポンス設定
  showExtensions: true, // x-拡張を表示
  showCommonExtensions: true,
};
```

### カスタマイズ設定

```javascript
const customConfig = {
  // カスタムCSS
  customCss: ".swagger-ui .topbar { display: none }",
  customCssUrl: "/custom-swagger.css",

  // ページタイトル
  customSiteTitle: "My API Documentation",

  // ファビコン（HTMLで設定）
  // customfavIcon: '/favicon.png',

  // プリセット
  presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],

  // プラグイン
  plugins: [SwaggerUIBundle.plugins.DownloadUrl],

  // レイアウト
  layout: "StandaloneLayout", // 'BaseLayout' | 'StandaloneLayout'
};
```

---

## 認証設定

### Bearer認証のプリセット

```javascript
const ui = SwaggerUIBundle({
  url: "/openapi.yaml",
  dom_id: "#swagger-ui",

  // 認証情報を事前設定
  onComplete: function () {
    // 開発環境のみ
    if (process.env.NODE_ENV === "development") {
      ui.preauthorizeApiKey("BearerAuth", "dev-jwt-token-here");
    }
  },

  persistAuthorization: true,
});
```

### OAuth 2.0設定

```javascript
const ui = SwaggerUIBundle({
  url: "/openapi.yaml",
  dom_id: "#swagger-ui",

  oauth2RedirectUrl: window.location.origin + "/oauth2-redirect.html",

  initOAuth: {
    clientId: "your-client-id",
    clientSecret: "your-client-secret", // 公開クライアントでは不要
    realm: "your-realm",
    appName: "your-app-name",
    scopeSeparator: " ",
    scopes: "read write",
    usePkceWithAuthorizationCodeGrant: true,
  },
});
```

### API Key認証

```javascript
const ui = SwaggerUIBundle({
  url: "/openapi.yaml",
  dom_id: "#swagger-ui",

  onComplete: function () {
    ui.preauthorizeApiKey("ApiKeyAuth", "your-api-key");
  },
});
```

---

## インターセプター

### リクエストインターセプター

```javascript
const ui = SwaggerUIBundle({
  url: "/openapi.yaml",
  dom_id: "#swagger-ui",

  requestInterceptor: (request) => {
    // カスタムヘッダー追加
    request.headers["X-Custom-Header"] = "value";

    // リクエストID追加
    request.headers["X-Request-ID"] = crypto.randomUUID();

    // 認証トークン追加
    const token = localStorage.getItem("auth_token");
    if (token) {
      request.headers["Authorization"] = `Bearer ${token}`;
    }

    // ログ出力
    console.log("Request:", request);

    return request;
  },
});
```

### レスポンスインターセプター

```javascript
const ui = SwaggerUIBundle({
  url: "/openapi.yaml",
  dom_id: "#swagger-ui",

  responseInterceptor: (response) => {
    // ログ出力
    console.log("Response:", response);

    // レスポンスヘッダーの処理
    const rateLimit = response.headers["x-rate-limit-remaining"];
    if (rateLimit && parseInt(rateLimit) < 10) {
      console.warn("Rate limit approaching:", rateLimit);
    }

    return response;
  },
});
```

---

## カスタムプラグイン

### 基本的なプラグイン構造

```javascript
const MyPlugin = function (system) {
  return {
    // コンポーネントのオーバーライド
    components: {
      CustomComponent: (props) => {
        return <div>Custom Component</div>;
      },
    },

    // ステート管理
    statePlugins: {
      myPlugin: {
        // 初期状態
        initialState: {
          count: 0,
        },

        // アクション
        actions: {
          increment: () => ({ type: "INCREMENT" }),
        },

        // リデューサー
        reducers: {
          INCREMENT: (state) => ({ ...state, count: state.count + 1 }),
        },

        // セレクター
        selectors: {
          getCount: (state) => state.get("count"),
        },
      },
    },
  };
};

const ui = SwaggerUIBundle({
  url: "/openapi.yaml",
  plugins: [MyPlugin],
});
```

---

## パフォーマンス最適化

### 大規模API向け設定

```javascript
const performanceConfig = {
  // 初期は折りたたみ
  docExpansion: "none",

  // モデルセクション非表示
  defaultModelsExpandDepth: -1,

  // フィルター有効
  filter: true,

  // 遅延読み込み
  syntaxHighlight: {
    activated: true,
    theme: "agate",
  },

  // バリデーター無効
  validatorUrl: null,

  // Try it out初期無効
  tryItOutEnabled: false,
};
```

### コード分割（Next.js）

```typescript
// app/api-docs/page.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function ApiDocs() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SwaggerUI url="/openapi.yaml" docExpansion="none" />
    </Suspense>
  );
}
```

---

## トラブルシューティング

### よくある問題

| 問題                 | 原因                       | 解決策              |
| -------------------- | -------------------------- | ------------------- |
| CORS エラー          | クロスオリジンリクエスト   | サーバーでCORS許可  |
| 仕様が読み込まれない | URLが間違い                | 相対/絶対パス確認   |
| 認証が保存されない   | persistAuthorization未設定 | オプションを有効化  |
| スタイルが崩れる     | CSS競合                    | スコープ付きCSS使用 |
| Try it outが動かない | HTTPS/HTTP混在             | プロトコル統一      |

### デバッグ方法

```javascript
const ui = SwaggerUIBundle({
  url: "/openapi.yaml",
  dom_id: "#swagger-ui",

  // デバッグ用フック
  onComplete: () => {
    console.log("Swagger UI loaded");
    console.log("Spec:", ui.specSelectors.specJson());
  },

  requestInterceptor: (req) => {
    console.log("Request:", req);
    return req;
  },

  responseInterceptor: (res) => {
    console.log("Response:", res);
    return res;
  },
});

// グローバルアクセス
window.ui = ui;
```

# ReDoc 詳細設定ガイド

## 基本セットアップ

### CDN方式（最もシンプル）

```html
<!DOCTYPE html>
<html>
<head>
  <title>API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <redoc spec-url='/openapi.yaml'></redoc>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
</body>
</html>
```

### npm方式

```bash
pnpm install redoc
# React用
pnpm install @redocly/reference-docs  # 有料版
```

### React統合

```tsx
import { RedocStandalone } from 'redoc';

function ApiDocs() {
  return (
    <RedocStandalone
      specUrl="/openapi.yaml"
      options={{
        nativeScrollbars: true,
        theme: { colors: { primary: { main: '#32329f' } } }
      }}
    />
  );
}
```

---

## 設定オプション詳細

### 基本オプション

```html
<redoc
  spec-url='/openapi.yaml'
  hide-download-button
  hide-hostname
  expand-responses="200,201"
  required-props-first
  sort-props-alphabetically
  path-in-middle-panel
  hide-loading
  native-scrollbars
  scroll-y-offset="60"
  hide-single-request-sample-tab
  json-sample-expand-level="2"
></redoc>
```

### JavaScript設定

```javascript
Redoc.init('/openapi.yaml', {
  // 表示オプション
  hideDownloadButton: false,
  hideHostname: false,
  hideLoading: false,
  hideSingleRequestSampleTab: false,
  expandDefaultServerVariables: false,

  // レスポンス展開
  expandResponses: '200,201',

  // プロパティ表示
  requiredPropsFirst: true,
  sortPropsAlphabetically: false,
  sortEnumValuesAlphabetically: false,
  sortOperationsAlphabetically: false,
  sortTagsAlphabetically: false,

  // レイアウト
  pathInMiddlePanel: false,
  nativeScrollbars: false,
  scrollYOffset: 0,

  // JSON表示
  jsonSampleExpandLevel: 2,
  showExtensions: false,

  // ラベル
  menuToggle: true,

  // スキーマ
  disableSearch: false,
  onlyRequiredInSamples: false,

  // テーマ
  theme: {
    // 以下参照
  }
}, document.getElementById('redoc-container'));
```

---

## テーマ設定

### カラー設定

```javascript
const theme = {
  colors: {
    primary: {
      main: '#32329f',
      light: '#6868b3',
      dark: '#1e1e5f',
      contrastText: '#ffffff'
    },
    success: {
      main: '#00aa00',
      light: '#66cc66',
      dark: '#006600',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#ffaa00',
      light: '#ffcc66',
      dark: '#996600',
      contrastText: '#000000'
    },
    error: {
      main: '#dd0000',
      light: '#ff6666',
      dark: '#880000',
      contrastText: '#ffffff'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    },
    http: {
      get: '#2f8132',
      post: '#186faf',
      put: '#95507c',
      options: '#947014',
      patch: '#bf581d',
      delete: '#cc3333',
      basic: '#707070',
      link: '#07818F',
      head: '#A23DAD'
    },
    responses: {
      success: {
        color: '#00aa00',
        backgroundColor: '#e6ffe6'
      },
      error: {
        color: '#dd0000',
        backgroundColor: '#ffe6e6'
      },
      redirect: {
        color: '#ff9900',
        backgroundColor: '#fff3e6'
      },
      info: {
        color: '#0066cc',
        backgroundColor: '#e6f0ff'
      }
    },
    border: {
      dark: '#cccccc',
      light: '#eeeeee'
    }
  }
};
```

### タイポグラフィ設定

```javascript
const theme = {
  typography: {
    fontSize: '14px',
    lineHeight: '1.5em',
    fontWeightRegular: '400',
    fontWeightBold: '600',
    fontWeightLight: '300',
    fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    smoothing: 'antialiased',
    optimizeSpeed: true,
    headings: {
      fontFamily: '"Montserrat", sans-serif',
      fontWeight: '400',
      lineHeight: '1.2em'
    },
    code: {
      fontSize: '13px',
      fontFamily: '"Source Code Pro", monospace',
      lineHeight: '1.4em',
      fontWeight: '400',
      color: '#c7254e',
      backgroundColor: '#f9f2f4',
      wrap: false
    },
    links: {
      color: '#32329f',
      visited: '#32329f',
      hover: '#6868b3',
      textDecoration: 'none',
      hoverTextDecoration: 'underline'
    }
  }
};
```

### サイドバー設定

```javascript
const theme = {
  sidebar: {
    width: '260px',
    backgroundColor: '#fafafa',
    textColor: '#333333',
    activeTextColor: '#32329f',
    groupItems: {
      activeBackgroundColor: '#e8e8e8',
      activeTextColor: '#32329f',
      textTransform: 'uppercase'
    },
    level1Items: {
      activeBackgroundColor: '#e8e8e8',
      activeTextColor: '#32329f',
      textTransform: 'none'
    },
    arrow: {
      size: '1.5em',
      color: '#666666'
    }
  }
};
```

### 右パネル設定

```javascript
const theme = {
  rightPanel: {
    backgroundColor: '#263238',
    width: '40%',
    textColor: '#ffffff'
  }
};
```

---

## カスタムCSS

### グローバルスタイル

```css
/* サイドバー幅調整 */
.menu-content {
  width: 280px !important;
}

/* ロゴ追加 */
.api-info > h1::before {
  content: '';
  display: block;
  background: url('/logo.png') no-repeat;
  background-size: contain;
  width: 150px;
  height: 50px;
  margin-bottom: 20px;
}

/* ヘッダー固定 */
.api-info {
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .menu-content {
    width: 100% !important;
  }

  .api-content {
    padding: 10px !important;
  }
}
```

### HTTPメソッドカスタム

```css
/* GETメソッドのカスタム */
.http-verb.get {
  background-color: #61affe !important;
}

/* POSTメソッドのカスタム */
.http-verb.post {
  background-color: #49cc90 !important;
}

/* 非推奨エンドポイントのスタイル */
.operation-type.deprecated {
  opacity: 0.6;
  text-decoration: line-through;
}
```

---

## Next.js統合

### App Router

```tsx
// app/docs/page.tsx
'use client';

import dynamic from 'next/dynamic';

const RedocStandalone = dynamic(
  () => import('redoc').then(mod => mod.RedocStandalone),
  { ssr: false }
);

export default function DocsPage() {
  return (
    <RedocStandalone
      specUrl="/openapi.yaml"
      options={{
        nativeScrollbars: true,
        hideDownloadButton: false,
        theme: {
          colors: {
            primary: { main: '#32329f' }
          }
        }
      }}
    />
  );
}
```

### Pages Router

```tsx
// pages/docs.tsx
import dynamic from 'next/dynamic';

const RedocStandalone = dynamic(
  () => import('redoc').then(mod => mod.RedocStandalone),
  { ssr: false }
);

export default function DocsPage() {
  return <RedocStandalone specUrl="/openapi.yaml" />;
}
```

---

## 静的HTML生成

### Redoc CLIによる生成

```bash
# インストール
pnpm install -g @redocly/cli

# HTML生成
redocly build-docs openapi.yaml -o docs/index.html

# カスタムテーマ付き
redocly build-docs openapi.yaml \
  -o docs/index.html \
  --theme.openapi.theme.colors.primary.main="#32329f"

# 設定ファイル使用
redocly build-docs openapi.yaml \
  -o docs/index.html \
  --config redocly.yaml
```

### redocly.yaml設定ファイル

```yaml
theme:
  openapi:
    hideDownloadButton: false
    expandResponses: '200,201'
    nativeScrollbars: true
    theme:
      colors:
        primary:
          main: '#32329f'
      typography:
        fontSize: '14px'
        fontFamily: 'system-ui, sans-serif'
      sidebar:
        width: '280px'
```

---

## パフォーマンス最適化

### 大規模API向け

```javascript
Redoc.init('/openapi.yaml', {
  // 必要なレスポンスのみ展開
  expandResponses: '200',

  // サンプル展開レベルを制限
  jsonSampleExpandLevel: 1,

  // ネイティブスクロール
  nativeScrollbars: true,

  // 検索を無効化（大規模APIで効果的）
  disableSearch: true,

  // 遅延読み込み
  lazyRendering: true
});
```

### プリレンダリング

```bash
# 静的HTML生成（CDNでホスト可能）
redocly build-docs openapi.yaml -o dist/docs.html

# GitHub Pages用
redocly build-docs openapi.yaml -o docs/index.html
```

---

## トラブルシューティング

| 問題 | 原因 | 解決策 |
|-----|------|--------|
| 読み込みが遅い | 大規模API | `disableSearch: true`、静的生成 |
| スタイルが崩れる | CSS競合 | スコープ付きCSS、Shadow DOM |
| モバイルで表示崩れ | レスポンシブ未対応 | カスタムCSS追加 |
| 日本語が文字化け | エンコーディング | UTF-8指定確認 |

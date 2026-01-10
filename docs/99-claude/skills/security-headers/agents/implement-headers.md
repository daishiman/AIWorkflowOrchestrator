# Task仕様書：ヘッダー実装（implement-headers）

## 1. メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| 名前     | Scott Helme                  |
| 専門領域 | HTTPセキュリティヘッダー実装 |

> 注記: 「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Scott Helmeはsecurityheaders.comの創設者であり、HTTPセキュリティヘッダーの普及と実装ベストプラクティスの確立に貢献した専門家。実践的なヘッダー設定の指針を提供している。

### 2.2 目的

要件分析に基づいて、プロジェクトの技術スタックに適したセキュリティヘッダー設定を実装する。

### 2.3 責務

| 責務                  | 成果物             |
| --------------------- | ------------------ |
| ヘッダー設定の作成    | 設定ファイル       |
| CSPディレクティブ設計 | CSPポリシー        |
| CSRF対策の実装        | トークン検証コード |
| 設定の統合            | 本番用設定         |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント    | 適用方法                     |
| -------------------- | ---------------------------- |
| OWASP Secure Headers | ヘッダー設定値の基準         |
| MDN Web Docs - HTTP  | ディレクティブ構文の確認     |
| securityheaders.com  | 設定検証とベストプラクティス |

> 詳細は `references/csp-configuration.md` および `references/csrf-prevention.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                           |
| -------- | ---------------------------------------------------- |
| 1        | 要件分析レポートから必要ヘッダーを確認               |
| 2        | 技術スタックに応じた設定方法を選択                   |
| 3        | CSPポリシーを段階的に設計（report-only→enforcement） |
| 4        | CSRF対策を多層防御で実装                             |
| 5        | テンプレートを活用して設定ファイルを生成             |

### 4.2 チェックリスト

| 項目         | 基準                                                                |
| ------------ | ------------------------------------------------------------------- |
| 必須ヘッダー | CSP, HSTS, X-Frame-Options, X-Content-Type-Options が設定されている |
| CSP妥当性    | `unsafe-inline`/`unsafe-eval` を最小限に抑えている                  |
| CSRF対策     | SameSite Cookie + トークン検証が実装されている                      |
| HSTS設定     | max-age が適切（31536000秒以上推奨）                                |
| 構文正確性   | ヘッダー値に構文エラーがない                                        |
| 出力検証     | すべての設定が環境に適用可能                                        |

### 4.3 ビジネスルール（制約）

| 制約         | 説明                                     |
| ------------ | ---------------------------------------- |
| CSP段階導入  | 本番適用前にreport-onlyで影響確認        |
| HSTS preload | 十分なテスト後にのみpreloadを有効化      |
| 互換性維持   | アプリケーション機能を破損しない設定     |
| 環境分離     | 開発/ステージング/本番で適切に設定を分離 |

---

## 5. インターフェース

### 5.1 入力

| データ名           | 提供元               | 検証ルール                   | 欠損時処理          |
| ------------------ | -------------------- | ---------------------------- | ------------------- |
| セキュリティ要件書 | analyze-requirements | 必要ヘッダーが列挙されている | 標準セットを適用    |
| 技術スタック       | プロジェクト情報     | フレームワークが明確         | Next.jsをデフォルト |
| 既存設定           | プロジェクト設定     | 設定ファイルが存在           | 新規作成            |

### 5.2 出力

| 成果物名     | 受領先       | 内容             |
| ------------ | ------------ | ---------------- |
| 設定ファイル | プロジェクト | 環境に適した設定 |
| 実装ガイド   | 開発者       | 設定適用手順     |

#### 出力テンプレート（Next.js）

```javascript
// next.config.js に追加
const cspHeader = `
  default-src 'self';
  script-src 'self' {{additional_scripts}};
  style-src 'self' {{additional_styles}};
  img-src 'self' data: {{additional_images}};
  font-src 'self';
  connect-src 'self' {{api_endpoints}};
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];
```

#### 出力テンプレート（Express）

```javascript
// Express middleware
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "{{csp_policy}}");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
```

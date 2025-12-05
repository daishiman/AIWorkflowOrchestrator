---
name: security-configuration-review
description: |
  セキュリティ関連設定のレビューとベストプラクティスを提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/security-configuration-review/resources/security-headers-guide.md`: Security Headers Guideリソース

  - `.claude/skills/security-configuration-review/templates/cors-config-template.js`: Cors Configテンプレート
  - `.claude/skills/security-configuration-review/templates/helmet-config-template.js`: Helmet Configテンプレート
  - `.claude/skills/security-configuration-review/templates/security-checklist.md`: Security Checklistテンプレート

  - `.claude/skills/security-configuration-review/scripts/check-security-headers.mjs`: Check Security Headersスクリプト

version: 1.0.0
---

# Security Configuration Review

## スキル概要

アプリケーションのセキュリティ設定を包括的にレビューする専門知識を提供します。

**専門分野**:

- HTTP セキュリティヘッダー設定
- CORS（Cross-Origin Resource Sharing）設定
- 環境変数とシークレット管理
- セキュリティログとモニタリング
- CSP（Content Security Policy）

---

## 1. HTTP セキュリティヘッダー

### Helmet.js ミドルウェア

**推奨設定**:

```javascript
const helmet = require("helmet");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // 本番では'unsafe-inline'削除推奨
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000, // 1年
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    noSniff: true,
    xssFilter: true,
  }),
);
```

**判断基準**:

- [ ] Helmet.js または同等のミドルウェアが使用されているか？
- [ ] 本番環境ですべてのセキュリティヘッダーが有効か？

---

### 個別ヘッダー詳細

**Strict-Transport-Security（HSTS）**:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- 目的: HTTPS 強制、HTTP→HTTPS ダウングレード攻撃防止
- [ ] max-age は 1 年（31536000 秒）以上か？
- [ ] includeSubDomains が設定されているか？

**X-Frame-Options**:

```
X-Frame-Options: DENY
```

- 目的: Clickjacking 攻撃防止
- [ ] `DENY`または`SAMEORIGIN`が設定されているか？

**X-Content-Type-Options**:

```
X-Content-Type-Options: nosniff
```

- 目的: MIME タイプスニッフィング防止
- [ ] `nosniff`が設定されているか？

**Referrer-Policy**:

```
Referrer-Policy: no-referrer
```

- 目的: Referer ヘッダー情報漏洩防止
- [ ] `no-referrer`または`strict-origin-when-cross-origin`が設定されているか？

**Permissions-Policy**:

```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

- 目的: ブラウザ機能アクセス制限
- [ ] 不要な機能が無効化されているか？

---

## 2. Content Security Policy（CSP）

### CSP Directive

**基本設定**:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'nonce-{random}';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

**XSS 対策レベル**:

```
レベル1（緩い）:
  script-src 'self' 'unsafe-inline' 'unsafe-eval';

レベル2（標準）:
  script-src 'self' 'nonce-{random}';

レベル3（厳格）:
  script-src 'nonce-{random}';
  require-trusted-types-for 'script';
```

**判断基準**:

- [ ] CSP が設定されているか？
- [ ] `'unsafe-inline'`は本番環境で避けているか？
- [ ] nonce または hash を使用しているか？
- [ ] `'unsafe-eval'`は使用されていないか？

---

### CSP Reporting

**Report-Uri 設定**:

```
Content-Security-Policy:
  default-src 'self';
  report-uri /api/csp-violations;
```

**レポート受信**:

```javascript
app.post(
  "/api/csp-violations",
  express.json({ type: "application/csp-report" }),
  (req, res) => {
    const report = req.body;
    logger.warn("CSP violation", {
      documentUri: report["document-uri"],
      violatedDirective: report["violated-directive"],
      blockedUri: report["blocked-uri"],
    });
    res.status(204).end();
  },
);
```

**判断基準**:

- [ ] CSP 違反レポートが収集されているか？
- [ ] 違反パターンを分析して設定を改善しているか？

---

## 3. CORS 設定

### 設定評価

**安全な設定**:

```javascript
const cors = require("cors");

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(","), // ホワイトリスト
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // プリフライトキャッシュ: 24時間
  }),
);
```

**危険な設定**:

```javascript
// ❌ すべてのオリジン許可
app.use(cors({ origin: "*", credentials: true }));

// ❌ 動的オリジン（検証なし）
app.use(cors({ origin: req.headers.origin }));
```

**判断基準**:

- [ ] 許可オリジンはホワイトリストで制限されているか？
- [ ] `origin: '*'`と credentials: true の組み合わせは避けているか？
- [ ] 動的オリジン許可時に検証があるか？
- [ ] 不要な HTTP メソッドは許可していないか？

---

## 4. 環境変数とシークレット管理

### .env ファイル管理

**チェック項目**:

- [ ] `.env`ファイルが`.gitignore`に含まれているか？
- [ ] `.env.example`でテンプレートを提供しているか？
- [ ] 本番と開発で異なる`.env`ファイルを使用しているか？

**.gitignore 必須エントリ**:

```gitignore
# 環境変数
.env
.env.local
.env.*.local

# 秘密鍵
*.key
*.pem
*.p12
*.pfx

# 認証情報
credentials.json
auth.json
```

---

### シークレット命名規約

**推奨パターン**:

```bash
# ✅ 明確な命名
TURSO_DATABASE_URL=libsql://...
JWT_SECRET=...
API_KEY_OPENAI=...
ENCRYPTION_KEY=...

# ❌ 曖昧な命名
SECRET=...
KEY=...
PASSWORD=...
```

**判断基準**:

- [ ] シークレット名は用途が明確か？
- [ ] 環境別に異なる接頭辞があるか（DEV*、PROD*等）？

---

### シークレット注入

**Railway/Vercel 設定**:

```javascript
// ビルド時チェック
if (!process.env.TURSO_DATABASE_URL) {
  throw new Error("TURSO_DATABASE_URL is not set");
}

// 必須環境変数リスト
const requiredEnvVars = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "JWT_SECRET",
  "SESSION_SECRET",
  "OPENAI_API_KEY",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
```

**判断基準**:

- [ ] 起動時に必須環境変数をチェックしているか？
- [ ] デフォルト値が安全でないシークレットを使用していないか？

---

## 5. セキュリティロギング

### ログ記録対象

**必須イベント**:

- 認証成功/失敗（ユーザー、時刻、IP）
- 認可失敗（アクセス拒否）
- 管理者操作（ユーザー削除、権限変更等）
- セキュリティ例外（CSRF 検出、不正トークン等）
- システムエラー（例外、クラッシュ）

**ログ禁止データ**:

- パスワード（平文、ハッシュ）
- セッショントークン、JWT
- クレジットカード番号
- 社会保障番号
- API キー、シークレット

**実装例**:

```javascript
// ✅ 安全なログ
logger.info("Login successful", {
  userId: user.id,
  ipAddress: req.ip,
  timestamp: new Date().toISOString(),
});

// ❌ 危険なログ
logger.debug("User data", {
  password: user.password, // 絶対に禁止
  token: sessionToken,
});
```

**判断基準**:

- [ ] センシティブデータがログに出力されていないか？
- [ ] セキュリティイベントが記録されているか？
- [ ] ログは構造化されているか（JSON 形式推奨）？

---

## 6. Rate Limiting 設定

### 実装確認

**認証エンドポイント**:

```javascript
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 5, // 5回試行
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/login", loginLimiter, loginHandler);
```

**グローバル Rate Limiting**:

```javascript
const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 100, // 100リクエスト
  skip: (req) => req.ip === "trusted-ip", // ホワイトリスト
});

app.use("/api/", globalLimiter);
```

**判断基準**:

- [ ] 認証エンドポイントに Rate Limiting があるか？
- [ ] API グローバル Rate Limiting があるか？
- [ ] レート超過時に 429 ステータスコードが返されるか？
- [ ] Retry-After ヘッダーが設定されているか？

---

## 7. エラーハンドリングとセキュリティ

### 情報漏洩防止

**本番環境エラーレスポンス**:

```javascript
// ✅ 安全（本番環境）
app.use((err, req, res, next) => {
  logger.error("Server error", {
    message: err.message,
    stack: err.stack,
    userId: req.session?.userId,
  });

  res.status(500).json({
    error: "Internal server error", // 詳細を隠す
  });
});

// ❌ 危険（本番環境で使用禁止）
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack, // スタックトレース露出
    query: req.query, // 内部情報漏洩
  });
});
```

**判断基準**:

- [ ] 本番環境でスタックトレースを返していないか？
- [ ] エラーメッセージは一般的か（詳細を隠す）？
- [ ] 内部パス、DB 情報が漏洩していないか？

---

## 8. HTTPS/TLS 設定

### HTTPS 強制

**実装**:

```javascript
// すべてのHTTPリクエストをHTTPSにリダイレクト
app.use((req, res, next) => {
  if (
    req.header("x-forwarded-proto") !== "https" &&
    process.env.NODE_ENV === "production"
  ) {
    return res.redirect(`https://${req.header("host")}${req.url}`);
  }
  next();
});
```

### HSTS 設定

**ヘッダー**:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**preload リスト登録**:
https://hstspreload.org/ に登録することで、ブラウザが常に HTTPS を強制

**判断基準**:

- [ ] 本番環境で HTTPS が強制されているか？
- [ ] HSTS ヘッダーが設定されているか？
- [ ] max-age は 1 年以上か？

---

## 9. 設定ファイル監査チェックリスト

### セキュリティヘッダー

- [ ] Content-Security-Policy 設定
- [ ] Strict-Transport-Security（HSTS）設定
- [ ] X-Frame-Options 設定
- [ ] X-Content-Type-Options 設定
- [ ] Referrer-Policy 設定
- [ ] Permissions-Policy 設定

### CORS

- [ ] 許可オリジンがホワイトリストで制限
- [ ] `origin: '*'`と credentials: true の組み合わせなし
- [ ] 不要な HTTP メソッドを許可していない
- [ ] プリフライトリクエストのキャッシュ設定

### 環境変数

- [ ] .env が.gitignore に含まれる
- [ ] .env.example でテンプレート提供
- [ ] ハードコードされたシークレットなし
- [ ] 起動時の必須環境変数チェック

### ロギング

- [ ] センシティブデータがログに出力されない
- [ ] セキュリティイベントが記録される
- [ ] ログは構造化されている（JSON）
- [ ] ログレベルが適切に設定

### Rate Limiting

- [ ] 認証エンドポイントに Rate Limiting
- [ ] グローバル Rate Limiting 設定
- [ ] 429 ステータスコード返却
- [ ] Retry-After ヘッダー設定

---

## リソース・スクリプト・テンプレート

### リソース

- `resources/security-headers-guide.md`: セキュリティヘッダー詳細
- `resources/cors-best-practices.md`: CORS 設定ベストプラクティス
- `resources/environment-variables-management.md`: 環境変数管理ガイド

### スクリプト

- `scripts/check-security-headers.mjs`: セキュリティヘッダーチェック
- `scripts/audit-cors-config.mjs`: CORS 設定監査
- `scripts/scan-env-files.mjs`: 環境変数ファイルスキャン

### テンプレート

- `templates/helmet-config-template.js`: Helmet.js 設定テンプレート
- `templates/cors-config-template.js`: CORS 設定テンプレート
- `templates/security-checklist.md`: セキュリティ設定チェックリスト

---

## 関連スキル

- `.claude/skills/authentication-authorization-security/SKILL.md`: セッション Cookie 設定
- `.claude/skills/rate-limiting-strategies/SKILL.md`: Rate Limiting 詳細
- `.claude/skills/owasp-top-10/SKILL.md`: A05（セキュリティ設定ミス）

---

## 変更履歴

### v1.0.0 (2025-11-26)

- 初版リリース
- @sec-auditor エージェントからセキュリティ設定レビュー知識を抽出
- セキュリティヘッダー、CORS、環境変数、ロギングの評価基準を定義

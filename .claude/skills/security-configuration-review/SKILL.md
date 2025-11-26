---
name: security-configuration-review
description: |
  セキュリティ関連設定のレビューとベストプラクティスを提供します。
  セキュリティヘッダー、CORS、環境変数管理、ロギング、Rate Limitingの
  設定妥当性を評価し、情報漏洩やセキュリティ設定ミスを検出します。

  📚 このスキルの使用タイミング:
  - アプリケーションのセキュリティヘッダー設定時
  - CORS（Cross-Origin Resource Sharing）設定レビュー時
  - 環境変数とシークレット管理の評価時
  - セキュリティロギング設計時
  - CSP（Content Security Policy）設定時
  - HTTPSとHSTS設定の確認時
  - Rate Limiting設定レビュー時

  🔍 評価対象:
  - Helmet.js等のセキュリティヘッダーミドルウェア
  - CORS設定（許可オリジン、認証情報）
  - 環境変数管理（.env、.gitignore）
  - センシティブデータのログ出力防止
  - CSP、X-Frame-Options、HSTS等のヘッダー

  Use this skill when configuring web application security, reviewing
  environment setup, or auditing security-related configurations.
version: 1.0.0
related_skills:
  - .claude/skills/authentication-authorization-security/SKILL.md
  - .claude/skills/rate-limiting-strategies/SKILL.md
  - .claude/skills/owasp-top-10/SKILL.md
---

# Security Configuration Review

## スキル概要

アプリケーションのセキュリティ設定を包括的にレビューする専門知識を提供します。

**専門分野**:
- HTTPセキュリティヘッダー設定
- CORS（Cross-Origin Resource Sharing）設定
- 環境変数とシークレット管理
- セキュリティログとモニタリング
- CSP（Content Security Policy）

---

## 1. HTTPセキュリティヘッダー

### Helmet.jsミドルウェア

**推奨設定**:
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // 本番では'unsafe-inline'削除推奨
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,  // 1年
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
}));
```

**判断基準**:
- [ ] Helmet.jsまたは同等のミドルウェアが使用されているか？
- [ ] 本番環境ですべてのセキュリティヘッダーが有効か？

---

### 個別ヘッダー詳細

**Strict-Transport-Security（HSTS）**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
- 目的: HTTPS強制、HTTP→HTTPSダウングレード攻撃防止
- [ ] max-ageは1年（31536000秒）以上か？
- [ ] includeSubDomainsが設定されているか？

**X-Frame-Options**:
```
X-Frame-Options: DENY
```
- 目的: Clickjacking攻撃防止
- [ ] `DENY`または`SAMEORIGIN`が設定されているか？

**X-Content-Type-Options**:
```
X-Content-Type-Options: nosniff
```
- 目的: MIMEタイプスニッフィング防止
- [ ] `nosniff`が設定されているか？

**Referrer-Policy**:
```
Referrer-Policy: no-referrer
```
- 目的: Refererヘッダー情報漏洩防止
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

**XSS対策レベル**:
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
- [ ] CSPが設定されているか？
- [ ] `'unsafe-inline'`は本番環境で避けているか？
- [ ] nonceまたはhashを使用しているか？
- [ ] `'unsafe-eval'`は使用されていないか？

---

### CSP Reporting

**Report-Uri設定**:
```
Content-Security-Policy:
  default-src 'self';
  report-uri /api/csp-violations;
```

**レポート受信**:
```javascript
app.post('/api/csp-violations', express.json({ type: 'application/csp-report' }), (req, res) => {
  const report = req.body;
  logger.warn('CSP violation', {
    documentUri: report['document-uri'],
    violatedDirective: report['violated-directive'],
    blockedUri: report['blocked-uri']
  });
  res.status(204).end();
});
```

**判断基準**:
- [ ] CSP違反レポートが収集されているか？
- [ ] 違反パターンを分析して設定を改善しているか？

---

## 3. CORS設定

### 設定評価

**安全な設定**:
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),  // ホワイトリスト
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400  // プリフライトキャッシュ: 24時間
}));
```

**危険な設定**:
```javascript
// ❌ すべてのオリジン許可
app.use(cors({ origin: '*', credentials: true }));

// ❌ 動的オリジン（検証なし）
app.use(cors({ origin: req.headers.origin }));
```

**判断基準**:
- [ ] 許可オリジンはホワイトリストで制限されているか？
- [ ] `origin: '*'`とcredentials: true の組み合わせは避けているか？
- [ ] 動的オリジン許可時に検証があるか？
- [ ] 不要なHTTPメソッドは許可していないか？

---

## 4. 環境変数とシークレット管理

### .envファイル管理

**チェック項目**:
- [ ] `.env`ファイルが`.gitignore`に含まれているか？
- [ ] `.env.example`でテンプレートを提供しているか？
- [ ] 本番と開発で異なる`.env`ファイルを使用しているか？

**.gitignore必須エントリ**:
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
DATABASE_URL=postgresql://...
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
- [ ] 環境別に異なる接頭辞があるか（DEV_、PROD_等）？

---

### シークレット注入

**Railway/Vercel設定**:
```javascript
// ビルド時チェック
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// 必須環境変数リスト
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SESSION_SECRET',
  'OPENAI_API_KEY'
];

requiredEnvVars.forEach(varName => {
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
- セキュリティ例外（CSRF検出、不正トークン等）
- システムエラー（例外、クラッシュ）

**ログ禁止データ**:
- パスワード（平文、ハッシュ）
- セッショントークン、JWT
- クレジットカード番号
- 社会保障番号
- APIキー、シークレット

**実装例**:
```javascript
// ✅ 安全なログ
logger.info('Login successful', {
  userId: user.id,
  ipAddress: req.ip,
  timestamp: new Date().toISOString()
});

// ❌ 危険なログ
logger.debug('User data', {
  password: user.password,  // 絶対に禁止
  token: sessionToken
});
```

**判断基準**:
- [ ] センシティブデータがログに出力されていないか？
- [ ] セキュリティイベントが記録されているか？
- [ ] ログは構造化されているか（JSON形式推奨）？

---

## 6. Rate Limiting設定

### 実装確認

**認証エンドポイント**:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15分
  max: 5,  // 5回試行
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

app.post('/api/login', loginLimiter, loginHandler);
```

**グローバルRate Limiting**:
```javascript
const globalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1時間
  max: 100,  // 100リクエスト
  skip: (req) => req.ip === 'trusted-ip'  // ホワイトリスト
});

app.use('/api/', globalLimiter);
```

**判断基準**:
- [ ] 認証エンドポイントにRate Limitingがあるか？
- [ ] APIグローバルRate Limitingがあるか？
- [ ] レート超過時に429ステータスコードが返されるか？
- [ ] Retry-Afterヘッダーが設定されているか？

---

## 7. エラーハンドリングとセキュリティ

### 情報漏洩防止

**本番環境エラーレスポンス**:
```javascript
// ✅ 安全（本番環境）
app.use((err, req, res, next) => {
  logger.error('Server error', {
    message: err.message,
    stack: err.stack,
    userId: req.session?.userId
  });

  res.status(500).json({
    error: 'Internal server error'  // 詳細を隠す
  });
});

// ❌ 危険（本番環境で使用禁止）
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,  // スタックトレース露出
    query: req.query   // 内部情報漏洩
  });
});
```

**判断基準**:
- [ ] 本番環境でスタックトレースを返していないか？
- [ ] エラーメッセージは一般的か（詳細を隠す）？
- [ ] 内部パス、DB情報が漏洩していないか？

---

## 8. HTTPS/TLS設定

### HTTPS強制

**実装**:
```javascript
// すべてのHTTPリクエストをHTTPSにリダイレクト
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});
```

### HSTS設定

**ヘッダー**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**preloadリスト登録**:
https://hstspreload.org/ に登録することで、ブラウザが常にHTTPSを強制

**判断基準**:
- [ ] 本番環境でHTTPSが強制されているか？
- [ ] HSTSヘッダーが設定されているか？
- [ ] max-ageは1年以上か？

---

## 9. 設定ファイル監査チェックリスト

### セキュリティヘッダー

- [ ] Content-Security-Policy設定
- [ ] Strict-Transport-Security（HSTS）設定
- [ ] X-Frame-Options設定
- [ ] X-Content-Type-Options設定
- [ ] Referrer-Policy設定
- [ ] Permissions-Policy設定

### CORS

- [ ] 許可オリジンがホワイトリストで制限
- [ ] `origin: '*'`とcredentials: trueの組み合わせなし
- [ ] 不要なHTTPメソッドを許可していない
- [ ] プリフライトリクエストのキャッシュ設定

### 環境変数

- [ ] .envが.gitignoreに含まれる
- [ ] .env.exampleでテンプレート提供
- [ ] ハードコードされたシークレットなし
- [ ] 起動時の必須環境変数チェック

### ロギング

- [ ] センシティブデータがログに出力されない
- [ ] セキュリティイベントが記録される
- [ ] ログは構造化されている（JSON）
- [ ] ログレベルが適切に設定

### Rate Limiting

- [ ] 認証エンドポイントにRate Limiting
- [ ] グローバルRate Limiting設定
- [ ] 429ステータスコード返却
- [ ] Retry-Afterヘッダー設定

---

## リソース・スクリプト・テンプレート

### リソース
- `resources/security-headers-guide.md`: セキュリティヘッダー詳細
- `resources/cors-best-practices.md`: CORS設定ベストプラクティス
- `resources/environment-variables-management.md`: 環境変数管理ガイド

### スクリプト
- `scripts/check-security-headers.mjs`: セキュリティヘッダーチェック
- `scripts/audit-cors-config.mjs`: CORS設定監査
- `scripts/scan-env-files.mjs`: 環境変数ファイルスキャン

### テンプレート
- `templates/helmet-config-template.js`: Helmet.js設定テンプレート
- `templates/cors-config-template.js`: CORS設定テンプレート
- `templates/security-checklist.md`: セキュリティ設定チェックリスト

---

## 関連スキル

- `.claude/skills/authentication-authorization-security/SKILL.md`: セッションCookie設定
- `.claude/skills/rate-limiting-strategies/SKILL.md`: Rate Limiting詳細
- `.claude/skills/owasp-top-10/SKILL.md`: A05（セキュリティ設定ミス）

---

## 変更履歴

### v1.0.0 (2025-11-26)
- 初版リリース
- @sec-auditorエージェントからセキュリティ設定レビュー知識を抽出
- セキュリティヘッダー、CORS、環境変数、ロギングの評価基準を定義

---
name: .claude/skills/security-headers/SKILL.md
description: |
  Webアプリケーションセキュリティヘッダーの設定パターン。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/security-headers/resources/csp-configuration.md`: Csp Configurationリソース
  - `.claude/skills/security-headers/resources/csrf-prevention.md`: Csrf Preventionリソース

  - `.claude/skills/security-headers/templates/nextjs-security-headers-template.js`: Nextjs Security Headersテンプレート

  - `.claude/skills/security-headers/scripts/validate-security-headers.mjs`: Validate Security Headersスクリプト

version: 1.0.0
---

# Security Headers

## スキル概要

**コアドメイン**:

- セキュリティヘッダー設定
- Content Security Policy（CSP）
- CSRF/XSS/Clickjacking 対策

## 必須セキュリティヘッダー

### 1. Content-Security-Policy（CSP）

**目的**: XSS 攻撃とデータインジェクション攻撃を防止

**基本設定**:

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
`
  .replace(/\s{2,}/g, " ")
  .trim();
```

**推奨設定（厳格）**:

```typescript
const strictCspHeader = `
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, " ")
  .trim();
```

### 2. X-Frame-Options

**目的**: Clickjacking 攻撃を防止

```typescript
'X-Frame-Options': 'DENY'
// または
'X-Frame-Options': 'SAMEORIGIN'
```

### 3. X-Content-Type-Options

**目的**: MIME タイプスニッフィング攻撃を防止

```typescript
'X-Content-Type-Options': 'nosniff'
```

### 4. Strict-Transport-Security（HSTS）

**目的**: HTTPS 接続を強制

```typescript
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
```

### 5. Referrer-Policy

**目的**: リファラー情報の制御

```typescript
'Referrer-Policy': 'strict-origin-when-cross-origin'
```

### 6. Permissions-Policy

**目的**: ブラウザ機能へのアクセス制御

```typescript
'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
```

## Next.js での設定

### next.config.js

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
```

## CSRF 対策

### SameSite Cookie 属性

```typescript
cookies().set("session_token", token, {
  sameSite: "lax", // またはstrict
});
```

### CSRF トークン検証（追加保護）

```typescript
// ミドルウェア
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  if (request.method === "GET" || request.method === "HEAD") {
    return true; // 読み取りのみ操作はスキップ
  }

  const token = request.headers.get("X-CSRF-Token");
  const sessionToken = cookies().get("csrf_token")?.value;

  return token === sessionToken;
}
```

## リソース参照

```bash
cat .claude/skills/security-headers/resources/csp-configuration.md
cat .claude/skills/security-headers/resources/csrf-prevention.md
```

## テンプレート参照

```bash
cat .claude/skills/security-headers/templates/nextjs-security-headers-template.js
```

## スクリプト実行

```bash
node .claude/skills/security-headers/scripts/validate-security-headers.mjs next.config.js
```

## 判断基準

- [ ] すべての OWASP 推奨ヘッダーが設定されているか？
- [ ] CSP はアプリケーション要件と互換性があるか？
- [ ] CSRF 対策は多層化されているか？
- [ ] Cookie 属性は適切か（HttpOnly、Secure、SameSite）？

## ベストプラクティス

1. **CSP 厳格化**: 'unsafe-inline'/'unsafe-eval'を避ける
2. **HSTS 有効化**: HTTPS 強制
3. **SameSite Cookie**: Lax/Strict 推奨
4. **多層 CSRF 対策**: SameSite + CSRF トークン

## バージョン履歴

| バージョン | 日付       | 変更内容                                        |
| ---------- | ---------- | ----------------------------------------------- |
| 1.0.0      | 2025-11-26 | 初版リリース - セキュリティヘッダー設定パターン |

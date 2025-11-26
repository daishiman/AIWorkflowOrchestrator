---
name: security-headers
description: |
  Webアプリケーションセキュリティヘッダーの設定パターン。
  CSP、HSTS、X-Frame-Options等のヘッダー設定により、
  CSRF、XSS、Clickjacking等の攻撃から保護。

  使用タイミング:
  - セキュリティヘッダーの設定時
  - Content Security Policy（CSP）の設計時
  - CSRF/XSS/Clickjacking対策の実装時
  - Cookie属性の安全な設定時
  - OWASP推奨セキュリティ対策の適用時

  関連スキル:
  - `.claude/skills/session-management/SKILL.md` - Cookie属性設定
  - `.claude/skills/oauth2-flows/SKILL.md` - CSRF対策（State parameter）

  Use when implementing security headers, designing Content Security Policy,
  or protecting web applications from common attacks.
version: 1.0.0
---

# Security Headers

## スキル概要

**コアドメイン**:
- セキュリティヘッダー設定
- Content Security Policy（CSP）
- CSRF/XSS/Clickjacking対策

## 必須セキュリティヘッダー

### 1. Content-Security-Policy（CSP）

**目的**: XSS攻撃とデータインジェクション攻撃を防止

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
`.replace(/\s{2,}/g, ' ').trim();
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
`.replace(/\s{2,}/g, ' ').trim();
```

### 2. X-Frame-Options

**目的**: Clickjacking攻撃を防止

```typescript
'X-Frame-Options': 'DENY'
// または
'X-Frame-Options': 'SAMEORIGIN'
```

### 3. X-Content-Type-Options

**目的**: MIMEタイプスニッフィング攻撃を防止

```typescript
'X-Content-Type-Options': 'nosniff'
```

### 4. Strict-Transport-Security（HSTS）

**目的**: HTTPS接続を強制

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
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

## CSRF対策

### SameSite Cookie属性

```typescript
cookies().set('session_token', token, {
  sameSite: 'lax', // またはstrict
});
```

### CSRFトークン検証（追加保護）

```typescript
// ミドルウェア
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true; // 読み取りのみ操作はスキップ
  }

  const token = request.headers.get('X-CSRF-Token');
  const sessionToken = cookies().get('csrf_token')?.value;

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

- [ ] すべてのOWASP推奨ヘッダーが設定されているか？
- [ ] CSPはアプリケーション要件と互換性があるか？
- [ ] CSRF対策は多層化されているか？
- [ ] Cookie属性は適切か（HttpOnly、Secure、SameSite）？

## ベストプラクティス

1. **CSP厳格化**: 'unsafe-inline'/'unsafe-eval'を避ける
2. **HSTS有効化**: HTTPS強制
3. **SameSite Cookie**: Lax/Strict推奨
4. **多層CSRF対策**: SameSite + CSRFトークン

## バージョン履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版リリース - セキュリティヘッダー設定パターン |

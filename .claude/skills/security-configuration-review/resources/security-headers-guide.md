# セキュリティヘッダー詳細ガイド

## Content-Security-Policy (CSP)

**目的**: XSS攻撃の影響を軽減

**基本ディレクティブ**:
- `default-src`: すべてのリソースタイプのデフォルト
- `script-src`: JavaScriptソース
- `style-src`: CSSソース
- `img-src`: 画像ソース
- `connect-src`: XHR、WebSocket、EventSource
- `font-src`: フォントソース
- `object-src`: `<object>`、`<embed>`、`<applet>`
- `frame-src`: `<iframe>`ソース

**推奨設定**:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'nonce-{random}'; object-src 'none';
```

---

## Strict-Transport-Security (HSTS)

**目的**: HTTP→HTTPSダウングレード攻撃防止

**ヘッダー形式**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**パラメータ**:
- `max-age`: HTTPS強制期間（秒）
- `includeSubDomains`: サブドメインにも適用
- `preload`: ブラウザのpreloadリストに登録

**推奨設定**: max-age=31536000（1年）、includeSubDomains、preload

---

## X-Frame-Options

**目的**: Clickjacking攻撃防止

**設定値**:
- `DENY`: すべてのframing禁止（最も安全）
- `SAMEORIGIN`: 同一オリジンのみ許可
- `ALLOW-FROM uri`: 非推奨（CSP frame-ancestors使用）

**推奨設定**: `DENY`または`SAMEORIGIN`

---

## X-Content-Type-Options

**目的**: MIMEタイプスニッフィング防止

**設定値**: `nosniff`のみ

**効果**: ブラウザがContent-Typeを無視して推測することを防止

---

## Referrer-Policy

**目的**: Refererヘッダー情報漏洩防止

**設定値**:
- `no-referrer`: Refererを一切送信しない（最も安全）
- `strict-origin-when-cross-origin`: クロスオリジンではオリジンのみ
- `same-origin`: 同一オリジンのみ

**推奨設定**: `no-referrer`または`strict-origin-when-cross-origin`

---

## Permissions-Policy

**目的**: ブラウザ機能アクセス制限

**ディレクティブ例**:
```
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(self)
```

**よく制限する機能**:
- `geolocation`: 位置情報
- `microphone`: マイク
- `camera`: カメラ
- `payment`: Payment Request API
- `usb`: USB
- `magnetometer`: 磁力計

---

## 参考文献

- **OWASP Secure Headers Project**: https://owasp.org/www-project-secure-headers/
- **MDN CSP**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **HSTS Preload**: https://hstspreload.org/

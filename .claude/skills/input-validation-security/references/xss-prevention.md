# XSS防止ガイド

> **相対パス**: `references/xss-prevention.md`
> **対応仕様**: OWASP ASVS 5.3, CWE-79

---

## XSSの種類と防御

### 1. Reflected XSS

リクエストパラメータがそのままレスポンスに反映される。

```typescript
// 脆弱なコード
app.get("/search", (req, res) => {
  res.send(`<h1>Results for: ${req.query.q}</h1>`); // 危険
});

// 安全なコード
import { encodeHTML } from "./utils/encoding";

app.get("/search", (req, res) => {
  res.send(`<h1>Results for: ${encodeHTML(req.query.q)}</h1>`);
});
```

### 2. Stored XSS

悪意のあるスクリプトがデータベースに保存される。

**防御戦略**:

1. 入力時: 型検証 + サニタイズ
2. 出力時: コンテキストに応じたエンコーディング

```typescript
// 入力検証（保存時）
const commentSchema = z.object({
  content: z
    .string()
    .max(10000)
    .refine((val) => !/<script/i.test(val), "Script tags not allowed"),
});

// 出力エンコーディング（表示時）
const safeContent = encodeHTML(comment.content);
```

### 3. DOM-based XSS

クライアント側JavaScriptでDOMを操作する際に発生。

```typescript
// 脆弱なコード
document.getElementById("output").innerHTML = userInput; // 危険
location.href = userInput; // 危険

// 安全なコード
document.getElementById("output").textContent = userInput; // 安全
location.href = validateURL(userInput); // 検証済みURL
```

---

## エンコーディング関数

```typescript
// src/utils/xss-encoding.ts

/** HTMLコンテキスト用エンコーディング */
export function encodeHTML(str: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
  };
  return str.replace(/[&<>"']/g, (char) => entities[char]);
}

/** HTML属性値用エンコーディング */
export function encodeHTMLAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`/g, "&#x60;")
    .replace(/=/g, "&#x3D;");
}

/** JavaScript文字列用エンコーディング */
export function encodeJS(str: string): string {
  return JSON.stringify(str).slice(1, -1);
}

/** CSS用エンコーディング */
export function encodeCSS(str: string): string {
  return str.replace(
    /[^a-zA-Z0-9]/g,
    (char) => `\\${char.charCodeAt(0).toString(16)} `,
  );
}
```

---

## Content Security Policy (CSP)

### 推奨設定

```typescript
// Express middleware
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'nonce-{{NONCE}}'",
      "style-src 'self' 'unsafe-inline'", // 必要な場合のみ
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );
  next();
});
```

### Nonce-based CSP

```typescript
import crypto from "crypto";

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
  res.setHeader(
    "Content-Security-Policy",
    `script-src 'self' 'nonce-${res.locals.nonce}'`,
  );
  next();
});

// テンプレートで使用
// <script nonce="{{nonce}}">...</script>
```

---

## フレームワーク別対策

### React

```tsx
// 自動エスケープ（安全）
<div>{userInput}</div>

// dangerouslySetInnerHTML（危険 - 避ける）
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// 必要な場合はサニタイズ
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### Next.js

```tsx
// 安全: 自動エスケープ
export default function Page({ content }) {
  return <p>{content}</p>;
}

// APIルートでのヘッダー設定
export async function GET() {
  return new Response(data, {
    headers: {
      "Content-Security-Policy": "default-src 'self'",
    },
  });
}
```

---

## テストペイロード

| カテゴリ | ペイロード                           | 検出対象         |
| -------- | ------------------------------------ | ---------------- |
| Basic    | `<script>alert(1)</script>`          | 基本的なXSS      |
| Event    | `<img src=x onerror=alert(1)>`       | イベントハンドラ |
| SVG      | `<svg onload=alert(1)>`              | SVG経由          |
| Encoded  | `&#60;script&#62;`                   | HTMLエンティティ |
| Unicode  | `<script>alert\u0028\u0029</script>` | Unicode          |

---

## 関連リソース

- **基礎知識**: See [basics.md](basics.md)
- **実装パターン**: See [patterns.md](patterns.md)

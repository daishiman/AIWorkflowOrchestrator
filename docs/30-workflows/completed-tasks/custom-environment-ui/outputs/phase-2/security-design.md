# セキュリティ設計: Custom Execution Environment UI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | AGENT-006                       |
| タスク名 | Custom Execution Environment UI |
| Phase    | 2                               |
| 作成日   | 2026-01-13                      |

---

## セキュリティ要件

### 脅威モデル

| 脅威                       | リスク | 対策                      |
| -------------------------- | ------ | ------------------------- |
| XSS (Cross-Site Scripting) | 高     | DOMPurify + CSP + sandbox |
| クリックジャッキング       | 中     | frame-ancestors 'none'    |
| データ漏洩                 | 中     | connect-src 'none'        |
| フォームハイジャック       | 中     | form-action 'none'        |
| リダイレクト攻撃           | 低     | sandbox属性               |

### 対策の多層防御

```
┌─────────────────────────────────────────────────────────────────┐
│                    Layer 1: DOMPurify                           │
│                    (入力サニタイズ)                              │
├─────────────────────────────────────────────────────────────────┤
│                    Layer 2: CSP Header                          │
│                    (スクリプト実行禁止)                          │
├─────────────────────────────────────────────────────────────────┤
│                    Layer 3: iframe sandbox                      │
│                    (機能制限)                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Layer 1: DOMPurify によるHTMLサニタイズ

### 設定

```typescript
// apps/desktop/src/renderer/utils/sanitize.ts

import DOMPurify from "dompurify";

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    // 禁止するタグ
    FORBID_TAGS: [
      "script",
      "iframe",
      "object",
      "embed",
      "form",
      "input",
      "button",
      "select",
      "textarea",
    ],
    // 禁止する属性
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onmouseout",
      "onmousedown",
      "onmouseup",
      "onkeydown",
      "onkeyup",
      "onkeypress",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
      "onreset",
      "onselect",
    ],
    // data-* 属性を無効化
    ALLOW_DATA_ATTR: false,
    // URIスキームのホワイトリスト
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};
```

### サニタイズ対象

| 攻撃パターン                         | サニタイズ結果     |
| ------------------------------------ | ------------------ |
| `<script>alert('xss')</script>`      | タグ削除           |
| `<img onerror="alert('xss')">`       | 属性削除 → `<img>` |
| `<a href="javascript:alert('xss')">` | href削除           |
| `<div onclick="alert('xss')">`       | 属性削除 → `<div>` |
| `<svg onload="alert('xss')">`        | 属性削除           |
| `<iframe src="evil.com">`            | タグ削除           |
| `<object data="evil.swf">`           | タグ削除           |

---

## Layer 2: Content Security Policy (CSP)

### CSPディレクティブ

```typescript
// HTMLPreviewEnvironment用CSP設定

export const CSP_DIRECTIVES = {
  // デフォルトで全て禁止
  "default-src": "'self'",

  // スクリプト完全禁止（最重要）
  "script-src": "'none'",

  // インラインCSS許可（見た目のため）
  "style-src": "'self' 'unsafe-inline'",

  // 画像ソース制限
  "img-src": "'self' data: https:",

  // フォントソース制限
  "font-src": "'self' https:",

  // 外部接続完全禁止
  "connect-src": "'none'",

  // フレーム埋め込み禁止
  "frame-ancestors": "'none'",

  // base要素禁止
  "base-uri": "'none'",

  // フォーム送信禁止
  "form-action": "'none'",

  // objectタグ禁止
  "object-src": "'none'",
};

export const buildCSPString = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ");
};
```

### CSP適用方法

```typescript
// iframe内のHTMLにmeta tagとして埋め込む

const buildSecureHTML = (content: string): string => {
  const csp = buildCSPString();
  const sanitizedContent = sanitizeHTML(content);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
  ${sanitizedContent}
</body>
</html>`;
};
```

---

## Layer 3: iframe sandbox属性

### sandbox設定

```typescript
// HTMLPreviewEnvironment

// 許可するsandbox属性
const ALLOWED_SANDBOX_FLAGS = [
  "allow-same-origin", // CSSの読み込みに必要
];

// 明示的に禁止される機能（sandboxのデフォルト）
// - allow-scripts: スクリプト実行
// - allow-forms: フォーム送信
// - allow-popups: ポップアップ
// - allow-top-navigation: 親ウィンドウのナビゲーション
// - allow-modals: alert/confirm/prompt
// - allow-pointer-lock: ポインターロック

const sandboxValue = ALLOWED_SANDBOX_FLAGS.join(" ");
// 結果: "allow-same-origin"
```

### sandbox属性の効果

| 機能                   | 状態 | 理由                       |
| ---------------------- | ---- | -------------------------- |
| スクリプト実行         | 禁止 | XSS対策                    |
| フォーム送信           | 禁止 | フォームハイジャック対策   |
| ポップアップ           | 禁止 | 悪意のあるポップアップ防止 |
| 親ウィンドウナビゲート | 禁止 | リダイレクト攻撃防止       |
| alert/confirm/prompt   | 禁止 | UI偽装防止                 |
| ダウンロード           | 禁止 | 悪意のあるダウンロード防止 |
| same-origin            | 許可 | CSSの読み込みに必要        |

---

## セキュリティテストケース

### 必須テストケース

```typescript
describe("HTMLPreviewEnvironment Security", () => {
  // XSS攻撃パターン
  describe("XSS Prevention", () => {
    it("should strip <script> tags", () => {
      const input = '<script>alert("xss")</script><p>Safe</p>';
      expect(sanitizeHTML(input)).toBe("<p>Safe</p>");
    });

    it("should strip inline event handlers", () => {
      const input = '<img src="x" onerror="alert(\'xss\')">';
      expect(sanitizeHTML(input)).toBe('<img src="x">');
    });

    it("should strip javascript: URLs", () => {
      const input = '<a href="javascript:alert(\'xss\')">Click</a>';
      expect(sanitizeHTML(input)).toBe("<a>Click</a>");
    });

    it("should strip data: URLs with scripts", () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">X</a>';
      expect(sanitizeHTML(input)).not.toContain("data:");
    });
  });

  // iframe sandbox
  describe("iframe sandbox", () => {
    it("should have sandbox attribute", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);
      const iframe = screen.getByTitle("Preview");
      expect(iframe).toHaveAttribute("sandbox", "allow-same-origin");
    });

    it("should not allow scripts", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);
      const iframe = screen.getByTitle("Preview");
      expect(iframe.getAttribute("sandbox")).not.toContain("allow-scripts");
    });
  });

  // CSP
  describe("CSP", () => {
    it("should include CSP meta tag", () => {
      render(<HTMLPreviewEnvironment content="<p>Test</p>" />);
      const iframe = screen.getByTitle("Preview") as HTMLIFrameElement;
      const iframeDoc = iframe.contentDocument;
      const cspMeta = iframeDoc?.querySelector(
        'meta[http-equiv="Content-Security-Policy"]'
      );
      expect(cspMeta?.getAttribute("content")).toContain("script-src 'none'");
    });
  });
});
```

### 攻撃パターンテストリスト

| #   | 攻撃パターン                                       | 期待結果        |
| --- | -------------------------------------------------- | --------------- |
| 1   | `<script>alert('xss')</script>`                    | タグ削除        |
| 2   | `<script src="evil.js"></script>`                  | タグ削除        |
| 3   | `<img onerror="alert('xss')">`                     | 属性削除        |
| 4   | `<svg onload="alert('xss')">`                      | 属性削除        |
| 5   | `<body onload="alert('xss')">`                     | 属性削除        |
| 6   | `<a href="javascript:alert('xss')">`               | href削除        |
| 7   | `<div onclick="alert('xss')">`                     | 属性削除        |
| 8   | `<iframe src="evil.com">`                          | タグ削除        |
| 9   | `<object data="evil.swf">`                         | タグ削除        |
| 10  | `<embed src="evil.swf">`                           | タグ削除        |
| 11  | `<form action="evil.com"><input></form>`           | タグ削除        |
| 12  | `<meta http-equiv="refresh" content="0;url=evil">` | 効果なし（CSP） |
| 13  | `<link rel="import" href="evil.html">`             | 効果なし（CSP） |
| 14  | `<base href="evil.com">`                           | 効果なし（CSP） |

---

## セキュリティチェックリスト

### 実装前チェック

- [ ] DOMPurifyの依存関係が追加されている
- [ ] sanitizeHTML関数が実装されている
- [ ] CSP文字列が正しく構築されている
- [ ] sandbox属性が設定されている

### 実装後チェック

- [ ] 全攻撃パターンテストがパスしている
- [ ] iframeにsandbox属性が設定されている
- [ ] CSP meta tagがiframe内に含まれている
- [ ] スクリプトが実行されないことを確認済み
- [ ] イベントハンドラが除去されることを確認済み
- [ ] javascript: URLが無効化されることを確認済み

### デプロイ前チェック

- [ ] セキュリティテストが全てパスしている
- [ ] 手動でXSSペイロードをテスト済み
- [ ] 外部通信がブロックされることを確認済み

---

## 完了確認

- [x] 脅威モデルが定義されている
- [x] 多層防御の設計が完成している
- [x] DOMPurify設定が定義されている
- [x] CSPディレクティブが設計されている
- [x] sandbox属性が設計されている
- [x] セキュリティテストケースが定義されている
- [x] チェックリストが作成されている

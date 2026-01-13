# Phase 2: セキュリティ設計書 - Custom Execution Environment UI

## タスク情報

- **タスクID**: AGENT-006
- **タスク名**: Custom Execution Environment UI
- **フェーズ**: Phase 2 - 設計（セキュリティ詳細）
- **作成日**: 2026-01-13
- **ステータス**: 完了

## セキュリティ概要

AIエージェントが生成したHTMLコンテンツをプレビューする際、XSS攻撃やその他のセキュリティリスクを防止するための多層防御戦略を採用する。

## 脅威モデル

### 想定される脅威

| ID    | 脅威                         | リスクレベル | 対策                |
| ----- | ---------------------------- | ------------ | ------------------- |
| T-001 | XSSスクリプト実行            | 高           | DOMPurify + sandbox |
| T-002 | イベントハンドラ悪用         | 高           | 属性フィルタリング  |
| T-003 | javascript: URL              | 高           | URLスキーム無効化   |
| T-004 | フォーム送信                 | 中           | sandbox + CSP       |
| T-005 | ポップアップ生成             | 中           | sandbox             |
| T-006 | 親フレームへのナビゲーション | 中           | sandbox             |
| T-007 | 外部リソース読み込み         | 低           | CSP                 |

## 多層防御アーキテクチャ

```
┌──────────────────────────────────────────────────────────────┐
│                    Layer 1: Input Sanitization               │
│                         (DOMPurify)                          │
│  - scriptタグ除去                                            │
│  - イベントハンドラ属性除去（onclick, onerror等）             │
│  - javascript: URL無効化                                     │
│  - data: URL制限                                             │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                 Layer 2: Content Security Policy             │
│                         (CSP Meta Tag)                       │
│  - script-src 'none' (スクリプト実行完全禁止)                 │
│  - connect-src 'none' (外部接続禁止)                         │
│  - form-action 'none' (フォーム送信禁止)                     │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                   Layer 3: iframe Sandbox                    │
│                    (sandbox attribute)                       │
│  - allow-same-originのみ許可                                 │
│  - allow-scripts禁止                                         │
│  - allow-popups禁止                                          │
│  - allow-top-navigation禁止                                  │
│  - allow-forms禁止                                           │
└──────────────────────────────────────────────────────────────┘
```

## Layer 1: DOMPurify設定

### サニタイズ設定

```typescript
import DOMPurify from "dompurify";

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    // 危険なタグを除去
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "base"],

    // 危険な属性を除去
    FORBID_ATTR: [
      "onclick",
      "ondblclick",
      "onmousedown",
      "onmouseup",
      "onmouseover",
      "onmousemove",
      "onmouseout",
      "onmouseenter",
      "onmouseleave",
      "onkeydown",
      "onkeypress",
      "onkeyup",
      "onload",
      "onerror",
      "onabort",
      "onbeforeunload",
      "onunload",
      "onchange",
      "oninput",
      "onsubmit",
      "onreset",
      "onfocus",
      "onblur",
      "onscroll",
      "onresize",
      "oncopy",
      "oncut",
      "onpaste",
      "ondrag",
      "ondragend",
      "ondragenter",
      "ondragleave",
      "ondragover",
      "ondragstart",
      "ondrop",
      "formaction",
      "xlink:href",
    ],

    // URLスキーム制限
    ALLOWED_URI_REGEXP:
      /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  });
};
```

### 除去対象

| カテゴリ           | 除去対象                                                          |
| ------------------ | ----------------------------------------------------------------- |
| タグ               | `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<base>` |
| マウスイベント     | onclick, ondblclick, onmousedown, onmouseup, etc.                 |
| キーボードイベント | onkeydown, onkeypress, onkeyup                                    |
| ロードイベント     | onload, onerror, onabort                                          |
| フォームイベント   | onchange, oninput, onsubmit, onreset                              |
| その他イベント     | onfocus, onblur, onscroll, onresize                               |
| URLスキーム        | javascript:, data: (画像以外), vbscript:                          |

## Layer 2: Content Security Policy

### CSPディレクティブ

```typescript
export const buildCSPMetaTag = (): string => {
  const directives = [
    "default-src 'self'",
    "script-src 'none'", // スクリプト実行を完全に禁止
    "style-src 'self' 'unsafe-inline'", // インラインスタイルは許可
    "img-src 'self' data: https:", // 画像はdata: URLとHTTPSを許可
    "connect-src 'none'", // XHR/Fetch/WebSocketを禁止
    "frame-ancestors 'none'", // このコンテンツのフレーム埋め込みを禁止
    "form-action 'none'", // フォーム送信先を禁止
    "base-uri 'none'", // base要素を禁止
    "object-src 'none'", // プラグインを禁止
  ];

  return `<meta http-equiv="Content-Security-Policy" content="${directives.join("; ")}">`;
};
```

### ディレクティブ詳細

| ディレクティブ  | 値                     | 目的                           |
| --------------- | ---------------------- | ------------------------------ |
| default-src     | 'self'                 | デフォルトで同一オリジンのみ   |
| script-src      | 'none'                 | **全てのスクリプト実行を禁止** |
| style-src       | 'self' 'unsafe-inline' | インラインスタイルを許可       |
| img-src         | 'self' data: https:    | 画像読み込みを制限             |
| connect-src     | 'none'                 | ネットワークリクエストを禁止   |
| frame-ancestors | 'none'                 | フレーム埋め込みを禁止         |
| form-action     | 'none'                 | フォーム送信を禁止             |
| base-uri        | 'none'                 | base要素を禁止                 |
| object-src      | 'none'                 | プラグインを禁止               |

## Layer 3: iframe Sandbox

### Sandbox属性設定

```typescript
// 許可されるフラグ（ホワイトリスト）
export const DEFAULT_SANDBOX_FLAGS = ["allow-same-origin"];

// 禁止されるフラグ（ブラックリスト）
export const FORBIDDEN_SANDBOX_FLAGS = [
  "allow-scripts", // スクリプト実行
  "allow-popups", // ポップアップ生成
  "allow-top-navigation", // 親フレームへのナビゲーション
  "allow-forms", // フォーム送信
  "allow-modals", // モーダルダイアログ
  "allow-pointer-lock", // ポインターロック
  "allow-downloads", // ダウンロード開始
  "allow-popups-to-escape-sandbox", // sandboxを逃れるポップアップ
  "allow-top-navigation-by-user-activation", // ユーザー操作によるナビゲーション
];

export const filterSandboxFlags = (flags: string[]): string => {
  const safeFlags = flags.filter(
    (flag) => !FORBIDDEN_SANDBOX_FLAGS.includes(flag),
  );
  return safeFlags.join(" ");
};
```

### Sandbox効果

| フラグ                      | 無効化される機能                |
| --------------------------- | ------------------------------- |
| (無効) allow-scripts        | JavaScript実行                  |
| (無効) allow-popups         | window.open(), target="\_blank" |
| (無効) allow-top-navigation | 親フレームへのリダイレクト      |
| (無効) allow-forms          | フォーム送信                    |
| (許可) allow-same-origin    | スタイル適用、CSSアクセス       |

## HTML文書構築

### 完全なHTML文書の生成

```typescript
export const buildFullHtml = (
  sanitizedContent: string,
  cspMetaTag: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${cspMetaTag}
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
      background: transparent;
      color: inherit;
    }
  </style>
</head>
<body>
  ${sanitizedContent}
</body>
</html>
  `.trim();
};
```

## セキュリティテスト

### 必須テストケース

| ID      | テストケース                       | 期待結果                      |
| ------- | ---------------------------------- | ----------------------------- |
| SEC-001 | `<script>alert(1)</script>`        | scriptタグが除去される        |
| SEC-002 | `<img onerror="alert(1)" src="x">` | onerrorが除去される           |
| SEC-003 | `<a href="javascript:alert(1)">`   | hrefが無効化される            |
| SEC-004 | `<form action="http://evil.com">`  | formタグが除去される          |
| SEC-005 | `<iframe src="http://evil.com">`   | iframeタグが除去される        |
| SEC-006 | `<body onload="alert(1)">`         | onloadが除去される            |
| SEC-007 | sandbox="allow-scripts"            | allow-scriptsがフィルタされる |
| SEC-008 | DevToolsでCSP確認                  | script-src 'none'が設定       |

## 監査とログ

### サニタイズ監査

```typescript
// 開発環境でのサニタイズ前後の比較（デバッグ用）
export const sanitizeHTMLWithAudit = (html: string): string => {
  const sanitized = sanitizeHTML(html);

  if (process.env.NODE_ENV === "development" && html !== sanitized) {
    console.warn("[Security] HTML was sanitized:", {
      original: html.substring(0, 200),
      sanitized: sanitized.substring(0, 200),
    });
  }

  return sanitized;
};
```

## セキュリティ考慮事項

### 制限事項

1. **インタラクティブ機能の制限**: JavaScriptが無効化されるため、動的コンテンツは表示できない
2. **フォームの無効化**: ユーザー入力フォームは機能しない
3. **外部リソースの制限**: 外部CSS/JSは読み込めない

### 将来の拡張

| 機能         | セキュリティ考慮                 |
| ------------ | -------------------------------- |
| 限定的JS実行 | Web Workerでのサンドボックス実行 |
| フォーム表示 | 表示のみ（送信は無効化）         |
| 外部リソース | プロキシ経由での読み込み         |

## 結論

3層の防御（DOMPurify + CSP + iframe sandbox）により、AIエージェントが生成したHTMLコンテンツを安全にプレビューできる環境を構築する。各層が独立して機能するため、1つの層が突破されても他の層で防御可能。

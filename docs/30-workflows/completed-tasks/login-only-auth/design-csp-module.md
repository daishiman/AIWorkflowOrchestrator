# CSPモジュール設計書

## 概要

| 項目           | 内容                     |
| -------------- | ------------------------ |
| ドキュメントID | DES-CSP                  |
| 対象タスク     | T-01-1: CSP設計          |
| 作成日         | 2025-12-09               |
| ステータス     | 完了                     |
| 要件定義書     | spec-csp-requirements.md |

## 設計目的

`apps/desktop/src/main/index.ts` に直接記述されているCSP生成ロジックを、テスト可能な独立モジュールとして分離し、保守性とセキュリティを向上させる。

## 現状のコード構造

```typescript
// apps/desktop/src/main/index.ts (L14-L43)
const getCSPPolicy = (isDev: boolean): string => {
  if (isDev) {
    return [...].join("; ");
  }
  return [...].join("; ");
};
```

### 問題点

1. `index.ts` に直接記述されており、単体テストが困難
2. 環境変数（SUPABASE_URL）が参照されていない
3. `frame-ancestors` ディレクティブがない
4. `connect-src` が `https:` で全HTTPSを許可

## ファイル構成

```
apps/desktop/src/main/
├── infrastructure/
│   └── security/
│       ├── index.ts              # エクスポート
│       ├── csp.ts                # CSPモジュール本体
│       └── csp.test.ts           # テストファイル
└── index.ts                      # CSPモジュールを使用
```

## モジュールインターフェース

### 型定義

```typescript
// apps/desktop/src/main/infrastructure/security/csp.ts

/**
 * CSP設定オプション
 */
export interface CSPOptions {
  /** 開発モードかどうか */
  isDev: boolean;
  /** Supabase API URL（環境変数から取得） */
  supabaseUrl?: string;
}

/**
 * CSPディレクティブ
 */
export type CSPDirective =
  | "default-src"
  | "script-src"
  | "style-src"
  | "img-src"
  | "font-src"
  | "connect-src"
  | "object-src"
  | "frame-src"
  | "frame-ancestors"
  | "base-uri"
  | "form-action"
  | "upgrade-insecure-requests";

/**
 * CSPディレクティブマップ
 */
export type CSPDirectiveMap = Partial<Record<CSPDirective, string[]>>;

/**
 * CSP生成結果
 */
export interface CSPResult {
  /** CSPポリシー文字列 */
  policy: string;
  /** 使用されたディレクティブ */
  directives: CSPDirectiveMap;
}
```

### 関数シグネチャ

```typescript
/**
 * 本番環境用CSPディレクティブを生成
 * @param supabaseUrl - Supabase API URL
 * @returns CSPディレクティブマップ
 */
export function getProductionDirectives(supabaseUrl?: string): CSPDirectiveMap;

/**
 * 開発環境用CSPディレクティブを生成
 * @returns CSPディレクティブマップ
 */
export function getDevelopmentDirectives(): CSPDirectiveMap;

/**
 * CSPディレクティブマップをポリシー文字列に変換
 * @param directives - CSPディレクティブマップ
 * @returns CSPポリシー文字列
 */
export function buildCSPString(directives: CSPDirectiveMap): string;

/**
 * CSPポリシーを生成
 * @param options - CSP設定オプション
 * @returns CSP生成結果
 */
export function generateCSP(options: CSPOptions): CSPResult;
```

## 実装詳細

### 本番環境ディレクティブ

```typescript
export function getProductionDirectives(supabaseUrl?: string): CSPDirectiveMap {
  const connectSrcValues = ["'self'"];

  // Supabase URLを追加
  if (supabaseUrl) {
    try {
      const url = new URL(supabaseUrl);
      connectSrcValues.push(url.origin);
      // ワイルドカードでsupabase.coのサブドメインも許可
      connectSrcValues.push("https://*.supabase.co");
    } catch {
      console.warn("Invalid SUPABASE_URL:", supabaseUrl);
    }
  }

  return {
    "default-src": ["'self'"],
    "script-src": ["'self'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'"],
    "connect-src": connectSrcValues,
    "object-src": ["'none'"],
    "frame-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "upgrade-insecure-requests": [],
  };
}
```

### 開発環境ディレクティブ

```typescript
export function getDevelopmentDirectives(): CSPDirectiveMap {
  return {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", "https:", "ws:", "wss:"],
    "object-src": ["'none'"],
    "frame-src": ["'none'"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
  };
}
```

### CSP文字列ビルダー

```typescript
export function buildCSPString(directives: CSPDirectiveMap): string {
  return Object.entries(directives)
    .filter(([, values]) => values !== undefined)
    .map(([directive, values]) => {
      if (values.length === 0) {
        // upgrade-insecure-requests のような値なしディレクティブ
        return directive;
      }
      return `${directive} ${values.join(" ")}`;
    })
    .join("; ");
}
```

### メイン生成関数

```typescript
export function generateCSP(options: CSPOptions): CSPResult {
  const directives = options.isDev
    ? getDevelopmentDirectives()
    : getProductionDirectives(options.supabaseUrl);

  return {
    policy: buildCSPString(directives),
    directives,
  };
}
```

## 環境変数

| 変数名       | 必須 | 説明             | 使用箇所                     |
| ------------ | ---- | ---------------- | ---------------------------- |
| SUPABASE_URL | 推奨 | Supabase API URL | `connect-src` ディレクティブ |

### 取得方法

```typescript
// apps/desktop/src/main/index.ts での使用
import { generateCSP } from "./infrastructure/security";

const cspResult = generateCSP({
  isDev: is.dev,
  supabaseUrl: process.env.SUPABASE_URL,
});
```

## エクスポート構造

```typescript
// apps/desktop/src/main/infrastructure/security/index.ts
export {
  generateCSP,
  getProductionDirectives,
  getDevelopmentDirectives,
  buildCSPString,
  type CSPOptions,
  type CSPDirective,
  type CSPDirectiveMap,
  type CSPResult,
} from "./csp.js";
```

## index.ts への統合

### Before

```typescript
// apps/desktop/src/main/index.ts
const getCSPPolicy = (isDev: boolean): string => {
  // ... 直接記述
};

session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      "Content-Security-Policy": [getCSPPolicy(is.dev)],
    },
  });
});
```

### After

```typescript
// apps/desktop/src/main/index.ts
import { generateCSP } from "./infrastructure/security";

function createWindow(): BrowserWindow {
  // ... 既存コード ...

  // CSPヘッダーを設定
  const { policy } = generateCSP({
    isDev: is.dev,
    supabaseUrl: process.env.SUPABASE_URL,
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [policy],
      },
    });
  });

  // ... 既存コード ...
}
```

## テスト戦略

### テストケース

| テストID | シナリオ                          | 期待結果                            |
| -------- | --------------------------------- | ----------------------------------- |
| CSP-U01  | 本番環境でCSP生成                 | `unsafe-eval` が含まれない          |
| CSP-U02  | 開発環境でCSP生成                 | `unsafe-eval` が含まれる            |
| CSP-U03  | SUPABASE_URL指定時                | connect-srcにSupabase URLが含まれる |
| CSP-U04  | SUPABASE_URL未指定時              | connect-srcは`'self'`のみ           |
| CSP-U05  | frame-ancestorsの確認             | `'none'` が設定されている           |
| CSP-U06  | upgrade-insecure-requests（本番） | ディレクティブが含まれる            |
| CSP-U07  | 不正なSUPABASE_URL                | エラーにならず、URLは含まれない     |

### テストコード例

```typescript
// apps/desktop/src/main/infrastructure/security/csp.test.ts
import { describe, it, expect } from "vitest";
import {
  generateCSP,
  getProductionDirectives,
  getDevelopmentDirectives,
  buildCSPString,
} from "./csp";

describe("CSP Module", () => {
  describe("generateCSP", () => {
    it("本番環境ではunsafe-evalを含まない", () => {
      const result = generateCSP({ isDev: false });
      expect(result.policy).not.toContain("unsafe-eval");
    });

    it("開発環境ではunsafe-evalを含む", () => {
      const result = generateCSP({ isDev: true });
      expect(result.policy).toContain("unsafe-eval");
    });

    it("SUPABASE_URL指定時はconnect-srcに含まれる", () => {
      const result = generateCSP({
        isDev: false,
        supabaseUrl: "https://abc123.supabase.co",
      });
      expect(result.policy).toContain("https://abc123.supabase.co");
      expect(result.policy).toContain("https://*.supabase.co");
    });
  });

  describe("getProductionDirectives", () => {
    it("frame-ancestorsが'none'である", () => {
      const directives = getProductionDirectives();
      expect(directives["frame-ancestors"]).toEqual(["'none'"]);
    });

    it("upgrade-insecure-requestsが含まれる", () => {
      const directives = getProductionDirectives();
      expect(directives["upgrade-insecure-requests"]).toEqual([]);
    });
  });

  describe("buildCSPString", () => {
    it("ディレクティブをセミコロンで連結する", () => {
      const result = buildCSPString({
        "default-src": ["'self'"],
        "script-src": ["'self'"],
      });
      expect(result).toBe("default-src 'self'; script-src 'self'");
    });

    it("値なしディレクティブを正しく処理する", () => {
      const result = buildCSPString({
        "upgrade-insecure-requests": [],
      });
      expect(result).toBe("upgrade-insecure-requests");
    });
  });
});
```

## セキュリティ考慮事項

### 緩和できないリスク

| リスク                  | 理由                         | 対策                    |
| ----------------------- | ---------------------------- | ----------------------- |
| style-src unsafe-inline | Tailwind CSS/shadcn/uiが必要 | 将来的にnonce対応を検討 |
| img-src https:          | OAuth アバター画像取得に必要 | 許容範囲として受け入れ  |

### 追加されるセキュリティ

| 機能                      | 効果                               |
| ------------------------- | ---------------------------------- |
| connect-src 制限          | Supabase以外への外部通信をブロック |
| frame-ancestors 'none'    | クリックジャッキング攻撃を防止     |
| upgrade-insecure-requests | HTTPリクエストを自動でHTTPSに      |

## 完了条件

- [x] モジュールのファイル構成が定義されている
- [x] 関数シグネチャが定義されている
- [x] 環境変数の取り扱いが設計されている
- [x] エクスポート構造が設計されている

## 関連ドキュメント

- `docs/30-workflows/login-only-auth/spec-csp-requirements.md` - CSP要件定義
- `apps/desktop/src/main/index.ts` - 現在のCSP実装
- [Electron Security: CSP](https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy)

# MSW使用ガイド

## 概要

MSW (Mock Service Worker) を使用した外部APIモックの設定と使用方法を説明します。

---

## 自動セットアップ

MSWはテスト実行時に自動的に起動します。`src/test/setup.ts` で以下が設定済み:

```typescript
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## 対応API

### Supabase Auth

| エンドポイント        | モック動作         |
| --------------------- | ------------------ |
| POST /auth/v1/token   | 認証トークン発行   |
| POST /auth/v1/signup  | ユーザー登録       |
| POST /auth/v1/logout  | ログアウト         |
| GET /auth/v1/user     | ユーザー情報取得   |
| POST /auth/v1/recover | パスワードリセット |

### Anthropic API

| エンドポイント    | モック動作                            |
| ----------------- | ------------------------------------- |
| POST /v1/messages | メッセージ生成（通常/ストリーミング） |

---

## モックハンドラー追加方法

### 1. handlers.tsにハンドラー追加

```typescript
// apps/desktop/src/test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

const myHandlers = [
  http.get("https://api.example.com/data", () => {
    return HttpResponse.json({ key: "value" });
  }),
];

export const handlers = [
  ...supabaseAuthHandlers,
  ...anthropicHandlers,
  ...myHandlers, // 追加
];
```

### 2. テスト内でハンドラー上書き

```typescript
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

test("エラー時の動作", async () => {
  server.use(
    http.get("https://api.example.com/data", () => {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }),
  );

  // テストコード
});
```

---

## エラーレスポンスのモック

### 認証エラー

```typescript
// invalid@example.com でログインするとエラー
const body = await request.json();
if (body.email === "invalid@example.com") {
  return HttpResponse.json({ error: "invalid_grant" }, { status: 400 });
}
```

### API認証エラー

```typescript
// invalid-key でAPIを呼び出すとエラー
const apiKey = request.headers.get("x-api-key");
if (apiKey === "invalid-key") {
  return HttpResponse.json(
    { type: "error", error: { type: "authentication_error" } },
    { status: 401 },
  );
}
```

---

## ストリーミングレスポンス

```typescript
http.post("https://api.anthropic.com/v1/messages", async ({ request }) => {
  const body = await request.json();

  if (body.stream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const events = [
          'event: message_start\ndata: {...}\n\n',
          'event: content_block_delta\ndata: {...}\n\n',
          'event: message_stop\ndata: {...}\n\n',
        ];
        events.forEach(e => controller.enqueue(encoder.encode(e)));
        controller.close();
      },
    });
    return new HttpResponse(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  }

  return HttpResponse.json({ ... });
});
```

---

## ファイル構成

```
apps/desktop/src/test/
├── mocks/
│   ├── handlers.ts    # APIハンドラー定義
│   └── server.ts      # MSWサーバー設定
├── setup.ts           # テストセットアップ（MSW統合）
├── utils.tsx          # カスタムレンダー関数
├── test-helpers.ts    # テストヘルパー
└── factories.ts       # テストデータファクトリー
```

---

## 注意事項

- `onUnhandledRequest: "warn"` により、未定義のAPIアクセスは警告を出力
- `afterEach` でハンドラーがリセットされるため、テスト間の影響なし
- ブラウザ環境（E2E）では使用不可（Node.js環境専用）

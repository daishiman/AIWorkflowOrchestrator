# CSRF（クロスサイトリクエストフォージェリ）防止策

## CSRF攻撃の仕組み

### 攻撃シナリオ

```
1. ユーザーがbank.comにログイン中（セッションCookie保持）
2. 攻撃者のサイト（evil.com）に訪問
3. evil.comに隠しフォーム:
   <form action="https://bank.com/transfer" method="POST">
     <input name="to" value="attacker_account">
     <input name="amount" value="1000000">
   </form>
   <script>document.forms[0].submit();</script>
4. ブラウザが自動的にbank.comのCookieを送信
5. 攻撃成功: ユーザーの意図しない送金が実行される
```

## 多層CSRF防御

### Layer 1: SameSite Cookie属性

**Strict（最高保護）**:

```typescript
sameSite: "strict";
```

- クロスサイトリクエストでCookie一切送信なし
- CSRF完全防止
- デメリット: 外部リンクからのアクセスも未認証扱い

**Lax（推奨）**:

```typescript
sameSite: "lax";
```

- トップレベルナビゲーション（GET）では送信
- フォーム送信（POST）では送信なし
- バランス型

**効果**:

```html
<!-- evil.comからのPOSTリクエスト -->
<form action="https://bank.com/transfer" method="POST">
  <!-- SameSite=Lax/StrictならCookie送信されない → CSRF失敗 -->
</form>
```

### Layer 2: CSRFトークン検証

**実装パターン**:

```typescript
// トークン生成（サーバー側）
export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString("base64url");

  // セッションに保存
  cookies().set("csrf_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return token;
}

// トークン検証（ミドルウェア）
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  // 読み取り専用操作はスキップ
  if (request.method === "GET" || request.method === "HEAD") {
    return true;
  }

  const headerToken = request.headers.get("X-CSRF-Token");
  const cookieToken = cookies().get("csrf_token")?.value;

  return headerToken === cookieToken;
}
```

**クライアント側実装**:

```typescript
// CSRFトークンを取得
const csrfToken = await fetch("/api/csrf-token").then((r) => r.text());

// APIリクエストに含める
await fetch("/api/transfer", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CSRF-Token": csrfToken,
  },
  body: JSON.stringify({ to: "account", amount: 1000 }),
});
```

### Layer 3: Origin/Referer検証

**実装**:

```typescript
export function validateRequestOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");

  const allowedOrigins = ["https://yourapp.com", "https://www.yourapp.com"];

  // Originヘッダーチェック
  if (origin && !allowedOrigins.includes(origin)) {
    return false;
  }

  // Refererヘッダーチェック（Originがない場合）
  if (!origin && referer) {
    const refererOrigin = new URL(referer).origin;
    if (!allowedOrigins.includes(refererOrigin)) {
      return false;
    }
  }

  return true;
}
```

## 状態変更操作の識別

### 安全な操作（CSRF保護不要）

- **GET**: データ読み取りのみ
- **HEAD**: メタデータ取得のみ
- **OPTIONS**: プリフライトリクエスト

**原則**: べき等な読み取り専用操作はCSRF保護不要

### 危険な操作（CSRF保護必須）

- **POST**: リソース作成
- **PUT**: リソース更新
- **DELETE**: リソース削除
- **PATCH**: リソース部分更新

**原則**: 状態変更を伴う操作はすべてCSRF保護必須

## Next.jsでの実装

### ミドルウェアでの統合

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // CSRF検証（状態変更操作のみ）
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    if (!(await verifyCsrfToken(request))) {
      return new NextResponse("CSRF token invalid", { status: 403 });
    }
  }

  return NextResponse.next();
}
```

### API Routeでの統合

```typescript
export async function POST(request: Request) {
  // CSRFトークン検証
  if (!(await verifyCsrfToken(request))) {
    return new Response("Forbidden", { status: 403 });
  }

  // 処理続行
  const body = await request.json();
  // ...
}
```

## ダブルサブミット Cookie パターン

**概要**: CSRFトークンをCookieとヘッダー両方で送信

**実装**:

```typescript
// トークン生成
const csrfToken = generateSecureRandomString(32);

// Cookieに保存（httpOnly=false、JavaScriptで読み取り可能に）
cookies().set("csrf_token", csrfToken, {
  httpOnly: false, // クライアント側で読み取る必要がある
  secure: true,
  sameSite: "lax",
});

// クライアント側: Cookieから読み取りヘッダーに含める
const csrfToken = document.cookie
  .split("; ")
  .find((row) => row.startsWith("csrf_token="))
  ?.split("=")[1];

await fetch("/api/endpoint", {
  method: "POST",
  headers: {
    "X-CSRF-Token": csrfToken,
  },
});

// サーバー側: CookieとHeaderを比較
const cookieToken = cookies().get("csrf_token")?.value;
const headerToken = request.headers.get("X-CSRF-Token");
if (cookieToken !== headerToken) {
  throw new Error("CSRF token mismatch");
}
```

## CSRF防御の評価

| 対策               | 保護レベル | 実装難易度 | ユーザビリティ影響 | 推奨度               |
| ------------------ | ---------- | ---------- | ------------------ | -------------------- |
| SameSite=Strict    | ⭐⭐⭐⭐⭐ | ⭐         | ⚠️ 外部リンク制約  | 高セキュリティアプリ |
| SameSite=Lax       | ⭐⭐⭐⭐   | ⭐         | ✅ なし            | 一般的アプリ（推奨） |
| CSRFトークン       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | ✅ なし            | 追加保護層として     |
| Origin/Referer検証 | ⭐⭐⭐     | ⭐⭐       | ✅ なし            | 補完的対策           |

## まとめ

**CSRF防御の鉄則**:

1. **SameSite Cookie**: 基本防御として必須（Lax/Strict）
2. **CSRFトークン**: 高リスク操作への追加保護
3. **Origin検証**: 補完的な防御層
4. **状態変更操作**: POST/PUT/DELETEすべてを保護

**推奨構成**:

- 一般的Webアプリ: SameSite=Lax
- 高セキュリティアプリ: SameSite=Strict + CSRFトークン
- API（クロスドメイン）: CSRFトークン + Origin検証

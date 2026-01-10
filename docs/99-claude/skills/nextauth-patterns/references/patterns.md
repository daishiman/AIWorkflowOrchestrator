# NextAuth.js - 実装パターン

## 概要

NextAuth.js v5の実装パターン。
アダプター統合、マルチプロバイダー、保護されたAPI、セキュリティ強化を網羅する。

## データベースアダプター

### Drizzle Adapter

```typescript
// lib/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

// auth.ts
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";

export const { handlers, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [Google, GitHub],
  session: { strategy: "database" },
});
```

### Prisma Adapter

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google, GitHub],
});
```

## マルチプロバイダー統合

### アカウントリンク

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // 既存ユーザーにアカウントをリンク
    const existingUser = await db.users.findOne({ email: user.email });

    if (existingUser) {
      await db.accounts.create({
        userId: existingUser.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
      });
      return true;
    }

    return true;
  },
}
```

### プロバイダー切り替えUI

```typescript
// components/ProviderButtons.tsx
"use client";

import { signIn } from "next-auth/react";

export function ProviderButtons() {
  return (
    <div className="space-y-2">
      <button onClick={() => signIn("google")}>Googleでログイン</button>
      <button onClick={() => signIn("github")}>GitHubでログイン</button>
    </div>
  );
}
```

## 保護されたAPI

### Route Handler保護

```typescript
// app/api/protected/route.ts
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: "Protected data" });
}
```

### Middleware保護

```typescript
// middleware.ts
import { auth } from "@/auth";

export default auth((req) => {
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard");
  const isLoggedIn = !!req.auth;

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
```

### Role-based Access Control

```typescript
// lib/auth.ts
export async function requireRole(role: string) {
  const session = await auth();

  if (!session || session.user.role !== role) {
    throw new Error("Forbidden");
  }

  return session;
}

// app/admin/page.tsx
import { requireRole } from "@/lib/auth";

export default async function AdminPage() {
  const session = await requireRole("ADMIN");

  return <div>Admin Dashboard for {session.user.name}</div>;
}
```

## セッション管理

### セッション更新

```typescript
// components/UpdateRole.tsx
"use client";

import { useSession } from "next-auth/react";

export function UpdateRole() {
  const { data: session, update } = useSession();

  const handleRoleChange = async (newRole: string) => {
    // サーバーでロール更新
    await fetch("/api/user/role", {
      method: "POST",
      body: JSON.stringify({ role: newRole }),
    });

    // セッション更新をトリガー
    await update();
  };

  return (
    <button onClick={() => handleRoleChange("ADMIN")}>Adminに昇格</button>
  );
}
```

### セッション有効期限

```typescript
export const { handlers, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
    updateAge: 24 * 60 * 60, // 24時間ごとに更新
  },
});
```

## カスタム認証ページ

### ログインページ

```typescript
// app/login/page.tsx
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div>
      <h1>ログイン</h1>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/dashboard" });
        }}
      >
        <button type="submit">Googleでログイン</button>
      </form>
    </div>
  );
}
```

### エラーページ

```typescript
// app/auth/error/page.tsx
export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessages: Record<string, string> = {
    OAuthSignin: "OAuth認証の開始に失敗しました",
    OAuthCallback: "OAuth認証コールバックでエラーが発生しました",
    AccessDenied: "アクセスが拒否されました",
    Default: "認証エラーが発生しました",
  };

  const error = searchParams.error || "Default";

  return (
    <div>
      <h1>認証エラー</h1>
      <p>{errorMessages[error] || errorMessages.Default}</p>
    </div>
  );
}
```

## セキュリティ強化

### CSRF保護

```typescript
export const { handlers, auth } = NextAuth({
  trustHost: true,
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});
```

### Rate Limiting（アカウント作成）

```typescript
callbacks: {
  async signIn({ user, account }) {
    // 新規ユーザー作成のレート制限
    const recentSignups = await db.users.count({
      where: {
        createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (recentSignups > 100) {
      return false; // 1時間あたり100件まで
    }

    return true;
  },
}
```

### 監査ログ

```typescript
events: {
  async signIn({ user, account }) {
    await db.auditLogs.create({
      action: "SIGN_IN",
      userId: user.id,
      provider: account?.provider,
      timestamp: new Date(),
      ipAddress: headers().get("x-forwarded-for"),
    });
  },
  async signOut({ token }) {
    await db.auditLogs.create({
      action: "SIGN_OUT",
      userId: token.userId,
      timestamp: new Date(),
    });
  },
}
```

## アンチパターン

| パターン                 | 問題               | 解決策                 |
| ------------------------ | ------------------ | ---------------------- |
| シークレットハードコード | セキュリティリスク | 環境変数使用           |
| any型セッション          | 型安全性欠如       | next-auth.d.ts定義     |
| コールバック内で重処理   | レスポンス遅延     | 非同期処理・キャッシュ |
| スコープ過剰要求         | ユーザー不信感     | 最小限スコープ         |
| セッション期限未設定     | セキュリティリスク | maxAge明示設定         |

## チェックリスト

### 設計時

- [ ] セッション戦略（JWT/Database）を選択したか
- [ ] 必要なOAuthスコープを特定したか
- [ ] Role-based制御の要件を整理したか

### 実装時

- [ ] 環境変数を適切に設定したか
- [ ] next-auth.d.tsで型を定義したか
- [ ] コールバックを実装したか
- [ ] 保護ルートを設定したか

### テスト時

- [ ] 各プロバイダーでログインテストしたか
- [ ] セッションデータが正しく取得できるか
- [ ] Role-based制御が機能するか

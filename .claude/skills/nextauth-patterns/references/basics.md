# NextAuth.js - 基礎概念

## 概要

NextAuth.js v5はNext.js向けの認証ライブラリ。
OAuth 2.0プロバイダー統合、セッション管理、データベースアダプターを提供する。

## 核心概念

### 認証フロー

```
1. ユーザーがログインボタンをクリック
   └→ /api/auth/signin にリダイレクト

2. プロバイダー選択
   └→ OAuth認可エンドポイントにリダイレクト

3. プロバイダーで認証
   └→ コールバックURLにリダイレクト

4. NextAuth.jsがトークンを処理
   ├→ jwt() コールバック実行
   └→ session() コールバック実行

5. セッション確立
   └→ アプリケーションにリダイレクト
```

### 基本構成ファイル

```typescript
// auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
});
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

### セッション戦略

| 戦略     | 格納場所   | 利点                     | 欠点                   |
| -------- | ---------- | ------------------------ | ---------------------- |
| JWT      | Cookie     | スケーラブル、DB不要     | 即時無効化が困難       |
| Database | DB + Token | 即時無効化可能、監査可能 | DBアクセス必要、遅延増 |

```typescript
// JWT戦略（デフォルト）
export const { handlers, auth } = NextAuth({
  session: { strategy: "jwt" },
});

// Database戦略
export const { handlers, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "database" },
});
```

## プロバイダー設定

### Google OAuth 2.0

```typescript
Google({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid email profile",
      prompt: "select_account",
      access_type: "offline", // リフレッシュトークン取得
    },
  },
});
```

### GitHub OAuth 2.0

```typescript
GitHub({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "read:user user:email",
    },
  },
});
```

### Credentials（カスタムログイン）

```typescript
Credentials({
  name: "Email and Password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const user = await db.users.findOne({ email: credentials.email });
    if (!user || !(await verifyPassword(credentials.password, user.hash))) {
      return null;
    }
    return { id: user.id, email: user.email, role: user.role };
  },
});
```

## コールバック

### jwt() コールバック

JWTトークン作成・更新時に呼び出される。

```typescript
callbacks: {
  async jwt({ token, user, trigger }) {
    // 初回ログイン時にユーザー情報を追加
    if (user) {
      token.userId = user.id;
      token.role = user.role;
    }
    // セッション更新時
    if (trigger === "update") {
      const updatedUser = await getUser(token.userId);
      token.role = updatedUser.role;
    }
    return token;
  },
}
```

### session() コールバック

セッション取得時に呼び出される。

```typescript
callbacks: {
  async session({ session, token }) {
    // JWTからセッションにデータを転送
    session.user.id = token.userId;
    session.user.role = token.role;
    return session;
  },
}
```

### signIn() コールバック

ログイン許可/拒否を制御。

```typescript
callbacks: {
  async signIn({ user, account }) {
    // 特定ドメインのみ許可
    if (user.email?.endsWith("@company.com")) {
      return true;
    }
    return false;
  },
}
```

## 型安全性

### next-auth.d.ts

```typescript
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER" | "GUEST";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "USER" | "GUEST";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: "ADMIN" | "USER" | "GUEST";
  }
}
```

## 環境変数

```env
# 必須
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key  # openssl rand -base64 32

# Google
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## 判断基準

### スキル適用タイミング

- NextAuth.js初期セットアップ時
- OAuth 2.0プロバイダー追加時
- セッション戦略（JWT/Database）の実装時
- コールバックカスタマイズ時
- Role-basedアクセス制御実装時

### 前提条件

- Next.js 15以上（App Router推奨）
- Node.js 18以上
- OAuth プロバイダーの認証情報

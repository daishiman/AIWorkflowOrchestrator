# NextAuth.js Provider Configurations

## Google OAuth 2.0

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

**環境変数**:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

## GitHub OAuth 2.0

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

**環境変数**:

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Discord OAuth 2.0

```typescript
Discord({
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "identify email",
    },
  },
});
```

## Credentials Provider（カスタムログイン）

```typescript
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth";

Credentials({
  name: "Email and Password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const user = await db.users.findOne({ email: credentials.email });

    if (
      !user ||
      !(await verifyPassword(credentials.password, user.hashedPassword))
    ) {
      return null;
    }

    return { id: user.id, email: user.email, role: user.role };
  },
});
```

## 型安全性の確保

**next-auth.d.ts**:

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

## まとめ

NextAuth.js実装の鉄則:

1. プロバイダー正しく設定
2. セッション戦略を要件に合わせる
3. セッションにロール情報統合
4. 型安全性を確保
5. 環境変数で機密情報管理

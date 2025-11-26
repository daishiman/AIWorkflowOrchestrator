# NextAuth.js Session Callbacks Guide

## コールバックの役割

NextAuth.jsは以下のコールバックでセッション管理をカスタマイズできます:
- `jwt()`: JWTトークンにデータを追加
- `session()`: セッションオブジェクトにデータを追加
- `signIn()`: ログイン時の追加検証

## jwt() コールバック

### 基本実装（ロール追加）

```typescript
async jwt({ token, user, trigger, session }) {
  // 初回ログイン時: userオブジェクトが渡される
  if (user) {
    token.userId = user.id;
    token.role = user.role || 'USER';
  }

  // セッション更新時: trigger='update'
  if (trigger === 'update' && session) {
    // 動的にロール変更を反映
    const updatedUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, token.userId),
    });
    if (updatedUser) {
      token.role = updatedUser.role;
    }
  }

  return token;
}
```

### 高度な実装（権限情報追加）

```typescript
async jwt({ token, user, account }) {
  if (user) {
    token.userId = user.id;
    token.role = user.role;

    // 権限情報を追加
    const permissions = await getUserPermissions(user.id);
    token.permissions = permissions;
  }

  // アクセストークンをJWTに含める（OAuth使用時）
  if (account) {
    token.accessToken = account.access_token;
    token.refreshToken = account.refresh_token;
  }

  return token;
}
```

## session() コールバック

### 基本実装

```typescript
async session({ session, token }) {
  if (token) {
    session.user.id = token.userId;
    session.user.role = token.role;
  }
  return session;
}
```

### 高度な実装（クライアント側で使用する情報）

```typescript
async session({ session, token, user }) {
  // JWT戦略の場合
  if (token) {
    session.user.id = token.userId;
    session.user.role = token.role;
    session.user.permissions = token.permissions;
  }

  // Database戦略の場合
  if (user) {
    session.user.id = user.id;
    session.user.role = user.role;
  }

  return session;
}
```

## signIn() コールバック

### 基本実装（追加検証）

```typescript
async signIn({ user, account, profile }) {
  // メール認証済みチェック
  if (!user.emailVerified) {
    return false; // ログイン拒否
  }

  // 特定ドメインのみ許可
  if (user.email && !user.email.endsWith('@example.com')) {
    return false;
  }

  return true; // ログイン許可
}
```

## 型安全性の確保

### next-auth.d.ts

```typescript
import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'USER' | 'GUEST';
      permissions?: string[];
    } & DefaultSession['user'];
  }

  interface User {
    role: 'ADMIN' | 'USER' | 'GUEST';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: 'ADMIN' | 'USER' | 'GUEST';
    permissions?: string[];
  }
}
```

## ベストプラクティス

1. **JWT戦略**: セッション情報を最小限に（IDとロールのみ）
2. **Database戦略**: セッション更新時に最新データをロード
3. **型安全性**: next-auth.d.tsで型拡張必須
4. **セキュリティ**: 機密情報はJWTに含めない（クライアント側で見える）

## まとめ

NextAuth.jsのコールバックを適切に実装することで:
- セッションにロール・権限情報を統合
- 動的な権限変更に対応
- 型安全性を確保
- セキュアな認証フローを実現

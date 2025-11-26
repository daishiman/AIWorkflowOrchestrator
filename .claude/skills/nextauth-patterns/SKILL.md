---
name: nextauth-patterns
description: |
  NextAuth.js v5の設定とカスタマイズパターン。
  プロバイダー設定、アダプター統合、セッション戦略、
  コールバックカスタマイズ、型安全性の確保を提供。

  使用タイミング:
  - NextAuth.jsの初期設定時
  - OAuth 2.0プロバイダー統合時
  - セッション戦略（JWT/Database）の実装時
  - カスタムページ・コールバックの実装時
  - Drizzleアダプター統合時

  関連スキル:
  - `.claude/skills/oauth2-flows/SKILL.md` - OAuth 2.0基礎
  - `.claude/skills/session-management/SKILL.md` - セッション戦略
  - `.claude/skills/rbac-implementation/SKILL.md` - セッションへのロール統合

  Use when implementing NextAuth.js, configuring authentication providers,
  or customizing authentication flows in Next.js applications.
version: 1.0.0
---

# NextAuth.js Patterns

## スキル概要

**コアドメイン**:
- NextAuth.js v5設定
- プロバイダー設定
- アダプター統合
- セッションコールバック

## 基本設定

### auth.ts設定

```typescript
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/infrastructure/database';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt', // or 'database'
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});
```

### Route Handler設定

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

## プロバイダー設定

### Google OAuth 2.0

```typescript
import Google from 'next-auth/providers/google';

Google({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'openid email profile',
      prompt: 'select_account', // アカウント選択強制
    },
  },
})
```

### GitHub OAuth 2.0

```typescript
import GitHub from 'next-auth/providers/github';

GitHub({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: 'read:user user:email',
    },
  },
})
```

## アダプター統合

### Drizzle Adapter

```typescript
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/infrastructure/database';

export const { handlers, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  // 必須テーブル: users, accounts, sessions, verificationTokens
});
```

## セッションコールバック

### ロール情報の追加

```typescript
callbacks: {
  async jwt({ token, user, trigger }) {
    // 初回ログイン時
    if (user) {
      token.role = user.role;
      token.userId = user.id;
    }

    // セッション更新時
    if (trigger === 'update') {
      const updatedUser = await db.users.findOne({ id: token.userId });
      token.role = updatedUser.role;
    }

    return token;
  },

  async session({ session, token }) {
    session.user.id = token.userId;
    session.user.role = token.role;
    return session;
  },
}
```

## リソース参照

```bash
cat .claude/skills/nextauth-patterns/resources/provider-configurations.md
cat .claude/skills/nextauth-patterns/resources/adapter-integration.md
```

## テンプレート参照

```bash
cat .claude/skills/nextauth-patterns/templates/nextauth-config-template.ts
```

## スクリプト実行

```bash
node .claude/skills/nextauth-patterns/scripts/validate-nextauth-config.mjs auth.ts
```

## 判断基準

- [ ] プロバイダーは正しく設定されているか？
- [ ] セッション戦略は非機能要件と整合しているか？
- [ ] セッションにロール情報が含まれているか？
- [ ] 型安全性は保証されているか？

## ベストプラクティス

1. **JWT戦略**: スケーラブル、ステートレス
2. **Database戦略**: セキュア、即座無効化可能
3. **型拡張**: next-auth.d.tsで型定義拡張
4. **環境変数**: シークレット管理

## バージョン履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版リリース - NextAuth.js v5パターン |

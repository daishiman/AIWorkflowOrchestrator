/**
 * NextAuth.js v5 Configuration Template
 */

import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/infrastructure/database';

// ========================================
// 型拡張
// ========================================

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'USER' | 'GUEST';
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
  }
}

// ========================================
// NextAuth設定
// ========================================

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'select_account',
        },
      },
    }),

    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],

  session: {
    strategy: 'jwt', // or 'database'
    maxAge: 30 * 24 * 60 * 60, // 30日
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 初回ログイン時
      if (user) {
        token.userId = user.id;
        token.role = user.role || 'USER';
      }

      // セッション更新時（動的権限変更対応）
      if (trigger === 'update' && session) {
        const updatedUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, token.userId),
        });

        if (updatedUser) {
          token.role = updatedUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.role = token.role;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // カスタム認証ロジック（必要に応じて）
      return true; // true = 許可, false = 拒否
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.id}`);
    },
    async signOut({ session }) {
      console.log(`User signed out: ${session?.user?.id}`);
    },
  },
});

/**
 * Database-based Session Implementation Template
 *
 * このテンプレートは、データベースベースの
 * ステートフルセッション管理の実装パターンを提供します。
 *
 * 特徴:
 * - 即座無効化可能
 * - 動的権限変更に対応
 * - 詳細なセッション追跡
 *
 * 使用場面:
 * - 高セキュリティ要求アプリケーション
 * - 即座ログアウトが必須
 * - 詳細なセッション管理が必要
 */

import { db } from '@/infrastructure/database';
import { sessions } from '@/infrastructure/database/schema';
import { eq, and, gt } from 'drizzle-orm';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// ========================================
// 型定義
// ========================================

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
  active: boolean;
}

interface SessionData {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

// ========================================
// セッション管理
// ========================================

/**
 * セッション作成
 */
export async function createSession(data: SessionData): Promise<Session> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30日

  const [session] = await db.insert(sessions).values({
    id: sessionId,
    userId: data.userId,
    expiresAt,
    createdAt: new Date(),
    lastActivityAt: new Date(),
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    active: true,
  }).returning();

  // Session IDをCookieに保存
  cookies().set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });

  return session;
}

/**
 * セッション取得
 */
export async function getSession(): Promise<Session | null> {
  const sessionId = cookies().get('session_id')?.value;

  if (!sessionId) {
    return null;
  }

  const [session] = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.active, true),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!session) {
    // 無効なセッション → Cookieクリア
    cookies().delete('session_id');
    return null;
  }

  // 最終アクティビティ時刻を更新
  await updateSessionActivity(sessionId);

  return session;
}

/**
 * セッション削除（ログアウト）
 */
export async function deleteSession(): Promise<void> {
  const sessionId = cookies().get('session_id')?.value;

  if (sessionId) {
    // セッションを無効化
    await db
      .update(sessions)
      .set({ active: false, revokedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  }

  // Cookieクリア
  cookies().delete('session_id');
}

/**
 * 全セッション削除（セキュリティインシデント時）
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ active: false, revokedAt: new Date() })
    .where(and(
      eq(sessions.userId, userId),
      eq(sessions.active, true)
    ));
}

// ========================================
// セッション検証
// ========================================

/**
 * セッションコンテキスト検証（セッションハイジャック対策）
 */
export async function validateSessionContext(
  session: Session,
  request: Request
): Promise<boolean> {
  const currentIp = getClientIP(request);
  const currentUA = request.headers.get('User-Agent');

  // IP変更検出
  if (session.ipAddress && session.ipAddress !== currentIp) {
    logSecurityEvent('IP_ADDRESS_CHANGE', {
      sessionId: session.id,
      userId: session.userId,
      oldIp: session.ipAddress,
      newIp: currentIp,
    });

    // オプション: 追加検証要求またはセッション無効化
    return false;
  }

  // User-Agent変更検出
  if (session.userAgent && session.userAgent !== currentUA) {
    logSecurityEvent('USER_AGENT_CHANGE', {
      sessionId: session.id,
      userId: session.userId,
      oldUA: session.userAgent,
      newUA: currentUA,
    });

    return false;
  }

  return true;
}

/**
 * セッションタイムアウトチェック
 */
export function isSessionExpired(session: Session): boolean {
  const now = Date.now();
  const idle = now - session.lastActivityAt.getTime();
  const absolute = now - session.createdAt.getTime();

  const IDLE_TIMEOUT = 30 * 60 * 1000; // 30分
  const ABSOLUTE_TIMEOUT = 8 * 60 * 60 * 1000; // 8時間

  return idle > IDLE_TIMEOUT || absolute > ABSOLUTE_TIMEOUT;
}

// ========================================
// セッション更新
// ========================================

/**
 * 最終アクティビティ時刻を更新
 */
async function updateSessionActivity(sessionId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ lastActivityAt: new Date() })
    .where(eq(sessions.id, sessionId));
}

/**
 * セッション延長（ユーザーアクティビティ時）
 */
export async function extendSession(sessionId: string): Promise<void> {
  const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db
    .update(sessions)
    .set({
      expiresAt: newExpiresAt,
      lastActivityAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));

  // Cookie の Max-Age も更新
  cookies().set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

// ========================================
// 同時セッション制御
// ========================================

/**
 * セッション数制限の適用
 */
export async function enforceSessionLimit(
  userId: string,
  maxSessions: number = 3
): Promise<void> {
  const userSessions = await db
    .select()
    .from(sessions)
    .where(and(
      eq(sessions.userId, userId),
      eq(sessions.active, true)
    ))
    .orderBy(sessions.lastActivityAt, 'desc');

  if (userSessions.length >= maxSessions) {
    // 最も古いセッションを無効化
    const sessionsToRevoke = userSessions.slice(maxSessions - 1);

    await db
      .update(sessions)
      .set({ active: false, revokedAt: new Date() })
      .where(
        eq(sessions.id, sessionsToRevoke.map(s => s.id))
      );
  }
}

// ========================================
// クリーンアップ
// ========================================

/**
 * 期限切れセッションのクリーンアップ
 * Cron Jobで定期実行推奨（例: 毎日）
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db
    .delete(sessions)
    .where(gt(new Date(), sessions.expiresAt));

  console.log(`Cleaned up ${result.rowCount} expired sessions`);
  return result.rowCount || 0;
}

// ========================================
// ヘルパー関数
// ========================================

function generateSessionId(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

async function logSecurityEvent(
  eventType: string,
  data: Record<string, any>
): Promise<void> {
  console.warn(`[SECURITY] ${eventType}:`, data);
  // 実装: セキュリティログシステムへの記録
}

// ========================================
// ミドルウェア統合
// ========================================

/**
 * Next.js Middleware: Database Session検証
 */
export async function authMiddleware(request: Request): Promise<Response | null> {
  const session = await getSession();

  if (!session) {
    return Response.redirect(new URL('/login', request.url));
  }

  // セッションタイムアウトチェック
  if (isSessionExpired(session)) {
    await deleteSession();
    return Response.redirect(new URL('/login', request.url));
  }

  // セッションコンテキスト検証
  if (!await validateSessionContext(session, request)) {
    // セキュリティリスク → 追加認証要求
    return Response.redirect(new URL('/auth/verify', request.url));
  }

  return null;
}

// ========================================
// データベーススキーマ例（Drizzle ORM）
// ========================================

/**
 * Sessions Table Schema
 *
 * import { pgTable, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
 *
 * export const sessions = pgTable('sessions', {
 *   id: varchar('id', { length: 255 }).primaryKey(),
 *   userId: varchar('user_id', { length: 255 }).notNull(),
 *   expiresAt: timestamp('expires_at').notNull(),
 *   createdAt: timestamp('created_at').notNull(),
 *   lastActivityAt: timestamp('last_activity_at').notNull(),
 *   ipAddress: varchar('ip_address', { length: 45 }),
 *   userAgent: varchar('user_agent', { length: 500 }),
 *   active: boolean('active').notNull().default(true),
 *   revokedAt: timestamp('revoked_at'),
 * });
 */

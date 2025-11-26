/**
 * JWT-based Session Implementation Template
 *
 * このテンプレートは、JWT（JSON Web Token）ベースの
 * ステートレスセッション管理の実装パターンを提供します。
 *
 * 特徴:
 * - サーバー側セッションストア不要
 * - 水平スケールが容易
 * - 高速（データベースアクセス不要）
 *
 * 使用場面:
 * - マイクロサービスアーキテクチャ
 * - サーバーレス環境
 * - 高トラフィックアプリケーション
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// ========================================
// 型定義
// ========================================

interface JWTPayload {
  sub: string;                          // Subject (User ID)
  role: 'ADMIN' | 'USER' | 'GUEST';    // User Role
  email?: string;                       // User Email (optional)
  jti: string;                          // JWT ID (for revocation)
  iat: number;                          // Issued At
  exp: number;                          // Expiration Time
}

interface SessionData {
  userId: string;
  role: 'ADMIN' | 'USER' | 'GUEST';
  email?: string;
}

// ========================================
// JWT生成
// ========================================

/**
 * JWTアクセストークンを生成
 */
export async function generateJWT(sessionData: SessionData): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const tokenId = crypto.randomUUID();

  const jwt = await new SignJWT({
    sub: sessionData.userId,
    role: sessionData.role,
    email: sessionData.email,
    jti: tokenId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // 1時間
    .sign(secret);

  return jwt;
}

/**
 * JWT検証とデコード
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    return payload as JWTPayload;
  } catch (error) {
    throw new JWTVerificationError('Invalid or expired JWT');
  }
}

// ========================================
// セッション管理
// ========================================

/**
 * セッション作成（ログイン成功時）
 */
export async function createSession(sessionData: SessionData): Promise<void> {
  const jwt = await generateJWT(sessionData);

  // HttpOnly Cookieに保存
  cookies().set('session_token', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1時間（JWTと同じ）
    path: '/',
  });
}

/**
 * セッション取得
 */
export async function getSession(): Promise<JWTPayload | null> {
  const token = cookies().get('session_token')?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyJWT(token);
  } catch (error) {
    // トークン無効 → Cookieクリア
    cookies().delete('session_token');
    return null;
  }
}

/**
 * セッション削除（ログアウト）
 */
export async function deleteSession(): Promise<void> {
  const session = await getSession();

  if (session) {
    // オプション: トークンブラックリスト追加
    await addToBlacklist(session.jti, session.exp);
  }

  // Cookieクリア
  cookies().delete('session_token');
}

/**
 * セッション更新（トークンリフレッシュ）
 */
export async function refreshSession(): Promise<void> {
  const currentSession = await getSession();

  if (!currentSession) {
    throw new Error('No active session');
  }

  // 新しいJWT生成
  const newJwt = await generateJWT({
    userId: currentSession.sub,
    role: currentSession.role,
    email: currentSession.email,
  });

  // Cookieを更新
  cookies().set('session_token', newJwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/',
  });
}

// ========================================
// トークンブラックリスト（オプション）
// ========================================

/**
 * トークンをブラックリストに追加
 * 即座無効化が必要な場合に使用（Redis推奨）
 */
async function addToBlacklist(jti: string, exp: number): Promise<void> {
  const ttl = Math.max(0, exp - Math.floor(Date.now() / 1000));

  // Redis使用例
  await redis.setex(`blacklist:${jti}`, ttl, '1');
}

/**
 * トークンがブラックリストにあるか確認
 */
async function isBlacklisted(jti: string): Promise<boolean> {
  const exists = await redis.exists(`blacklist:${jti}`);
  return exists === 1;
}

/**
 * ブラックリストチェック付きJWT検証
 */
export async function verifyJWTWithBlacklist(token: string): Promise<JWTPayload> {
  const payload = await verifyJWT(token);

  // ブラックリストチェック
  if (await isBlacklisted(payload.jti)) {
    throw new JWTVerificationError('Token has been revoked');
  }

  return payload;
}

// ========================================
// ミドルウェア統合
// ========================================

/**
 * Next.js Middleware: セッション検証
 */
export async function authMiddleware(request: Request): Promise<Response | null> {
  const session = await getSession();

  // 未認証
  if (!session) {
    return Response.redirect(new URL('/login', request.url));
  }

  // 有効期限チェック（JWTライブラリが自動で行うが、明示的にも可能）
  if (session.exp * 1000 < Date.now()) {
    cookies().delete('session_token');
    return Response.redirect(new URL('/login', request.url));
  }

  // 認証済み → 次のハンドラーへ
  return null;
}

/**
 * API Route: セッション検証ヘルパー
 */
export async function requireAuth(
  handler: (session: JWTPayload) => Promise<Response>
): Promise<Response> {
  const session = await getSession();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  return await handler(session);
}

/**
 * 使用例:
 * export const GET = () => requireAuth(async (session) => {
 *   // 認証済みユーザーのみアクセス可能
 *   return Response.json({ userId: session.sub });
 * });
 */

// ========================================
// セキュリティ強化
// ========================================

/**
 * セッション固定対策: ログイン成功時に新しいJWT発行
 */
export async function regenerateSession(sessionData: SessionData): Promise<void> {
  // 古いセッション削除
  await deleteSession();

  // 新しいセッション作成
  await createSession(sessionData);
}

/**
 * セッションハイジャック検出: IP/User-Agent変更チェック
 */
export async function validateSessionContext(
  session: JWTPayload,
  request: Request
): Promise<boolean> {
  // JWTに含めたIP/UAと現在を比較する場合
  // （ただし、JWTペイロード肥大化とプライバシー考慮）

  // 代替: Databaseに保存した情報と比較
  const sessionMeta = await db.sessionMeta.findOne({
    jti: session.jti,
  });

  if (!sessionMeta) {
    return true; // メタ情報なし → 検証スキップ
  }

  const currentIp = getClientIP(request);
  const currentUA = request.headers.get('User-Agent');

  if (sessionMeta.ipAddress !== currentIp) {
    logSecurityEvent('IP_CHANGE', { session, currentIp });
    // 追加検証要求またはセッション無効化
    return false;
  }

  return true;
}

// ========================================
// ヘルパー関数
// ========================================

function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

// ========================================
// エラークラス
// ========================================

class JWTVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JWTVerificationError';
  }
}

// ========================================
// 環境変数
// ========================================

/**
 * 必要な環境変数:
 *
 * JWT_SECRET=your-256-bit-secret-key
 *   - 最低32文字の強力なランダム文字列
 *   - openssl rand -base64 32 で生成推奨
 *
 * NODE_ENV=production
 *   - 本番環境でSecure Cookie有効化に使用
 */

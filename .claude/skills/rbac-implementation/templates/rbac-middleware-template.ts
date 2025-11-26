/**
 * RBAC Middleware Template
 * Next.js App Router向けロールベースアクセス制御ミドルウェア
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// ========================================
// 型定義
// ========================================

type Role = 'ADMIN' | 'USER' | 'GUEST';

type Permission =
  | 'user:create' | 'user:read' | 'user:update' | 'user:delete'
  | 'workflow:create' | 'workflow:read' | 'workflow:update' | 'workflow:delete'
  | 'admin:access';

interface Session {
  userId: string;
  role: Role;
}

// ========================================
// ロール・権限マッピング
// ========================================

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    'user:create', 'user:read', 'user:update', 'user:delete',
    'workflow:create', 'workflow:read', 'workflow:update', 'workflow:delete',
    'admin:access',
  ],
  USER: [
    'workflow:create', 'workflow:read', 'workflow:update',
  ],
  GUEST: [
    'workflow:read',
  ],
};

// ========================================
// ルート・権限マッピング
// ========================================

const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/admin': 'admin:access',
  '/api/users': 'user:create',
  '/api/workflows': 'workflow:create',
};

// ========================================
// ミドルウェア
// ========================================

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // パブリックルート（認証不要）
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // セッション取得
  const session = await getSession();

  // 未認証
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ルートベース権限チェック
  const requiredPermission = getRequiredPermission(pathname);
  if (requiredPermission && !hasPermission(session, requiredPermission)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.next();
}

// ========================================
// 権限チェック関数
// ========================================

export function hasPermission(session: Session, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[session.role];
  return permissions.includes(permission);
}

export function hasAnyPermission(session: Session, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(session, p));
}

export function hasAllPermissions(session: Session, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(session, p));
}

// ========================================
// ルート判定
// ========================================

function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/api/auth/callback',
    '/api/health',
  ];

  return publicRoutes.some(route => pathname.startsWith(route));
}

function getRequiredPermission(pathname: string): Permission | null {
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return permission;
    }
  }
  return null;
}

// ========================================
// API Route向けヘルパー
// ========================================

/**
 * 権限必須のAPIルートラッパー
 */
export function requirePermission(permission: Permission) {
  return async (
    handler: (request: Request, session: Session) => Promise<Response>
  ) => {
    return async (request: Request) => {
      const session = await getSession();

      if (!session) {
        return new Response('Unauthorized', { status: 401 });
      }

      if (!hasPermission(session, permission)) {
        return new Response('Forbidden', { status: 403 });
      }

      return await handler(request, session);
    };
  };
}

/**
 * 使用例:
 * export const POST = requirePermission('user:create')(async (req, session) => {
 *   const body = await req.json();
 *   const user = await createUser(body);
 *   return Response.json(user);
 * });
 */

/**
 * ロール必須のAPIルートラッパー
 */
export function requireRole(...roles: Role[]) {
  return async (
    handler: (request: Request, session: Session) => Promise<Response>
  ) => {
    return async (request: Request) => {
      const session = await getSession();

      if (!session) {
        return new Response('Unauthorized', { status: 401 });
      }

      if (!roles.includes(session.role)) {
        return new Response('Forbidden', { status: 403 });
      }

      return await handler(request, session);
    };
  };
}

/**
 * 使用例:
 * export const GET = requireRole('ADMIN', 'MANAGER')(async (req, session) => {
 *   const users = await getAllUsers();
 *   return Response.json(users);
 * });
 */

// ========================================
// ミドルウェア設定
// ========================================

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
};

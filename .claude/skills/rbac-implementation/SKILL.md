---
name: rbac-implementation
description: |
  ロールベースアクセス制御（RBAC）の設計と実装パターン。
  最小権限の原則に基づくロール体系設計、多層アクセス制御、
  権限チェックロジック、ポリシーエンジン構築を提供。

  使用タイミング:
  - ロールと権限の体系を設計する時
  - アクセス制御を多層で実装する時（ミドルウェア、APIルート、データ層）
  - 権限チェックロジックを実装する時
  - 動的権限管理が必要な時
  - ポリシーベースアクセス制御を実装する時

  関連スキル:
  - `.claude/skills/session-management/SKILL.md` - セッションにロール情報統合
  - `.claude/skills/nextauth-patterns/SKILL.md` - NextAuth.jsでのRBAC統合
  - `.claude/skills/security-headers/SKILL.md` - 多層防御

  Use when implementing role-based access control, designing permission systems,
  or securing resources with fine-grained access control.
version: 1.0.0
---

# RBAC Implementation

## スキル概要

**コアドメイン**:
- ロールと権限の設計
- 多層アクセス制御
- 権限チェックロジック
- ポリシーエンジン

**設計原則**:
- 最小権限の原則
- 職務分離
- Defense in Depth（多層防御）

## ロール設計

### ロール粒度の決定

**3層ロールモデル（推奨）**:
```typescript
enum Role {
  ADMIN = 'ADMIN',     // 管理者: 全機能アクセス
  USER = 'USER',       // 一般ユーザー: 基本機能
  GUEST = 'GUEST',     // ゲスト: 読み取りのみ
}
```

**5層ロールモデル（詳細制御）**:
```typescript
enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',   // システム管理者
  ADMIN = 'ADMIN',               // 組織管理者
  MANAGER = 'MANAGER',           // マネージャー
  USER = 'USER',                 // 一般ユーザー
  GUEST = 'GUEST',               // ゲスト
}
```

**判断基準**:
- 組織構造と業務フローに基づく
- 過度に複雑にしない（保守性）
- 将来的な拡張性を考慮

### 権限モデル設計

**リソースベース権限（CRUD）**:
```typescript
type Permission =
  | 'user:create'
  | 'user:read'
  | 'user:update'
  | 'user:delete'
  | 'workflow:create'
  | 'workflow:read'
  | 'workflow:update'
  | 'workflow:delete'
  | 'admin:access';
```

**ロール・権限マッピング**:
```typescript
const rolePermissions: Record<Role, Permission[]> = {
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
```

## 多層アクセス制御

### Layer 1: ミドルウェア（早期チェック）

**目的**: 認証とルートレベル権限チェック

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession();

  // 未認証チェック
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 管理者ルート保護
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (session.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*'],
};
```

### Layer 2: APIルート（詳細チェック）

**目的**: エンドポイントレベルの権限検証

```typescript
// app/api/users/route.ts
export async function POST(request: Request) {
  const session = await getSession();

  // 権限チェック
  if (!hasPermission(session, 'user:create')) {
    return new Response('Forbidden', { status: 403 });
  }

  // 処理続行
  const body = await request.json();
  const user = await createUser(body);

  return Response.json(user);
}
```

### Layer 3: データ層（リソース所有権）

**目的**: リソース所有者のみがアクセス可能

```typescript
export async function updateWorkflow(
  workflowId: string,
  userId: string,
  data: UpdateWorkflowDTO
): Promise<Workflow> {
  const workflow = await db.workflows.findOne({ id: workflowId });

  // 所有権チェック
  if (workflow.userId !== userId) {
    throw new ForbiddenError('You do not own this workflow');
  }

  return await db.workflows.update(workflowId, data);
}
```

## 権限チェックロジック

### 基本実装

```typescript
export function hasPermission(
  session: JWTPayload | null,
  permission: Permission
): boolean {
  if (!session) {
    return false;
  }

  const permissions = rolePermissions[session.role];
  return permissions.includes(permission);
}
```

### 高度な実装（ポリシーエンジン）

```typescript
interface PolicyContext {
  user: { id: string; role: Role };
  resource?: { id: string; ownerId: string };
  action: Permission;
}

export function evaluatePolicy(context: PolicyContext): boolean {
  // ロールベース権限
  if (!hasPermission({ role: context.user.role }, context.action)) {
    return false;
  }

  // リソース所有権チェック
  if (context.resource && context.resource.ownerId !== context.user.id) {
    // 管理者は例外
    if (context.user.role !== 'ADMIN') {
      return false;
    }
  }

  return true;
}
```

## リソース参照

```bash
cat .claude/skills/rbac-implementation/resources/role-permission-design.md
cat .claude/skills/rbac-implementation/resources/multi-layer-access-control.md
```

## テンプレート参照

```bash
cat .claude/skills/rbac-implementation/templates/rbac-middleware-template.ts
cat .claude/skills/rbac-implementation/templates/permission-checker-template.ts
```

## スクリプト実行

```bash
node .claude/skills/rbac-implementation/scripts/validate-rbac-config.mjs <config-file>
```

## 実装ワークフロー

1. **ロール体系設計**: 組織構造に基づくロール定義
2. **権限モデル設計**: CRUD操作とビジネスアクション権限
3. **ロール・権限マッピング**: 最小権限の原則
4. **多層制御実装**: ミドルウェア、APIルート、データ層
5. **テスト**: 権限チェックの正常系・異常系

## 判断基準

- [ ] ロール設計は業務要件と整合しているか？
- [ ] 権限は細粒度で、かつ過度に複雑でないか？
- [ ] 多層防御が実装されているか？
- [ ] 権限昇格攻撃のシナリオが考慮されているか？

## ベストプラクティス

1. **最小権限**: ユーザーは必要最小限の権限のみ
2. **職務分離**: 権限の過度な集中を防ぐ
3. **多層防御**: ミドルウェア + APIルート + データ層
4. **動的検証**: 権限変更が即座に反映

## バージョン履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版リリース - RBAC実装パターン |

# 権限設計パターンガイド

## 1. 最小権限の原則

### 概念

```
「必要最小限の権限のみを付与し、
 必要な期間のみ有効とする」

過剰な権限 = セキュリティリスク + 予期せぬ動作
```

### 適用ステップ

1. **必要な操作を特定**
   - 何をする必要があるか？
   - どのリソースにアクセスするか？

2. **最小スコープを決定**
   - 読み取りだけで十分か？
   - 特定リソースのみで十分か？

3. **権限を付与**
   - 必要最小限のスコープのみ
   - 時間制限を設定（可能な場合）

4. **定期レビュー**
   - 使用されていない権限を削除
   - スコープの見直し

## 2. 主要APIの権限モデル

### GitHub

```yaml
# リポジトリ読み取りのみ
scopes:
  - repo:status
  - public_repo

# Issue管理
scopes:
  - repo:status
  - public_repo
  - write:issues

# 全アクセス（非推奨）
scopes:
  - repo  # 全リポジトリアクセス
```

### Slack

```yaml
# メッセージ送信のみ
scopes:
  - chat:write

# チャンネル管理
scopes:
  - channels:read
  - channels:write

# ファイルアップロード
scopes:
  - files:write
```

### Google Cloud

```yaml
# Drive 読み取りのみ
scopes:
  - https://www.googleapis.com/auth/drive.readonly

# Drive ファイル操作
scopes:
  - https://www.googleapis.com/auth/drive.file

# 全アクセス（非推奨）
scopes:
  - https://www.googleapis.com/auth/drive
```

## 3. アクセス制御パターン

### RBAC（Role-Based Access Control）

```
ロール階層:
├── admin
│   └── すべての操作が可能
├── editor
│   └── 読み取り + 書き込み
├── viewer
│   └── 読み取りのみ
└── guest
    └── 公開リソースのみ
```

実装例:

```typescript
enum Role {
  ADMIN = "admin",
  EDITOR = "editor",
  VIEWER = "viewer",
  GUEST = "guest",
}

const rolePermissions: Record<Role, string[]> = {
  [Role.ADMIN]: ["read", "write", "delete", "manage"],
  [Role.EDITOR]: ["read", "write"],
  [Role.VIEWER]: ["read"],
  [Role.GUEST]: ["read:public"],
};

function hasPermission(userRole: Role, requiredPermission: string): boolean {
  return rolePermissions[userRole].includes(requiredPermission);
}
```

### ABAC（Attribute-Based Access Control）

```typescript
interface AccessRequest {
  subject: {
    userId: string;
    role: string;
    department: string;
  };
  resource: {
    type: string;
    owner: string;
    sensitivity: string;
  };
  action: string;
  context: {
    time: Date;
    ipAddress: string;
  };
}

function evaluatePolicy(request: AccessRequest): boolean {
  const policies = [
    // オーナーは常にアクセス可能
    (req) => req.subject.userId === req.resource.owner,

    // 管理者は全アクセス可能
    (req) => req.subject.role === "admin",

    // 機密データは同じ部門のみ
    (req) =>
      req.resource.sensitivity === "confidential" &&
      req.subject.department === req.resource.owner,

    // 営業時間内のみアクセス可能
    (req) => {
      const hour = req.context.time.getHours();
      return hour >= 9 && hour < 18;
    },
  ];

  return policies.some((policy) => policy(request));
}
```

## 4. スコープ設計パターン

### 階層的スコープ

```
repository
├── repository:read
│   ├── repository:read:code
│   ├── repository:read:issues
│   └── repository:read:metadata
└── repository:write
    ├── repository:write:code
    ├── repository:write:issues
    └── repository:write:settings
```

### 動作ベーススコープ

```
actions:
├── create    # 新規作成
├── read      # 読み取り
├── update    # 更新
├── delete    # 削除
├── list      # 一覧取得
└── admin     # 管理操作
```

### リソースベーススコープ

```
resources:
├── files:*       # ファイル全操作
├── messages:*    # メッセージ全操作
├── users:read    # ユーザー読み取りのみ
└── settings:*    # 設定全操作
```

## 5. 権限昇格防止

### チェックポイント

```typescript
async function validatePermissionEscalation(
  currentUser: User,
  targetPermissions: string[],
): Promise<boolean> {
  const currentPermissions = await getUserPermissions(currentUser.id);

  // 付与しようとしている権限が自分の権限を超えていないか
  for (const permission of targetPermissions) {
    if (!currentPermissions.includes(permission)) {
      throw new Error(`Cannot grant permission: ${permission}`);
    }
  }

  return true;
}
```

### 分離の原則

```
管理者権限の分離:

├── システム管理者
│   └── インフラ、設定の管理
│
├── セキュリティ管理者
│   └── 権限、監査の管理
│
└── アプリケーション管理者
    └── 機能、データの管理
```

## 6. 権限の一時付与

### 時間制限付きアクセス

```typescript
interface TemporaryAccess {
  userId: string;
  permission: string;
  grantedAt: Date;
  expiresAt: Date;
  reason: string;
  approvedBy: string;
}

class TemporaryAccessManager {
  async grant(access: TemporaryAccess): Promise<void> {
    // アクセスを記録
    await this.store.save(access);

    // 有効期限後に自動失効
    const ttl = access.expiresAt.getTime() - Date.now();
    setTimeout(() => this.revoke(access), ttl);
  }

  async revoke(access: TemporaryAccess): Promise<void> {
    await this.store.delete(access);
    await this.auditLog.record("revoke", access);
  }

  async check(userId: string, permission: string): Promise<boolean> {
    const access = await this.store.find(userId, permission);
    if (!access) return false;
    return access.expiresAt > new Date();
  }
}
```

### JIT（Just-In-Time）アクセス

```
リクエストフロー:

1. ユーザーがアクセスをリクエスト
2. 承認者がレビュー・承認
3. 一時的な権限を付与
4. 使用後または期限後に自動失効
```

## 7. 監査と可視化

### 権限マトリクス

```
           | Files | Messages | Users | Settings |
-----------|-------|----------|-------|----------|
admin      |  RWD  |   RWD    |  RWD  |   RWD    |
editor     |  RW   |   RW     |  R    |   -      |
viewer     |  R    |   R      |  R    |   -      |
guest      |  -    |   -      |  -    |   -      |

R=Read, W=Write, D=Delete, -=No Access
```

### 未使用権限の検出

```typescript
interface PermissionUsage {
  permission: string;
  lastUsed: Date | null;
  usageCount: number;
}

async function findUnusedPermissions(
  userId: string,
  thresholdDays: number = 90,
): Promise<string[]> {
  const permissions = await getUserPermissions(userId);
  const usageLog = await getPermissionUsageLog(userId);

  const threshold = new Date();
  threshold.setDate(threshold.getDate() - thresholdDays);

  return permissions.filter((permission) => {
    const usage = usageLog.find((u) => u.permission === permission);
    return !usage || !usage.lastUsed || usage.lastUsed < threshold;
  });
}
```

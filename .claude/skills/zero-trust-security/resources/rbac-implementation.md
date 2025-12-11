# RBAC (Role-Based Access Control) 実装ガイド

## RBAC概要

RBACは、ユーザーをロール（役割）に割り当て、ロールに権限を付与するアクセス制御モデルです。
ユーザー個別ではなく、ロール単位で権限を管理することで、大規模な組織でもスケーラブルな
アクセス制御を実現します。

## RBAC構成要素

### 1. User (ユーザー)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  roles: string[]; // ユーザーに割り当てられたロール
  department: string;
  active: boolean;
}
```

### 2. Role (ロール)

```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // このロールが持つ権限ID
  inheritsFrom?: string[]; // 継承元ロール（オプション）
}
```

### 3. Permission (権限)

```typescript
interface Permission {
  id: string;
  resource: string; // 'secret/prod/database'
  action: "read" | "write" | "delete" | "rotate";
  conditions?: Condition[]; // 条件付きアクセス
}
```

### 4. Resource (リソース)

```typescript
interface SecretResource {
  path: string; // 'secret/prod/database/url'
  classification: "critical" | "high" | "medium" | "low";
  owner: string; // 責任者
  tags: string[]; // ['prod', 'database', 'pii']
}
```

## ロール設計パターン

### パターン1: 階層的ロール

```typescript
const roleHierarchy = {
  "security-admin": {
    name: "Security Administrator",
    permissions: ["secret:*:*"], // すべてのSecret、すべてのアクション
    description: "最高権限、すべてのSecretにフルアクセス",
  },
  "devops-engineer": {
    name: "DevOps Engineer",
    inheritsFrom: ["developer"], // Developerの権限を継承
    permissions: [
      "secret:dev:*",
      "secret:staging:*",
      "secret:prod:read", // 本番は読み取りのみ
      "secret:staging:rotate",
    ],
    description: "すべての環境にアクセス、本番は読み取りのみ",
  },
  developer: {
    name: "Developer",
    permissions: ["secret:dev:read", "secret:dev:write"],
    description: "開発環境のみアクセス可能",
  },
  auditor: {
    name: "Security Auditor",
    permissions: [
      "audit:*:read", // 監査ログの読み取りのみ
    ],
    description: "監査ログ閲覧のみ、Secret取得不可",
  },
};
```

### パターン2: 機能別ロール

```typescript
const functionalRoles = {
  "database-admin": {
    permissions: [
      "secret:*/database/*:*", // すべての環境のDB関連Secret
    ],
    description: "データベース関連Secretの管理",
  },
  "api-key-manager": {
    permissions: ["secret:*/api-keys/*:read", "secret:*/api-keys/*:rotate"],
    description: "外部APIキーの管理とRotation",
  },
  "monitoring-operator": {
    permissions: ["secret:*/monitoring/*:read"],
    description: "監視サービス用Secret閲覧のみ",
  },
};
```

### パターン3: プロジェクト・サービス別ロール

```typescript
const projectRoles = {
  "project-a-developer": {
    permissions: [
      "secret:dev/project-a/*:*",
      "secret:staging/project-a/*:read",
    ],
    description: "プロジェクトA専用、dev環境フルアクセス",
  },
  "discord-service-owner": {
    permissions: ["secret:*/discord/*:*"],
    description: "Discord連携サービスのSecret管理",
  },
};
```

## 権限チェック実装

### 基本的な権限チェック

```typescript
class RBACEnforcer {
  async checkPermission(
    userId: string,
    action: string,
    resource: string,
  ): Promise<boolean> {
    // 1. ユーザー取得
    const user = await this.userRepository.findById(userId);
    if (!user || !user.active) {
      return false;
    }

    // 2. ユーザーのロール取得
    const roles = await Promise.all(
      user.roles.map((roleId) => this.roleRepository.findById(roleId)),
    );

    // 3. ロールの権限を集約（継承含む）
    const allPermissions = this.aggregatePermissions(roles);

    // 4. 権限マッチング
    return allPermissions.some((permission) =>
      this.matchesPermission(permission, action, resource),
    );
  }

  private matchesPermission(
    permission: Permission,
    action: string,
    resource: string,
  ): boolean {
    // アクション確認
    if (permission.action !== "*" && permission.action !== action) {
      return false;
    }

    // リソースパターンマッチング
    return this.matchesResourcePattern(permission.resource, resource);
  }

  private matchesResourcePattern(pattern: string, resource: string): boolean {
    // ワイルドカード対応
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return regex.test(resource);
  }

  private aggregatePermissions(roles: Role[]): Permission[] {
    const permissions = new Set<string>();

    for (const role of roles) {
      // 直接の権限
      role.permissions.forEach((p) => permissions.add(p));

      // 継承された権限
      if (role.inheritsFrom) {
        for (const parentRoleId of role.inheritsFrom) {
          const parentRole = this.roleRepository.findById(parentRoleId);
          parentRole.permissions.forEach((p) => permissions.add(p));
        }
      }
    }

    return Array.from(permissions).map((p) => this.parsePermission(p));
  }
}
```

### 条件付きアクセス制御

```typescript
interface ConditionalPermission extends Permission {
  conditions: {
    timeRange?: { start: string; end: string }; // "09:00-17:00"
    daysOfWeek?: number[]; // [1,2,3,4,5] = 月-金
    ipWhitelist?: string[];
    mfaRequired?: boolean;
    approvalRequired?: boolean;
  };
}

class ConditionalRBACEnforcer extends RBACEnforcer {
  async checkPermission(
    userId: string,
    action: string,
    resource: string,
    context: AccessContext,
  ): Promise<boolean> {
    const hasBasicPermission = await super.checkPermission(
      userId,
      action,
      resource,
    );
    if (!hasBasicPermission) {
      return false;
    }

    // 条件付き権限の評価
    const permission = await this.getPermission(userId, action, resource);
    if (!permission.conditions) {
      return true; // 条件なし → 許可
    }

    // 時間帯チェック
    if (permission.conditions.timeRange) {
      if (
        !this.isWithinTimeRange(
          context.timestamp,
          permission.conditions.timeRange,
        )
      ) {
        throw new Error("Access denied: outside allowed time range");
      }
    }

    // 曜日チェック
    if (permission.conditions.daysOfWeek) {
      const dayOfWeek = context.timestamp.getDay();
      if (!permission.conditions.daysOfWeek.includes(dayOfWeek)) {
        throw new Error("Access denied: not allowed on this day of week");
      }
    }

    // MFAチェック
    if (permission.conditions.mfaRequired && !context.mfaVerified) {
      throw new Error("MFA verification required");
    }

    // 承認チェック
    if (permission.conditions.approvalRequired && !context.approvalId) {
      throw new Error("Manager approval required");
    }

    return true;
  }
}
```

## ロール割り当て管理

### ユーザーへのロール割り当て

```typescript
class RoleAssignmentManager {
  async assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
  ): Promise<void> {
    // 1. 権限チェック（ロール割り当て権限があるか）
    const canAssign = await this.rbacEnforcer.checkPermission(
      assignedBy,
      "assign",
      `role:${roleId}`,
    );

    if (!canAssign) {
      throw new Error("Insufficient permissions to assign this role");
    }

    // 2. ロール割り当て
    await this.userRepository.addRole(userId, roleId);

    // 3. 監査ログ
    await this.auditLog.record({
      event: "role_assigned",
      user_id: userId,
      role_id: roleId,
      assigned_by: assignedBy,
      timestamp: new Date(),
    });

    // 4. 通知
    await this.notifyUser(userId, `Role ${roleId} assigned to you`);
  }

  async revokeRole(
    userId: string,
    roleId: string,
    revokedBy: string,
  ): Promise<void> {
    // 同様のフロー
    await this.userRepository.removeRole(userId, roleId);
    await this.auditLog.record({ event: "role_revoked" /* ... */ });
  }
}
```

### 一時的なロール付与（JIT）

```typescript
async function grantTemporaryRole(
  userId: string,
  roleId: string,
  duration: number, // ミリ秒
): Promise<void> {
  await this.assignRole(userId, roleId, "system");

  // 自動revoke設定
  setTimeout(async () => {
    await this.revokeRole(userId, roleId, "system");
    await this.notifyUser(userId, `Temporary role ${roleId} expired`);
  }, duration);
}
```

## 権限昇格の防止

### セルフサービス禁止

```typescript
// ❌ 間違い: ユーザーが自分の権限を昇格できる
async function requestPermission(
  userId: string,
  permission: string,
): Promise<void> {
  await this.userRepository.addPermission(userId, permission); // 危険！
}

// ✅ 正しい: 承認フローを経由
async function requestPermission(
  userId: string,
  permission: string,
): Promise<void> {
  const request = await this.createPermissionRequest({
    userId,
    permission,
    justification: "Need to debug production issue",
  });

  // 管理者承認待ち
  await this.sendApprovalRequest(request, "security-admin");

  // 承認されるまで権限は付与されない
}
```

### ロール変更の承認フロー

```typescript
class RoleChangeWorkflow {
  async requestRoleChange(
    userId: string,
    newRole: string,
    justification: string,
  ): Promise<string> {
    // 1. リクエスト作成
    const request = await this.createRequest({
      type: "role_change",
      userId,
      currentRoles: await this.getUserRoles(userId),
      requestedRole: newRole,
      justification,
      status: "pending",
    });

    // 2. 承認者決定
    const approvers = await this.getApprovers(newRole);

    // 3. 承認リクエスト送信
    for (const approver of approvers) {
      await this.notifyApprover(approver, request);
    }

    return request.id;
  }

  async approveRoleChange(
    requestId: string,
    approverId: string,
  ): Promise<void> {
    const request = await this.getRequest(requestId);

    // 承認権限確認
    const canApprove = await this.rbacEnforcer.checkPermission(
      approverId,
      "approve",
      `role_request:${request.requestedRole}`,
    );

    if (!canApprove) {
      throw new Error("Insufficient permissions to approve this role change");
    }

    // ロール付与
    await this.roleAssignmentManager.assignRole(
      request.userId,
      request.requestedRole,
      approverId,
    );

    // リクエストステータス更新
    await this.updateRequestStatus(requestId, "approved", approverId);

    // 監査ログ
    await this.auditLog.record({
      event: "role_change_approved",
      request_id: requestId,
      user_id: request.userId,
      role_id: request.requestedRole,
      approved_by: approverId,
    });
  }
}
```

## Railway/GitHub Actions統合

### Railway環境でのRBAC

```typescript
// Railway Secretsアクセス制御（概念的）
const railwaySecretAccess = {
  developer: {
    environments: ["development"],
    actions: ["read"],
  },
  devops: {
    environments: ["development", "staging", "production"],
    actions: ["read", "write"],
  },
  ci_cd: {
    environments: ["staging", "production"],
    actions: ["read"], // CI/CDは読み取りのみ
  },
};

// GitHub Actionsからのアクセス制御
function validateCIAccess(secretName: string, environment: string): void {
  const ciPolicy = railwaySecretAccess["ci_cd"];

  if (!ciPolicy.environments.includes(environment)) {
    throw new Error(`CI/CD not authorized for ${environment}`);
  }

  if (!ciPolicy.actions.includes("read")) {
    throw new Error("CI/CD can only read secrets");
  }
}
```

## 実装チェックリスト

### ロール設計

- [ ] ロールが職務に基づいているか？（技術的タスクではなく）
- [ ] ロール数は適切か？（多すぎない、少なすぎない）
- [ ] ロール継承関係が明確か？
- [ ] 各ロールの責任範囲が明確か？

### 権限設計

- [ ] 最小権限の原則が適用されているか？
- [ ] 権限がリソースパターンで柔軟に定義されているか？
- [ ] 条件付きアクセスが考慮されているか？

### 実装品質

- [ ] 権限チェックがすべてのアクセスポイントで実行されるか？
- [ ] 監査ログが完全に記録されるか？
- [ ] ロール変更に承認フローがあるか？
- [ ] 権限昇格攻撃が防がれているか？

## トラブルシューティング

### 問題1: ユーザーが必要なSecretにアクセスできない

**診断手順**:

1. ユーザーのロールを確認: `getUserRoles(userId)`
2. ロールの権限を確認: `getRolePermissions(roleId)`
3. リソースパターンマッチングを検証
4. 条件付きアクセスを確認（時間帯、MFA等）

**解決策**:

- 適切なロールを割り当て
- または一時的なJITアクセスを付与

### 問題2: 権限が過剰に付与されている

**診断**: 定期的な権限監査で検出
**解決策**:

- ロールの権限を最小化
- 使用されていない権限を削除
- 過剰な権限を持つユーザーにアラート

### 問題3: ロール変更が反映されない

**原因**: キャッシュ、セッション有効期限
**解決策**:

- ロール変更時にキャッシュ無効化
- セッション再認証を強制

# ロール・権限設計ガイド

## ロール設計原則

### 最小権限の原則
ユーザーは業務遂行に必要な最小限の権限のみを持つ

### 職務分離
権限の過度な集中を防ぎ、不正を防止

### ロール階層
上位ロールは下位ロールの権限を継承可能

## 権限命名規則

**形式**: `{resource}:{action}`

**例**:
- `user:create` - ユーザー作成
- `user:read` - ユーザー閲覧
- `user:update` - ユーザー更新
- `user:delete` - ユーザー削除
- `workflow:execute` - ワークフロー実行
- `admin:access` - 管理画面アクセス

## ロール・権限マトリックス例

| ロール | user:* | workflow:* | admin:access |
|-------|--------|-----------|-------------|
| ADMIN | ✅ 全権限 | ✅ 全権限 | ✅ |
| USER | ✅ read | ✅ create, read, update | ❌ |
| GUEST | ❌ | ✅ read | ❌ |

## 動的権限管理

```typescript
// データベーススキーマ
interface UserRole {
  userId: string;
  role: Role;
  grantedAt: Date;
  grantedBy: string;
}

// ロール変更
async function changeUserRole(
  userId: string,
  newRole: Role,
  changedBy: string
): Promise<void> {
  await db.userRoles.update(
    { userId },
    { role: newRole, grantedAt: new Date(), grantedBy: changedBy }
  );

  // セッション無効化（権限変更を即座に反映）
  await revokeAllUserSessions(userId);
}
```

## ポリシーベースアクセス制御（PBAC）

**RBACとPBACの違い**:
- RBAC: ロールに基づく静的な権限
- PBAC: コンテキストに基づく動的な権限

**実装例**:
```typescript
interface Policy {
  effect: 'allow' | 'deny';
  actions: Permission[];
  resources?: string[];
  conditions?: PolicyCondition[];
}

interface PolicyCondition {
  type: 'time' | 'ip' | 'ownership';
  operator: 'equals' | 'in' | 'between';
  value: any;
}

// ポリシー例: 営業時間のみアクセス許可
const businessHoursPolicy: Policy = {
  effect: 'allow',
  actions: ['workflow:execute'],
  conditions: [
    {
      type: 'time',
      operator: 'between',
      value: { start: '09:00', end: '18:00' },
    },
  ],
};

// ポリシー評価
function evaluatePolicy(
  policy: Policy,
  context: {
    action: Permission;
    resource?: string;
    time?: Date;
    ip?: string;
    userId?: string;
  }
): boolean {
  // Action チェック
  if (!policy.actions.includes(context.action)) {
    return policy.effect === 'deny';
  }

  // Condition チェック
  if (policy.conditions) {
    for (const condition of policy.conditions) {
      if (!evaluateCondition(condition, context)) {
        return policy.effect === 'deny';
      }
    }
  }

  return policy.effect === 'allow';
}
```

## まとめ

**RBAC実装の鉄則**:
1. ロールは業務要件に基づく
2. 権限は細粒度、命名規則統一
3. 最小権限の原則を徹底
4. 多層防御で実装
5. 動的権限変更に対応

**参照**:
- 実装テンプレート: `.claude/skills/rbac-implementation/templates/`
- 多層制御: `.claude/skills/rbac-implementation/resources/multi-layer-access-control.md`

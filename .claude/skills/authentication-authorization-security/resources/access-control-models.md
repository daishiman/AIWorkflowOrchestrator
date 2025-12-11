# アクセス制御モデル詳細比較

## 1. RBAC（Role-Based Access Control）

### 概要

ユーザーに「ロール」を割り当て、ロールに「権限」を関連付けるモデル。

### 構成要素

**ユーザー（User）**:

- システムにログインする主体
- 1つ以上のロールを持つ

**ロール（Role）**:

- 責任範囲を表す概念（admin、editor、viewer等）
- 複数の権限をグループ化

**権限（Permission）**:

- 具体的な操作（create_post、delete_user等）
- リソースとアクション の組み合わせ

**関係**:

```
User → Role → Permission → Resource
```

---

### 実装パターン

**データベーススキーマ例**:

```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- ロールテーブル
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- 権限テーブル
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  resource VARCHAR(100) NOT NULL,   -- 'posts', 'users', 'comments'
  action VARCHAR(100) NOT NULL,     -- 'create', 'read', 'update', 'delete'
  UNIQUE(resource, action)
);

-- ユーザー-ロール関連
CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- ロール-権限関連
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

**TypeScript実装**:

```typescript
interface User {
  id: string;
  roles: Role[];
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  resource: string;
  action: string;
}

// 権限チェック
function hasPermission(user: User, resource: string, action: string): boolean {
  return user.roles.some((role) =>
    role.permissions.some(
      (p) => p.resource === resource && p.action === action,
    ),
  );
}

// ミドルウェア
const requirePermission = (resource: string, action: string) => {
  return (req, res, next) => {
    if (!hasPermission(req.user, resource, action)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};

app.delete("/api/users/:id", requirePermission("users", "delete"), deleteUser);
```

---

### ロール階層

**概念**: ロール間の継承関係

**例**:

```
SuperAdmin
  ├─ Admin
  │    ├─ Editor
  │    └─ Moderator
  └─ Manager
       └─ Employee
```

**実装**:

```sql
CREATE TABLE role_hierarchy (
  parent_role_id UUID REFERENCES roles(id),
  child_role_id UUID REFERENCES roles(id),
  PRIMARY KEY (parent_role_id, child_role_id)
);
```

**権限継承**:

```typescript
function getAllPermissions(role: Role): Permission[] {
  const direct = role.permissions;
  const inherited = role.parentRoles.flatMap((parent) =>
    getAllPermissions(parent),
  );
  return [...direct, ...inherited];
}
```

**判断基準**:

- [ ] ロール階層は循環していないか？
- [ ] 継承関係は論理的に正しいか（AdminがEditorの権限を含む等）？
- [ ] 最大階層深度は適切か（3-4レベル推奨）？

---

### RBAC の利点と欠点

**利点**:

- 管理が容易（ロール単位で権限管理）
- スケーラブル（ユーザー数増加に強い）
- 職務分離が明確
- 監査が容易

**欠点**:

- ロール爆発（役職が多いとロール数が膨大）
- コンテキスト考慮が困難（時間、場所、条件）
- 柔軟性に欠ける（細かい権限制御が難しい）

**使用ケース**:

- エンタープライズアプリケーション
- 明確な職務定義がある組織
- ユーザー数が多いシステム

---

## 2. ABAC（Attribute-Based Access Control）

### 概要

ユーザー、リソース、環境の「属性」に基づいてアクセスを制御する動的モデル。

### 構成要素

**Subject Attributes（主体属性）**:

- ユーザーの属性（role、department、clearanceLevel等）

**Resource Attributes（リソース属性）**:

- リソースの属性（owner、classification、createdAt等）

**Action Attributes（アクション属性）**:

- 実行する操作（read、write、delete等）

**Environment Attributes（環境属性）**:

- コンテキスト情報（時刻、IPアドレス、デバイス等）

---

### ポリシー例

**XACML風の表現**:

```xml
<!-- ポリシー: 勤務時間内のみドキュメント編集可能 -->
<Policy>
  <Target>
    <Resource>documents</Resource>
    <Action>edit</Action>
  </Target>
  <Rule Effect="Permit">
    <Condition>
      <Apply FunctionId="time-in-range">
        <CurrentTime/>
        <AttributeValue>09:00</AttributeValue>
        <AttributeValue>17:00</AttributeValue>
      </Apply>
      <Apply FunctionId="string-equal">
        <SubjectAttribute>department</SubjectAttribute>
        <AttributeValue>Engineering</AttributeValue>
      </Apply>
    </Condition>
  </Rule>
</Policy>
```

**TypeScript実装**:

```typescript
interface Policy {
  resource: string;
  action: string;
  conditions: Condition[];
}

interface Condition {
  attribute: string;
  operator: "eq" | "neq" | "in" | "gt" | "lt" | "between";
  value: any;
}

function evaluatePolicy(
  user: User,
  resource: Resource,
  action: string,
  environment: Environment,
): boolean {
  return policies.some((policy) => {
    if (policy.resource !== resource.type || policy.action !== action) {
      return false;
    }

    return policy.conditions.every((condition) => {
      const attributeValue = getAttribute(
        user,
        resource,
        environment,
        condition.attribute,
      );
      return evaluateCondition(
        attributeValue,
        condition.operator,
        condition.value,
      );
    });
  });
}
```

---

### ABAC の利点と欠点

**利点**:

- 非常に柔軟（複雑な条件を表現可能）
- コンテキスト考慮（時間、場所、状況）
- ロール爆発を回避
- 細粒度アクセス制御

**欠点**:

- 実装が複雑
- ポリシー管理が困難（大量のルール）
- パフォーマンス: ポリシー評価コストが高い
- デバッグが難しい

**使用ケース**:

- 複雑なビジネスルールがある組織
- コンテキスト依存のアクセス制御が必要
- 動的な権限変更が頻繁

---

## 3. ACL（Access Control List）

### 概要

リソースごとに「誰が何をできるか」を直接指定するシンプルなモデル。

### 実装

**ファイルシステム型ACL**:

```
File: document.pdf
  - User Alice: Read, Write
  - User Bob: Read
  - Group Editors: Read, Write
  - Group Viewers: Read
```

**データベース実装**:

```sql
CREATE TABLE acl_entries (
  id UUID PRIMARY KEY,
  resource_type VARCHAR(100) NOT NULL,    -- 'post', 'file', 'project'
  resource_id UUID NOT NULL,
  principal_type VARCHAR(50) NOT NULL,    -- 'user', 'group'
  principal_id UUID NOT NULL,
  permissions TEXT[] NOT NULL,            -- ['read', 'write', 'delete']
  UNIQUE(resource_type, resource_id, principal_type, principal_id)
);
```

**TypeScript実装**:

```typescript
interface AclEntry {
  resourceType: string;
  resourceId: string;
  principalType: "user" | "group";
  principalId: string;
  permissions: string[];
}

async function checkAcl(
  userId: string,
  resourceType: string,
  resourceId: string,
  requiredPermission: string,
): Promise<boolean> {
  // ユーザー直接権限をチェック
  const userEntry = await db.acl.findOne({
    resourceType,
    resourceId,
    principalType: "user",
    principalId: userId,
  });

  if (userEntry?.permissions.includes(requiredPermission)) {
    return true;
  }

  // グループ権限をチェック
  const userGroups = await db.userGroups.find({ userId });
  for (const group of userGroups) {
    const groupEntry = await db.acl.findOne({
      resourceType,
      resourceId,
      principalType: "group",
      principalId: group.id,
    });

    if (groupEntry?.permissions.includes(requiredPermission)) {
      return true;
    }
  }

  return false;
}
```

---

### ACL の利点と欠点

**利点**:

- シンプルで理解しやすい
- リソースごとの細かい制御
- 実装が容易

**欠点**:

- スケールしにくい（リソース数増加で管理困難）
- ユーザー数が多いと非効率
- 一貫性維持が難しい（リソースごとに設定）

**使用ケース**:

- ファイル共有システム
- ドキュメント管理
- 小規模アプリケーション
- リソース所有者が権限を管理するシステム

---

## 4. モデル選択ガイド

### 選択決定ツリー

```
アクセス制御のニーズは？
│
├─ 組織の職務に基づく？
│  ├─ はい → RBAC ✅
│  └─ コンテキスト（時間、場所）も考慮？
│     └─ はい → ABAC ✅
│
├─ リソースごとの個別制御？
│  ├─ リソース数は少ない？
│  │  └─ はい → ACL ✅
│  └─ リソース数は多い？
│     └─ RBAC + ACL のハイブリッド ✅
│
└─ 複雑なビジネスルール？
   └─ ABAC ✅
```

---

### ハイブリッドアプローチ

**RBAC + ACL**:

```typescript
// 1. まずRBACで基本権限チェック
const hasRolePermission = user.roles.some((role) =>
  role.permissions.includes("edit_documents"),
);

if (!hasRolePermission) {
  return false; // ロールレベルで権限なし
}

// 2. 次にACLでリソースレベル権限チェック
const hasResourcePermission = await checkAcl(
  user.id,
  "document",
  documentId,
  "edit",
);

return hasResourcePermission;
```

**RBAC + ABAC**:

```typescript
// 1. RBACで基本権限
const hasRole = user.roles.includes("editor");

// 2. ABACで動的条件
const isWorkingHours = isWithinBusinessHours();
const isOwnDepartment = document.department === user.department;

return hasRole && isWorkingHours && isOwnDepartment;
```

---

## 5. 実装比較表

| 特性                 | RBAC | ABAC  | ACL                |
| -------------------- | ---- | ----- | ------------------ |
| **複雑性**           | 中   | 高    | 低                 |
| **柔軟性**           | 中   | 高    | 低                 |
| **スケーラビリティ** | 高   | 中    | 低                 |
| **管理コスト**       | 中   | 高    | 高（リソース多時） |
| **パフォーマンス**   | 高   | 低-中 | 中-高              |
| **監査容易性**       | 高   | 中    | 中                 |
| **動的制御**         | 低   | 高    | 低                 |

---

## 6. デフォルト拒否原則

### Deny by Default

**概念**: 明示的に許可されていない限り、すべてのアクセスを拒否

**実装パターン**:

```typescript
// ✅ デフォルト拒否
function checkPermission(user, resource, action) {
  // ホワイトリストアプローチ
  const hasPermission = explicitlyAllowed(user, resource, action);
  return hasPermission; // false if not explicitly allowed
}

// ❌ デフォルト許可（危険）
function checkPermission(user, resource, action) {
  // ブラックリストアプローチ
  const isForbidden = explicitlyDenied(user, resource, action);
  return !isForbidden; // true unless explicitly denied
}
```

**適用例**:

```typescript
// すべてのAPIエンドポイントにデフォルトで認証を要求
app.use("/api/*", requireAuth);

// 公開エンドポイントは明示的に許可
app.get("/api/public/status", skipAuth, getStatus);
```

**判断基準**:

- [ ] 新しいエンドポイント追加時、デフォルトで保護されるか？
- [ ] ホワイトリストアプローチを採用しているか？
- [ ] 公開リソースは明示的にマークされているか？

---

## 7. 最小権限の原則

### Principle of Least Privilege

**概念**: ユーザーには業務遂行に必要最小限の権限のみを付与

**実装**:

```typescript
// ✅ 最小権限
const editorPermissions = [
  "posts:read",
  "posts:create",
  "posts:update",
  "own_posts:delete", // 自分の投稿のみ削除可能
];

// ❌ 過剰な権限
const editorPermissions = [
  "posts:*", // すべての投稿操作
  "users:read", // 不要
  "admin:*", // 危険
];
```

**動的権限調整**:

```typescript
// コンテキストに応じて権限を制限
function getEffectivePermissions(user, context) {
  const basePermissions = user.role.permissions;

  // 自分のリソースのみ操作可能
  if (context.resourceOwnerId !== user.id && !user.isAdmin) {
    return basePermissions.filter(
      (p) => !p.includes("delete") && !p.includes("update"),
    );
  }

  return basePermissions;
}
```

**判断基準**:

- [ ] ロールは業務に必要な最小限の権限のみを持つか？
- [ ] 管理者ロールが過剰に権限を持っていないか？
- [ ] 一時的な権限昇格メカニズムがあるか（sudo的な）？

---

## 8. 権限昇格脆弱性の検出

### 垂直権限昇格（Vertical Privilege Escalation）

**攻撃**: 一般ユーザーが管理者機能にアクセス

**検出パターン**:

```typescript
// ❌ 危険: ロールチェックなし
app.delete("/api/admin/users/:id", deleteUser);

// ✅ 安全: ロールチェックあり
app.delete("/api/admin/users/:id", requireRole("admin"), deleteUser);
```

**検出方法**:

- すべての`/admin/*`エンドポイントに認可チェックがあるか？
- センシティブ操作（削除、権限変更）にロールチェックがあるか？

---

### 水平権限昇格（Horizontal Privilege Escalation）

**攻撃**: ユーザーAがユーザーBのデータにアクセス

**検出パターン**:

```typescript
// ❌ 危険: 所有権チェックなし
app.get("/api/users/:userId/profile", async (req, res) => {
  const profile = await db.profiles.findOne(req.params.userId);
  res.json(profile);
});

// ✅ 安全: 所有権チェックあり
app.get("/api/users/:userId/profile", async (req, res) => {
  const requestedUserId = req.params.userId;
  const currentUserId = req.session.userId;

  if (requestedUserId !== currentUserId && !req.user.isAdmin) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const profile = await db.profiles.findOne(requestedUserId);
  res.json(profile);
});
```

**検出方法**:

- ユーザーIDパラメータを受け取るエンドポイントで所有権検証があるか？
- `req.params.userId === req.session.userId`のチェックがあるか？

---

### IDOR（Insecure Direct Object Reference）

**攻撃**: 予測可能なID（1, 2, 3...）で他人のリソースにアクセス

**脆弱な実装**:

```
GET /api/orders/1234  ← 1235, 1236... と試せば他人の注文が見える
```

**対策**:

```typescript
// 対策1: 所有権検証
app.get("/api/orders/:orderId", async (req, res) => {
  const order = await db.orders.findOne(req.params.orderId);

  if (order.userId !== req.session.userId && !req.user.isAdmin) {
    return res.status(404).json({ error: "Not found" }); // 403ではなく404
  }

  res.json(order);
});

// 対策2: UUIDの使用（予測困難）
// 1234 → '550e8400-e29b-41d4-a716-446655440000'

// 対策3: 間接参照
// ユーザーが直接IDを指定せず、"自分の注文"としてアクセス
app.get("/api/my-orders/:index", async (req, res) => {
  const orders = await db.orders.find({ userId: req.session.userId });
  const order = orders[req.params.index];
  res.json(order);
});
```

**判断基準**:

- [ ] リソースIDは予測困難か（UUID推奨）？
- [ ] IDパラメータで所有権が検証されているか？
- [ ] 404エラーで情報漏洩していないか（403は存在を示唆）？

---

## 9. アクセス制御の一貫性

### すべてのエンドポイントでの検証

**問題**: 一部のエンドポイントで認可チェックが漏れる

**対策**:

```typescript
// ベースとなる認可ミドルウェアを全エンドポイントに適用
app.use("/api/*", requireAuth);

// デフォルトで権限チェック
app.use("/api/*", checkDefaultPermissions);

// 例外的に公開するエンドポイントは明示的にスキップ
app.get("/api/public/health", skipAuth, healthCheck);
```

**自動テスト**:

```typescript
// 全エンドポイントで認証なしアクセスを試行
describe("Authorization Tests", () => {
  const endpoints = [
    "GET /api/users",
    "POST /api/posts",
    "DELETE /api/comments/:id",
  ];

  endpoints.forEach((endpoint) => {
    it(`${endpoint} should require authentication`, async () => {
      const response = await request(app).get(endpoint);
      expect(response.status).toBe(401); // Unauthorized
    });
  });
});
```

**判断基準**:

- [ ] すべてのAPIエンドポイントにデフォルトで認証が必要か？
- [ ] 認可チェックの漏れを検出するテストがあるか？
- [ ] 新しいエンドポイント追加時、デフォルトで保護されるか？

---

## 10. 実装チェックリスト

### RBAC実装

- [ ] ユーザー、ロール、権限のデータモデルが定義されている
- [ ] ロール階層（該当する場合）が循環していない
- [ ] 権限チェックはサーバーサイドで行われている
- [ ] デフォルト拒否原則が適用されている
- [ ] 最小権限の原則に従っている

### ABAC実装

- [ ] ポリシー評価エンジンが実装されている
- [ ] 属性（Subject、Resource、Environment）が定義されている
- [ ] ポリシーは読みやすく、管理可能な形式で保存されている
- [ ] パフォーマンスが許容範囲内か（キャッシュ活用）

### ACL実装

- [ ] リソースごとのACLエントリが管理されている
- [ ] グループ権限が考慮されている
- [ ] 所有者には自動的に全権限が付与されている
- [ ] ACLエントリの継承メカニズムがある（該当する場合）

### 共通チェック

- [ ] 権限チェックはすべてのAPIエンドポイントにある
- [ ] クライアントサイドの権限チェックはUIのみ（セキュリティではない）
- [ ] 権限昇格（垂直・水平）への対策がある
- [ ] IDOR脆弱性への対策がある
- [ ] 監査ログが記録されている

---

## 参考文献

- **NIST RBAC Model**: https://csrc.nist.gov/projects/role-based-access-control
- **XACML (eXtensible Access Control Markup Language)**: OASIS標準
- **OWASP Access Control Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html
- **OAuth 2.0 Scope Best Practices**: https://www.oauth.com/oauth2-servers/scope/

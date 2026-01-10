# Policy Enforcer

## 1. メタ情報

| 項目     | 値                                                   |
| -------- | ---------------------------------------------------- |
| Agent ID | policy-enforcer                                      |
| スキル   | zero-trust-security                                  |
| トリガー | ポリシー適用、マイクロセグメンテーション、実行時制御 |
| 入力     | アクセス制御ポリシー、リクエストコンテキスト         |
| 出力     | 適用結果、ポリシー違反レポート                       |

## 2. プロフィール

**役割**: ポリシーの実行時適用とマイクロセグメンテーションを担当するエージェント

**専門性**:

- ポリシー決定点（PDP）の設計
- ポリシー適用点（PEP）の実装
- マイクロセグメンテーション
- サービスメッシュ統合

**原則**:

- 全てのリクエストでポリシーを評価
- ポリシー違反は明示的に拒否
- 監査証跡を完全に記録

## 3. 知識ベース

### 参照リソース

| リソース   | パス                                                   | 用途         |
| ---------- | ------------------------------------------------------ | ------------ |
| 継続的検証 | `references/continuous-verification-implementation.md` | 実行時検証   |
| RBAC実装   | `references/rbac-implementation.md`                    | ポリシー適用 |

### 知識アンカー

- **Zero Trust Networks (Evan Gilman)**: マイクロセグメンテーション
- **XACML**: ポリシー言語標準

## 4. 実行仕様

### 入力スキーマ

```typescript
interface PolicyEnforcementInput {
  request: {
    subject: string; // ユーザー/サービスID
    resource: string; // リソースパス
    action: string; // 操作
    context: Record<string, any>; // 追加コンテキスト
  };
  policies: Policy[];
  enforcementMode: "strict" | "permissive" | "audit-only";
}
```

### 実行ステップ

1. **リクエスト評価**
   - ポリシー照合
   - コンテキスト属性の評価
   - 条件の検証

2. **決定実行**
   - 許可/拒否の決定
   - 理由の記録
   - 監査ログ出力

3. **セグメンテーション適用**
   - ネットワークレベルの制御
   - サービス間通信の制限
   - 動的ルール更新

### 出力スキーマ

```typescript
interface PolicyEnforcementResult {
  decision: "allow" | "deny";
  reason: string;
  appliedPolicies: string[];
  violations?: Array<{
    policy: string;
    condition: string;
    actual: any;
    expected: any;
  }>;
  auditRecord: {
    timestamp: string;
    requestId: string;
    subject: string;
    resource: string;
    decision: string;
  };
}
```

## 5. インターフェース

### ポリシー評価フロー

```typescript
// Policy Decision Point (PDP)
interface PolicyDecisionPoint {
  evaluate(request: AccessRequest): Promise<Decision>;
  getApplicablePolicies(resource: string): Policy[];
  resolveConflicts(decisions: Decision[]): Decision;
}

// Policy Enforcement Point (PEP)
interface PolicyEnforcementPoint {
  intercept(request: Request): Promise<void>;
  enforce(decision: Decision): void;
  audit(request: Request, decision: Decision): void;
}
```

### マイクロセグメンテーションパターン

```yaml
# サービスメッシュポリシー例
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: user-service-policy
spec:
  selector:
    matchLabels:
      app: user-service
  rules:
    - from:
        - source:
            principals:
              - cluster.local/ns/default/sa/api-gateway
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/api/users/*"]
```

### 適用モード

| モード     | 動作                     | 用途         |
| ---------- | ------------------------ | ------------ |
| strict     | 違反は即座に拒否         | 本番環境     |
| permissive | 違反はログのみ、通過許可 | 移行期間     |
| audit-only | 評価のみ、適用なし       | ポリシー検証 |

### 連携エージェント

| エージェント      | 連携タイミング | 受け取るデータ       |
| ----------------- | -------------- | -------------------- |
| access-controller | ポリシー取得時 | アクセス制御ポリシー |
| trust-evaluator   | 評価時         | 信頼スコア           |

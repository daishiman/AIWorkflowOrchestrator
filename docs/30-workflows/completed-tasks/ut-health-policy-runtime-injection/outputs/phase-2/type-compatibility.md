# Phase 2: 型互換性検証テーブル（下書き）

## 型互換性テーブル

| Factory/DI                                     | 渡す具象型                  | 受け取り先 Interface / 引数型                                 | 互換性 |
| ---------------------------------------------- | --------------------------- | ------------------------------------------------------------- | ------ |
| `resolveHealthPolicy()`                        | `HealthPolicy`              | `RuntimePolicyResolver` 第3引数 `healthPolicy?: HealthPolicy` | ✅     |
| `RuntimeSkillCreatorFacadeDeps.healthPolicy`   | `HealthPolicy \| undefined` | `RuntimePolicyResolver` 第3引数 `healthPolicy?: HealthPolicy` | ✅     |
| `options?.healthPolicy ?? runtimeHealthPolicy` | `HealthPolicy`              | `RuntimeSkillCreatorFacadeDeps.healthPolicy?: HealthPolicy`   | ✅     |

## 型定義確認

### HealthPolicy インターフェース

```typescript
// packages/shared/src/types/health-policy.ts:32
export interface HealthPolicy {
  isConnectionAvailable: boolean;
  isDegraded: boolean;
  isRateLimited: boolean;
  healthStatus: "healthy" | "degraded" | "unknown";
  lastCheckedAt: Date | null;
}
```

### resolveHealthPolicy() シグネチャ

```typescript
// packages/shared/src/types/health-policy.ts:94
export function resolveHealthPolicy(input: HealthPolicyInput): HealthPolicy;
```

### RuntimePolicyResolver 第3引数

```typescript
// apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts:43
constructor(
  private readonly authKeyService?: IAuthKeyService,
  private readonly subscriptionAuthProvider?: ISubscriptionAuthProvider,
  private readonly healthPolicy?: HealthPolicy,  // 第3引数
)
```

## 互換性判定: PASS

全ての型渡しが `HealthPolicy | undefined` → `healthPolicy?: HealthPolicy` であり、
TypeScript の型システム上で完全に互換。

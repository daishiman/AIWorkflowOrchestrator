# Phase 3: 型互換性検証テーブル（確定版）

## 確定版型互換性テーブル

| DI 渡し元                                      | 渡す具象型                  | 受け取り先 Interface / 引数型                                 | 互換性  |
| ---------------------------------------------- | --------------------------- | ------------------------------------------------------------- | ------- |
| `resolveHealthPolicy()`                        | `HealthPolicy`              | `RuntimePolicyResolver` 第3引数 `healthPolicy?: HealthPolicy` | ✅ PASS |
| `RuntimeSkillCreatorFacadeDeps.healthPolicy`   | `HealthPolicy \| undefined` | `RuntimePolicyResolver` 第3引数 `healthPolicy?: HealthPolicy` | ✅ PASS |
| `options?.healthPolicy ?? runtimeHealthPolicy` | `HealthPolicy`              | `RuntimeSkillCreatorFacadeDeps.healthPolicy?: HealthPolicy`   | ✅ PASS |

## 検証根拠

### HealthPolicy 型の export 確認

```
packages/shared/src/types/health-policy.ts:32   export interface HealthPolicy { ... }
packages/shared/src/types/health-policy.ts:94   export function resolveHealthPolicy(...): HealthPolicy
packages/shared/src/types/index.ts              → re-exports from health-policy.ts
```

### 既存 shared import パターン確認

```typescript
// RuntimeSkillCreatorFacade.ts では既に @repo/shared/types からの import が存在
// HealthPolicy もこのパターンで import 済み
import type { HealthPolicy } from "@repo/shared/types"; // ✅
```

### TypeScript コンパイル確認

```
pnpm --filter @repo/desktop typecheck → エラー 0 件 ✅
```

## 判定: PASS（全行互換確認済み）

# Phase 2: 設計決定記録

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 2                                      |
| 作成日 | 2026-04-14                             |
| タスク | UT-HEALTH-POLICY-RUNTIME-INJECTION-001 |

---

## 設計決定一覧

| 決定事項                    | 選択                     | 理由                                                           |
| --------------------------- | ------------------------ | -------------------------------------------------------------- |
| DI 方式                     | Constructor Injection    | 既存の `Deps` パターンに合わせる。不変性・テスタビリティを確保 |
| `healthPolicy` 生成方法     | アプローチ B（即時生成） | スコープ最小化・後方互換性優先。新規ファイル不要               |
| Setter Injection 採用       | 不採用                   | 本タスクのスコープ外。後続タスクで検討                         |
| `HealthCheckCache` 新規作成 | 不採用                   | 本タスクのスコープ外。動的更新は別タスク                       |
| `healthPolicy` の必須化     | 不採用                   | 後方互換性を破壊する。optional が適切                          |

---

## T-02-1: `RuntimeSkillCreatorFacadeDeps` への型追加設計

```typescript
import type { HealthPolicy } from "@repo/shared/types";

export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  // ... 既存フィールド ...
  /** 起動時に注入する HealthPolicy（UT-HEALTH-POLICY-RUNTIME-INJECTION-001） */
  healthPolicy?: HealthPolicy; // 追加
}
```

**型配置判断**: `HealthPolicy` は `packages/shared/src/types/health-policy.ts` に定義済み。
`import type { HealthPolicy } from "@repo/shared/types"` パターンで import 可能。

---

## T-02-2: コンストラクタ修正設計

**変更前（問題の状態）**:

```typescript
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
  // healthPolicy が渡されていない → デッドコード
);
```

**変更後（修正後）**:

```typescript
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
  deps.healthPolicy, // 追加: 3番目引数として渡す
);
```

**後方互換性**: `healthPolicy` は optional のため、未渡しの場合は `undefined` として動作。

---

## T-02-3: アプローチ B（即時生成）の採用

`index.ts` での `healthPolicy` 生成方針:

```typescript
const runtimeHealthPolicy = resolveHealthPolicy({
  connectionStatus: "connected",
  isApiKeyValid: true,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: null, // 初回 → healthStatus: "unknown", isDegraded: false
});
```

採用理由:

1. 本タスクの目的は DI チェーンの接続であり、動的更新は別タスクに切り分ける
2. `lastHealthCheck: null` により既存動作を壊さず、`isDegraded` を既定で false に保てる
3. 追加ファイルが不要で後続の再検証コストが低い

---

## T-02-4: HealthPolicy の import パス確認

```bash
# 確認結果
packages/shared/src/types/health-policy.ts:32  export interface HealthPolicy { ... }
packages/shared/src/types/health-policy.ts:94  export function resolveHealthPolicy(...): HealthPolicy
```

`@repo/shared/types` から正常に export 済み ✅

---

## IPC ハンドラ変更確認

- IPC チャンネルの追加・変更: **なし**
- Preload API 変更: **なし**
- Renderer 側コード変更: **なし**

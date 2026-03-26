# [#1606] "[UT-HEALTH-POLICY-RUNTIME-INJECTION-001] 未タスク仕様書: UT"

## メタ情報

```yaml
task_id: UT-HEALTH-POLICY-RUNTIME-INJECTION-001
task_name: 未タスク仕様書: UT
category: -
target_feature: -
priority: HIGH
scale: -
status: unassigned
source_phase: -
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-HEALTH-POLICY-RUNTIME-INJECTION-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | HIGH       |
| 規模       | -          |
| ステータス | unassigned |

---

## 背景・目的

`TASK-IMP-HEALTH-POLICY-UNIFICATION-001` の実装により、`RuntimePolicyResolver` のコンストラクタに3番目の optional パラメータ `healthPolicy?: HealthPolicy` が追加された（`RuntimePolicyResolver.ts:43`）。

しかし、この3番目の引数を実際に渡す呼び出し元が未実装のまま残っている。具体的には `apps/desktop/src/main/ipc/index.ts:904-911` の `new RuntimeSkillCreatorFacade({...})` を経由して、`RuntimeSkillCreatorFacade.ts:72-75` が `new RuntimePolicyResolver(deps.authKeyService, deps.subscriptionAuthProvider)` と **2引数** で呼んでおり、3番目の `healthPolicy` が渡されていない。

この状態では `RuntimePolicyResolver` に追加した `isDegraded` チェック（D-4）が実質的に機能しない（デッドコード）。30種思考法分析で「最大リスク: 注入元未実装による永続的デッドコード化」として検出された。

## 対象ファイル

### 主要変更ファイル

| ファイル                                                              | 変更種別 | 理由                                                                                                                                                        |
| --------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正     | `RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` を追加し、コンストラクタ L72-75 の `new RuntimePolicyResolver()` 呼び出しに3番目引数を渡す |
| `apps/desktop/src/main/ipc/index.ts`                                  | 修正     | `RuntimeSkillCreatorFacade` のインスタンス生成箇所（L904-911）で `healthPolicy` を生成・渡す                                                                |

### 影響を受けるテストファイル

| ファイル                                                                                     | 変更種別 | 理由                                                            |
| -------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`         | 修正     | `mockHealthPolicy` の追加、`healthPolicy` DI テストケースの追加 |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`    | 修正     | 必要に応じて `healthPolicy` モック追加                          |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | 修正     | 必要に応じて `healthPolicy` モック追加                          |

### 参考ファイル（変更なし）

| ファイル                                                                                       | 参照理由                                                                |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `packages/shared/src/types/health-policy.ts`                                                   | `HealthPolicy` インターフェース・`resolveHealthPolicy()` 純粋関数の定義 |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                              | 3番目引数の受け取り側実装（変更不要）                                   |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts` | `healthPolicy` DI の使用例（モック構築パターンの参照元）                |
| `apps/desktop/src/main/adapters/llm/BaseLLMAdapter.ts`                                         | `checkHealth()` の戻り値型 `HealthCheckResult` の参照                   |

## 変更内容

### 1. HealthPolicy 生成ロジックの設計

`HealthPolicy` を生成するには `HealthCheckResult`（`BaseLLMAdapter.checkHealth()` の戻り値）が必要。現状の Main Process には LLM ヘルスチェック結果をキャッシュするサービスが存在しない。

以下の2アプローチが考えられる。設計判断はこのタスクの実装者が行う。

**アプローチA: ヘルスチェック結果の最終値をキャッシュするシングルトン**

```typescript
// apps/desktop/src/main/services/HealthCheckCache.ts (新規)
import { resolveHealthPolicy, HealthPolicy } from "@repo/shared/types";
import type { HealthCheckResult } from "@repo/shared/types/llm/schemas";

export class HealthCheckCache {
  private static lastResult: HealthCheckResult | null = null;

  static update(result: HealthCheckResult): void {
    this.lastResult = result;
  }

  static resolvePolicy(): HealthPolicy {
    return resolveHealthPolicy({
      connectionStatus:
        this.lastResult?.status === "healthy" ? "connected" : "error",
      isApiKeyValid: this.lastResult !== null,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: this.lastResult,
    });
  }
}
```

**アプローチB: `RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` を直接追加し、呼び出し元で生成**

`index.ts` の `new RuntimeSkillCreatorFacade({...})` で `resolveHealthPolicy()` を即時呼び出し（`lastHealthCheck: null` → `healthStatus: "unknown"` → `isDegraded: false` として扱う）。

後続の Setter Injection パターン（`setLLMAdapter` と同様）で `setHealthPolicy(policy: HealthPolicy): void` メソッドを追加し、LLM ヘルスチェック完了後に注入する設計も有効。

### 2. `RuntimeSkillCreatorFacadeDeps` への追加

```typescript
// apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
import type { HealthPolicy } from "@repo/shared/types";

export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter;
  resourceLoader?: ResourceLoader;
  skillFileManager?: SkillFileManager;
  skillFileWriter?: SkillFileWriter;
  healthPolicy?: HealthPolicy; // 追加
}
```

### 3. コンストラクタの修正（L72-75）

```typescript
// 変更前
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
);

// 変更後
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
  deps.healthPolicy,
);
```

### 4. `index.ts` での `healthPolicy` 生成と渡し（L904-911）

```typescript
import { resolveHealthPolicy } from "@repo/shared/types";

const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
      resourceLoader,
      healthPolicy: resolveHealthPolicy({
        connectionStatus: "connected", // 初期値: 後でヘルスチェック結果で更新
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: null, // 未実施 → healthStatus: "unknown", isDegraded: false
      }),
    })
  : undefined;
```

あるいは Setter Injection を採用する場合:

```typescript
// RuntimeSkillCreatorFacade にメソッド追加
setHealthPolicy(policy: HealthPolicy): void {
  (this.resolver as RuntimePolicyResolver).setHealthPolicy(policy);
}
```

この場合 `RuntimePolicyResolver` にも `setHealthPolicy()` の追加が必要。

### 5. テストへの `mockHealthPolicy` 追加

```typescript
// RuntimeSkillCreatorFacade.test.ts の beforeEach に追加
import type { HealthPolicy } from "@repo/shared/types";

const mockHealthPolicy: HealthPolicy = {
  isConnectionAvailable: true,
  isDegraded: false,
  isRateLimited: false,
  healthStatus: "healthy",
  lastCheckedAt: new Date("2026-03-25T00:00:00Z"),
};

// facade 生成時に渡す
facade = new RuntimeSkillCreatorFacade({
  skillExecutor: mockSkillExecutor,
  healthPolicy: mockHealthPolicy,
});
```

`isDegraded: true` を渡した場合に `plan()` / `improve()` が `terminal_handoff` を返すことを検証するテストケースも追加すること。

## 受入基準

- [ ] `RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` が追加されている
- [ ] `RuntimeSkillCreatorFacade` のコンストラクタが `new RuntimePolicyResolver()` に3番目の引数（`deps.healthPolicy`）を渡している
- [ ] `apps/desktop/src/main/ipc/index.ts` の `new RuntimeSkillCreatorFacade({...})` で `healthPolicy` が生成・渡されている（`undefined` のままではない）
- [ ] `isDegraded: true` の `healthPolicy` を渡した `RuntimeSkillCreatorFacade` で `plan()` を呼ぶと `{ type: "terminal_handoff" }` が返ることをテストで検証している
- [ ] `healthPolicy` を渡さない（`undefined`）場合の後方互換性が保たれており、既存テストが全PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] 関連テストファイルが全PASS（`RuntimeSkillCreatorFacade.test.ts`, `RuntimeSkillCreatorFacade.plan.test.ts`, `RuntimeSkillCreatorFacade.improve.test.ts`）

## 苦戦箇所（ナレッジ）

### HealthCheckResult の取得経路

Main Process 側に LLM ヘルスチェック結果をリアルタイムで保持するサービスが存在しない。`BaseLLMAdapter.checkHealth()` は呼び出すたびに実際の HTTP リクエストを行う。定期ポーリングまたはキャッシュ機構の設計が必要になる可能性がある。

`lastHealthCheck: null` を渡す場合、`resolveHealthPolicy()` は `healthStatus: "unknown"`, `isDegraded: false` を返す（`health-policy.ts:95-103`）。これにより `RuntimePolicyResolver` の isDegraded チェックは false となり、既存の API Key / Subscription ベースのロジックが引き続き使用される。初期実装としては許容できる状態。

### DI コンテナ不在の問題

このプロジェクトには正式な DI コンテナが存在せず、`index.ts` で全サービスを手動配線している（P34 参照）。`healthPolicy` が動的に変化する（LLM 接続状態に応じてリアルタイム更新が必要）場合、Setter Injection パターン（`setHealthPolicy()`）の採用を検討する。これは既存の `setLLMAdapter()` と同じパターン。

### `RuntimePolicyResolver` への Setter 追加の要否

`RuntimePolicyResolver` が `readonly` フィールドで `healthPolicy` を持つ現在の設計では、インスタンス生成後の更新ができない。Setter Injection を採用する場合、`RuntimePolicyResolver` に `setHealthPolicy(policy: HealthPolicy): void` の追加と、`readonly` の除去が必要。

### テストへの影響範囲

`RuntimeSkillCreatorFacade` のテストファイルは3つあり（`.test.ts`, `.plan.test.ts`, `.improve.test.ts`）、それぞれに `mockHealthPolicy` の追加が必要になる可能性がある。P21 / P35（DI 追加時のテストモック大規模修正）に注意。

## 依存関係

- 前提: `TASK-IMP-HEALTH-POLICY-UNIFICATION-001` 完了（`RuntimePolicyResolver` への3番目引数追加、`resolveHealthPolicy()` 純粋関数実装）
- 関連: `UT-HEALTH-POLICY-MAINLINE-MIGRATION-001`（Renderer 側の `useMainlineExecutionAccess` 移行タスク、同じ親タスクから派生）
- 参照: `.claude/rules/06-known-pitfalls.md` P21, P34, P35, P62

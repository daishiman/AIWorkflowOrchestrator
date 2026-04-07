# フェーズ2: 設計書

## DI タイミング設計判断

### 選択肢の評価

| アプローチ                  | メリット           | デメリット                   | 採否     |
| --------------------------- | ------------------ | ---------------------------- | -------- |
| A: 起動時静的注入           | シンプル、変更最小 | 起動後の状態変化を反映しない | **採用** |
| B: per-request 動的生成     | 常に最新           | 現行アーキテクチャと乖離大   | 非採用   |
| C: IHealthPolicyProvider DI | 柔軟               | インターフェース変更が必要   | 非採用   |

**採用理由**: `RuntimePolicyResolver` は起動時に1回だけ生成されるシングルトン的な使い方をしている。
タスク仕様書も「コンストラクタに渡す」という静的注入を前提に書かれている。
degraded 状態の検出は起動時の初回 HealthCheck で十分（接続断は起動直後に判明する）。

## コンポーネント設計

### 新規ファイル: `buildHealthPolicy.ts`

```
apps/desktop/src/main/services/runtime/buildHealthPolicy.ts
```

**責務**: LLMAdapterFactory からHealthCheckを実行し、HealthPolicy を構築して返す。

```typescript
export async function buildHealthPolicy(
  fallbackProviderId?: LLMProviderId,
): Promise<HealthPolicy>;
```

**フロー**:

1. `getSelectedLLMConfig()` から現在選択中のプロバイダーIDを取得
2. 未選択の場合は `fallbackProviderId`（デフォルト: `"anthropic"`）を使用
3. `LLMAdapterFactory.getAdapter(providerId)` でアダプターを取得
4. `adapter.checkHealth()` で HealthCheckResult を取得
5. `resolveHealthPolicy()` で HealthPolicy に変換して返す
6. 例外発生時は `null` HealthCheck → `unknown` HealthPolicy にフォールバック

### 修正ファイル1: `index.ts`

```typescript
// 変更前
const runtimePolicyResolver = new RuntimePolicyResolver(
  authKeyService,
  subscriptionAuthProvider,
);

// 変更後
const healthPolicy = await buildHealthPolicy();
const runtimePolicyResolver = new RuntimePolicyResolver(
  authKeyService,
  subscriptionAuthProvider,
  healthPolicy,
);
```

### 修正ファイル2: `RuntimeSkillCreatorFacade.ts`

```typescript
// deps 型に追加
export interface RuntimeSkillCreatorFacadeDeps {
  // ... 既存フィールド ...
  healthPolicy?: HealthPolicy; // 追加
}

// コンストラクタ内
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
  deps.healthPolicy, // 追加
);
```

## 依存関係

```
buildHealthPolicy.ts
  ├── LLMAdapterFactory (既存)
  ├── getSelectedLLMConfig (既存)
  └── resolveHealthPolicy (既存, @repo/shared/types)

index.ts
  └── buildHealthPolicy (新規)

RuntimeSkillCreatorFacade.ts
  └── HealthPolicy 型 (既存, @repo/shared/types)
```

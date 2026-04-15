# Phase 12: 実装ガイド — UT-HEALTH-POLICY-RUNTIME-INJECTION-001

---

## Part 1: 中学生レベルの説明

### なぜこの修正が必要だったか

コンピュータのプログラムには、「スイッチはあるけれど、ずっとオフのまま」という状態になることがあります。

今回のケースでは:

- **あるべき状態**: AIの調子が悪い（`isDegraded: true`）ときに、特別な対応（`terminal_handoff`）をする
- **問題の状態**: AIの調子チェック機能（`healthPolicy`）が、実際には届いていなかった

たとえるなら、病院の受付に「患者の状態を教えてください」という指示書（`healthPolicy`）を渡し忘れていたようなものです。

指示書がないので、受付（`RuntimePolicyResolver`）は「とりあえず普通に処理して」と判断し続けていました。これが**デッドコード**（動かないコード）の状態です。

### 修正でしたこと

1. **指示書の作成** — `index.ts` で `resolveHealthPolicy()` を使って `runtimeHealthPolicy` を組み立てた
2. **指示書の受け渡し** — `RuntimeSkillCreatorFacade` の Deps（依存関係の箱）に `healthPolicy?` を追加し、必要なら `runtimeHealthPolicy` をフォールバックとして渡せるようにした
3. **受付への伝達** — `RuntimeSkillCreatorFacade` のコンストラクタで3番目の引数として `RuntimePolicyResolver` に渡し、共通 `RuntimePolicyResolver` 側も同じ `effectiveRuntimeHealthPolicy` を使うよう整理した

この3ステップで「スイッチ」が有効になりました。

---

## Part 2: 技術者向け詳細

### 変更の全体像

```
index.ts
  ↓ resolveHealthPolicy({...}) で runtimeHealthPolicy を生成
  ↓ effectiveRuntimeHealthPolicy = options?.healthPolicy ?? runtimeHealthPolicy
  ├─ new RuntimePolicyResolver(authKey, subscriptionAuth, effectiveRuntimeHealthPolicy)
  └─ new RuntimeSkillCreatorFacade({
       ...,
       healthPolicy: effectiveRuntimeHealthPolicy,
     })
       ↓ constructor 内で
       ↓ new RuntimePolicyResolver(authKey, subscriptionAuth, deps.healthPolicy)
         ↓ if (this.healthPolicy?.isDegraded) → terminal_handoff
```

### `RuntimeSkillCreatorFacadeDeps` の型変化

```typescript
// Before（修正前）
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  // ... 他フィールド ...
  // healthPolicy なし → RuntimePolicyResolver は isDegraded を常に false で処理
}

// After（修正後）
export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  // ... 他フィールド ...
  /** 起動時に注入する HealthPolicy（UT-HEALTH-POLICY-RUNTIME-INJECTION-001） */
  healthPolicy?: HealthPolicy; // 追加
}
```

### コンストラクタの変化

```typescript
// Before
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
  // healthPolicy が渡されていない → isDegraded 常時 false
);

// After
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
  deps.healthPolicy, // 追加: 3番目引数として DI
);
```

### `resolveHealthPolicy()` の使い方と初期値

```typescript
// apps/desktop/src/main/ipc/index.ts
const runtimeHealthPolicy = resolveHealthPolicy({
  connectionStatus: "connected",
  isApiKeyValid: true,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: null, // 未実施 → unknown / isConnectionAvailable: false / isDegraded: false
});
const effectiveRuntimeHealthPolicy =
  options?.healthPolicy ?? runtimeHealthPolicy;

// RuntimeSkillCreatorFacade への注入
healthPolicy: (effectiveRuntimeHealthPolicy,
  //            ↑ テスト時の上書き / 本番時のフォールバック

  // 共通 RuntimePolicyResolver への注入
  new RuntimePolicyResolver(
    authKeyService,
    subscriptionAuthProvider,
    effectiveRuntimeHealthPolicy,
  ));
// どちらの経路も同じ effectiveRuntimeHealthPolicy を使う
```

`options?.healthPolicy ?? runtimeHealthPolicy` は
`RuntimeSkillCreatorFacade` の経路だけでなく `RuntimePolicyResolver` にも
同じ値を渡すための共通フォールバックである。
そのため、「起動時の安全な既定値を使う経路」と
「テストや明示指定で差し替える経路」を 1 行で両立している。

### エラーケースと後方互換性

| ケース                           | 動作                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `healthPolicy` を渡さない        | `runtimeHealthPolicy` が共通フォールバックされ、`healthStatus: "unknown"` / `isConnectionAvailable: false` / `isDegraded: false` で起動する |
| `healthPolicy.isDegraded: false` | 正常フロー（通常の `plan` / `execute` / `improve`）                                                                                         |
| `healthPolicy.isDegraded: true`  | `terminal_handoff` を返す（LLM 呼び出しなし）                                                                                               |

### 設定値・定数・引数一覧

| 名前                      | 型                                         | 初期値 / デフォルト | 説明                                                                 |
| ------------------------- | ------------------------------------------ | ------------------- | -------------------------------------------------------------------- |
| `connectionStatus`        | `"connected" \| "disconnected" \| "error"` | `"connected"`       | `resolveHealthPolicy` 入力。現在の接続状態                           |
| `isApiKeyValid`           | `boolean`                                  | `true`              | `resolveHealthPolicy` 入力。API キー有効性。現行分岐では参照されない |
| `apiKeyDegraded`          | `boolean`                                  | `false`             | `resolveHealthPolicy` 入力。API キー劣化状態                         |
| `isRateLimited`           | `boolean`                                  | `false`             | `resolveHealthPolicy` 入力。レート制限状態                           |
| `lastHealthCheck`         | `HealthCheckResult \| null`                | `null`              | `resolveHealthPolicy` 入力。`null` の場合は `unknown` を返す         |
| `healthPolicy.isDegraded` | `boolean`                                  | `false`             | 劣化フラグ。`true` のとき `terminal_handoff` を返す                  |

### 動的更新（将来タスク）

現在の実装は起動時に1回 `resolveHealthPolicy()` を呼ぶのみ（静的）。
動的なヘルスチェック結果の反映は別タスクで実装予定:

- `Setter Injection` パターン（`facade.setHealthPolicy(policy)` 等）
- または `HealthCheckCache` シングルトンによる共有状態管理

# Phase 12: 実装ガイド — UT-HEALTH-POLICY-RUNTIME-INJECTION-001

## Part 1: 中学生レベルの説明

### なぜ必要か

体調が悪いときに無理をすると事故につながります。システムでも同じで、接続の調子が悪いときは「自動のやり方」ではなく「手動のやり方」へ切り替えるのが安全です。

今回の問題は、体調メモ（`healthPolicy`）が担当者に届いていなかったことです。メモが届かなければ、調子が悪いことに気づけません。

### 何をしたか

- 体調メモ（`healthPolicy`）を作って、判断係（`RuntimePolicyResolver`）へ渡すようにした
- 調子が悪いときは自動実行ではなく手動の案内（`terminal_handoff`）に切り替える

### たとえ

先生に「今日は体調が悪いです」と書いた連絡帳を、先生にちゃんと渡すようにした。すると先生が「今日は無理せず保健室で休もう」と判断できる。

---

## Part 2: 技術者向け説明

### 変更内容（実装済み）

#### 1) `RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` を追加

```typescript
import type { HealthPolicy } from "@repo/shared/types";

export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter;
  resourceLoader?: ResourceLoader;
  skillFileManager?: SkillFileManager;
  skillFileWriter?: SkillFileWriter;
  healthPolicy?: HealthPolicy;
}
```

#### 2) `RuntimePolicyResolver` 呼び出しに第3引数を追加

```typescript
this.resolver = new RuntimePolicyResolver(
  deps.authKeyService,
  deps.subscriptionAuthProvider,
  deps.healthPolicy,
);
```

#### 3) `apps/desktop/src/main/ipc/index.ts` で `healthPolicy` を生成して注入

```typescript
import { resolveHealthPolicy } from "@repo/shared/types";

const runtimeHealthPolicy = resolveHealthPolicy({
  connectionStatus: "connected",
  isApiKeyValid: true,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: null,
});

const runtimePolicyResolver = new RuntimePolicyResolver(
  authKeyService,
  subscriptionAuthProvider,
  runtimeHealthPolicy,
);

const runtimeSkillCreatorService = skillExecutor
  ? new RuntimeSkillCreatorFacade({
      skillExecutor,
      authKeyService,
      skillFileWriter,
      resourceLoader,
      sourceResolver,
      resourcePlanner,
      resolvedResourceReader,
      skillFileManager,
      notificationService,
      healthPolicy: runtimeHealthPolicy,
    })
  : undefined;
```

### テスト追加（実装済み）

- `RuntimeSkillCreatorFacade.plan.test.ts`: degraded policy + api-key 有効でも `terminal_handoff`
- `RuntimeSkillCreatorFacade.test.ts`: execute 側の degraded policy
- `RuntimeSkillCreatorFacade.improve.test.ts`: improve 側の degraded policy

### エラーハンドリング / 後方互換性

| ケース                             | 動作                                           |
| ---------------------------------- | ---------------------------------------------- |
| `healthPolicy` 未指定              | 既存ロジック維持（後方互換）                   |
| `healthPolicy.isDegraded === true` | `terminal_handoff` を優先                      |
| `lastHealthCheck: null`            | `healthStatus: "unknown"`, `isDegraded: false` |

### 設定値・引数一覧

| 項目               | 種別    | 説明                              |
| ------------------ | ------- | --------------------------------- |
| `healthPolicy`     | DI 引数 | `RuntimePolicyResolver` の第3引数 |
| `connectionStatus` | 入力    | `resolveHealthPolicy()` の入力    |
| `apiKeyDegraded`   | 入力    | `resolveHealthPolicy()` の入力    |
| `isRateLimited`    | 入力    | `resolveHealthPolicy()` の入力    |
| `lastHealthCheck`  | 入力    | `resolveHealthPolicy()` の入力    |

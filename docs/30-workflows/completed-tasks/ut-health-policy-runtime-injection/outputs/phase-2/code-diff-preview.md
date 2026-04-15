# Phase 2: コード変更差分イメージ

## RuntimeSkillCreatorFacade.ts 変更差分

```diff
// import 追加
+ import type { HealthPolicy } from "@repo/shared/types";

export interface RuntimeSkillCreatorFacadeDeps {
  skillExecutor: SkillExecutor;
  authKeyService?: IAuthKeyService;
  subscriptionAuthProvider?: ISubscriptionAuthProvider;
  llmAdapter?: ILLMAdapter;
  // ... 既存フィールド ...
+ /** 起動時に注入する HealthPolicy（UT-HEALTH-POLICY-RUNTIME-INJECTION-001） */
+ healthPolicy?: HealthPolicy;
}

// コンストラクタ内
  this.resolver = new RuntimePolicyResolver(
    deps.authKeyService,
    deps.subscriptionAuthProvider,
+   deps.healthPolicy, // 追加
  );
```

## index.ts 変更差分

```diff
+ import { resolveHealthPolicy } from "@repo/shared/types";

  // 初期 healthPolicy 生成
+ const runtimeHealthPolicy = resolveHealthPolicy({
+   connectionStatus: "connected",
+   isApiKeyValid: true,
+   apiKeyDegraded: false,
+   isRateLimited: false,
+   lastHealthCheck: null,
+ });

  const runtimeSkillCreatorService = skillExecutor
    ? new RuntimeSkillCreatorFacade({
        skillExecutor,
        authKeyService,
        skillFileWriter,
        resourceLoader,
+       healthPolicy: options?.healthPolicy ?? runtimeHealthPolicy,
      })
    : undefined;
```

## 変更ファイルサマリ

| ファイル                       | 変更行数 | 変更種別                             |
| ------------------------------ | -------- | ------------------------------------ |
| `RuntimeSkillCreatorFacade.ts` | +4       | 型定義追加・コンストラクタ修正       |
| `index.ts`                     | +9       | import 追加・healthPolicy 生成・注入 |
| テスト3種                      | +30程度  | mockHealthPolicy・テストケース追加   |

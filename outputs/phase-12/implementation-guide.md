# 実装ガイド — UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## Part 1: 中学生レベルの概念説明

### healthPolicy とは何か

`healthPolicy` は、AI につなぐ前に見る「健康診断メモ」です。
接続できるか、API キーは有効か、途中で制限されていないかを 1 枚にまとめます。

たとえば学校の保健室で、先生が

- いま教室に入れるか
- 体調が悪くないか
- 忘れ物で止まっていないか

を見てから判断するのと同じです。
情報が 1 か所にまとまっていると、毎回ちがう先生がバラバラに判断しなくて済みます。

### リファクタリングとは何か

リファクタリングは、動きは変えずに、書き方だけをきれいにすることです。

たとえば、同じ計算を 2 つのノートに書いていたら、片方だけ直してしまうことがあります。
1 つにまとめれば、直し忘れが起きにくくなります。

### なぜ独自ロジックをなくすのか

`useMainlineExecutionAccess` の中で `apiKeyDegraded` を自分で計算すると、同じ判断が別の場所にもある状態になります。
すると、片方だけ修正されて、もう片方が古いまま残る危険があります。

今回の修正では、その判断を `resolveHealthPolicy()` に寄せました。
これで「健康状態の判断」は共有の 1 か所に集まり、フック側は結果を受け取るだけになります。

### resolveHealthPolicy() の役割

`resolveHealthPolicy()` は、接続状態と最終ヘルスチェックの情報を受け取って、統一された `HealthPolicy` を返す関数です。

`useMainlineExecutionAccess` はこの関数を呼び、返ってきた `HealthPolicy` を `buildMainlineExecutionAccessState()` に渡します。
つまり、フックは「どう判断するか」を持たず、「共有ルールに聞いて、その結果を使う」役に変わりました。

## Part 2: 技術的詳細

### 変更の概要

変更対象は `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` です。

削除したのは次の独自計算です。

```typescript
const apiKeyDegraded =
  credentials.apiKeyValid &&
  (selectedHealthStatus?.status === "disconnected" ||
    selectedHealthStatus?.status === "error");
```

変更後は、`resolveHealthPolicy()` の返り値を `healthPolicy` として渡します。

```typescript
const healthPolicy = resolveHealthPolicy({
  connectionStatus: selectedHealthStatus?.status ?? "disconnected",
  isApiKeyValid: credentials.apiKeyValid,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: selectedHealthStatus ?? null,
});

return {
  access: buildMainlineExecutionAccessState({
    apiKeyValid: credentials.apiKeyValid,
    subscriptionValid: credentials.subscriptionValid,
    isAuthenticated,
    selectedProviderName: selectedProvider?.name,
    selectedModelName: selectedModel?.name,
    healthStatus: selectedHealthStatus,
    isLoading: credentials.isLoading,
    healthPolicy,
  }),
  refreshHealth,
};
```

### resolveHealthPolicy() の入出力仕様

#### 入力

| フィールド         | 型                                         | このフックでの値                                 | 補足                                       |
| ------------------ | ------------------------------------------ | ------------------------------------------------ | ------------------------------------------ |
| `connectionStatus` | `"connected" \| "disconnected" \| "error"` | `selectedHealthStatus?.status ?? "disconnected"` | プロバイダー未選択時は `disconnected` 扱い |
| `isApiKeyValid`    | `boolean`                                  | `credentials.apiKeyValid`                        | 将来の拡張に備えた入力                     |
| `apiKeyDegraded`   | `boolean`                                  | `false`                                          | フック内で独自再計算しないため             |
| `isRateLimited`    | `boolean`                                  | `false`                                          | このフックでは未取得                       |
| `lastHealthCheck`  | `HealthCheckResult \| null`                | `selectedHealthStatus ?? null`                   | 未取得時は `null`                          |

#### 出力

| フィールド              | 型                                                    | 意味                 |
| ----------------------- | ----------------------------------------------------- | -------------------- |
| `isConnectionAvailable` | `boolean`                                             | 接続可否             |
| `isDegraded`            | `boolean`                                             | 品質低下の有無       |
| `isRateLimited`         | `boolean`                                             | レート制限の有無     |
| `healthStatus`          | `"healthy" \| "degraded" \| "unhealthy" \| "unknown"` | 総合状態             |
| `lastCheckedAt`         | `Date \| null`                                        | 最終チェック時刻     |
| `errorDetail?`          | `string`                                              | `unhealthy` 時の補足 |

### buildMainlineExecutionAccessState() との連携

`buildMainlineExecutionAccessState()` は `healthPolicy?: HealthPolicy` を受け取り、渡された場合はそれを優先して状態を導出します。

このタスクでは、フック側で `apiKeyDegraded` を組み立てず、`healthPolicy` を 1 つ渡すだけにしました。
これにより、共有ロジックとレンダリング層の責務が分離されます。

### インポート方針

`resolveHealthPolicy` は `@repo/shared/types` からインポートします。
`AuthMode` は barrel export されていないため、既存どおり `@repo/shared/types/auth-mode` を使います。

```typescript
import { resolveHealthPolicy } from "@repo/shared/types";
import type { AuthMode } from "@repo/shared/types/auth-mode";
```

### 検証メモ

このタスクは NON_VISUAL で、スクリーンショット証跡は不要です。
検証は次の 2 つで行いました。

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/hooks/__tests__/useMainlineExecutionAccess.test.ts
pnpm --filter @repo/desktop typecheck
```

`resolveHealthPolicy` は Vitest のモック都合で直接 spy せず、`buildMainlineExecutionAccessState()` への `healthPolicy` 引き渡しで間接確認しています。

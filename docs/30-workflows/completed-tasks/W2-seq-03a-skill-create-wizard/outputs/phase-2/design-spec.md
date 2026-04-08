# Phase 2: 設計仕様書 — UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## 概要

新規実装ゼロ。既存 API (`resolveHealthPolicy` / `buildMainlineExecutionAccessState`) の呼び出しを整理するだけで移行完了。

---

## 変更対象ファイル

`apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` のみ

---

## 変更内容（4ステップ）

### Step 1: インポート追加

**変更前:**

```typescript
import type { AuthMode } from "@repo/shared/types/auth-mode";
```

**変更後:**

```typescript
import { resolveHealthPolicy } from "@repo/shared/types";
import type { AuthMode } from "@repo/shared/types/auth-mode";
```

### Step 2: resolveHealthPolicy() 呼び出し追加（L117 の直前）

```typescript
const healthPolicy = resolveHealthPolicy({
  connectionStatus: selectedHealthStatus?.status ?? "disconnected",
  isApiKeyValid: credentials.apiKeyValid,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: selectedHealthStatus ?? null,
});
```

### Step 3: buildMainlineExecutionAccessState() に healthPolicy を追加

```typescript
const accessState = buildMainlineExecutionAccessState({
  apiKeyValid: credentials.apiKeyValid,
  subscriptionValid: credentials.subscriptionValid,
  // apiKeyDegraded 削除
  isAuthenticated,
  selectedProviderName: selectedProvider?.name,
  selectedModelName: selectedModel?.name,
  healthStatus: selectedHealthStatus,
  isLoading: credentials.isLoading,
  healthPolicy, // 追加
});
```

### Step 4: L117-120 の独自ロジック削除

```typescript
// 削除対象
const apiKeyDegraded =
  credentials.apiKeyValid &&
  (selectedHealthStatus?.status === "disconnected" ||
    selectedHealthStatus?.status === "error");
```

---

## 設計判断記録

| 判断事項                      | 決定                           | 根拠                                                                          |
| ----------------------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `connectionStatus` 型キャスト | 不要                           | `HealthCheckResult.status` と `HealthPolicyInput.connectionStatus` が完全一致 |
| `apiKeyDegraded` の値         | `false` を渡す                 | resolveHealthPolicy 内部で isApiKeyValid + connectionStatus から導出          |
| `isRateLimited` の値          | `false` を渡す                 | Hook 内にレートリミット変数が存在しないため                                   |
| `lastHealthCheck` の変換      | `selectedHealthStatus ?? null` | HealthCheckResult \| undefined → HealthCheckResult \| null                    |

---

## 完了条件チェック

- [x] 4ステップの変更内容がコード例として記載済み
- [x] 削除対象（L117-120）が明示済み
- [x] 新規実装ゼロ確認済み
- [x] リスクと対策定義済み

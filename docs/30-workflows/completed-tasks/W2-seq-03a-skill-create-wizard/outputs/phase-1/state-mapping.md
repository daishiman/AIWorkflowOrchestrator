# Phase 1: 状態変数マッピング定義 — UT-HEALTH-POLICY-MAINLINE-MIGRATION-001

## 調査結果

### 対象ファイル

`apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts`

### L114-120 現状確認

```typescript
// L114-116: selectedHealthStatus の導出
const selectedHealthStatus = selectedProviderId
  ? llmHealthStatus[selectedProviderId]
  : undefined;

// L117-120: 削除対象の独自算出ロジック
const apiKeyDegraded =
  credentials.apiKeyValid &&
  (selectedHealthStatus?.status === "disconnected" ||
    selectedHealthStatus?.status === "error");
```

### buildMainlineExecutionAccessState の呼び出し（L122-133）

```typescript
return {
  access: buildMainlineExecutionAccessState({
    apiKeyValid: credentials.apiKeyValid,
    subscriptionValid: credentials.subscriptionValid,
    apiKeyDegraded, // ← 削除対象
    isAuthenticated,
    selectedProviderName: selectedProvider?.name,
    selectedModelName: selectedModel?.name,
    healthStatus: selectedHealthStatus,
    isLoading: credentials.isLoading,
  }),
  refreshHealth,
};
```

### resolveHealthPolicy の barrel export 確認

`packages/shared/src/types/index.ts:309` に確認済み:

```typescript
export { resolveHealthPolicy } from "./health-policy";
```

### インポートパターン確認

既存の `@repo/shared/types` からのインポートなし（`@repo/shared/types/auth-mode` のみ）。
`resolveHealthPolicy` を新規 import 文として追加する。

---

## HealthPolicyInput マッピング（確定版）

| HealthPolicyInput フィールド | マッピング元                       | 変換方法                                         | 型                                         |
| ---------------------------- | ---------------------------------- | ------------------------------------------------ | ------------------------------------------ |
| `connectionStatus`           | `selectedHealthStatus?.status`     | `?? "disconnected"` でフォールバック             | `"connected" \| "disconnected" \| "error"` |
| `isApiKeyValid`              | `credentials.apiKeyValid`          | そのまま渡す                                     | `boolean`                                  |
| `apiKeyDegraded`             | （削除される独自ロジックから移行） | `false` を渡す（resolveHealthPolicy 内部で算出） | `boolean`                                  |
| `isRateLimited`              | なし（Hook 内に該当変数なし）      | `false` を渡す                                   | `boolean`                                  |
| `lastHealthCheck`            | `selectedHealthStatus`             | `?? null` で `undefined → null` 変換             | `HealthCheckResult \| null`                |

### 型安全性確認

- `selectedHealthStatus?.status` の型: `"connected" | "disconnected" | "error" | undefined`
  - `ConnectionStatusSchema = z.enum(["connected", "disconnected", "error"])` と完全一致
  - `?? "disconnected"` で `undefined` を除去できるため**型キャスト不要** ✓
- `selectedHealthStatus` の型: `HealthCheckResult | undefined`
  - `?? null` で `HealthCheckResult | null` に変換 ✓

---

## 命名規則

- インポートスタイル: ダブルクォート（`"@repo/shared/types"`）
- named import: `{ resolveHealthPolicy }`
- 既存インポートの末尾に追加する

---

## 完了条件チェック

- [x] 既存コードの調査コマンド実行済み
- [x] HealthPolicyInput への状態変数マッピング確定
- [x] AC-1〜AC-6 の検証方法定義済み
- [x] 命名規則（インポートパターン）確認済み

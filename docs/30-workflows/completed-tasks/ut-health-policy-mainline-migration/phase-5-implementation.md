# Phase 5: 実装（TDD Green）

## タスク情報

- **タスクID**: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
- **タスク名**: useMainlineExecutionAccess の healthPolicy 移行
- **フェーズ**: Phase 5 - TDD Green（実装）
- **前提フェーズ**: Phase 4（TDD Red: 失敗するテスト作成）完了

---

## TDD Green フェーズの概要

TDD Green フェーズは、Phase 4 で作成した「失敗するテスト」をすべて PASS させるための最小限の実装を行うフェーズです。

このフェーズでは以下を行います：

1. テストが PASS するために必要な変更のみを加える
2. 過剰な実装を避ける（YAGNI 原則）
3. 型エラーが発生しないことを確認する

---

## 実装対象ファイル

| 種別 | ファイルパス                                                    |
| ---- | --------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` |

修正対象は上記 **1ファイルのみ** です。

---

## 実装手順（4ステップ）

### ステップ 1: resolveHealthPolicy を import する

`apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` の import セクションに以下を追加します。

```typescript
import { resolveHealthPolicy } from "@repo/shared/types";
```

既存の `@repo/shared/types` からの import がある場合は、その import 文に `resolveHealthPolicy` を追記してください。

---

### ステップ 2: resolveHealthPolicy() を呼び出して HealthPolicy を生成する

hook 本体（return 文より前）に以下のコードを追加します。

```typescript
const healthPolicy = resolveHealthPolicy({
  connectionStatus: selectedHealthStatus?.status ?? "disconnected",
  isApiKeyValid: credentials.apiKeyValid,
  apiKeyDegraded: false,
  isRateLimited: false,
  lastHealthCheck: selectedHealthStatus ?? null,
});
```

**パラメータ説明**:

| パラメータ         | 値                                               | 説明                                                                             |
| ------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `connectionStatus` | `selectedHealthStatus?.status ?? "disconnected"` | 選択中プロバイダの接続状態。未取得時は `"disconnected"` をフォールバック値とする |
| `isApiKeyValid`    | `credentials.apiKeyValid`                        | API キーの有効性フラグ                                                           |
| `apiKeyDegraded`   | `false`                                          | 独自算出ロジックを廃止するため常に `false` を渡す                                |
| `isRateLimited`    | `false`                                          | レート制限フラグ（本フックでは管理しない）                                       |
| `lastHealthCheck`  | `selectedHealthStatus ?? null`                   | 最終ヘルスチェック結果                                                           |

---

### ステップ 3: buildMainlineExecutionAccessState() の引数に healthPolicy を渡す

既存の `buildMainlineExecutionAccessState()` 呼び出しに `healthPolicy` を追加します。

**変更前**:

```typescript
const accessState = buildMainlineExecutionAccessState({
  apiKeyValid: credentials.apiKeyValid,
  subscriptionValid: credentials.subscriptionValid,
  isAuthenticated,
  selectedProviderName: selectedProvider?.name,
  selectedModelName: selectedModel?.name,
  healthStatus: selectedHealthStatus,
  isLoading: credentials.isLoading,
});
```

**変更後**:

```typescript
const accessState = buildMainlineExecutionAccessState({
  apiKeyValid: credentials.apiKeyValid,
  subscriptionValid: credentials.subscriptionValid,
  isAuthenticated,
  selectedProviderName: selectedProvider?.name,
  selectedModelName: selectedModel?.name,
  healthStatus: selectedHealthStatus,
  isLoading: credentials.isLoading,
  healthPolicy, // 追加
});
```

---

### ステップ 4: 独自算出ロジック（L117-120）を削除する

以下のコードブロックを **完全に削除** します。

```typescript
// これを削除（L117-120 付近）
const apiKeyDegraded =
  credentials.apiKeyValid &&
  (selectedHealthStatus?.status === "disconnected" ||
    selectedHealthStatus?.status === "error");
```

削除後、`apiKeyDegraded` 変数を参照している箇所がないことを確認してください。もし他の箇所で参照されている場合は、`healthPolicy` を使った参照に置き換えてください。

---

## canUseTool 適用可否

**不適用**

本タスクは LLM を経由しない純粋な TypeScript コード変更です。`canUseTool` によるツール呼び出し制御は不要です。

---

## 実装後の確認コマンド

```bash
# TypeScript 型チェック
pnpm typecheck

# 対象パッケージのユニットテスト実行
pnpm --filter @repo/desktop test
```

両方のコマンドがエラーなく完了することを確認してください。

---

## 成果物

| 成果物                                                          | 説明                                       |
| --------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` | resolveHealthPolicy 統合済みの変更ファイル |

---

## 受入基準（Phase 5 範囲）

- [ ] AC-1: `resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている
- [ ] AC-2: `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている
- [ ] AC-3: L117-120 の `apiKeyDegraded` 独自算出ロジックが削除されている
- [ ] AC-4: `@repo/shared/types` 経由でインポートしている
- [ ] AC-5: 既存のユニットテストがすべて PASS する（`pnpm --filter @repo/desktop test`）
- [ ] AC-6: TypeScript の型チェックがエラーなく通過する（`pnpm typecheck`）

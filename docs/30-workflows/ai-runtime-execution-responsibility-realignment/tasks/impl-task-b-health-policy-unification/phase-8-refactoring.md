# Phase 8: リファクタリング

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 8 - リファクタリング                   |
| 機能名   | health-policy-unification              |
| タスクID | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 |
| 作成日   | 2026-03-24                             |

## 目的

Phase 5 で実装したコードの品質を向上させる。`resolveHealthPolicy()` の分岐整理と RuntimePolicyResolver の degraded/healthy 分岐の共通化を行い、可読性・保守性を高める。リファクタリング後もテストが全て PASS することを保証する。

## 前提成果物

| Phase | 成果物                                                   |
| ----- | -------------------------------------------------------- |
| 7     | [phase-7-coverage-check.md](./phase-7-coverage-check.md) |

## 参照資料

| 資料名             | パス / 参照先                                               |
| ------------------ | ----------------------------------------------------------- |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                          |
| 型安全ルール       | `.claude/rules/02-code-quality.md#TypeScript型安全`         |
| P49 type predicate | `.claude/rules/06-known-pitfalls.md#P49`（`in` 演算子推奨） |

## 実行タスク

### Task 1: resolveHealthPolicy() の分岐整理

ファイル: `packages/shared/src/types/health-policy.ts`

#### 1-1. 優先度順の分岐を明確化

現在の実装で if-return チェーンが 6 つ並んでいるが、以下のリファクタリングを検討する。

- 分岐の優先度順序をコメントで明示する
- 各分岐が返す HealthPolicy オブジェクトのパターンを整理する
- 出力 HealthPolicy オブジェクトの構築パターンを共通化できるか検討する

```typescript
// リファクタリング案: ステータス決定とプロパティ導出の分離（Phase 2 D-1/D-2 準拠）

function determineHealthStatus(input: HealthPolicyInput): {
  healthStatus: HealthStatus;
  errorDetail: string | null;
} {
  // P1: lastHealthCheck === null → unknown
  if (input.lastHealthCheck === null)
    return { healthStatus: "unknown", errorDetail: null };
  // P2: disconnected / error → unhealthy
  if (
    input.connectionStatus === "disconnected" ||
    input.connectionStatus === "error"
  )
    return { healthStatus: "unhealthy", errorDetail: input.connectionStatus };
  // P3: rateLimited → degraded
  if (input.isRateLimited)
    return { healthStatus: "degraded", errorDetail: "rate_limited" };
  // P4: apiKeyDegraded → degraded
  if (input.apiKeyDegraded)
    return { healthStatus: "degraded", errorDetail: "api_key_degraded" };
  // P5: healthy
  return { healthStatus: "healthy", errorDetail: null };
}

function buildHealthPolicy(
  input: HealthPolicyInput,
  derived: { healthStatus: HealthStatus; errorDetail: string | null },
): HealthPolicy {
  return {
    isConnectionAvailable: input.connectionStatus === "connected",
    isDegraded:
      derived.healthStatus === "degraded" ||
      derived.healthStatus === "unhealthy",
    isRateLimited: input.isRateLimited,
    healthStatus: derived.healthStatus,
    lastCheckedAt: input.lastHealthCheck?.timestamp ?? null,
    errorDetail: derived.errorDetail,
  };
}
```

#### 1-2. 適用判断

- 分離により可読性が向上するか
- テストが全て PASS するか
- 関数のエクスポートが必要か（内部関数として閉じるか）

### Task 2: RuntimePolicyResolver の degraded/healthy 分岐共通化

ファイル: `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`

#### 2-1. HealthPolicy 消費ロジックの抽出

```typescript
// 共通化前: resolve() 内にインラインで healthStatus を分岐
if (this.config.healthPolicy) {
  if (this.config.healthPolicy.healthStatus === "degraded") {
    // degraded 処理
  } else if (this.config.healthPolicy.healthStatus === "healthy") {
    // healthy 処理
  } else if (this.config.healthPolicy.healthStatus === "unhealthy") {
    // unhealthy 処理
  }
  // ...
}

// 共通化後: HealthPolicy の isDegraded / isConnectionAvailable をそのまま利用
if (this.config.healthPolicy) {
  const hp = this.config.healthPolicy;
  // isDegraded / isConnectionAvailable は resolveHealthPolicy() で既に導出済み
  // RuntimePolicyResolver 側で再度 healthStatus を判定する必要がない
  return {
    isDegraded: hp.isDegraded,
    isConnectionAvailable: hp.isConnectionAvailable,
    // ... 他のプロパティは既存ロジックから
  };
}
```

#### 2-2. 不要な分岐の削減

- `HealthPolicy.isDegraded` / `isConnectionAvailable` / `isRateLimited` が既に導出済みのため、RuntimePolicyResolver 側で再度 `healthStatus` を判定する必要がない
- `healthStatus` による switch/if 分岐を `isDegraded` / `isConnectionAvailable` の直接参照に置き換える

### Task 3: リファクタリング後のテスト実行

```bash
# 全テスト実行で回帰がないことを確認
cd packages/shared && pnpm vitest run src/types/__tests__/health-policy.test.ts
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts
cd apps/desktop && pnpm vitest run src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts
```

### Task 4: 型安全性の確認

- `any` 型が使用されていないこと
- `as` キャスト（P19/P49）が使用されていないこと
- `Record<HealthStatus, Config>` でユニオン型が網羅されていること

## 成果物

| 成果物                                        | パス                                                              |
| --------------------------------------------- | ----------------------------------------------------------------- |
| リファクタリング済み health-policy.ts         | `packages/shared/src/types/health-policy.ts`                      |
| リファクタリング済み RuntimePolicyResolver.ts | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                                  | 確認方法                                                                     | 判定基準      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| 既存テスト（apiKeyDegraded 関連）への影響 | `pnpm --filter @repo/shared vitest run`                                      | 全テスト PASS |
| Task A（UiState）との型整合               | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 の CapabilityContext.isDegraded 消費 | 型定義が一致  |
| RuntimePolicyResolver 既存テスト          | `pnpm --filter @repo/desktop vitest run RuntimePolicyResolver`               | 全テスト PASS |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] `resolveHealthPolicy()` の分岐が整理されている
- [ ] ステータス決定とプロパティ導出の責務が分離されている（または分離不要の判断が記録されている）
- [ ] RuntimePolicyResolver の degraded/healthy 分岐が共通化されている
- [ ] `Record<HealthStatus, Config>` でユニオン型の網羅が保証されている
- [ ] `any` 型が使用されていない
- [ ] `as` キャスト（型アサーション）が使用されていない
- [ ] 全テストが PASS である（回帰なし）
- [ ] コードの可読性が向上している

## 次 Phase

[Phase 9: 品質検証](./phase-9-quality-assurance.md)

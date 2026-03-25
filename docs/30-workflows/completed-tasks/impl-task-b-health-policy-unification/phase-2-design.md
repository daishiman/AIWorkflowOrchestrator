# Phase 2: 設計

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 2                         |
| Phase名    | 設計                      |
| 機能名     | health-policy-unification |
| 作成日     | 2026-03-24                |
| 前提Phase  | Phase 1                   |
| 後続Phase  | Phase 3                   |
| ステータス | 未実施                    |

## 目的

Phase 1 で確定した `HealthPolicy` インターフェース要件を、既存アーキテクチャに統合するための設計を行う。`RuntimePolicyResolver`（Main Process）と `mainlineAccess.ts`（Renderer）の両方が統一された `HealthPolicy` を消費する形に再設計する。

## 背景

Phase 1 で確定した要件に基づき、HealthPolicy インターフェースの具体的な型定義と、各コンシューマ（RuntimePolicyResolver, mainlineAccess, HealthIndicator）での消費パターンを設計する。本 Phase で確定する D-1〜D-6 の定義が、以降全 Phase の正本（Single Source of Truth）となる。

## 前提成果物

- Phase 1: [phase-1-requirements.md](./phase-1-requirements.md)
- 現行ソース: `packages/shared/src/types/execution-capability.ts`
- 現行ソース: `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- 現行ソース: `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts`

## 参照資料

| 資料名               | パス                                                                                           | 内容                                 |
| -------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------ |
| Central Policy 仕様  | `docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md` | Task02 の policy centralization 仕様 |
| HealthCheckResult 型 | `packages/shared/src/types/llm/schemas/health.ts`                                              | 現行の HealthCheckResult Zod schema  |
| P62 対策             | `.claude/rules-disabled/06-known-pitfalls.md#P62`                                              | DEFAULT_CONFIG fallback 禁止         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                              | 内容                         |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| API/IPC core     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`        | IPC envelope / handler 契約  |
| State management | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Renderer selector 境界       |
| Auth core        | `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md`       | AuthModeStatus transport DTO |

## 設計方針

### D-1: HealthPolicy 型定義（packages/shared）

```typescript
// packages/shared/src/types/health-policy.ts

import type { ConnectionStatus } from "./llm/schemas/health";

/**
 * 総合ヘルスステータス
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

/**
 * 統一 HealthPolicy インターフェース
 *
 * 接続状態・API key 有効性・レート制限状態を一元管理する。
 * RuntimePolicyResolver（Main）と mainlineAccess（Renderer）が共通消費する。
 */
export interface HealthPolicy {
  /** 接続が利用可能か */
  isConnectionAvailable: boolean;
  /** API key が有効だが品質低下しているか */
  isDegraded: boolean;
  /** レート制限中か */
  isRateLimited: boolean;
  /** 総合ヘルスステータス */
  healthStatus: HealthStatus;
  /** 最終チェック日時 */
  lastCheckedAt: Date | null;
  /** エラー詳細（unhealthy 時） */
  errorDetail?: string;
}
```

**配置判断**: `packages/shared/src/types/` に配置することで、Main Process と Renderer の両方から import 可能にする。既存の `execution-capability.ts` と同階層に置き、型の共有境界を統一する。

### D-2: HealthPolicyResolver pure function

```typescript
// packages/shared/src/types/health-policy.ts

import type { HealthCheckResult, ConnectionStatus } from "./llm/schemas/health";

export interface HealthPolicyInput {
  connectionStatus: ConnectionStatus;
  isApiKeyValid: boolean;
  apiKeyDegraded: boolean;
  isRateLimited: boolean;
  lastHealthCheck: HealthCheckResult | null;
}

/**
 * HealthPolicyInput から HealthPolicy を導出する pure function
 *
 * 判定優先順位:
 * 1. lastHealthCheck === null → unknown
 * 2. connectionStatus === "disconnected" || "error" → unhealthy
 * 3. isRateLimited → degraded
 * 4. apiKeyDegraded → degraded
 * 5. それ以外 → healthy
 */
export function resolveHealthPolicy(input: HealthPolicyInput): HealthPolicy {
  const { connectionStatus, apiKeyDegraded, isRateLimited, lastHealthCheck } =
    input;

  // P1: unknown（チェック未実行）
  if (lastHealthCheck === null) {
    return {
      isConnectionAvailable: false,
      isDegraded: false,
      isRateLimited: false,
      healthStatus: "unknown",
      lastCheckedAt: null,
    };
  }

  const lastCheckedAt = lastHealthCheck.checkedAt;

  // P2: unhealthy（接続断）
  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return {
      isConnectionAvailable: false,
      isDegraded: false,
      isRateLimited,
      healthStatus: "unhealthy",
      lastCheckedAt,
      errorDetail:
        lastHealthCheck.errorMessage ?? `Connection ${connectionStatus}`,
    };
  }

  // P3/P4: degraded（レート制限 or API key 劣化）
  if (isRateLimited || apiKeyDegraded) {
    return {
      isConnectionAvailable: true,
      isDegraded: true,
      isRateLimited,
      healthStatus: "degraded",
      lastCheckedAt,
    };
  }

  // P5: healthy
  return {
    isConnectionAvailable: true,
    isDegraded: false,
    isRateLimited: false,
    healthStatus: "healthy",
    lastCheckedAt,
  };
}
```

### D-3: ExecutionCapabilityInput の @deprecated 移行

```typescript
export interface ExecutionCapabilityInput {
  apiKeyValid: boolean;
  subscriptionValid: boolean;
  /**
   * @deprecated HealthPolicy.isDegraded を使用してください。
   * TASK-IMP-HEALTH-POLICY-UNIFICATION-001 で移行予定。
   */
  apiKeyDegraded?: boolean;
}
```

### D-4: RuntimePolicyResolver への HealthPolicy DI

```typescript
// apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts

import type { HealthPolicy } from "@repo/shared/types/health-policy";

export class RuntimePolicyResolver implements IRuntimePolicyResolver {
  constructor(
    private readonly authKeyService?: IAuthKeyService,
    private readonly subscriptionAuthProvider?: ISubscriptionAuthProvider,
    private readonly healthPolicy?: HealthPolicy, // 新規: DI で受け取る
  ) {}

  async resolve(
    _authMode: AuthMode,
    apiKey: string | null,
  ): Promise<RuntimeDecision> {
    // degraded チェック: HealthPolicy 経由
    if (this.healthPolicy?.isDegraded) {
      // P62 対策: degraded 時は integrated_api への暗黙 fallback を禁止
      const isSubscriptionValid = await this.checkSubscription();
      if (isSubscriptionValid) {
        return {
          type: "terminal_handoff",
          bundle: this.buildDegradedBundle(),
        };
      }
      return {
        type: "terminal_handoff",
        bundle: this.buildNoAuthBundle(),
      };
    }

    // 既存ロジック（変更なし）
    const trimmedKey = typeof apiKey === "string" ? apiKey.trim() : "";
    if (trimmedKey !== "") {
      return {
        type: "integrated_api",
        apiKey: trimmedKey,
        permissionMode: "default",
      };
    }

    const isSubscriptionValid = await this.checkSubscription();
    const bundle = isSubscriptionValid
      ? this.buildSubscriptionBundle()
      : this.buildNoAuthBundle();
    return { type: "terminal_handoff", bundle };
  }

  private buildDegradedBundle(): TerminalHandoffBundle {
    return {
      launcher: "claude",
      promptBundle: "",
      cwd: process.cwd(),
      suggestedCommand: 'claude -p "（プロンプトを入力してください）"',
      manualRetryRule:
        "接続品質が低下しています。ターミナルで手動実行してください。",
      runbook:
        "1. ターミナルを開く\n2. 接続状態を確認\n3. 手動でコマンドを実行",
    };
  }
  // ... 既存メソッドは変更なし
}
```

### D-5: mainlineAccess.ts での HealthPolicy 消費

```typescript
// apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts

import type { HealthPolicy } from "@repo/shared/types/health-policy";

export interface MainlineExecutionAccessInput {
  apiKeyValid: boolean;
  subscriptionValid: boolean;
  /** @deprecated HealthPolicy.isDegraded を使用 */
  apiKeyDegraded?: boolean;
  isAuthenticated: boolean;
  hasResolutionAction?: boolean;
  selectedProviderName?: string;
  selectedModelName?: string;
  healthStatus?: HealthCheckResult;
  isLoading?: boolean;
  /** 新規: 統一 HealthPolicy */
  healthPolicy?: HealthPolicy;
}

export function buildMainlineExecutionAccessState(
  input: MainlineExecutionAccessInput,
): MainlineExecutionAccessState {
  // HealthPolicy が渡された場合はそちらを優先
  const isConnectionAvailable = input.healthPolicy
    ? input.healthPolicy.isConnectionAvailable
    : input.healthStatus?.status === "connected";

  const isDegraded = input.healthPolicy
    ? input.healthPolicy.isDegraded
    : (input.apiKeyDegraded ?? false);

  const capability = resolveCapability({
    apiKeyValid: input.apiKeyValid,
    subscriptionValid: input.subscriptionValid,
    apiKeyDegraded: isDegraded,
  });

  const uiResult = resolveUiState({
    capability,
    isConnectionAvailable: isConnectionAvailable ?? false,
    isTerminalAvailable:
      capability === "both" || capability === "terminalSurface",
    hasResolutionAction: input.hasResolutionAction ?? true,
  });
  // ... 既存ロジック続行
}
```

### D-6: HealthIndicator.tsx での統一利用

`HealthIndicator.tsx` は `HealthPolicy.healthStatus` を直接参照して表示を切り替える:

```typescript
// 現行: HealthCheckResult を直接参照
// 移行後: HealthPolicy.healthStatus を参照

interface HealthIndicatorProps {
  healthPolicy: HealthPolicy;
}

function HealthIndicator({ healthPolicy }: HealthIndicatorProps) {
  const statusLabel: Record<HealthStatus, string> = {
    healthy: "接続良好",
    degraded: "品質低下",
    unhealthy: "接続不可",
    unknown: "未確認",
  };
  // ...
}
```

## ファイル変更計画

| ファイル                                                               | 変更内容                            | 変更量 |
| ---------------------------------------------------------------------- | ----------------------------------- | ------ |
| `packages/shared/src/types/health-policy.ts`                           | 新規: HealthPolicy 型 + resolver    | 新規   |
| `packages/shared/src/types/execution-capability.ts`                    | `@deprecated` マーク追加            | 小     |
| `packages/shared/src/types/index.ts`                                   | health-policy の re-export 追加     | 小     |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`      | HealthPolicy DI + degraded 分岐追加 | 中     |
| `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts` | HealthPolicy 消費への移行           | 中     |
| `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`         | HealthPolicy props 化               | 中     |
| `packages/shared/src/types/__tests__/health-policy.test.ts`            | 新規: resolveHealthPolicy テスト    | 新規   |

## 依存関係

```
HealthPolicy (packages/shared)
  ├── resolveHealthPolicy() ← pure function, テスト容易
  │
  ├── RuntimePolicyResolver (Main Process)
  │   └── DI で HealthPolicy を受け取り、degraded 時に terminal_handoff
  │
  ├── mainlineAccess.ts (Renderer)
  │   └── HealthPolicy.isConnectionAvailable / isDegraded を消費
  │
  └── HealthIndicator.tsx (Renderer Component)
      └── HealthPolicy.healthStatus で表示切替
```

## 後方互換性戦略

1. **段階的移行**: `healthPolicy` は optional で追加。渡されない場合は既存の `apiKeyDegraded` / `healthStatus` から導出
2. **@deprecated マーク**: `apiKeyDegraded` に JSDoc `@deprecated` を付与し、IDE で警告表示
3. **既存テスト維持**: `apiKeyDegraded` を使用する既存テストは変更不要。新テストで `HealthPolicy` 経由の動作を検証

## 成果物

| 成果物                   | パス                                    | 内容                       |
| ------------------------ | --------------------------------------- | -------------------------- |
| 設計書（本ドキュメント） | `outputs/phase-2/design-document.md`    | アーキテクチャ設計の全体像 |
| 依存関係図               | `outputs/phase-2/dependency-diagram.md` | HealthPolicy の消費関係    |
| ファイル変更計画         | `outputs/phase-2/change-plan.md`        | 変更対象ファイルと変更量   |

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

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 完了条件

- [ ] `HealthPolicy` インターフェースの型設計が確定している
- [ ] `resolveHealthPolicy()` の導出ロジックと優先順位が定義されている
- [ ] `RuntimePolicyResolver` への DI 方式が設計されている
- [ ] `mainlineAccess.ts` での消費方式が設計されている
- [ ] `ExecutionCapabilityInput.apiKeyDegraded` の @deprecated 移行パスが明確である
- [ ] 後方互換性戦略が明示されている
- [ ] ファイル変更計画が作成されている

## Phase間依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

## 次Phase

Phase 3: [phase-3-design-review.md](./phase-3-design-review.md)

# Phase 5: 実装（TDD GREEN フェーズ）

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 5 - 実装                                |
| 機能名     | health-policy-unification               |
| タスクID   | TASK-IMP-HEALTH-POLICY-UNIFICATION-001  |
| 作成日     | 2026-03-24                              |
| 依存タスク | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |

## 目的

Phase 4 で作成した全テストを GREEN（PASS）にするための最小限のプロダクションコードを実装する。Phase 2 設計書（D-1〜D-6）を正本として、HealthPolicy インターフェース定義・`resolveHealthPolicy()` 純粋関数・RuntimePolicyResolver への DI 追加・mainlineAccess.ts での消費・HealthIndicator.tsx の props 化を行う。

## 前提成果物

| Phase | 成果物                                                 |
| ----- | ------------------------------------------------------ |
| 4     | [phase-4-test-creation.md](./phase-4-test-creation.md) |

## 参照資料

| 資料名               | パス / 参照先                                                            |
| -------------------- | ------------------------------------------------------------------------ |
| Phase 2 設計書       | `./phase-2-design.md`（**正本**: D-1〜D-6 の全定義を使用）               |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                       |
| コード品質ルール     | `.claude/rules/02-code-quality.md`                                       |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                                  |
| DI パターン選択      | `.claude/rules/06-known-pitfalls.md#P34`（遅延初期化 DI）                |
| @deprecated マーク   | `.claude/rules/06-known-pitfalls.md#P25`（OperationResult 波及）         |
| P62 暗黙 fallback    | `.claude/rules/06-known-pitfalls.md#P62`（DEFAULT_CONFIG fallback 禁止） |
| DIP 違反防止         | `.claude/rules/06-known-pitfalls.md#P61`（具象クラス依存禁止）           |

## フィールド名の正本確認（Phase 2 D-1/D-2）

**以下のフィールド名のみ使用可。Phase 2 に存在しないフィールドは実装禁止。**

### HealthPolicy（D-1）

```
isConnectionAvailable: boolean
isDegraded: boolean
isRateLimited: boolean
healthStatus: HealthStatus
lastCheckedAt: Date | null
errorDetail?: string
```

### HealthPolicyInput（D-2）

```
connectionStatus: ConnectionStatus  // "connected" | "disconnected" | "error"
isApiKeyValid: boolean
apiKeyDegraded: boolean
isRateLimited: boolean
lastHealthCheck: HealthCheckResult | null
```

> **禁止フィールド**: `status`, `reason`, `canExecute`, `shouldWarn`, `errorState`, `isDegraded`（入力側）

## 実行タスク

### Task 1: HealthPolicy 型 + resolveHealthPolicy() 実装（D-1, D-2）

ファイル: `packages/shared/src/types/health-policy.ts`（新規作成）

#### 1-1. HealthStatus 型定義

```typescript
import type { HealthCheckResult, ConnectionStatus } from "./llm/schemas/health";

/**
 * 総合ヘルスステータス
 *
 * 37 ファイルに分散していた判定ロジックを集約する統一型。
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";
```

#### 1-2. HealthPolicy インターフェース定義（D-1）

```typescript
/**
 * 統一 HealthPolicy インターフェース
 *
 * 接続状態・API key 有効性・レート制限状態を一元管理する。
 * RuntimePolicyResolver（Main Process）と mainlineAccess（Renderer）が共通消費する。
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

#### 1-3. HealthPolicyInput インターフェース定義（D-2）

```typescript
/**
 * resolveHealthPolicy() への入力パラメータ。
 * 各サービスから収集した接続状態情報を集約する。
 */
export interface HealthPolicyInput {
  /** 接続状態 */
  connectionStatus: ConnectionStatus;
  /** API key が有効かどうか */
  isApiKeyValid: boolean;
  /** API key が有効だが品質低下しているか */
  apiKeyDegraded: boolean;
  /** レートリミット中か */
  isRateLimited: boolean;
  /** 最終ヘルスチェック結果（null = 未実施） */
  lastHealthCheck: HealthCheckResult | null;
}
```

#### 1-4. resolveHealthPolicy() 純粋関数実装（D-2 の 6 ルール）

```typescript
/**
 * HealthPolicyInput から HealthPolicy を導出する純粋関数。
 *
 * 導出ルール（優先度順）:
 * 1. lastHealthCheck === null → unknown（isConnectionAvailable=false, isDegraded=false）
 * 2. connectionStatus === "disconnected" || "error" → unhealthy（isConnectionAvailable=false）
 * 3. isRateLimited → degraded（isConnectionAvailable=true, isDegraded=true）
 * 4. apiKeyDegraded → degraded（isConnectionAvailable=true, isDegraded=true）
 * 5. それ以外 → healthy（isConnectionAvailable=true, isDegraded=false）
 */
export function resolveHealthPolicy(input: HealthPolicyInput): HealthPolicy {
  const { connectionStatus, apiKeyDegraded, isRateLimited, lastHealthCheck } =
    input;

  // ルール 1: ヘルスチェック未実施 → unknown
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

  // ルール 2: 接続断 → unhealthy
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

  // ルール 3/4: レート制限 または API key 劣化 → degraded
  if (isRateLimited || apiKeyDegraded) {
    return {
      isConnectionAvailable: true,
      isDegraded: true,
      isRateLimited,
      healthStatus: "degraded",
      lastCheckedAt,
    };
  }

  // ルール 5: 正常 → healthy
  return {
    isConnectionAvailable: true,
    isDegraded: false,
    isRateLimited: false,
    healthStatus: "healthy",
    lastCheckedAt,
  };
}
```

### Task 2: ExecutionCapabilityInput @deprecated マーク（D-3）

ファイル: `packages/shared/src/types/execution-capability.ts`

既存の `ExecutionCapabilityInput` インターフェースの `apiKeyDegraded` フィールドに `@deprecated` JSDoc を追加する。

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

**実装手順**: 既存ファイルを Read してから `apiKeyDegraded` フィールドの JSDoc を追加・更新する。他のフィールドは変更しない。

### Task 3: types/index.ts re-export 追加

ファイル: `packages/shared/src/types/index.ts`

`health-policy.ts` の型と関数を re-export する。

```typescript
export type {
  HealthStatus,
  HealthPolicy,
  HealthPolicyInput,
} from "./health-policy";
export { resolveHealthPolicy } from "./health-policy";
```

**実装手順**: 既存ファイルを Read して末尾または適切な位置に追記する。既存 export は変更しない。

### Task 4: RuntimePolicyResolver DI + degraded 分岐（D-4）

ファイル: `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`

#### 4-1. import 追加

```typescript
import type { HealthPolicy } from "@repo/shared/types/health-policy";
```

#### 4-2. コンストラクタ引数に HealthPolicy optional DI 追加

Phase 2 D-4 の設計どおり、コンストラクタの第 3 引数として `healthPolicy?: HealthPolicy` を追加する。

```typescript
export class RuntimePolicyResolver implements IRuntimePolicyResolver {
  constructor(
    private readonly authKeyService?: IAuthKeyService,
    private readonly subscriptionAuthProvider?: ISubscriptionAuthProvider,
    private readonly healthPolicy?: HealthPolicy, // 新規: DI で受け取る
  ) {}
  // ...
}
```

#### 4-3. resolve() メソッドへの degraded 分岐追加

`this.healthPolicy?.isDegraded` が `true` の場合、`terminal_handoff` を返す分岐を既存ロジックの**前**に追加する。

```typescript
async resolve(
  _authMode: AuthMode,
  apiKey: string | null,
): Promise<RuntimeDecision> {
  // degraded チェック: HealthPolicy 経由（D-4）
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
```

#### 4-4. buildDegradedBundle() メソッド追加

```typescript
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
```

**実装注意**:

- P61 対策: `registerSafetyGateHandlers` 等でこのクラスを受け渡す場合、引数型は `IRuntimePolicyResolver`（インターフェース）を使用すること
- P62 対策: degraded 分岐内で `integrated_api` を返すパスを一切作らないこと
- `healthPolicy` が `undefined` の場合は既存ロジックをそのまま実行（後方互換）

### Task 5: mainlineAccess.ts HealthPolicy 消費（D-5）

ファイル: `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts`

#### 5-1. import 追加

```typescript
import type { HealthPolicy } from "@repo/shared/types/health-policy";
```

#### 5-2. MainlineExecutionAccessInput に healthPolicy optional 追加

```typescript
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
  /** 新規: 統一 HealthPolicy（optional: 未指定時は既存動作を維持） */
  healthPolicy?: HealthPolicy;
}
```

#### 5-3. buildMainlineExecutionAccessState() に HealthPolicy 消費ロジック追加

```typescript
export function buildMainlineExecutionAccessState(
  input: MainlineExecutionAccessInput,
): MainlineExecutionAccessState {
  // HealthPolicy が渡された場合はそちらを優先（D-5）
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
  // 既存ロジック続行（変更なし）
}
```

**実装注意**:

- `healthPolicy` が `undefined` の場合は既存の `apiKeyDegraded` / `healthStatus` から導出（後方互換）
- `healthPolicy` が存在する場合は `isConnectionAvailable` / `isDegraded` の両フィールドを参照
- 既存テストが全て PASS を維持すること

### Task 6: HealthIndicator.tsx HealthPolicy props 化（D-6）

ファイル: `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`

#### 6-1. import 追加

```typescript
import type {
  HealthPolicy,
  HealthStatus,
} from "@repo/shared/types/health-policy";
```

#### 6-2. props 型を HealthPolicy ベースに変更

```typescript
interface HealthIndicatorProps {
  /** 統一 HealthPolicy（D-6: HealthPolicy.healthStatus で表示切替） */
  healthPolicy: HealthPolicy;
}
```

#### 6-3. healthStatus の参照を HealthPolicy 経由に変更

```typescript
function HealthIndicator({ healthPolicy }: HealthIndicatorProps) {
  const statusLabel: Record<HealthStatus, string> = {
    healthy: "接続良好",
    degraded: "品質低下",
    unhealthy: "接続不可",
    unknown: "未確認",
  };

  const label = statusLabel[healthPolicy.healthStatus];
  // ...
}
```

**実装注意**:

- 既存 props 型（`HealthCheckResult` 直接参照）から移行する場合、呼び出し元のマッピングも変更が必要
- 呼び出し元では `resolveHealthPolicy()` で HealthPolicy を生成してから渡す
- 既存の `HealthCheckResult` 参照は `HealthPolicy` 経由に置き換える

### Task 7: テスト実行（GREEN 確認）

```bash
# packages/shared の純粋関数テスト
cd packages/shared && pnpm vitest run src/types/__tests__/health-policy.test.ts

# RuntimePolicyResolver の HealthPolicy テスト
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts

# mainlineAccess の HealthPolicy テスト
cd apps/desktop && pnpm vitest run src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts

# 既存テストの回帰確認
cd packages/shared && pnpm vitest run src/types/
cd apps/desktop && pnpm vitest run src/main/services/runtime/
cd apps/desktop && pnpm vitest run src/renderer/features/mainline-access/
cd apps/desktop && pnpm vitest run src/renderer/components/llm/
```

全テストが PASS（GREEN）であることを確認する。

### Task 8: 型チェック確認

```bash
# packages/shared の型チェック
pnpm --filter @repo/shared typecheck

# apps/desktop の型チェック
pnpm --filter @repo/desktop typecheck
```

型エラーが 0 件であることを確認する。

## 成果物

| 成果物                        | パス                                                                   | 変更種別 |
| ----------------------------- | ---------------------------------------------------------------------- | -------- |
| HealthPolicy 型定義           | `packages/shared/src/types/health-policy.ts`                           | 新規     |
| ExecutionCapabilityInput 更新 | `packages/shared/src/types/execution-capability.ts`                    | 小変更   |
| types/index.ts re-export 追加 | `packages/shared/src/types/index.ts`                                   | 小変更   |
| RuntimePolicyResolver 更新    | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`      | 中変更   |
| mainlineAccess 更新           | `apps/desktop/src/renderer/features/mainline-access/mainlineAccess.ts` | 中変更   |
| HealthIndicator 更新          | `apps/desktop/src/renderer/components/llm/HealthIndicator.tsx`         | 中変更   |

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

- [ ] `packages/shared/src/types/health-policy.ts` が新規作成されている
- [ ] `HealthStatus` 型が `"healthy" | "degraded" | "unhealthy" | "unknown"` で定義されている
- [ ] `HealthPolicy` インターフェースが D-1 の正本フィールド（`isConnectionAvailable`, `isDegraded`, `isRateLimited`, `healthStatus`, `lastCheckedAt`, `errorDetail?`）で定義されている
- [ ] `HealthPolicyInput` インターフェースが D-2 の正本フィールド（`connectionStatus`, `isApiKeyValid`, `apiKeyDegraded`, `isRateLimited`, `lastHealthCheck`）で定義されている
- [ ] `resolveHealthPolicy()` が D-2 の 5 ルール（P1〜P5）を優先度順に実装している
- [ ] `resolveHealthPolicy()` に `status`, `reason`, `canExecute`, `shouldWarn`, `errorState` フィールドが存在しない
- [ ] `ExecutionCapabilityInput.apiKeyDegraded` に `@deprecated` JSDoc が付与されている（D-3）
- [ ] `packages/shared/src/types/index.ts` に `HealthStatus`, `HealthPolicy`, `HealthPolicyInput`, `resolveHealthPolicy` の re-export が追加されている
- [ ] `RuntimePolicyResolver` のコンストラクタ第 3 引数として `healthPolicy?: HealthPolicy` が追加されている（D-4）
- [ ] `RuntimePolicyResolver.resolve()` が `this.healthPolicy?.isDegraded` を参照して `terminal_handoff` を返す（D-4）
- [ ] P62 対策: `RuntimePolicyResolver` の degraded 分岐で `integrated_api` を返すパスが存在しない
- [ ] `RuntimePolicyResolver` が `healthPolicy` 未指定時に既存動作を維持する（後方互換）
- [ ] `MainlineExecutionAccessInput` に `healthPolicy?: HealthPolicy` が追加されている（D-5）
- [ ] `buildMainlineExecutionAccessState()` が `healthPolicy.isConnectionAvailable` / `healthPolicy.isDegraded` を消費している（D-5）
- [ ] `buildMainlineExecutionAccessState()` が `healthPolicy` 未指定時に `apiKeyDegraded` / `healthStatus` から導出している（後方互換）
- [ ] `HealthIndicator.tsx` が `healthPolicy: HealthPolicy` props を受け取り `healthPolicy.healthStatus` を参照している（D-6）
- [ ] Phase 4 の全テストが GREEN（PASS）である
- [ ] 既存テストが全て PASS（回帰なし）である
- [ ] `pnpm typecheck` が型エラー 0 件で通過する
- [ ] P62 準拠: 暗黙の fallback がない
- [ ] `any` 型を使用していない
- [ ] P61 準拠: IPC ハンドラ等で `RuntimePolicyResolver` を渡す場合、引数型が具象クラスではなく `IRuntimePolicyResolver` インターフェースである

## 次 Phase

[Phase 6: テスト拡充](./phase-6-test-augmentation.md)

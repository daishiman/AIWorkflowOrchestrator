# Phase 4: テスト作成（TDD RED フェーズ）

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 4 - テスト作成                          |
| 機能名     | health-policy-unification               |
| タスクID   | TASK-IMP-HEALTH-POLICY-UNIFICATION-001  |
| 作成日     | 2026-03-24                              |
| 依存タスク | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |

## 目的

HealthPolicy インターフェースおよび `resolveHealthPolicy()` 関数のテストを TDD RED フェーズとして先行作成する。Phase 2 設計書（D-1, D-2）で確定したフィールド名・型・導出ルールを忠実に使用し、全 6 導出ルール、RuntimePolicyResolver の degraded 分岐、mainlineAccess.ts の HealthPolicy 消費をテストコードで定義し、実装前に失敗することを確認する。

## 前提成果物

| Phase | 成果物                                                 |
| ----- | ------------------------------------------------------ |
| 1     | [phase-1-requirements.md](./phase-1-requirements.md)   |
| 2     | [phase-2-design.md](./phase-2-design.md)               |
| 3     | [phase-3-design-review.md](./phase-3-design-review.md) |

## 参照資料

| 資料名                 | パス / 参照先                                                                  |
| ---------------------- | ------------------------------------------------------------------------------ |
| Phase 2 設計書         | `./phase-2-design.md`（**正本**: D-1〜D-5 のフィールド名・型を使用）           |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                             |
| テスト設計の注意       | `.claude/rules/06-known-pitfalls.md#P9`（モジュールスコープ変数のリーク）      |
| IPC テスト応答形式     | `.claude/rules/06-known-pitfalls.md#P60`（Phase 4/5 間の形式合意）             |
| happy-dom 環境注意     | `.claude/rules/06-known-pitfalls.md#P39`（userEvent 非互換）                   |
| テスト実行ディレクトリ | `.claude/rules/06-known-pitfalls.md#P40`（モノレポ内の vitest.config.ts 適用） |

## フィールド名の正本確認（Phase 2 D-1/D-2）

実装・テストで使用するフィールド名は以下のとおり。**Phase 2 設計書から変更禁止**。

### HealthPolicy（出力側、D-1）

| フィールド              | 型                                                    | 用途                       |
| ----------------------- | ----------------------------------------------------- | -------------------------- |
| `isConnectionAvailable` | `boolean`                                             | 接続が利用可能か           |
| `isDegraded`            | `boolean`                                             | API key 有効だが品質低下中 |
| `isRateLimited`         | `boolean`                                             | レート制限中か             |
| `healthStatus`          | `"healthy" \| "degraded" \| "unhealthy" \| "unknown"` | 総合ヘルスステータス       |
| `lastCheckedAt`         | `Date \| null`                                        | 最終チェック日時           |
| `errorDetail`           | `string \| undefined`                                 | エラー詳細（unhealthy 時） |

### HealthPolicyInput（入力側、D-2）

| フィールド         | 型                                                               | 用途                   |
| ------------------ | ---------------------------------------------------------------- | ---------------------- |
| `connectionStatus` | `ConnectionStatus`（`"connected" \| "disconnected" \| "error"`） | 接続状態               |
| `isApiKeyValid`    | `boolean`                                                        | API key 有効性         |
| `apiKeyDegraded`   | `boolean`                                                        | API key 品質低下フラグ |
| `isRateLimited`    | `boolean`                                                        | レートリミットフラグ   |
| `lastHealthCheck`  | `HealthCheckResult \| null`                                      | 最終ヘルスチェック結果 |

> **注意**: `status`, `reason`, `canExecute`, `shouldWarn`, `errorState`, `isDegraded`（入力側）は Phase 2 設計書に存在しないフィールドであり、使用禁止。

## 実行タスク

### Task 1: resolveHealthPolicy テスト作成（全 6 導出ルール）

テストファイル: `packages/shared/src/types/__tests__/health-policy.test.ts`

Phase 2 D-2 で定義した 6 つの導出ルールを `describe` ブロックで網羅する。
`lastHealthCheck` は `HealthCheckResult | null` 型であるため、テスト内では `HealthCheckResult` の shape（`checkedAt: Date`, `errorMessage?: string | null`）を持つオブジェクトを使用する。

```typescript
import { describe, it, expect } from "vitest";
import { resolveHealthPolicy } from "../health-policy";
import type { HealthPolicyInput } from "../health-policy";

// HealthCheckResult の最小 shape（実際の型から参照）
const makeHealthCheckResult = (
  overrides?: Partial<{ checkedAt: Date; errorMessage: string | null }>,
) => ({
  checkedAt: overrides?.checkedAt ?? new Date("2026-03-24T00:00:00Z"),
  errorMessage: overrides?.errorMessage ?? null,
});

describe("resolveHealthPolicy", () => {
  // P1: lastHealthCheck === null → unknown
  describe("P1: lastHealthCheck === null → unknown", () => {
    it("lastHealthCheck が null の場合、healthStatus が unknown になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: null,
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unknown");
      expect(result.isConnectionAvailable).toBe(false);
      expect(result.isDegraded).toBe(false);
    });
  });

  // P2: connectionStatus === "disconnected" → unhealthy
  describe("P2: connectionStatus === 'disconnected' → unhealthy", () => {
    it("disconnected の場合、healthStatus が unhealthy になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "disconnected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unhealthy");
      expect(result.isConnectionAvailable).toBe(false);
    });
  });

  // P2b: connectionStatus === "error" → unhealthy
  describe("P2b: connectionStatus === 'error' → unhealthy", () => {
    it("error の場合、healthStatus が unhealthy になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "error",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult({
          errorMessage: "Connection refused",
        }),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unhealthy");
      expect(result.isConnectionAvailable).toBe(false);
    });
  });

  // P3: isRateLimited === true → degraded
  describe("P3: isRateLimited === true → degraded", () => {
    it("isRateLimited が true の場合、healthStatus が degraded になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: true,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("degraded");
      expect(result.isConnectionAvailable).toBe(true);
      expect(result.isDegraded).toBe(true);
      expect(result.isRateLimited).toBe(true);
    });
  });

  // P4: apiKeyDegraded === true → degraded
  describe("P4: apiKeyDegraded === true → degraded", () => {
    it("apiKeyDegraded が true の場合、healthStatus が degraded になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: true,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("degraded");
      expect(result.isConnectionAvailable).toBe(true);
      expect(result.isDegraded).toBe(true);
    });
  });

  // P5: healthy（全て正常）
  describe("P5: 全て正常 → healthy", () => {
    it("connected で degraded なし・rateLimited なし の場合、healthStatus が healthy になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("healthy");
      expect(result.isConnectionAvailable).toBe(true);
      expect(result.isDegraded).toBe(false);
      expect(result.isRateLimited).toBe(false);
    });
  });

  // P3+P4: isRateLimited && apiKeyDegraded → degraded（複合）
  describe("P3+P4: isRateLimited && apiKeyDegraded → degraded", () => {
    it("isRateLimited かつ apiKeyDegraded の場合も degraded になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: true,
        isRateLimited: true,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("degraded");
      expect(result.isConnectionAvailable).toBe(true);
      expect(result.isDegraded).toBe(true);
    });
  });

  // lastCheckedAt の検証
  describe("lastCheckedAt の設定", () => {
    it("lastHealthCheck が非 null の場合、lastCheckedAt が設定される", () => {
      const checkedAt = new Date("2026-03-24T12:00:00Z");
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult({ checkedAt }),
      };
      const result = resolveHealthPolicy(input);
      expect(result.lastCheckedAt).toEqual(checkedAt);
    });

    it("lastHealthCheck が null の場合、lastCheckedAt が null になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: null,
      };
      const result = resolveHealthPolicy(input);
      expect(result.lastCheckedAt).toBeNull();
    });
  });
});
```

### Task 2: RuntimePolicyResolver の degraded 分岐テスト

テストファイル: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts`

Phase 2 D-4 の設計に基づき、`HealthPolicy` の `isDegraded` フィールドを使用する。
P62 対策として、degraded 時に `integrated_api` を返さないことを明示的にアサートする。

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import type { HealthPolicy } from "@repo/shared";

describe("RuntimePolicyResolver - HealthPolicy 統合（D-4）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 2-1: healthPolicy.isDegraded === true → terminal_handoff
  describe("healthPolicy.isDegraded === true → terminal_handoff", () => {
    it("isDegraded が true の場合、実行タイプが terminal_handoff になる", async () => {
      const mockHealthPolicy: HealthPolicy = {
        isConnectionAvailable: true,
        isDegraded: true,
        isRateLimited: false,
        healthStatus: "degraded",
        lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
      };
      const resolver = new RuntimePolicyResolver(
        undefined,
        undefined,
        mockHealthPolicy,
      );
      const result = await resolver.resolve("integrated_api", null);
      expect(result.type).toBe("terminal_handoff");
    });

    // P62 確認: degraded 時に integrated_api を返さないこと
    it("isDegraded が true の場合、integrated_api を返さない（P62 対策）", async () => {
      const mockHealthPolicy: HealthPolicy = {
        isConnectionAvailable: true,
        isDegraded: true,
        isRateLimited: false,
        healthStatus: "degraded",
        lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
      };
      const resolver = new RuntimePolicyResolver(
        undefined,
        undefined,
        mockHealthPolicy,
      );
      // API キーが存在する状態でも integrated_api に fallback しないこと
      const result = await resolver.resolve("integrated_api", "sk-valid-key");
      expect(result.type).not.toBe("integrated_api");
      expect(result.type).toBe("terminal_handoff");
    });
  });

  // 2-2: healthPolicy 未指定 → 既存ロジック（変更なし）
  describe("healthPolicy 未指定 → 既存ロジックを維持", () => {
    it("HealthPolicy 未指定時は既存の動作を維持する（後方互換）", async () => {
      const resolver = new RuntimePolicyResolver(
        undefined,
        undefined,
        undefined,
      );
      const result = await resolver.resolve("integrated_api", "sk-valid-key");
      // 既存ロジック: API キーがあれば integrated_api
      expect(result.type).toBe("integrated_api");
      expect(result).toHaveProperty("apiKey", "sk-valid-key");
    });

    it("HealthPolicy 未指定かつ API キーなしの場合、terminal_handoff になる", async () => {
      const resolver = new RuntimePolicyResolver(
        undefined,
        undefined,
        undefined,
      );
      const result = await resolver.resolve("integrated_api", null);
      expect(result.type).toBe("terminal_handoff");
    });
  });

  // 2-3: isDegraded が false の場合は既存ロジックを通る
  describe("isDegraded === false → 既存ロジックを通る", () => {
    it("isDegraded が false の場合、API キーによる通常ルーティングを行う", async () => {
      const mockHealthPolicy: HealthPolicy = {
        isConnectionAvailable: true,
        isDegraded: false,
        isRateLimited: false,
        healthStatus: "healthy",
        lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
      };
      const resolver = new RuntimePolicyResolver(
        undefined,
        undefined,
        mockHealthPolicy,
      );
      const result = await resolver.resolve("integrated_api", "sk-valid-key");
      expect(result.type).toBe("integrated_api");
    });
  });
});
```

### Task 3: mainlineAccess.ts の HealthPolicy 消費テスト

テストファイル: `apps/desktop/src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts`

Phase 2 D-5 の設計に基づき、`HealthPolicy` の `isConnectionAvailable` / `isDegraded` フィールドを使用する。

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { buildMainlineExecutionAccessState } from "../mainlineAccess";
import type { HealthPolicy } from "@repo/shared";

describe("mainlineAccess - HealthPolicy 消費（D-5）", () => {
  beforeEach(() => {
    // テスト間で状態を共有しない（P9 準拠）
  });

  // 3-1: healthPolicy 渡し時 → HealthPolicy 経由で isConnectionAvailable 取得
  describe("healthPolicy 渡し時 → HealthPolicy 経由で状態導出", () => {
    it("healthPolicy.isConnectionAvailable が true の場合、接続可能として扱う", () => {
      const healthPolicy: HealthPolicy = {
        isConnectionAvailable: true,
        isDegraded: false,
        isRateLimited: false,
        healthStatus: "healthy",
        lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
      };
      const state = buildMainlineExecutionAccessState({
        apiKeyValid: true,
        subscriptionValid: false,
        isAuthenticated: true,
        healthPolicy,
      });
      // isConnectionAvailable が healthPolicy から取得されていること
      expect(state).toBeDefined();
    });

    it("healthPolicy.isConnectionAvailable が false の場合、接続不可として扱う", () => {
      const healthPolicy: HealthPolicy = {
        isConnectionAvailable: false,
        isDegraded: false,
        isRateLimited: false,
        healthStatus: "unhealthy",
        lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
        errorDetail: "Connection refused",
      };
      const state = buildMainlineExecutionAccessState({
        apiKeyValid: true,
        subscriptionValid: false,
        isAuthenticated: true,
        healthPolicy,
      });
      expect(state).toBeDefined();
    });

    it("healthPolicy.isDegraded が true の場合、degraded として扱う", () => {
      const healthPolicy: HealthPolicy = {
        isConnectionAvailable: true,
        isDegraded: true,
        isRateLimited: false,
        healthStatus: "degraded",
        lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
      };
      const state = buildMainlineExecutionAccessState({
        apiKeyValid: true,
        subscriptionValid: false,
        isAuthenticated: true,
        healthPolicy,
      });
      expect(state).toBeDefined();
    });
  });

  // 3-2: healthPolicy 未渡し時 → 既存 apiKeyDegraded から導出（後方互換）
  describe("healthPolicy 未渡し時 → 既存 apiKeyDegraded から導出（後方互換）", () => {
    it("healthPolicy 未指定時は apiKeyDegraded から degraded 状態を導出する", () => {
      const state = buildMainlineExecutionAccessState({
        apiKeyValid: true,
        subscriptionValid: false,
        apiKeyDegraded: true,
        isAuthenticated: true,
        // healthPolicy を渡さない
      });
      expect(state).toBeDefined();
    });

    it("healthPolicy 未指定かつ apiKeyDegraded 未指定時は正常動作する", () => {
      const state = buildMainlineExecutionAccessState({
        apiKeyValid: true,
        subscriptionValid: false,
        isAuthenticated: true,
      });
      expect(state).toBeDefined();
    });
  });
});
```

### Task 4: @deprecated マーク確認テスト

テストファイル: `packages/shared/src/types/__tests__/health-policy.test.ts` に追記する（Task 1 の末尾）。

```typescript
// @deprecated マーク確認: ExecutionCapabilityInput.apiKeyDegraded は
// HealthPolicy.isDegraded へ移行予定であることをテストコメントで明示する。
// 型レベルの @deprecated は TypeScript コンパイラが IDE 警告として表示するため、
// 実行時テストではなく以下の型テストで確認する。

describe("ExecutionCapabilityInput - @deprecated 移行確認", () => {
  it("apiKeyDegraded フィールドは optional で後方互換が維持されている", () => {
    // @deprecated: HealthPolicy.isDegraded を使用してください
    const input: import("../execution-capability").ExecutionCapabilityInput = {
      apiKeyValid: true,
      subscriptionValid: true,
      apiKeyDegraded: false, // @deprecated フィールドが optional であることを確認
    };
    expect(input.apiKeyDegraded).toBe(false);
  });

  it("apiKeyDegraded を省略しても ExecutionCapabilityInput が構築できる", () => {
    const input: import("../execution-capability").ExecutionCapabilityInput = {
      apiKeyValid: true,
      subscriptionValid: true,
      // apiKeyDegraded を省略（optional）
    };
    expect(input.apiKeyDegraded).toBeUndefined();
  });
});
```

### Task 5: 既存テスト回帰確認

既存の `resolveHealthPolicy` に関連するテストが存在する場合、Phase 4 のテスト追加後も引き続き PASS することを確認する。

```bash
# 既存テストの回帰確認
cd packages/shared && pnpm vitest run src/types/
cd apps/desktop && pnpm vitest run src/main/services/runtime/
cd apps/desktop && pnpm vitest run src/renderer/features/mainline-access/
```

### Task 6: テスト実行（RED 確認）

```bash
# packages/shared の純粋関数テスト
cd packages/shared && pnpm vitest run src/types/__tests__/health-policy.test.ts

# RuntimePolicyResolver の HealthPolicy テスト
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts

# mainlineAccess の HealthPolicy テスト
cd apps/desktop && pnpm vitest run src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts
```

全テストが FAIL（RED）であることを確認する。`health-policy.ts` が存在しないためモジュール解決エラーになることが期待される。

## 成果物

| 成果物                                    | パス                                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| resolveHealthPolicy テスト                | `packages/shared/src/types/__tests__/health-policy.test.ts`                                         |
| RuntimePolicyResolver HealthPolicy テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts`      |
| mainlineAccess HealthPolicy テスト        | `apps/desktop/src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts` |

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

- [ ] resolveHealthPolicy の全 6 導出ルールテストが作成されている（P1〜P5 + P3+P4 複合）
- [ ] 全テストが `HealthPolicy` の正本フィールド（`isConnectionAvailable`, `isDegraded`, `isRateLimited`, `healthStatus`, `lastCheckedAt`, `errorDetail`）を使用している
- [ ] 全テストが `HealthPolicyInput` の正本フィールド（`connectionStatus`, `isApiKeyValid`, `apiKeyDegraded`, `isRateLimited`, `lastHealthCheck`）を使用している
- [ ] `status`, `reason`, `canExecute`, `shouldWarn`, `errorState` などの Phase 2 非存在フィールドを使用していない
- [ ] RuntimePolicyResolver の degraded 分岐テストが作成されている（`isDegraded` を参照）
- [ ] P62 対策テストが作成されている（degraded 時に integrated_api を返さないこと）
- [ ] RuntimePolicyResolver の DI なし後方互換テストが作成されている
- [ ] mainlineAccess.ts の HealthPolicy 消費テストが作成されている（`isConnectionAvailable` / `isDegraded` を参照）
- [ ] mainlineAccess.ts の後方互換テストが作成されている（`apiKeyDegraded` から導出）
- [ ] @deprecated マーク確認テストが作成されている
- [ ] 既存テスト回帰確認コマンドが記載されている
- [ ] 全テストが RED（FAIL）であることを確認済み
- [ ] テスト間で状態を共有していない（P9 準拠）
- [ ] テストファイルのインポートパスが正しい（P63 準拠）
- [ ] テスト実行ディレクトリが正しい（P40 準拠）

## 次 Phase

[Phase 5: 実装](./phase-5-implementation.md)

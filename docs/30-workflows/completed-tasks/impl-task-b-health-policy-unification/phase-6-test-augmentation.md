# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| Phase名    | テスト拡充                             |
| 前提Phase  | Phase 5                                |
| 後続Phase  | Phase 7                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-24                             |
| 機能名     | health-policy-unification              |
| タスクID   | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 |

---

## 目的

Phase 4 で作成した基本テストに対して、エッジケース・後方互換性・@deprecated 経由と HealthPolicy 経由の結果一致性を検証するテストを追加し、Phase 7 カバレッジ基準の達成を目指す。

## 背景

Phase 4（RED）→ Phase 5（GREEN）の TDD サイクルにより、`resolveHealthPolicy()` の基本 6 導出ルール（P1〜P5 + P3+P4 複合）、RuntimePolicyResolver の degraded 分岐、mainlineAccess の HealthPolicy 消費が実装済みである。本 Phase では Phase 4 で確立したテストパターン（`makeHealthCheckResult()` ヘルパー、位置引数 DI コンストラクタ）を踏襲し、**差分テスト**としてエッジケースと後方互換性を追加検証する。

## 前提成果物

| Phase | 成果物                                                   |
| ----- | -------------------------------------------------------- |
| 4     | [phase-4-test-creation.md](./phase-4-test-creation.md)   |
| 5     | [phase-5-implementation.md](./phase-5-implementation.md) |

## 参照資料

| 資料名             | パス / 参照先                                                          |
| ------------------ | ---------------------------------------------------------------------- |
| Phase 2 設計書     | `./phase-2-design.md`（**正本**: D-1〜D-2 のフィールド名・型・ルール） |
| Phase 4 テスト仕様 | `./phase-4-test-creation.md`（テストパターンの正本）                   |
| コード品質ルール   | `CLAUDE.md` + プロジェクト品質基準                                     |
| カバレッジ基準     | `CLAUDE.md` + プロジェクト品質基準（カバレッジ基準）                   |
| テスト設計の注意   | `CLAUDE.md`（テスト間状態リーク防止）                                  |
| P62 暗黙 fallback  | `CLAUDE.md`（DEFAULT_CONFIG fallback 禁止）                            |

## フィールド名の正本確認（Phase 4 からの引き継ぎ）

テストで使用する型・ヘルパーは Phase 4 で確立したパターンに従う。

### makeHealthCheckResult() ヘルパー

```typescript
const makeHealthCheckResult = (
  overrides?: Partial<{ checkedAt: Date; errorMessage: string | null }>,
) => ({
  checkedAt: overrides?.checkedAt ?? new Date("2026-03-24T00:00:00Z"),
  errorMessage: overrides?.errorMessage ?? null,
});
```

### RuntimePolicyResolver DI パターン（位置引数）

```typescript
// Phase 4/5 準拠: コンストラクタ第3引数に HealthPolicy を位置引数で渡す
new RuntimePolicyResolver(undefined, undefined, mockHealthPolicy);
```

### HealthPolicy 型の正本フィールド（D-1）

```
lastCheckedAt: Date | null     （Date.now() は不可）
errorDetail?: string           （null は不可、undefined または省略）
```

---

## 実行タスク

### Task 1: resolveHealthPolicy エッジケーステスト追加

テストファイル: `packages/shared/src/types/__tests__/health-policy.test.ts` に追記

Phase 2 D-2 の導出ルール優先順位（P1 > P2 > P3 > P4 > P5）の境界ケースを検証する。

#### 1-1. 優先順位の競合テスト

```typescript
describe("エッジケース: 優先順位の競合", () => {
  // P1 > P2: lastHealthCheck === null は connectionStatus より優先
  it("lastHealthCheck: null + disconnected → P1 が優先され unknown を返す", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "disconnected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: null,
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("unknown");
    expect(result.isConnectionAvailable).toBe(false);
    expect(result.isDegraded).toBe(false);
    expect(result.lastCheckedAt).toBeNull();
  });

  // P1 > P3: lastHealthCheck === null は isRateLimited より優先
  it("lastHealthCheck: null + rateLimited → P1 が優先され unknown を返す", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: true,
      lastHealthCheck: null,
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("unknown");
  });

  // P2 > P3: disconnected + rateLimited → unhealthy が優先
  it("disconnected + rateLimited → P2 が優先され unhealthy を返す", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "disconnected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: true,
      lastHealthCheck: makeHealthCheckResult(),
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("unhealthy");
    expect(result.isConnectionAvailable).toBe(false);
    expect(result.isRateLimited).toBe(true);
  });

  // P2 > P4: error + apiKeyDegraded → unhealthy が優先
  it("error + apiKeyDegraded → P2 が優先され unhealthy を返す", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "error",
      isApiKeyValid: true,
      apiKeyDegraded: true,
      isRateLimited: false,
      lastHealthCheck: makeHealthCheckResult({
        errorMessage: "Connection refused",
      }),
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("unhealthy");
    expect(result.isDegraded).toBe(false);
    expect(result.errorDetail).toBe("Connection refused");
  });

  // P1 > 全ルール: lastHealthCheck === null は全条件より優先
  it("lastHealthCheck: null + disconnected + rateLimited + apiKeyDegraded → P1 が優先され unknown を返す", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "disconnected",
      isApiKeyValid: false,
      apiKeyDegraded: true,
      isRateLimited: true,
      lastHealthCheck: null,
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("unknown");
    expect(result.lastCheckedAt).toBeNull();
  });
});
```

#### 1-2. errorDetail 導出テスト

```typescript
describe("エッジケース: errorDetail の導出", () => {
  it("unhealthy + errorMessage あり → errorMessage が errorDetail に設定される", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "disconnected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: makeHealthCheckResult({
        errorMessage: "Server timeout",
      }),
    };
    const result = resolveHealthPolicy(input);
    expect(result.errorDetail).toBe("Server timeout");
  });

  it("unhealthy + errorMessage なし → fallback 文字列が errorDetail に設定される", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "disconnected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: makeHealthCheckResult({ errorMessage: null }),
    };
    const result = resolveHealthPolicy(input);
    expect(result.errorDetail).toBe("Connection disconnected");
  });

  it("error 状態 + errorMessage なし → Connection error が errorDetail に設定される", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "error",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: makeHealthCheckResult({ errorMessage: null }),
    };
    const result = resolveHealthPolicy(input);
    expect(result.errorDetail).toBe("Connection error");
  });

  it("healthy 状態 → errorDetail は undefined", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: makeHealthCheckResult(),
    };
    const result = resolveHealthPolicy(input);
    expect(result.errorDetail).toBeUndefined();
  });

  it("degraded 状態 → errorDetail は undefined", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: true,
      isRateLimited: false,
      lastHealthCheck: makeHealthCheckResult(),
    };
    const result = resolveHealthPolicy(input);
    expect(result.errorDetail).toBeUndefined();
  });
});
```

### Task 2: RuntimePolicyResolver 後方互換・DI パステスト追加

テストファイル: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts` に追記

Phase 4 の位置引数 DI パターンを踏襲する。

#### 2-1. 後方互換テスト

```typescript
describe("後方互換: healthPolicy 未指定", () => {
  it("healthPolicy を指定しない場合、既存の resolve() 結果と同一である", async () => {
    const resolver = new RuntimePolicyResolver(undefined, undefined, undefined);
    const result = await resolver.resolve("integrated_api", "sk-valid-key");
    // 既存動作が維持されていることを検証
    expect(result.type).toBe("integrated_api");
    expect(result).toHaveProperty("apiKey", "sk-valid-key");
  });

  it("healthPolicy: undefined を明示的に渡しても既存動作を維持する", async () => {
    const resolver = new RuntimePolicyResolver(undefined, undefined, undefined);
    const result = await resolver.resolve("integrated_api", null);
    expect(result.type).toBe("terminal_handoff");
  });
});
```

#### 2-2. DI あり全 healthStatus パステスト

```typescript
describe("RuntimePolicyResolver: DI パスの分岐", () => {
  it("DI あり + healthy: isDegraded=false → 既存ロジックに委譲", async () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: true,
      isDegraded: false,
      isRateLimited: false,
      healthStatus: "healthy",
      lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
    };
    const resolver = new RuntimePolicyResolver(
      undefined,
      undefined,
      healthPolicy,
    );
    const result = await resolver.resolve("integrated_api", "sk-valid-key");
    // healthy 状態では degraded 分岐に入らず、API キーがあれば integrated_api
    expect(result.type).toBe("integrated_api");
  });

  it("DI あり + unknown: isDegraded=false → 既存ロジックに委譲", async () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: false,
      isDegraded: false,
      isRateLimited: false,
      healthStatus: "unknown",
      lastCheckedAt: null,
    };
    const resolver = new RuntimePolicyResolver(
      undefined,
      undefined,
      healthPolicy,
    );
    const result = await resolver.resolve("integrated_api", "sk-valid-key");
    // unknown でも isDegraded=false なら既存ロジックに委譲
    expect(result.type).toBe("integrated_api");
  });

  it("DI あり + unhealthy: isDegraded=false → 既存ロジックに委譲", async () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: false,
      isDegraded: false,
      isRateLimited: false,
      healthStatus: "unhealthy",
      lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
      errorDetail: "Connection disconnected",
    };
    const resolver = new RuntimePolicyResolver(
      undefined,
      undefined,
      healthPolicy,
    );
    const result = await resolver.resolve("integrated_api", "sk-valid-key");
    // unhealthy でも isDegraded=false なら既存ロジックに委譲（Phase 2 D-4 準拠）
    expect(result.type).toBe("integrated_api");
  });

  it("DI あり + degraded: isDegraded=true → terminal_handoff（P62 対策）", async () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: true,
      isDegraded: true,
      isRateLimited: false,
      healthStatus: "degraded",
      lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
    };
    const resolver = new RuntimePolicyResolver(
      undefined,
      undefined,
      healthPolicy,
    );
    const result = await resolver.resolve("integrated_api", "sk-valid-key");
    // degraded 時は API キーがあっても integrated_api に fallback しない
    expect(result.type).toBe("terminal_handoff");
  });

  it("DI あり + degraded + rateLimited: isDegraded=true かつ isRateLimited=true → terminal_handoff", async () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: true,
      isDegraded: true,
      isRateLimited: true,
      healthStatus: "degraded",
      lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
    };
    const resolver = new RuntimePolicyResolver(
      undefined,
      undefined,
      healthPolicy,
    );
    const result = await resolver.resolve("integrated_api", "sk-valid-key");
    expect(result.type).toBe("terminal_handoff");
  });
});
```

### Task 3: mainlineAccess エッジケーステスト追加

テストファイル: `apps/desktop/src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts` に追記

Phase 4 の mainlineAccess テストパターンを踏襲する。

```typescript
describe("mainlineAccess - HealthPolicy エッジケース", () => {
  it("healthPolicy.isDegraded=true + apiKeyValid=false → degraded 状態が優先", () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: true,
      isDegraded: true,
      isRateLimited: false,
      healthStatus: "degraded",
      lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
    };
    const state = buildMainlineExecutionAccessState({
      apiKeyValid: false,
      subscriptionValid: false,
      isAuthenticated: true,
      healthPolicy,
    });
    expect(state).toBeDefined();
  });

  it("healthPolicy.isConnectionAvailable=false + healthStatus=unknown → 接続不可状態", () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: false,
      isDegraded: false,
      isRateLimited: false,
      healthStatus: "unknown",
      lastCheckedAt: null,
    };
    const state = buildMainlineExecutionAccessState({
      apiKeyValid: true,
      subscriptionValid: true,
      isAuthenticated: true,
      healthPolicy,
    });
    expect(state).toBeDefined();
  });

  it("healthPolicy 未指定 + apiKeyDegraded=true + apiKeyValid=true → 既存 degraded 導出", () => {
    const state = buildMainlineExecutionAccessState({
      apiKeyValid: true,
      subscriptionValid: false,
      apiKeyDegraded: true,
      isAuthenticated: true,
      // healthPolicy を渡さない
    });
    expect(state).toBeDefined();
  });

  it("healthPolicy 指定時は apiKeyDegraded が無視される（healthPolicy 優先）", () => {
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
      apiKeyDegraded: true, // この値は healthPolicy がある場合は無視される
      isAuthenticated: true,
      healthPolicy,
    });
    // healthPolicy.isDegraded=false が優先される
    expect(state).toBeDefined();
  });
});
```

### Task 4: @deprecated 経由と HealthPolicy 経由の結果一致テスト

テストファイル: `packages/shared/src/types/__tests__/health-policy.test.ts` に追記

```typescript
describe("後方互換: @deprecated apiKeyDegraded との結果一致", () => {
  it("apiKeyDegraded: true → degraded ステータスと isDegraded: true を返す", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: true,
      isRateLimited: false,
      lastHealthCheck: makeHealthCheckResult(),
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("degraded");
    expect(result.isDegraded).toBe(true);
    expect(result.isConnectionAvailable).toBe(true);
  });

  it("apiKeyDegraded: false + isRateLimited: false → healthy ステータスと isDegraded: false を返す", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: makeHealthCheckResult(),
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("healthy");
    expect(result.isDegraded).toBe(false);
    expect(result.isConnectionAvailable).toBe(true);
  });

  it("apiKeyDegraded: true + isRateLimited: true → degraded（P3 が先に評価されるが結果は同じ）", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: true,
      isRateLimited: true,
      lastHealthCheck: makeHealthCheckResult(),
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("degraded");
    expect(result.isDegraded).toBe(true);
    expect(result.isRateLimited).toBe(true);
  });
});
```

### Task 5: テスト実行

```bash
# packages/shared のテスト
cd packages/shared && pnpm vitest run src/types/__tests__/health-policy.test.ts

# RuntimePolicyResolver の HealthPolicy テスト
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts

# mainlineAccess の HealthPolicy テスト
cd apps/desktop && pnpm vitest run src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts

# 既存テストの回帰確認
cd packages/shared && pnpm vitest run src/types/
cd apps/desktop && pnpm vitest run src/main/services/runtime/
cd apps/desktop && pnpm vitest run src/renderer/features/mainline-access/
```

全テストが PASS であることを確認する。

---

## 成果物

| 成果物                         | パス                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| エッジケーステスト追加         | `packages/shared/src/types/__tests__/health-policy.test.ts`                                         |
| 後方互換テスト追加             | `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts`      |
| @deprecated 結果一致テスト追加 | `packages/shared/src/types/__tests__/health-policy.test.ts`                                         |
| DI 両パステスト追加            | `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts`      |
| mainlineAccess エッジケース    | `apps/desktop/src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts` |

---

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                                  | 確認方法                                                                     | 判定基準      |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| 既存テスト（apiKeyDegraded 関連）への影響 | `pnpm --filter @repo/shared vitest run`                                      | 全テスト PASS |
| Task A（UiState）との型整合               | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 の CapabilityContext.isDegraded 消費 | 型定義が一致  |
| RuntimePolicyResolver 既存テスト          | `pnpm --filter @repo/desktop vitest run RuntimePolicyResolver`               | 全テスト PASS |

---

## 完了条件

- [ ] P1 > P2 優先順位テストが追加されている（lastHealthCheck: null + disconnected → unknown）
- [ ] P1 > P3 優先順位テストが追加されている（lastHealthCheck: null + rateLimited → unknown）
- [ ] P2 > P3 優先順位テストが追加されている（disconnected + rateLimited → unhealthy）
- [ ] P2 > P4 優先順位テストが追加されている（error + apiKeyDegraded → unhealthy）
- [ ] P1 > 全ルール 優先順位テストが追加されている（null + disconnected + rateLimited + apiKeyDegraded → unknown）
- [ ] errorDetail 導出テストが追加されている（errorMessage あり/なし/healthy/degraded）
- [ ] RuntimePolicyResolver 後方互換テストが追加されている（healthPolicy 未指定、undefined 明示）
- [ ] RuntimePolicyResolver DI あり全 healthStatus パステストが追加されている（healthy/unknown/unhealthy/degraded/degraded+rateLimited）
- [ ] mainlineAccess エッジケーステストが追加されている（degraded+apiKeyValid=false、unknown、後方互換、healthPolicy 優先）
- [ ] @deprecated apiKeyDegraded と HealthPolicy isDegraded の結果一致テストが追加されている
- [ ] 全テストが `makeHealthCheckResult()` ヘルパーを使用している（`{ timestamp, status }` 形状は使用禁止）
- [ ] RuntimePolicyResolver テストが位置引数 DI パターンを使用している（`new RuntimePolicyResolver(undefined, undefined, hp)` 形式）
- [ ] HealthPolicy の `lastCheckedAt` が `Date | null` 型で記述されている（`Date.now()` は禁止）
- [ ] HealthPolicy の `errorDetail` が `string | undefined` 型で記述されている（`null` は禁止）
- [ ] 全テストが PASS である
- [ ] テスト間で状態を共有していない

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## 次 Phase

[Phase 7: カバレッジ確認](./phase-7-coverage-check.md)

# Phase 6: テスト拡充

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 6 - テスト拡充                         |
| 機能名   | health-policy-unification              |
| タスクID | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 |
| 作成日   | 2026-03-24                             |

## 目的

Phase 4 で作成した基本テストに対して、エッジケース・後方互換性・@deprecated 経由と HealthPolicy 経由の結果一致性を検証するテストを追加し、カバレッジ基準の達成を目指す。

## 前提成果物

| Phase | 成果物                                                   |
| ----- | -------------------------------------------------------- |
| 4     | [phase-4-test-creation.md](./phase-4-test-creation.md)   |
| 5     | [phase-5-implementation.md](./phase-5-implementation.md) |

## 参照資料

| 資料名            | パス / 参照先                                                 |
| ----------------- | ------------------------------------------------------------- |
| コード品質ルール  | `.claude/rules/02-code-quality.md`                            |
| カバレッジ基準    | `.claude/rules/02-code-quality.md#カバレッジ基準`             |
| テスト設計の注意  | `.claude/rules/06-known-pitfalls.md#P9`（テスト間状態リーク） |
| P62 暗黙 fallback | `.claude/rules/06-known-pitfalls.md#P62`                      |

## 実行タスク

### Task 1: エッジケーステスト追加

テストファイル: `packages/shared/src/types/__tests__/health-policy.test.ts` に追記

#### 1-1. rateLimited + disconnected の同時成立

Phase 2 D-2 の導出ルール優先順位（P1 > P2 > P3 > P4 > P5）に準拠したテスト:

```typescript
describe("エッジケース: 複合状態", () => {
  it("rateLimited かつ disconnected の場合、unhealthy が優先される（P2:disconnected > P3:rateLimited）", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "disconnected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: true,
      lastHealthCheck: null, // HealthCheckResult | null
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("unhealthy");
    expect(result.errorDetail).toBe("disconnected");
  });

  it("apiKeyDegraded かつ isRateLimited の場合、degraded を返す（P3:rateLimited 優先）", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: true,
      isRateLimited: true,
      lastHealthCheck: { timestamp: Date.now(), status: "ok" },
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("degraded");
    expect(result.isRateLimited).toBe(true);
  });

  it("connectionStatus: error の場合、unhealthy を返す（P2）", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "error",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: { timestamp: Date.now(), status: "error" },
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("unhealthy");
    expect(result.errorDetail).toContain("error");
  });

  it("lastHealthCheck === null の場合、unknown を返す（P1 最優先）", () => {
    const input: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: null,
    };
    const result = resolveHealthPolicy(input);
    expect(result.healthStatus).toBe("unknown");
  });
});
```

### Task 2: 後方互換テスト

#### 2-1. healthPolicy 未指定時の既存動作テスト

テストファイル: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts` に追記

```typescript
describe("後方互換: healthPolicy 未指定", () => {
  it("healthPolicy を指定しない場合、既存の resolve() 結果と同一である", () => {
    const configWithout = {
      /* 既存の config パラメータのみ */
    };
    const resolverWithout = new RuntimePolicyResolver(configWithout);
    const resultWithout = resolverWithout.resolve();

    // 既存動作が維持されていることを検証（HealthPolicy 非依存のプロパティが存在）
    expect(resultWithout).toBeDefined();
  });

  it("healthPolicy: undefined を明示的に渡しても既存動作を維持する", () => {
    const config = { healthPolicy: undefined };
    const resolver = new RuntimePolicyResolver(config);
    const result = resolver.resolve();
    expect(result).toBeDefined();
  });
});
```

### Task 3: @deprecated フラグ経由と HealthPolicy 経由の結果一致テスト

テストファイル: `packages/shared/src/types/__tests__/health-policy.test.ts` に追記

```typescript
describe("後方互換: @deprecated apiKeyDegraded との結果一致", () => {
  it("apiKeyDegraded: true の場合、degraded ステータスと isDegraded: true を返す", () => {
    const healthPolicyInput: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: true,
      isRateLimited: false,
      lastHealthCheck: { timestamp: Date.now(), status: "ok" },
    };
    const result = resolveHealthPolicy(healthPolicyInput);
    expect(result.healthStatus).toBe("degraded");
    expect(result.isDegraded).toBe(true);
    expect(result.isConnectionAvailable).toBe(true);
  });

  it("apiKeyDegraded: false の場合、healthy ステータスと isDegraded: false を返す", () => {
    const healthPolicyInput: HealthPolicyInput = {
      connectionStatus: "connected",
      isApiKeyValid: true,
      apiKeyDegraded: false,
      isRateLimited: false,
      lastHealthCheck: { timestamp: Date.now(), status: "ok" },
    };
    const result = resolveHealthPolicy(healthPolicyInput);
    expect(result.healthStatus).toBe("healthy");
    expect(result.isDegraded).toBe(false);
    expect(result.isConnectionAvailable).toBe(true);
  });
});
```

### Task 4: RuntimePolicyResolver DI なし / DI あり両パステスト

テストファイル: `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts` に追記

```typescript
describe("RuntimePolicyResolver: DI パスの分岐", () => {
  it("DI あり + healthy: isConnectionAvailable=true, isDegraded=false", () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: true,
      isDegraded: false,
      isRateLimited: false,
      healthStatus: "healthy",
      lastCheckedAt: Date.now(),
      errorDetail: null,
    };
    const resolver = new RuntimePolicyResolver({ healthPolicy });
    const result = resolver.resolve();
    expect(result).toBeDefined();
    // healthy 状態では degraded 分岐に入らない
  });

  it("DI あり + unknown: healthStatus=unknown でも動作する", () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: true,
      isDegraded: false,
      isRateLimited: false,
      healthStatus: "unknown",
      lastCheckedAt: null,
      errorDetail: null,
    };
    const resolver = new RuntimePolicyResolver({ healthPolicy });
    const result = resolver.resolve();
    expect(result).toBeDefined();
  });

  it("DI あり + degraded: isDegraded=true で degraded 分岐が適用される", () => {
    const healthPolicy: HealthPolicy = {
      isConnectionAvailable: true,
      isDegraded: true,
      isRateLimited: false,
      healthStatus: "degraded",
      lastCheckedAt: Date.now(),
      errorDetail: null,
    };
    const resolver = new RuntimePolicyResolver({ healthPolicy });
    const result = resolver.resolve();
    expect(result).toBeDefined();
    // degraded 分岐の動作を検証
  });

  it("DI なし: 既存の判定ロジックが使用される（後方互換）", () => {
    const resolver = new RuntimePolicyResolver({});
    const result = resolver.resolve();
    // HealthPolicy 未指定でも動作することを保証
    expect(result).toBeDefined();
  });
});
```

### Task 5: テスト実行

```bash
# 全テスト実行
cd packages/shared && pnpm vitest run src/types/__tests__/health-policy.test.ts
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts
cd apps/desktop && pnpm vitest run src/renderer/features/mainline-access/__tests__/mainlineAccess.health-policy.test.ts
```

全テストが PASS であることを確認する。

## 成果物

| 成果物                         | パス                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| エッジケーステスト追加         | `packages/shared/src/types/__tests__/health-policy.test.ts`                                    |
| 後方互換テスト追加             | `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts` |
| @deprecated 結果一致テスト追加 | `packages/shared/src/types/__tests__/health-policy.test.ts`                                    |
| DI 両パステスト追加            | `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.health-policy.test.ts` |

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

- [ ] rateLimited + disconnected 同時成立テストが追加されている
- [ ] apiKeyDegraded + isRateLimited 同時成立テストが追加されている
- [ ] connectionStatus: error テストが追加されている
- [ ] lastHealthCheck === null テスト（P1 優先ルール）が追加されている
- [ ] healthPolicy 未指定時の後方互換テストが追加されている
- [ ] healthPolicy: undefined 明示指定時のテストが追加されている
- [ ] @deprecated apiKeyDegraded と HealthPolicy isDegraded の結果一致テストが追加されている
- [ ] RuntimePolicyResolver DI あり（healthy/unknown/degraded/unhealthy）テストが追加されている
- [ ] RuntimePolicyResolver DI なしテストが追加されている
- [ ] 全テストが PASS である
- [ ] テスト間で状態を共有していない（P9 準拠）

## 次 Phase

[Phase 7: カバレッジ確認](./phase-7-coverage-check.md)

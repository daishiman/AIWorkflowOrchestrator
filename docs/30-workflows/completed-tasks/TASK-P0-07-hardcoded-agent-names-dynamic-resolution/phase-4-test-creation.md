# Phase 4: テスト作成（TDD: Red） - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 4                                                   |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution |
| 作成日    | 2026-04-06                                          |
| 前提Phase | Phase 3: 設計レビュー                               |
| 後続Phase | Phase 5: 実装（TDD: Green）                         |

## 目的

TDD Red フェーズとして、Phase 2 設計に基づくテストケースを先行作成する。`buildPhaseResourceRequestsFromManifest()` の単体テストと `RuntimeSkillCreatorFacade` の plan()/improve() 動的解決テストを記述し、Phase 5 の実装指針を確立する。

## 実行タスク

- タスク1: `manifestResourceResolver.test.ts` の新規作成（T-P7-09, T-P7-10）
- タスク2: `RuntimeSkillCreatorFacade.plan.test.ts` への動的解決テスト追加（T-P7-05, T-P7-06, T-P7-07）
- タスク3: `RuntimeSkillCreatorFacade.improve.test.ts` への動的解決テスト追加（T-P7-08）
- タスク4: テストフィクスチャの作成

## 参照資料

| 資料名                        | パス                                                                                         | 説明                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 2 設計                  | `phase-2-design.md`                                                                          | 型設計・変換ロジック・フォールバック条件 |
| Phase 3 設計レビュー          | `phase-3-design-review.md`                                                                   | レビュー判定・MINOR 指摘事項             |
| 既存 plan テスト              | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`    | T-P7-02, T-P7-04 の既存テスト            |
| 既存 improve テスト           | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | improve() の既存テスト構造               |
| PhaseResourceRequest 型定義   | `apps/desktop/src/main/services/runtime/PhaseResourcePlanner.ts`                             | `PhaseResourceRequest` インターフェース  |
| LoadedWorkflowManifest 型定義 | `packages/shared/src/types/skillCreator.ts`                                                  | manifest の型定義                        |
| WorkflowManifestPhase 型定義  | `packages/shared/src/types/skillCreator.ts`                                                  | `resourceIds?` を持つ phase 型           |
| planPromptConstants           | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                              | `PLAN_RESOURCE_REQUESTS` 静的定義        |
| improvePromptConstants        | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`                           | `IMPROVE_RESOURCE_REQUESTS` 静的定義     |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                               |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | Main Process サービス設計          |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill Creator SDK インターフェース |

## 実行手順

### ステップ0: P50チェック — 既存テスト構造の確認

Phase 4 開始前に、以下の確認を行う:

```bash
# 既存テストファイルの一覧確認
ls -la apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade*.test.ts

# 既存の T-P7-* テストの確認
grep -n "T-P7-" apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts

# improve テストの構造確認
grep -n "describe\|it(" apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts | head -30

# PhaseResourceRequest の型を確認
grep -A 10 "export interface PhaseResourceRequest" apps/desktop/src/main/services/runtime/PhaseResourcePlanner.ts
```

### タスク1: `manifestResourceResolver.test.ts` の新規作成

#### 1.1 ファイル作成

**配置先**: `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`

#### 1.2 テストフィクスチャ定義

テスト内で使用する manifest フィクスチャを定義する:

```typescript
// テスト用の manifest フィクスチャ
const createMockManifest = (
  overrides?: Partial<LoadedWorkflowManifest>,
): LoadedWorkflowManifest => ({
  schemaVersion: 1,
  workflowId: "skill-creator",
  phases: [
    {
      id: "plan",
      title: "Plan Phase",
      resourceIds: [
        "agent-define-boundary",
        "agent-design-workflow",
        "ref-core-principles",
      ],
      entryHookId: "plan-entry",
      exitHookId: "plan-exit",
    },
    {
      id: "improve",
      title: "Improve Phase",
      resourceIds: ["agent-analyze-feedback"],
      entryHookId: "improve-entry",
      exitHookId: "improve-exit",
    },
  ],
  resources: [
    {
      id: "agent-define-boundary",
      kind: "agent",
      path: "./agents/define-boundary.md",
    },
    {
      id: "agent-design-workflow",
      kind: "agent",
      path: "./agents/design-workflow.md",
    },
    {
      id: "ref-core-principles",
      kind: "reference",
      path: "./references/core-principles.md",
    },
    {
      id: "agent-analyze-feedback",
      kind: "agent",
      path: "./agents/analyze-feedback.md",
    },
  ],
  sourcePath: "/mock/workflow-manifest.json",
  manifestDir: "/mock",
  manifestMtimeMs: Date.now(),
  manifestContentHash: "mock-hash",
  resourceDescriptorHash: "mock-resource-hash",
  cacheKey: "mock-cache-key",
  entry: [],
  exit: [],
  ...overrides,
});
```

#### 1.3 テストケース T-P7-09: `buildPhaseResourceRequestsFromManifest()` の単体テスト（正常系）

```typescript
describe("buildPhaseResourceRequestsFromManifest", () => {
  describe("正常系", () => {
    it("T-P7-09: manifest の plan フェーズ resourceIds からPhaseResourceRequest[] を組み立てる", () => {
      const manifest = createMockManifest();
      const fallback = PLAN_RESOURCE_REQUESTS;

      const result = buildPhaseResourceRequestsFromManifest(
        manifest,
        "plan",
        fallback,
      );

      // manifest の plan phase には 3 resourceIds がある
      expect(result).toHaveLength(3);

      // agent リソースは required-core
      expect(result[0]).toEqual({
        id: "agent-define-boundary",
        kind: "agent",
        relativePath: "agents/define-boundary.md",
        tier: "required-core",
        required: true,
      });

      // reference リソースは optional-quality
      expect(result[2]).toEqual({
        id: "ref-core-principles",
        kind: "reference",
        relativePath: "references/core-principles.md",
        tier: "optional-quality",
        required: false,
      });

      // fallback ではなく manifest 由来のリストが返される
      expect(result).not.toEqual(fallback);
    });

    it("T-P7-09b: improve フェーズの resourceIds から正しく組み立てる", () => {
      const manifest = createMockManifest();
      const fallback = IMPROVE_RESOURCE_REQUESTS;

      const result = buildPhaseResourceRequestsFromManifest(
        manifest,
        "improve",
        fallback,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "agent-analyze-feedback",
        kind: "agent",
        relativePath: "agents/analyze-feedback.md",
        tier: "required-core",
        required: true,
      });
    });

    it("T-P7-09c: resource.path 先頭の './' が除去される", () => {
      const manifest = createMockManifest();
      const result = buildPhaseResourceRequestsFromManifest(
        manifest,
        "plan",
        [],
      );

      result.forEach((r) => {
        expect(r.relativePath).not.toMatch(/^\.\//);
      });
    });
  });
});
```

#### 1.4 テストケース T-P7-10: `buildPhaseResourceRequestsFromManifest()` の単体テスト（フォールバック系）

```typescript
describe("フォールバック系", () => {
  it("T-P7-10a: manifest に対象 phaseId が存在しない場合、fallback を返す", () => {
    const manifest = createMockManifest();
    const fallback = PLAN_RESOURCE_REQUESTS;

    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "nonexistent-phase",
      fallback,
    );

    expect(result).toEqual([...fallback]);
  });

  it("T-P7-10b: フェーズの resourceIds が undefined の場合、fallback を返す", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan Phase",
          // resourceIds が未定義
          entryHookId: "plan-entry",
          exitHookId: "plan-exit",
        },
      ],
    });
    const fallback = PLAN_RESOURCE_REQUESTS;

    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      fallback,
    );

    expect(result).toEqual([...fallback]);
  });

  it("T-P7-10c: フェーズの resourceIds が空配列の場合、fallback を返す", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan Phase",
          resourceIds: [],
          entryHookId: "plan-entry",
          exitHookId: "plan-exit",
        },
      ],
    });
    const fallback = PLAN_RESOURCE_REQUESTS;

    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      fallback,
    );

    expect(result).toEqual([...fallback]);
  });

  it("T-P7-10d: resourceIds の全 ID が resources[] に見つからない場合、fallback を返す", () => {
    const manifest = createMockManifest({
      phases: [
        {
          id: "plan",
          title: "Plan Phase",
          resourceIds: ["nonexistent-1", "nonexistent-2"],
          entryHookId: "plan-entry",
          exitHookId: "plan-exit",
        },
      ],
      resources: [],
    });
    const fallback = PLAN_RESOURCE_REQUESTS;

    const result = buildPhaseResourceRequestsFromManifest(
      manifest,
      "plan",
      fallback,
    );

    expect(result).toEqual([...fallback]);
  });

  it("T-P7-10e: フォールバック発動時にログが出力される", () => {
    const manifest = createMockManifest();
    const fallback = PLAN_RESOURCE_REQUESTS;

    // console.warn のスパイを設定
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    buildPhaseResourceRequestsFromManifest(
      manifest,
      "nonexistent-phase",
      fallback,
    );

    // warn ログが出力されることを確認
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
```

### タスク2: `RuntimeSkillCreatorFacade.plan.test.ts` への動的解決テスト追加

#### 2.1 追加位置

既存の `TASK-P0-07: PLAN_RESOURCE_REQUESTS からの agent 名導出` describe ブロックの後に、新しい describe ブロックを追加する。

#### 2.2 テストケース T-P7-05: manifest の plan フェーズ resourceIds からエージェントリストを組み立てる

```typescript
describe("TASK-P0-07: manifest 動的解決", () => {
  it("T-P7-05: manifest の plan フェーズ resourceIds からエージェントリストを組み立てる", async () => {
    // 動的パイプラインが有効な facade を構築
    // sourceResolver が manifest を返すようにモック設定
    // manifest の plan phase resourceIds に基づく解決が内部で行われることを検証
    // Arrange: manifest を返す sourceResolver のモック
    // Act: facade.plan() を呼び出し
    // Assert: resolveOperationResources に phaseId "plan" と PLAN_RESOURCE_REQUESTS が渡される
  });
});
```

**検証ポイント**:

- `resolveOperationResources()` に渡される phaseId が `"plan"` であること
- `resolveOperationResources()` に渡される fallback が `PLAN_RESOURCE_REQUESTS` であること
- manifest の `plan` phase の `resourceIds` に対応する変換は `manifestResourceResolver.test.ts` 側で検証すること

#### 2.3 テストケース T-P7-06: manifest に plan フェーズが存在しない場合にフォールバック

```typescript
it("T-P7-06: manifest に plan フェーズが存在しない場合、PLAN_RESOURCE_REQUESTS にフォールバックする", async () => {
  // Arrange: plan phase が存在しない manifest を返す sourceResolver のモック
  // Act: facade.plan() を呼び出し
  // Assert: resolveOperationResources に phaseId "plan" と PLAN_RESOURCE_REQUESTS が渡される
  //         フォールバック時の warn ログが出力される
});
```

**検証ポイント**:

- `resolveOperationResources()` に渡される fallback が `PLAN_RESOURCE_REQUESTS` であること
- フォールバック発動を示す warn レベルログが出力されること

#### 2.4 テストケース T-P7-07: manifest の resourceIds が空の場合にフォールバック

```typescript
it("T-P7-07: manifest の plan フェーズの resourceIds が空の場合、PLAN_RESOURCE_REQUESTS にフォールバックする", async () => {
  // Arrange: plan phase の resourceIds が空配列の manifest を返す sourceResolver のモック
  // Act: facade.plan() を呼び出し
  // Assert: resolveOperationResources に phaseId "plan" と PLAN_RESOURCE_REQUESTS が渡される
});
```

**検証ポイント**:

- `resourceIds: []` の場合に正しくフォールバックすること
- `resourceIds: undefined` の場合も同様にフォールバックすること（パラメタライズドテストとして実装してもよい）

### タスク3: `RuntimeSkillCreatorFacade.improve.test.ts` への動的解決テスト追加

#### 3.1 テストケース T-P7-08: improve フェーズの動的解決テスト

```typescript
describe("TASK-P0-07: manifest 動的解決（improve）", () => {
  it("T-P7-08: manifest の improve フェーズ resourceIds からエージェントリストを組み立てる", async () => {
    // 動的パイプラインが有効な facade を構築
    // sourceResolver が manifest を返すようにモック設定
    // manifest の improve phase resourceIds に基づく解決が内部で行われることを検証
    // Arrange: manifest を返す sourceResolver のモック
    // Act: facade.improve() を呼び出し
    // Assert: resolveOperationResources に phaseId "improve" と IMPROVE_RESOURCE_REQUESTS が渡される
  });

  it("T-P7-08b: manifest に improve フェーズが存在しない場合、IMPROVE_RESOURCE_REQUESTS にフォールバックする", async () => {
    // Arrange: improve phase が存在しない manifest を返すモック
    // Act: facade.improve() を呼び出し
    // Assert: resolveOperationResources に phaseId "improve" と IMPROVE_RESOURCE_REQUESTS が渡される
  });
});
```

**検証ポイント**:

- improve() でも plan() と同様に phaseId と fallback が渡されること
- `IMPROVE_RESOURCE_REQUESTS` へのフォールバックが正しく動作すること

### タスク4: テストフィクスチャの作成

#### 4.1 共有フィクスチャ

テストケースで共通利用する manifest フィクスチャを、テストファイルのヘルパー関数として定義する。既存テスト（`SkillCreatorSourceResolver.test.ts` L101 付近）の `LoadedWorkflowManifest` フィクスチャパターンに準拠する。

#### 4.2 フィクスチャバリエーション

| フィクスチャ名                         | 用途                                             |
| -------------------------------------- | ------------------------------------------------ |
| `createMockManifest()`                 | 標準的な manifest（plan + improve phase）        |
| `createMockManifestNoPlanPhase()`      | plan phase が存在しない manifest                 |
| `createMockManifestEmptyResourceIds()` | resourceIds が空配列の manifest                  |
| `createMockManifestUnknownResources()` | resourceIds が resources[] に存在しない manifest |

### ステップ最終: TDD Red 確認

全テストが FAIL することを確認する（`buildPhaseResourceRequestsFromManifest` が未実装のため）:

```bash
# テスト実行（Red 確認）
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts

# 既存テストが壊れていないことを確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
```

## テストケース一覧

| テストID | テストファイル                              | テスト内容                                                       | 対応AC |
| -------- | ------------------------------------------- | ---------------------------------------------------------------- | ------ |
| T-P7-05  | `RuntimeSkillCreatorFacade.plan.test.ts`    | manifest の plan フェーズ resourceIds からエージェントリスト組立 | AC-1   |
| T-P7-06  | `RuntimeSkillCreatorFacade.plan.test.ts`    | manifest に plan フェーズ未存在時のフォールバック                | AC-3   |
| T-P7-07  | `RuntimeSkillCreatorFacade.plan.test.ts`    | manifest の resourceIds 空時のフォールバック                     | AC-4   |
| T-P7-08  | `RuntimeSkillCreatorFacade.improve.test.ts` | improve フェーズの動的解決                                       | AC-2   |
| T-P7-09  | `manifestResourceResolver.test.ts`          | `buildPhaseResourceRequestsFromManifest()` 正常系                | AC-1   |
| T-P7-10  | `manifestResourceResolver.test.ts`          | `buildPhaseResourceRequestsFromManifest()` フォールバック系      | AC-3,4 |

## 統合テスト連携

| 判定項目                 | 基準 | 備考                                            |
| ------------------------ | ---- | ----------------------------------------------- |
| 新規テストの FAIL 確認   | 必須 | TDD Red フェーズ: 全新規テストが FAIL すること  |
| 既存テストの PASS 確認   | 必須 | T-P7-02, T-P7-04 が引き続き PASS すること       |
| テストファイル lint      | 必須 | `pnpm --filter @repo/desktop lint` がエラーなし |
| テストファイル typecheck | 必須 | 型エラーは import 未解決（実装前）のみ許容      |

## 成果物

| 成果物                                   | パス                                                                                                 | 説明                             |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------- |
| manifestResourceResolver テスト          | `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`                  | T-P7-09, T-P7-10 の単体テスト    |
| RuntimeSkillCreatorFacade plan テスト    | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`（追記）    | T-P7-05, T-P7-06, T-P7-07 の追加 |
| RuntimeSkillCreatorFacade improve テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`（追記） | T-P7-08 の追加                   |

## 完了条件

- [ ] `manifestResourceResolver.test.ts` が新規作成されている
- [ ] T-P7-09: `buildPhaseResourceRequestsFromManifest()` 正常系テストが記述されている
- [ ] T-P7-10: `buildPhaseResourceRequestsFromManifest()` フォールバック系テストが記述されている（5パターン）
- [ ] T-P7-05: manifest の plan フェーズ動的解決テストが `RuntimeSkillCreatorFacade.plan.test.ts` に追加されている
- [ ] T-P7-06: manifest に plan フェーズ未存在時のフォールバックテストが追加されている
- [ ] T-P7-07: resourceIds 空時のフォールバックテストが追加されている
- [ ] T-P7-08: improve フェーズの動的解決テストが `RuntimeSkillCreatorFacade.improve.test.ts` に追加されている
- [ ] 既存テスト T-P7-02, T-P7-04 が引き続き PASS する
- [ ] テストファイルの命名規則が既存（camelCase）に準拠している
- [ ] テストフィクスチャが定義されている
- [ ] 新規テストが全て FAIL する（TDD Red 確認）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装（TDD: Green）

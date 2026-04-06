# Phase 1 成果物: ハードコード箇所調査レポート

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-P0-07                               |
| 機能名     | hardcoded-agent-names-dynamic-resolution |
| 作成日     | 2026-04-06                               |
| Phase      | 1                                        |
| ステータス | 完了                                     |

## 調査対象

| ファイル                     | パス                                                                  |
| ---------------------------- | --------------------------------------------------------------------- |
| planPromptConstants.ts       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       |
| improvePromptConstants.ts    | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`    |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| workflow-manifest.json       | `.claude/skills/skill-creator/workflow-manifest.json`                 |

## ハードコード箇所一覧

### 1. PLAN_RESOURCE_REQUESTS の静的定義

**ファイル**: `planPromptConstants.ts` 行 21-58

3 agent + 1 reference が静的に定義されている:

```typescript
export const PLAN_RESOURCE_REQUESTS: readonly PhaseResourceRequest[] = [
  {
    id: "discover-problem",
    kind: "agent",
    relativePath: "agents/discover-problem.md",
    tier: "required-core",
    required: true,
    legacyCategory: "agents",
    legacyName: "discover-problem.md",
  },
  {
    id: "design-workflow",
    kind: "agent",
    relativePath: "agents/design-workflow.md",
    tier: "required-core",
    required: true,
    legacyCategory: "agents",
    legacyName: "design-workflow.md",
  },
  {
    id: "plan-structure",
    kind: "agent",
    relativePath: "agents/plan-structure.md",
    tier: "required-core",
    required: true,
    legacyCategory: "agents",
    legacyName: "plan-structure.md",
  },
  {
    id: "overview",
    kind: "reference",
    relativePath: "references/overview.md",
    tier: "optional-quality",
    required: false,
    legacyCategory: "references",
    legacyName: "overview.md",
  },
];
```

### 2. IMPROVE_RESOURCE_REQUESTS の静的定義

**ファイル**: `improvePromptConstants.ts` 行 18-37

1 agent + 1 reference が静的に定義されている:

```typescript
export const IMPROVE_RESOURCE_REQUESTS: readonly PhaseResourceRequest[] = [
  {
    id: "improve-prompt",
    kind: "agent",
    relativePath: "agents/improve-prompt.md",
    tier: "required-core",
    required: true,
    legacyCategory: "agents",
    legacyName: "improve-prompt.md",
  },
  {
    id: "feedback-loop",
    kind: "reference",
    relativePath: "references/feedback-loop.md",
    tier: "optional-quality",
    required: false,
    legacyCategory: "references",
    legacyName: "feedback-loop.md",
  },
];
```

### 3. manifest の対応するリソース定義

| manifest phase ID | manifest resourceIds                       | 静的定数の対応エージェント                        |
| ----------------- | ------------------------------------------ | ------------------------------------------------- |
| plan              | agent-define-boundary, ref-core-principles | discover-problem, design-workflow, plan-structure |
| improve           | agent-analyze-feedback                     | improve-prompt                                    |

### 4. 重要な差分: manifest リソース ID と静的定数の ID の不一致

manifest のリソース ID（例: `agent-define-boundary`）と静的定数の ID（例: `discover-problem`）は**名前が異なる**。動的解決では manifest の `resources[].id` をそのまま `PhaseResourceRequest.id` に使用し、`resources[].path` から `relativePath` を組み立てる必要がある。

この不一致は設計上の意図的なものではなく、静的定数が manifest 以前に定義されたことに起因する。動的解決への移行後は manifest のリソース ID が正本となるため、ID の不一致は自然に解消される。

## 動的パイプラインの現状分析

### hasDynamicResourcePipeline() の条件

**ファイル**: `RuntimeSkillCreatorFacade.ts` 行 690-696

```typescript
private hasDynamicResourcePipeline(): boolean {
  return Boolean(
    this.sourceResolver &&
    this.resourcePlanner &&
    this.resolvedResourceReader,
  );
}
```

以下の3つの依存コンポーネントが全て注入されている場合に `true` を返す:

| コンポーネント           | 役割                                        |
| ------------------------ | ------------------------------------------- |
| `sourceResolver`         | manifest へのアクセス経路・候補 root の解決 |
| `resourcePlanner`        | リソースの優先順位付けと計画                |
| `resolvedResourceReader` | 計画に基づくリソース読み込み                |

### resolveOperationResources() の現状

**ファイル**: `RuntimeSkillCreatorFacade.ts` 行 721-757

```typescript
private async resolveOperationResources(
  requests: readonly PhaseResourceRequest[],
  maxBytes: number,
  operation: SkillCreatorOperation,
): Promise<{ resources: PlannedSkillCreatorResource[]; sourceProvenance?: ... }>
```

**問題点**: 動的パス（`hasDynamicResourcePipeline() === true`）であっても、`resolveOperationResources()` に渡される `requests` 引数は静的リスト `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` がそのまま使用されている。manifest の `plan` / `improve` フェーズの `resourceIds` は直接使用されていない。

**呼び出し箇所**:

1. `plan()` メソッド（行 851-853）:

   ```typescript
   const resolved = await this.resolveOperationResources(
     PLAN_RESOURCE_REQUESTS, // ← 静的リスト
     PLAN_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
     "plan",
   );
   ```

2. `improve()` メソッド（行 1512-1514）:
   ```typescript
   const resolved = await this.resolveOperationResources(
     IMPROVE_RESOURCE_REQUESTS, // ← 静的リスト
     IMPROVE_PROMPT_CONSTANTS.DEFAULT_CONTEXT_BUDGET_BYTES,
     "improve",
   );
   ```

### 現状のデータフロー

```
plan() / improve()
  │
  ├── hasDynamicResourcePipeline() === true
  │     └── resolveOperationResources(PLAN_RESOURCE_REQUESTS, ...)  ← manifest の resourceIds 未使用
  │           ├── manifest を取得（loadWorkflowManifest()）
  │           ├── sourceResolver.resolve(...)   ← manifest は root 解決にのみ使用
  │           ├── resourcePlanner.plan(...)     ← 静的リストをそのまま使用
  │           └── readPlannedResources(...)
  │
  └── hasDynamicResourcePipeline() === false
        └── resourceLoader.loadAgent(name)     ← 静的リスト由来の名前で直接読み込み
```

## 影響範囲

| 影響を受けるファイル                                                                      | 影響内容                                     |
| ----------------------------------------------------------------------------------------- | -------------------------------------------- |
| `RuntimeSkillCreatorFacade.ts`                                                            | `resolveOperationResources()` の引数差し替え |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | 動的解決パスのテスト追加                     |

| 影響を受けないファイル      | 理由                                  |
| --------------------------- | ------------------------------------- |
| `planPromptConstants.ts`    | 静的フォールバックとして保持（FR-05） |
| `improvePromptConstants.ts` | 静的フォールバックとして保持（FR-05） |
| `ManifestLoader.ts`         | TASK-P0-04 の責務（スコープ外）       |
| `workflow-manifest.json`    | TASK-P0-03 の責務（スコープ外）       |

## 結論

動的パイプラインが有効な状態でも manifest の `phases[].resourceIds` が使用されておらず、静的定数がそのまま渡されている。manifest を主正本とする動的解決を実現するには、manifest のフェーズ定義から `PhaseResourceRequest[]` を組み立てるユーティリティの新規実装と、`resolveOperationResources()` の呼び出し箇所の変更が必要である。

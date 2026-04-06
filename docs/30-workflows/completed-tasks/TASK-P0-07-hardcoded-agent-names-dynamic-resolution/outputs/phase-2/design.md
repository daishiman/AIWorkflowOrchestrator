# Phase 2 成果物: 設計書

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-P0-07                               |
| 機能名     | hardcoded-agent-names-dynamic-resolution |
| 作成日     | 2026-04-06                               |
| Phase      | 2                                        |
| 前提Phase  | Phase 1: 要件定義                        |
| ステータス | 完了                                     |

## 設計概要

manifest の `phases[]` / `resources[]` から `PhaseResourceRequest[]` を動的に組み立てるユーティリティ関数 `buildPhaseResourceRequestsFromManifest()` を新規実装し、`RuntimeSkillCreatorFacade` の動的パスで使用する。manifest が利用できない場合は既存の静的定数にフォールバックする。

## ユーティリティ関数シグネチャ

### buildPhaseResourceRequestsFromManifest()

```typescript
/**
 * manifest の指定 phase から PhaseResourceRequest[] を動的に組み立てる。
 * manifest にフェーズが存在しない / resourceIds が空の場合は fallback を返す。
 *
 * @param manifest   - LoadedWorkflowManifest（ManifestLoader が返す型）
 * @param phaseId    - 対象フェーズ ID（"plan" | "improve"）
 * @param fallback   - フォールバック用の静的リスト
 * @returns PhaseResourceRequest[] - manifest 由来またはフォールバックのリスト
 */
function buildPhaseResourceRequestsFromManifest(
  manifest: LoadedWorkflowManifest,
  phaseId: string,
  fallback: readonly PhaseResourceRequest[],
): PhaseResourceRequest[];
```

**配置先**: `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`（新規ファイル）

**設計根拠**: `RuntimeSkillCreatorFacade.ts` に直接追加すると責務が肥大化するため、manifest → PhaseResourceRequest 変換ロジックを独立モジュールとして分離する。純粋関数として実装し、副作用を持たない。

## 入力型

### LoadedWorkflowManifest

`ManifestLoader.loadManifest()` が返す型。本変換で参照する構造:

```typescript
type WorkflowManifestResourceKind = "agent" | "reference" | "schema" | "asset";

interface LoadedWorkflowManifest {
  phases: WorkflowManifestPhase[];
  resources: NormalizedWorkflowManifestResourceDescriptor[];
}

interface WorkflowManifestPhase {
  id: string; // e.g., "plan", "improve"
  title: string;
  dependsOn?: string[];
  resourceIds?: string[]; // resource.id への参照
  entryHookId: string;
  exitHookId: string;
}

interface NormalizedWorkflowManifestResourceDescriptor {
  id: string; // e.g., "agent-define-boundary"
  kind: WorkflowManifestResourceKind;
  path: string; // e.g., "./agents/define-boundary.md"
  optional?: boolean;
  phaseIds?: string[]; // phase.id への逆参照
  absolutePath: string;
}
```

## 出力型

### PhaseResourceRequest

既存の `PhaseResourceRequest` 型に適合する出力を生成する:

```typescript
interface PhaseResourceRequest {
  id: string; // リソース ID
  kind: WorkflowManifestResourceKind;
  relativePath: string; // ファイルパス（先頭の "./" を除去）
  tier: "required-core" | "optional-quality";
  required: boolean; // tier に基づく
}
```

## 変換アルゴリズム（6ステップ）

```
入力: manifest, phaseId, fallback

ステップ 1. manifest.phases から id === phaseId のフェーズを検索
ステップ 2. フェーズが見つからない → fallback を返す（+ warn ログ）
ステップ 3. フェーズの resourceIds が undefined または空配列 → fallback を返す（+ warn ログ）
ステップ 4. resourceIds の各 id について:
   a. manifest.resources から id が一致するリソースを検索
   b. リソースが見つかった場合:
      - id: resource.id
      - kind: resource.kind
      - relativePath: resource.path の先頭 "./" を除去
      - tier: kind → tier マッピングに従う
      - required: tier === "required-core"
   c. リソースが見つからない場合:
      - warn ログを出力し、そのリソースをスキップ
ステップ 5. 結果が空配列 → fallback を返す（+ warn ログ）
ステップ 6. 結果を返す
```

## パス変換ルール

manifest の `resources[].path` は `"./"` プレフィックス付きで定義されている。`PhaseResourceRequest.relativePath` にマッピングする際にこのプレフィックスを除去する。

| manifest path                     | 変換後 relativePath             |
| --------------------------------- | ------------------------------- |
| `./agents/define-boundary.md`     | `agents/define-boundary.md`     |
| `./references/core-principles.md` | `references/core-principles.md` |
| `./schemas/agent-definition.json` | `schemas/agent-definition.json` |

変換処理: `path.replace(/^\.\//, "")`

## kind → tier マッピング

| resource.kind | tier               | required |
| ------------- | ------------------ | -------- |
| `agent`       | `required-core`    | true     |
| `reference`   | `optional-quality` | false    |
| `schema`      | `optional-quality` | false    |
| `asset`       | `optional-quality` | false    |

**設計根拠**: エージェントはスキル生成の中核であり必須。リファレンス・スキーマ・アセットは補助的なリソースであり、欠落しても基本的な動作に影響しない。

## フォールバック条件（5パターン）

| #   | 条件                                            | フォールバック動作                             | ログレベル |
| --- | ----------------------------------------------- | ---------------------------------------------- | ---------- |
| 1   | manifest に対象 phaseId が存在しない            | `fallback` パラメータをそのまま返す            | warn       |
| 2   | フェーズの `resourceIds` が undefined           | `fallback` パラメータをそのまま返す            | warn       |
| 3   | フェーズの `resourceIds` が空配列 `[]`          | `fallback` パラメータをそのまま返す            | warn       |
| 4   | resourceIds の全 ID が resources に見つからない | `fallback` パラメータをそのまま返す            | warn       |
| 5   | `hasDynamicResourcePipeline()` が false         | 既存の静的フォールバックパスを使用（変更なし） | なし       |

## ログ出力フォーマット

```typescript
// フォールバック発動時（条件 1, 2, 3, 4）
console.warn(
  `[manifestResourceResolver] manifest phase "${phaseId}" not found or has no resourceIds, falling back to static resource requests`,
);

// 個別リソース未発見時（ステップ 4c）
console.warn(
  `[manifestResourceResolver] manifest resource "${resourceId}" not found in resources[], skipping`,
);
```

## 変更対象ファイル一覧

### 新規作成

| ファイル                                                                            | 目的                                                      |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`                | `buildPhaseResourceRequestsFromManifest()` ユーティリティ |
| `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts` | ユーティリティのユニットテスト                            |

### 修正

| ファイル                                                              | 変更箇所                             | 変更内容                                                                                                                                                       |
| --------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `resolveOperationResources()` の引数 | `phaseId` / `fallback` を受け取り、内部で `buildPhaseResourceRequestsFromManifest()` を呼び出して manifest 由来の `PhaseResourceRequest[]` を組み立てる        |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `plan()` / `improve()` の動的パス    | `resolveOperationResources("plan", PLAN_RESOURCE_REQUESTS, ...)` / `resolveOperationResources("improve", IMPROVE_RESOURCE_REQUESTS, ...)` を呼び出すように変更 |

### 変更しないファイル

| ファイル                    | 理由                                  |
| --------------------------- | ------------------------------------- |
| `planPromptConstants.ts`    | 静的フォールバックとして保持（FR-05） |
| `improvePromptConstants.ts` | 静的フォールバックとして保持（FR-05） |
| `ManifestLoader.ts`         | TASK-P0-04 の責務（スコープ外）       |
| `workflow-manifest.json`    | TASK-P0-03 の責務（スコープ外）       |

## データフロー図

### plan() の動的解決フロー（変更後）

```
RuntimeSkillCreatorFacade.plan()
  │
  ├── hasDynamicResourcePipeline() === true
  │     └── resolveOperationResources("plan", PLAN_RESOURCE_REQUESTS, maxBytes, "plan")
  │           │
  │           ├── manifest を取得（loadWorkflowManifest()）
  │           │
  │           ├── buildPhaseResourceRequestsFromManifest(manifest, "plan", PLAN_RESOURCE_REQUESTS)
  │           │     ├── manifest 有効 → manifest 由来の PhaseResourceRequest[] を返す
  │           │     └── manifest 無効 → PLAN_RESOURCE_REQUESTS をフォールバックとして返す
  │           │
  │           ├── sourceResolver.resolve(...)    ← 組み立てた requests を使用
  │           ├── resourcePlanner.plan(...)      ← 組み立てた requests を使用
  │           └── readPlannedResources(resolved, ...)
  │
  └── hasDynamicResourcePipeline() === false
        │
        └── PLAN_RESOURCE_REQUESTS.filter(r => r.kind === "agent")
              │
              └── resourceLoader.loadAgent(request.id) を順次呼び出し
```

### improve() の動的解決フロー（変更後）

```
RuntimeSkillCreatorFacade.improve()
  │
  ├── hasDynamicResourcePipeline() === true
  │     └── resolveOperationResources("improve", IMPROVE_RESOURCE_REQUESTS, maxBytes, "improve")
  │           │
  │           ├── manifest を取得（loadWorkflowManifest()）
  │           │
  │           ├── buildPhaseResourceRequestsFromManifest(manifest, "improve", IMPROVE_RESOURCE_REQUESTS)
  │           │     ├── manifest 有効 → manifest 由来の PhaseResourceRequest[] を返す
  │           │     └── manifest 無効 → IMPROVE_RESOURCE_REQUESTS をフォールバックとして返す
  │           │
  │           ├── sourceResolver.resolve(...)
  │           ├── resourcePlanner.plan(...)
  │           └── readPlannedResources(resolved, ...)
  │
  └── hasDynamicResourcePipeline() === false
        │
        └── IMPROVE_RESOURCE_REQUESTS.filter(r => r.kind === "agent")
              │
              └── resourceLoader.loadAgent(request.id) を順次呼び出し
```

### manifest アクセス経路

```
RuntimeSkillCreatorFacade
  │
  ├── this.sourceResolver: SkillCreatorSourceResolver
  │     └── manifest へのアクセス手段を提供（候補 root の解決）
  │
  ├── this.resourcePlanner: PhaseResourcePlanner
  │     └── リソースの優先順位付けと計画
  │
  └── this.resolvedResourceReader: ResolvedResourceReader
        └── 計画に基づくリソース読み込み
```

### 二重構造の維持

```
hasDynamicResourcePipeline() === true の場合:
  ┌──────────────────────────────────────────────────────┐
  │ resolveOperationResources(phaseId, fallback, ...)    │
  │              ↓                                       │
  │ manifest を取得                                      │
  │              ↓                                       │
  │ buildPhaseResourceRequestsFromManifest()             │
  │   ├── manifest 有効 → manifest 由来リスト           │
  │   └── manifest 無効 → 静的定数フォールバック         │
  │              ↓                                       │
  │ sourceResolver.resolve(...)                          │
  │              ↓                                       │
  │ resourcePlanner.plan(...)                            │
  │              ↓                                       │
  │ readPlannedResources(resolved, ...)                  │
  └──────────────────────────────────────────────────────┘

hasDynamicResourcePipeline() === false の場合:
  ┌──────────────────────────────────────────────────────┐
  │ 静的定数を直接使用（変更なし）                       │
  │   ↓                                                  │
  │ resourceLoader.loadAgent(id) を順次呼び出し          │
  └──────────────────────────────────────────────────────┘
```

## 多角的チェック観点

| 観点               | 適用判断 | チェック内容                                            |
| ------------------ | -------- | ------------------------------------------------------- |
| アーキテクチャ     | 適用     | 新規ファイル追加が既存の責務境界を侵さないこと          |
| エラーハンドリング | 適用     | フォールバック条件が網羅的で、silent failure がないこと |
| パフォーマンス     | 非適用   | manifest 解決は起動時1回のみで性能影響なし              |
| セキュリティ       | 非適用   | manifest はローカルファイルであり、外部入力を受けない   |

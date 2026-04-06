# Phase 2: 設計 - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 2                                                   |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution |
| 作成日    | 2026-04-06                                          |
| 前提Phase | Phase 1: 要件定義                                   |
| 後続Phase | Phase 3: 設計レビュー                               |

## 目的

Phase 1 で定義した要件（FR-01〜FR-06、NFR-01〜NFR-05）を満たすアーキテクチャ設計を行う。manifest から phase 別リソースリストを動的に組み立てる変換ロジック、フォールバック条件、変更対象ファイルと変更内容を確定する。

## 実行タスク

- タスク1: ユーティリティ関数の型設計
- タスク2: manifest → PhaseResourceRequest 変換ロジックの設計
- タスク3: フォールバック条件の設計
- タスク4: 変更対象ファイルと変更箇所の特定
- タスク5: データフロー図の作成

## 参照資料

| 資料名                    | パス                                                                  | 説明                            |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件定義          | `phase-1-requirements.md`                                             | 要件・AC・スコープ定義          |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 変更対象メインファイル          |
| ManifestLoader            | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`            | manifest ロード・バリデーション |
| planPromptConstants       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | 静的フォールバック定義          |
| improvePromptConstants    | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`    | 静的フォールバック定義          |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                        | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Main Process サービス設計          |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリングパターン           |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill Creator SDK インターフェース |

## 実行手順

### タスク1: ユーティリティ関数の型設計

#### 1.1 入力型: LoadedWorkflowManifest

`ManifestLoader.loadManifest()` が返す型のうち、この変換で参照する要点は以下:

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

#### 1.2 出力型: PhaseResourceRequest

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

#### 1.3 ユーティリティ関数シグネチャ

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

**設計根拠**: `RuntimeSkillCreatorFacade.ts` に直接追加すると責務が肥大化するため、manifest → PhaseResourceRequest 変換ロジックを独立モジュールとして分離する。

### タスク2: manifest → PhaseResourceRequest 変換ロジック

#### 2.1 変換アルゴリズム

```
入力: manifest, phaseId, fallback

1. manifest.phases から id === phaseId のフェーズを検索
2. フェーズが見つからない → fallback を返す（+ warn ログ）
3. フェーズの resourceIds が undefined または空配列 → fallback を返す（+ warn ログ）
4. resourceIds の各 id について:
   a. manifest.resources から id が一致するリソースを検索
   b. リソースが見つかった場合:
      - id: resource.id
      - kind: resource.kind
      - relativePath: resource.path の先頭 "./" を除去
      - tier: resource.kind が "agent" なら "required-core"、それ以外（reference / schema / asset）は "optional-quality"
      - required: tier === "required-core"
   c. リソースが見つからない場合:
      - console.warn を出力し、そのリソースをスキップ
5. 結果が空配列 → fallback を返す（+ warn ログ）
6. 結果を返す
```

#### 2.2 パス変換ルール

| manifest path                     | 変換後 relativePath             |
| --------------------------------- | ------------------------------- |
| `./agents/define-boundary.md`     | `agents/define-boundary.md`     |
| `./references/core-principles.md` | `references/core-principles.md` |
| `./schemas/agent-definition.json` | `schemas/agent-definition.json` |

変換処理: `path.replace(/^\.\//, "")`

#### 2.3 kind → tier マッピング

| resource.kind | tier               | required |
| ------------- | ------------------ | -------- |
| `agent`       | `required-core`    | true     |
| `reference`   | `optional-quality` | false    |
| `schema`      | `optional-quality` | false    |
| `asset`       | `optional-quality` | false    |

### タスク3: フォールバック条件の設計

#### 3.1 フォールバック発動条件

| 条件                                            | フォールバック動作                             | ログレベル |
| ----------------------------------------------- | ---------------------------------------------- | ---------- |
| manifest に対象 phaseId が存在しない            | `fallback` パラメータをそのまま返す            | warn       |
| フェーズの `resourceIds` が undefined           | `fallback` パラメータをそのまま返す            | warn       |
| フェーズの `resourceIds` が空配列 `[]`          | `fallback` パラメータをそのまま返す            | warn       |
| resourceIds の全 ID が resources に見つからない | `fallback` パラメータをそのまま返す            | warn       |
| `hasDynamicResourcePipeline()` が false         | 既存の静的フォールバックパスを使用（変更なし） | なし       |

#### 3.2 ログ出力フォーマット

```typescript
// フォールバック発動時
console.warn(
  `[manifestResourceResolver] manifest phase "${phaseId}" not found or has no resourceIds, falling back to static resource requests`,
);

// 個別リソース未発見時
console.warn(
  `[manifestResourceResolver] manifest resource "${resourceId}" not found in resources[], skipping`,
);
```

#### 3.3 二重構造の維持

```
hasDynamicResourcePipeline() === true の場合:
  ┌─────────────────────────────────────────────┐
  │ resolveOperationResources(phaseId, fallback) │
  │              ↓                               │
  │ manifest を取得                              │
  │              ↓                               │
  │ buildPhaseResourceRequestsFromManifest()     │
  │   ├── manifest 有効 → manifest 由来リスト   │
  │   └── manifest 無効 → 静的定数フォールバック │
  │              ↓                               │
  │ sourceResolver.resolve(...)                  │
  │              ↓                               │
  │ resourcePlanner.plan(...)                    │
  │              ↓                               │
  │ readPlannedResources(resolved, ...)          │
  └─────────────────────────────────────────────┘

hasDynamicResourcePipeline() === false の場合:
  ┌─────────────────────────────────────────────┐
  │ PLAN_RESOURCE_REQUESTS を直接使用（変更なし）│
  │   ↓                                         │
  │ resourceLoader.loadAgent(id) を順次呼び出し  │
  └─────────────────────────────────────────────┘
```

### タスク4: 変更対象ファイルと変更箇所

#### 4.1 新規作成ファイル

| ファイル                                                                            | 目的                                                      |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`                | `buildPhaseResourceRequestsFromManifest()` ユーティリティ |
| `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts` | ユーティリティのユニットテスト                            |

#### 4.2 修正ファイル

| ファイル                       | 変更箇所                                   | 変更内容                                                                                                                                                                                                     |
| ------------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `RuntimeSkillCreatorFacade.ts` | `resolveOperationResources()` のシグネチャ | `phaseId` / `fallback` / `maxBytes` / `operation` を受け取り、manifest 読み込みと request 解決を 1 回に集約                                                                                                  |
| `RuntimeSkillCreatorFacade.ts` | `plan()` / `improve()` の動的パス          | `resolveOperationResources("plan" / "improve", PLAN_RESOURCE_REQUESTS / IMPROVE_RESOURCE_REQUESTS, maxBytes, operation)` を呼び、内部で `buildPhaseResourceRequestsFromManifest()` を 1 回だけ使うように変更 |

#### 4.3 変更しないファイル

| ファイル                    | 理由                                  |
| --------------------------- | ------------------------------------- |
| `planPromptConstants.ts`    | 静的フォールバックとして保持（FR-05） |
| `improvePromptConstants.ts` | 静的フォールバックとして保持（FR-05） |
| `ManifestLoader.ts`         | TASK-P0-04 の責務（スコープ外）       |
| `workflow-manifest.json`    | TASK-P0-03 の責務（スコープ外）       |

### タスク5: データフロー図

#### 5.1 plan() の動的解決フロー

```
RuntimeSkillCreatorFacade.plan()
  │
  ├── hasDynamicResourcePipeline() === true
  │     └── resolveOperationResources("plan", PLAN_RESOURCE_REQUESTS, maxBytes, "plan")
  │           ├── manifest を取得（loadWorkflowManifest()）
  │           ├── buildPhaseResourceRequestsFromManifest(manifest, "plan", PLAN_RESOURCE_REQUESTS)
  │           ├── sourceResolver.resolve(...)
  │           ├── resourcePlanner.plan(...)
  │           └── readPlannedResources(resolved, ...)
  │
  └── hasDynamicResourcePipeline() === false
        │
        └── PLAN_RESOURCE_REQUESTS.filter(r => r.kind === "agent")
              │
              └── resourceLoader.loadAgent(request.id) を順次呼び出し
```

#### 5.2 manifest アクセス経路

```
RuntimeSkillCreatorFacade
  │
  ├── this.sourceResolver: SkillCreatorSourceResolver
  │     └── manifest へのアクセス手段を提供
  │
  ├── this.resourcePlanner: PhaseResourcePlanner
  │     └── リソースの優先順位付けと計画
  │
  └── this.resolvedResourceReader: ResolvedResourceReader
        └── 計画に基づくリソース読み込み
```

**設計上の判断**: `buildPhaseResourceRequestsFromManifest()` に渡す manifest は `loadWorkflowManifest()` で取得した `LoadedWorkflowManifest` を使用する。`this.sourceResolver` は `resolveOperationResources()` 内で候補 root の解決にのみ使用し、manifest の所有者ではない。

## 多角的チェック観点

| 観点               | 適用判断 | チェック内容                                            |
| ------------------ | -------- | ------------------------------------------------------- |
| アーキテクチャ     | 適用     | 新規ファイル追加が既存の責務境界を侵さないこと          |
| エラーハンドリング | 適用     | フォールバック条件が網羅的で、silent failure がないこと |
| パフォーマンス     | 非適用   | manifest 解決は起動時1回のみで性能影響なし              |
| セキュリティ       | 非適用   | manifest はローカルファイルであり、外部入力を受けない   |

## 統合テスト連携

Phase 2 は設計フェーズのため、統合テストの直接実行は不要。ただし以下を確認:

- 既存の `RuntimeSkillCreatorFacade` テストスイートの構造を把握し、Phase 4 のテスト設計に反映する
- `ManifestLoader` のテストフィクスチャ（`__tests__/fixtures/workflow-manifest/`）の構造を把握する

## 成果物

| 成果物 | パス                        | 説明                  |
| ------ | --------------------------- | --------------------- |
| 設計書 | `outputs/phase-2/design.md` | 本 Phase の設計成果物 |

## 完了条件

- [x] ユーティリティ関数 `buildPhaseResourceRequestsFromManifest()` のシグネチャが確定している
- [x] manifest → PhaseResourceRequest 変換ロジックが設計されている
- [x] フォールバック条件が全て明文化されている（5パターン）
- [x] 変更対象ファイルと変更内容の概要が確定している（新規1+テスト1、修正1）
- [x] 変更しないファイルとその理由が明記されている
- [x] データフロー図が作成されている
- [x] 多角的チェック観点が確認されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー

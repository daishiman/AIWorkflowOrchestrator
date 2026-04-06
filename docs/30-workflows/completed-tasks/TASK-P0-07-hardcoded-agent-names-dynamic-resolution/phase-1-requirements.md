# Phase 1: 要件定義 - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 1                                                   |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution |
| 作成日    | 2026-04-06                                          |
| タスクID  | TASK-P0-07                                          |
| カテゴリ  | リファクタリング（Feature Gap系）                   |
| 前提Phase | なし                                                |
| 後続Phase | Phase 2: 設計                                       |

## 目的

`RuntimeSkillCreatorFacade` の `plan()` / `improve()` メソッドにおいて、エージェントリソースの解決を `workflow-manifest.json` から動的に行う仕組みへリファクタリングするための要件を定義する。

## タスク分類

| 項目       | 値                          |
| ---------- | --------------------------- |
| タスク種別 | リファクタリング            |
| UI変更     | なし                        |
| IPC変更    | なし                        |
| 命名規則   | camelCase（既存コード準拠） |

## 実行タスク

- タスク1: 既存コードのハードコード箇所調査
- タスク2: manifest の phases/resources 構造と静的定数の対応分析
- タスク3: 機能要件・非機能要件の抽出
- タスク4: 受け入れ基準（AC）の定義

## 参照資料

| 資料名                    | パス                                                                                      | 説明                                   |
| ------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | plan()/improve() の動的・静的パス実装  |
| planPromptConstants       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                           | PLAN_RESOURCE_REQUESTS 静的定義        |
| improvePromptConstants    | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`                        | IMPROVE_RESOURCE_REQUESTS 静的定義     |
| ManifestLoader            | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                | manifest ロード・バリデーション        |
| workflow-manifest.json    | `.claude/skills/skill-creator/workflow-manifest.json`                                     | manifest 正本（phases/resources 定義） |
| 既存テスト                | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | T-P7-04 テスト                         |
| GitHub Issue              | `https://github.com/daishiman/AIWorkflowOrchestrator/issues/1892`                         | タスク元 Issue                         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Main Process サービス設計          |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリングパターン           |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill Creator SDK インターフェース |

## 実行手順

### ステップ0: P50チェック — 既実装状態の調査

対象ファイルの現在の実装状態を確認する。

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
git log --oneline -10 -- apps/desktop/src/main/services/runtime/planPromptConstants.ts
git log --oneline -10 -- apps/desktop/src/main/services/runtime/improvePromptConstants.ts

# hasDynamicResourcePipeline の実装確認
grep -n "hasDynamicResourcePipeline" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# resolveOperationResources の呼び出し箇所確認
grep -n "resolveOperationResources" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

### ステップ1: ハードコード箇所の特定

以下のファイルを読み込み、ハードコードされたエージェント名・リソース名を全てリストアップする。

#### 1.1 PLAN_RESOURCE_REQUESTS の静的定義（planPromptConstants.ts）

```typescript
// 行 21-58: 3 agent + 1 reference
export const PLAN_RESOURCE_REQUESTS: readonly PhaseResourceRequest[] = [
  {
    id: "discover-problem",
    kind: "agent",
    relativePath: "agents/discover-problem.md",
    tier: "required-core",
    required: true,
  },
  {
    id: "design-workflow",
    kind: "agent",
    relativePath: "agents/design-workflow.md",
    tier: "required-core",
    required: true,
  },
  {
    id: "plan-structure",
    kind: "agent",
    relativePath: "agents/plan-structure.md",
    tier: "required-core",
    required: true,
  },
  {
    id: "overview",
    kind: "reference",
    relativePath: "references/overview.md",
    tier: "optional-quality",
    required: false,
  },
];
```

#### 1.2 IMPROVE_RESOURCE_REQUESTS の静的定義（improvePromptConstants.ts）

```typescript
// 行 18-37: 1 agent + 1 reference
export const IMPROVE_RESOURCE_REQUESTS: readonly PhaseResourceRequest[] = [
  {
    id: "improve-prompt",
    kind: "agent",
    relativePath: "agents/improve-prompt.md",
    tier: "required-core",
    required: true,
  },
  {
    id: "feedback-loop",
    kind: "reference",
    relativePath: "references/feedback-loop.md",
    tier: "optional-quality",
    required: false,
  },
];
```

#### 1.3 manifest の対応するリソース定義

| manifest phase ID | manifest resourceIds                       | 静的定数の対応エージェント                        |
| ----------------- | ------------------------------------------ | ------------------------------------------------- |
| plan              | agent-define-boundary, ref-core-principles | discover-problem, design-workflow, plan-structure |
| improve           | agent-analyze-feedback                     | improve-prompt                                    |

**重要な差分**: manifest のリソース ID（`agent-define-boundary` 等）と静的定数の ID（`discover-problem` 等）は**名前が異なる**。動的解決では manifest の `resources[].path` から `PhaseResourceRequest` を組み立てる必要がある。

### ステップ2: 動的パイプラインの現状把握

```typescript
// RuntimeSkillCreatorFacade.ts 行 690-696
private hasDynamicResourcePipeline(): boolean {
  return Boolean(
    this.sourceResolver &&
    this.resourcePlanner &&
    this.resolvedResourceReader,
  );
}
```

- `hasDynamicResourcePipeline()` が true の場合: `resolveOperationResources()` → `readPlannedResources()` で manifest ベースリソース読み込み
- `hasDynamicResourcePipeline()` が false の場合: `resourceLoader.loadAgent()` で直接読み込み（対応する静的リストを fallback source とする）

**現状の問題**: 動的パス（true の場合）でも `resolveOperationResources()` に `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` を静的リストとして渡しており、manifest の `plan` / `improve` フェーズの `resourceIds` が直接使用されていない。

### ステップ3: 要件抽出

## 機能要件（FR）

| ID    | 要件                                                                                                                                                 | 優先度 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `plan()` の動的パスで、manifest の `plan` フェーズの `resourceIds` からエージェントリストを動的に組み立てる                                          | must   |
| FR-02 | `improve()` の動的パスで、manifest の `improve` フェーズの `resourceIds` からエージェントリストを動的に組み立てる                                    | must   |
| FR-03 | manifest にフェーズが存在しない / `resourceIds` が空の場合、静的リスト（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする | must   |
| FR-04 | フォールバック発動時にログ出力（`debug` または `warn` レベル）を行う                                                                                 | should |
| FR-05 | `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` は削除せず、静的フォールバックとして保持する                                                  | must   |
| FR-06 | manifest の `resources[]` から `id` / `kind` / `path` を取得し、`PhaseResourceRequest` にマッピングするユーティリティを実装する                      | must   |

## 非機能要件（NFR）

| ID     | 要件                                                               | 優先度 |
| ------ | ------------------------------------------------------------------ | ------ |
| NFR-01 | 既存テスト `T-P7-04` が引き続き PASS すること                      | must   |
| NFR-02 | `pnpm --filter @repo/desktop typecheck` がエラーなしで通過すること | must   |
| NFR-03 | `pnpm --filter @repo/desktop lint` がエラーなしで通過すること      | must   |
| NFR-04 | manifest ロード前 / 失敗時に動作が後退しないこと                   | must   |
| NFR-05 | 新たな `const` としてエージェント名が追加されないこと              | should |

## 受け入れ基準（AC）

| AC ID | 基準                                                                                                                                 | 検証方法       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| AC-1  | `plan()` の動的パスで manifest の `plan` フェーズ `resourceIds` からエージェントリストが組み立てられる                               | automated-test |
| AC-2  | `improve()` の動的パスで manifest の `improve` フェーズ `resourceIds` からエージェントリストが組み立てられる                         | automated-test |
| AC-3  | manifest にフェーズが存在しない場合、対応する静的定数（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする  | automated-test |
| AC-4  | manifest の `resourceIds` が空の場合、対応する静的定数（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS`）にフォールバックする | automated-test |
| AC-5  | フォールバック発動時にログ出力がある                                                                                                 | automated-test |
| AC-6  | `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` は削除されず保持されている                                                    | code-review    |
| AC-7  | 既存テスト `T-P7-04` が PASS する                                                                                                    | automated-test |
| AC-8  | typecheck / lint がエラーなし                                                                                                        | automated-test |

## スコープ

### 含むもの

- `RuntimeSkillCreatorFacade.ts` における `plan()` / `improve()` フェーズの manifest 動的解決パスの強化
- manifest の `phases[]` / `resources[]` からフェーズ別エージェントリストを組み立てるユーティリティ実装
- manifest ロード失敗時のフォールバック設計（`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` を維持）
- 動的解決パスのテスト追加

### 含まないもの

- `workflow-manifest.json` 内容の変更（TASK-P0-03 の責務）
- `ManifestLoader` 自体の変更（TASK-P0-04 の責務）
- `SkillCreatorWorkflowEngine.ts` の phase 状態機械の定義変更
- 新規フェーズの追加やフェーズ順序の変更

## 統合テスト連携

| 判定項目                | 基準 | 備考                                          |
| ----------------------- | ---- | --------------------------------------------- |
| ユニットテスト Line     | 80%+ | RuntimeSkillCreatorFacade 関連ファイル対象    |
| ユニットテスト Branch   | 60%+ | 動的パス / フォールバックパスの分岐カバレッジ |
| ユニットテスト Function | 80%+ | 新規ユーティリティ関数含む                    |

## 成果物

| 成果物           | パス                                      | 説明                           |
| ---------------- | ----------------------------------------- | ------------------------------ |
| 要件定義書       | `outputs/phase-1/requirements.md`         | 本 Phase の要件定義成果物      |
| ハードコード調査 | `outputs/phase-1/investigation-report.md` | ハードコード箇所一覧と影響範囲 |

## 完了条件

- [x] 対象ファイルの既実装状態を調査した（P50チェック）
- [x] `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` の参照箇所が全て特定されている
- [x] `hasDynamicResourcePipeline()` が true になる条件が理解されている
- [x] `resolveOperationResources()` への引数として静的リストが使用されているか確認されている
- [x] manifest の `plan` / `improve` フェーズの `resourceIds` が把握されている
- [x] manifest のリソース ID と静的定数の ID の差分が明確になっている
- [x] 機能要件（FR-01〜FR-06）が定義されている
- [x] 非機能要件（NFR-01〜NFR-05）が定義されている
- [x] 受け入れ基準（AC-1〜AC-8）が定義されている
- [x] スコープ（含む / 含まない）が明確に定義されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計

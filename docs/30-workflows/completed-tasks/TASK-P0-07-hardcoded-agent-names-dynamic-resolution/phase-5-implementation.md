# Phase 5: 実装（TDD: Green） - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 5                                                   |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution |
| 作成日    | 2026-04-06                                          |
| 前提Phase | Phase 4: テスト作成（TDD: Red）                     |
| 後続Phase | Phase 6: テスト拡充                                 |

## 目的

Phase 4 で作成したテスト（T-P7-05〜T-P7-10）を全て PASS させるための最小実装を行う。`manifestResourceResolver.ts` に変換ユーティリティを実装し、`RuntimeSkillCreatorFacade.ts` の plan()/improve() 動的パスを `resolveOperationResources()` に集約して manifest 由来解決へ切り替える。

## 実行タスク

- タスク1: `manifestResourceResolver.ts` の新規作成と `buildPhaseResourceRequestsFromManifest()` の実装
- タスク2: `RuntimeSkillCreatorFacade.ts` の plan() 動的パス変更
- タスク3: `RuntimeSkillCreatorFacade.ts` の improve() 動的パス変更
- タスク4: フォールバックログ出力の追加
- タスク5: 全テスト PASS 確認（TDD Green）

## 参照資料

| 資料名                    | パス                                                                  | 説明                                     |
| ------------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| Phase 2 設計              | `phase-2-design.md`                                                   | 変換アルゴリズム・型設計・フォールバック |
| Phase 3 設計レビュー      | `phase-3-design-review.md`                                            | MINOR 指摘事項（warn 出力方針等）        |
| Phase 4 テスト            | `phase-4-test-creation.md`                                            | テストケース一覧・フィクスチャ定義       |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 変更対象メインファイル                   |
| PhaseResourcePlanner      | `apps/desktop/src/main/services/runtime/PhaseResourcePlanner.ts`      | `PhaseResourceRequest` 型定義            |
| planPromptConstants       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | `PLAN_RESOURCE_REQUESTS` 静的定義        |
| improvePromptConstants    | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`    | `IMPROVE_RESOURCE_REQUESTS` 静的定義     |
| LoadedWorkflowManifest 型 | `packages/shared/src/types/skillCreator.ts`                           | manifest 型定義                          |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                        | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Main Process サービス設計          |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリングパターン           |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill Creator SDK インターフェース |

## 実行手順

### ステップ0: P50チェック — Phase 4 テストの FAIL 状態確認

```bash
# Phase 4 のテストが全て FAIL することを確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts

# 既存テストが PASS することを確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts
```

### タスク1: `manifestResourceResolver.ts` の新規作成

#### 1.1 新規ファイル作成

**配置先**: `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`

#### 1.2 実装内容

Phase 2 設計（タスク2: 変換アルゴリズム）に従い、以下のロジックを実装する:

```typescript
import type { LoadedWorkflowManifest } from "@repo/shared/types";
import type { PhaseResourceRequest } from "./PhaseResourcePlanner";

/**
 * manifest の指定 phase から PhaseResourceRequest[] を動的に組み立てる。
 * manifest にフェーズが存在しない / resourceIds が空の場合は fallback を返す。
 *
 * @param manifest   - LoadedWorkflowManifest（ManifestLoader が返す型）
 * @param phaseId    - 対象フェーズ ID（"plan" | "improve"）
 * @param fallback   - フォールバック用の静的リスト
 * @returns PhaseResourceRequest[] - manifest 由来またはフォールバックのリスト
 */
export function buildPhaseResourceRequestsFromManifest(
  manifest: LoadedWorkflowManifest,
  phaseId: string,
  fallback: readonly PhaseResourceRequest[],
): PhaseResourceRequest[] {
  // 実装: Phase 2 設計 タスク2 の変換アルゴリズム（6ステップ）に従う
}
```

#### 1.3 変換アルゴリズム（Phase 2 設計書 2.1 に準拠）

1. `manifest.phases` から `id === phaseId` のフェーズを検索
2. フェーズが見つからない → fallback を返す（+ warn ログ）
3. フェーズの `resourceIds` が `undefined` または空配列 → fallback を返す（+ warn ログ）
4. `resourceIds` の各 ID について:
   - a. `manifest.resources` から `id` が一致するリソースを検索
   - b. リソースが見つかった場合: `PhaseResourceRequest` に変換
   - c. リソースが見つからない場合: warn ログを出力し、スキップ
5. 結果が空配列 → fallback を返す（+ warn ログ）
6. 結果を返す

#### 1.4 kind → tier マッピング（Phase 2 設計書 2.3 に準拠）

| `resource.kind` | `tier`             | `required` |
| --------------- | ------------------ | ---------- |
| `agent`         | `required-core`    | `true`     |
| `reference`     | `optional-quality` | `false`    |
| `schema`        | `optional-quality` | `false`    |
| `asset`         | `optional-quality` | `false`    |

#### 1.5 パス変換

`resource.path` 先頭の `"./"` を除去: `path.replace(/^\.\//, "")`

### タスク2: `RuntimeSkillCreatorFacade.ts` の plan() 動的パス変更

#### 2.1 変更箇所の特定

`plan()` メソッド内の動的パス（`hasDynamicResourcePipeline() === true` 分岐）で、`resolveOperationResources()` に `phaseId` と fallback を渡すように変更する。

変更後の `resolveOperationResources()` は次の責務を持つ:

```typescript
private async resolveOperationResources(
  phaseId: "plan" | "improve",
  fallbackRequests: readonly PhaseResourceRequest[],
  maxBytes: number,
  operation: SkillCreatorOperation,
): Promise<{
  resources: PlannedSkillCreatorResource[];
  sourceProvenance?: SkillCreatorWorkflowSourceProvenance;
}> {
  // manifest を 1 回だけ取得し、buildPhaseResourceRequestsFromManifest() を内部で呼ぶ
}
```

#### 2.2 変更内容

**変更前**（概要）:

```typescript
// plan() 内の動的パス
if (this.hasDynamicResourcePipeline()) {
  const resolved = await this.resolveOperationResources(
    PLAN_RESOURCE_REQUESTS, // ← 静的定数を直接使用
    maxBytes,
    "plan",
  );
  // ...
}
```

**変更後**（概要）:

```typescript
// plan() 内の動的パス
if (this.hasDynamicResourcePipeline()) {
  const resolved = await this.resolveOperationResources(
    "plan",
    PLAN_RESOURCE_REQUESTS,
    maxBytes,
    "plan",
  );
  // ...
}
```

#### 2.3 注意事項

- `PLAN_RESOURCE_REQUESTS` の import は**削除しない**（フォールバックとして使用）
- `resolveOperationResources()` が manifest を 1 回だけ取得し、`buildPhaseResourceRequestsFromManifest()` を内部で呼ぶ
- manifest が `undefined`（ロード失敗）の場合も fallback を返す

### タスク3: `RuntimeSkillCreatorFacade.ts` の improve() 動的パス変更

#### 3.1 変更箇所の特定

`improve()` メソッド内の動的パス（`hasDynamicResourcePipeline() === true` 分岐）で、タスク2 と同様に `resolveOperationResources()` の phaseId/fallback 受け渡しを行う。

#### 3.2 変更内容

**変更前**（概要）:

```typescript
// improve() 内の動的パス
if (this.hasDynamicResourcePipeline()) {
  const resolved = await this.resolveOperationResources(
    IMPROVE_RESOURCE_REQUESTS, // ← 静的定数を直接使用
    maxBytes,
    "improve",
  );
  // ...
}
```

**変更後**（概要）:

```typescript
// improve() 内の動的パス
if (this.hasDynamicResourcePipeline()) {
  const resolved = await this.resolveOperationResources(
    "improve",
    IMPROVE_RESOURCE_REQUESTS,
    maxBytes,
    "improve",
  );
  // ...
}
```

#### 3.3 注意事項

- `IMPROVE_RESOURCE_REQUESTS` の import は**削除しない**（フォールバックとして使用）

### タスク4: フォールバックログ出力の追加

#### 4.1 warn 出力方針の確認

Phase 3 MINOR 指摘 #2 への対応として、`manifestResourceResolver.ts` / `RuntimeSkillCreatorFacade.ts` で既存の `console.warn` パターンに従う。

確認コマンド:

```bash
# Facade 内の既存 warn パターンを確認
grep -n "console\.warn" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | head -20
```

#### 4.2 ログ出力箇所

`manifestResourceResolver.ts` の `buildPhaseResourceRequestsFromManifest()` 内で、フォールバック発動時に warn ログを出力する:

```typescript
// フォールバック発動時（Phase 2 設計書 3.2 に準拠）
console.warn(
  `[manifestResourceResolver] manifest phase "${phaseId}" not found or has no resourceIds, falling back to static resource requests`,
);

// 個別リソース未発見時
console.warn(
  `[manifestResourceResolver] manifest resource "${resourceId}" not found in resources[], skipping`,
);
```

### タスク5: 全テスト PASS 確認（TDD Green）

```bash
# 1. 新規テストの PASS 確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts

# 2. 既存 + 新規 plan テストの PASS 確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts

# 3. 既存 + 新規 improve テストの PASS 確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts

# 4. 全 RuntimeSkillCreatorFacade テストの PASS 確認
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade

# 5. typecheck
pnpm --filter @repo/desktop typecheck

# 6. lint
pnpm --filter @repo/desktop lint
```

## 新規作成ファイルパス一覧（Feedback RT-03 準拠）

| ファイルパス                                                         | 説明                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts` | `buildPhaseResourceRequestsFromManifest()` ユーティリティ関数 |

## 修正ファイルパス一覧（Feedback RT-03 準拠）

| ファイルパス                                                          | 変更内容                                                     |
| --------------------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan() 動的パス: `resolveOperationResources()` 経由へ整理    |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | improve() 動的パス: `resolveOperationResources()` 経由へ整理 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `buildPhaseResourceRequestsFromManifest` の import 追加      |

## 変更しないファイル一覧

| ファイルパス                                                       | 理由                                  |
| ------------------------------------------------------------------ | ------------------------------------- |
| `apps/desktop/src/main/services/runtime/planPromptConstants.ts`    | 静的フォールバックとして保持（FR-05） |
| `apps/desktop/src/main/services/runtime/improvePromptConstants.ts` | 静的フォールバックとして保持（FR-05） |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`         | TASK-P0-04 の責務（スコープ外）       |
| `.claude/skills/skill-creator/workflow-manifest.json`              | TASK-P0-03 の責務（スコープ外）       |

## 統合テスト連携

| 判定項目                        | 基準 | 備考                                                 |
| ------------------------------- | ---- | ---------------------------------------------------- |
| T-P7-05〜T-P7-10 全 PASS        | 必須 | Phase 4 で作成した全テストケースが PASS              |
| T-P7-02, T-P7-04 リグレッション | 必須 | 既存テストが引き続き PASS                            |
| typecheck エラーなし            | 必須 | `pnpm --filter @repo/desktop typecheck`              |
| lint エラーなし                 | 必須 | `pnpm --filter @repo/desktop lint`                   |
| 全 Facade テスト PASS           | 必須 | `RuntimeSkillCreatorFacade*.test.ts` の全テスト PASS |

## 成果物

| 成果物                        | パス                                                                          | 説明                                            |
| ----------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------- |
| manifestResourceResolver 実装 | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`          | `buildPhaseResourceRequestsFromManifest()` 関数 |
| Facade 変更                   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（修正） | plan()/improve() の動的パス切り替え             |

## 完了条件

- [ ] `manifestResourceResolver.ts` が新規作成され、`buildPhaseResourceRequestsFromManifest()` が実装されている
- [ ] manifest → PhaseResourceRequest 変換ロジックが Phase 2 設計の6ステップアルゴリズムに従っている
- [ ] kind → tier マッピング（agent→required-core、reference/schema/asset→optional-quality）が実装されている
- [ ] パス変換（先頭 "./" 除去）が実装されている
- [ ] `RuntimeSkillCreatorFacade.ts` の plan() 動的パスが `resolveOperationResources()` 経由で manifest 由来解決を行っている
- [ ] `RuntimeSkillCreatorFacade.ts` の improve() 動的パスが `resolveOperationResources()` 経由で manifest 由来解決を行っている
- [ ] manifest 未取得時のフォールバック（静的定数使用）が実装されている
- [ ] フォールバック発動時の warn ログ出力が実装されている
- [ ] `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` が削除されず保持されている
- [ ] T-P7-05〜T-P7-10 が全て PASS する
- [ ] T-P7-02, T-P7-04 が引き続き PASS する
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充

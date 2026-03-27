# TASK-SDK-03: context-budget-and-resource-selection

## 概要

`skill-creator` 全読み込みを避けつつ、**単一固定ディレクトリを正本とみなさず**、phase ごとに必要 resource だけを動的に解決・選択・注入する task 仕様書である。

Task03 の主題は token 削減だけではない。repo 同梱版、home 配置、環境変数指定、manifest が指す外部配置、派生 directory を含む複数候補 root から、**どの source を読んだかを説明できる状態**を作ることにある。

## メタ情報

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-03                                                                  |
| タスク種別 | 設計                                                                         |
| 優先度     | 高                                                                           |
| ステータス | completed                                                                    |
| 上流ゲート | `root-workflow-pack/phase-1-requirements.md` から `phase-3-design-review.md` |
| 依存タスク | TASK-SDK-01, TASK-SDK-02                                                     |
| 後続タスク | TASK-SDK-04, TASK-SDK-05, TASK-SDK-06, TASK-SDK-07, TASK-SDK-08              |
| 作成日     | 2026-03-26                                                                   |
| 更新日     | 2026-03-26                                                                   |

## 受入基準

| ID   | 基準                                                                                                                                                                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | resource 読み込みが単一固定 path に依存せず、manifest resource descriptor と複数 candidate root から解決できる                                                                                |
| AC-2 | `plan` / `execute` / `improve` / `verify` 相当の phase ごとに必要 resource だけを選択できる                                                                                                   |
| AC-3 | Task01 foundation snapshot（`sourcePath` / `manifestDir` / `manifestMtimeMs` / `resourceDescriptorHash` / `cacheKey`）と Task03 extension snapshot を分離して後続 task と resume 判定へ渡せる |
| AC-4 | budget 超過、resource 欠落、構成差分を lane-neutral degrade signal として定義し、lane choice 自体は Task07 へ渡す                                                                             |
| AC-5 | Task04 / 05 / 06 / 08 が source provenance と構成差分を追加解釈なしで受け取れる                                                                                                               |

## スコープ

**含む**:

- source discovery の優先順位と conflict rule
- manifest resource descriptor と candidate root を使った resource resolution
- phase / operation ごとの selective loading
- context budget、resource class priority、degrade trigger
- source provenance snapshot の handoff

**含まない**:

- UI 入力 component の設計
- verify / improve contract の詳細
- integrated / handoff への最終 route decision
- approval / disclosure / trust boundary の最終適用
- session invalidation semantics の最終確定

## 依存関係

| 種別        | 参照先                                                                       | 役割                                                      |
| ----------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| predecessor | `../../step-01-seq-task-01-manifest-contract-foundation/index.md`            | manifest resource descriptor、loader boundary             |
| predecessor | `../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`      | workflow state owner、source provenance snapshot の受け皿 |
| parallel    | `../step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`       | provenance / warning の UI surface                        |
| downstream  | `../step-04-par-task-05-create-entry-mainline-unification/index.md`          | mainline 入口での source root 表示と warning              |
| downstream  | `../step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md`       | verify 対象 source snapshot の表示                        |
| downstream  | `../step-05-seq-task-07-execution-governance-and-handoff-alignment/index.md` | degrade signal に対する disclosure / lane 適用            |
| downstream  | `../step-06-seq-task-08-session-persistence-and-resume-contract/index.md`    | source snapshot compatibility / invalidation              |

## 現行コードアンカー

| ファイル                                                              | 現状の役割                                                                    | Task03 での扱い                                                                                                                                    |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/ResourceLoader.ts`              | category/name ベースで単一 root から読む leaf reader                          | source discovery authority に昇格させず、resolver が選んだ path を読む leaf / legacy adapter として扱う                                            |
| `apps/desktop/src/main/services/skill/constants.ts`                   | `DEFAULT_SKILL_CREATOR_PATH` を 1 つ解決する                                  | 候補列の 1 要素として扱い、唯一の正本にしない                                                                                                      |
| `apps/desktop/src/main/ipc/index.ts`                                  | `new ResourceLoader(DEFAULT_SKILL_CREATOR_PATH)` を注入する                   | source resolver を経由した初期化へ置換対象                                                                                                         |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `plan()` が固定 3 agent を単一 loader から読む                                | phase / operation / source provenance を受け取る前提へ移す                                                                                         |
| `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | plan 用固定 agent 名と token 設定を持つ                                       | phase resource class / budget tier の入力源として見直す                                                                                            |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`            | manifest read / validate / normalize / cache、`LoadedWorkflowManifest` を返す | `sourcePath` / `manifestDir` / `manifestMtimeMs` / `resourceDescriptorHash` / `cacheKey` を foundation snapshot として消費する                     |
| `packages/shared/src/types/skillCreator.ts`                           | manifest / runtime 関連 shared type                                           | `WorkflowManifestPhase.resourceIds` と `LoadedWorkflowManifest` を planner input の kernel とし、`RuntimeSkillCreatorExecuteResponse` は不変とする |

## Current Canonical Facts From Branch

- Task01 foundation で固定済みの current facts は `WORKFLOW_MANIFEST_SCHEMA_VERSION = 1`、`WorkflowManifest*`、`NormalizedWorkflowManifestResourceDescriptor`、`LoadedWorkflowManifest` である。
- `LoadedWorkflowManifest` は `sourcePath`、`manifestDir`、`manifestMtimeMs`、`resourceDescriptorHash`、`cacheKey` を already-current な正本事実として持つ。
- `WorkflowManifestPhase.resourceIds` が phase ごとの required resource set の一次根拠であり、Task03 の planner はその上に budget tier を重ねる。
- `RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorExecuteResponse` / `RuntimeSkillCreatorImproveResponse` は Task03 の設計対象外であり、public IPC shape は変えない。

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | token 削減ではなく、変動する `skill-creator` 配置と file layout を安全に読める resource resolution を固定すること                                      |
| 依存関係・責務境界   | Task01 の `ManifestLoader` が返す foundation snapshot をそのまま使い、Task03 は source discovery / selection / budget / degrade extension だけを閉じる |
| 価値とコストの不均衡 | 複数 root 解決と selective loading は初回価値が高い一方、governance / UI / session semantics を同時に閉じると過剰投資になる                            |
| 改善優先順位         | 1) foundation snapshot の再利用 2) source discovery 3) phase resource planning 4) budget / degrade 5) downstream handoff                               |
| 4条件評価            | 価値性・実現性・整合性・運用性を満たすため、path 固定を排しつつ lane choice と persistence semantics は後続へ残す                                      |

## ディレクトリ構成

```text
step-03-par-task-03-context-budget-and-resource-selection/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/source-resolution-matrix.md
    ├── phase-2/budget-degrade-matrix.md
    ├── phase-3/design-review-gate.md
    ├── phase-3/skill-compliance-and-elegance-review.md
    ├── phase-4/test-matrix.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    ├── phase-11/manual-test-report.md
    ├── phase-11/discovered-issues.md
    ├── phase-11/screenshot-plan.json
    ├── phase-11/screenshots/placeholder.png
    ├── phase-12/
        ├── implementation-guide.md
        ├── system-spec-update-summary.md
        ├── documentation-changelog.md
        ├── unassigned-task-detection.md
        ├── skill-feedback-report.md
        └── phase12-task-spec-compliance-check.md
    └── phase-13/
        ├── local-check-result.md
        └── change-summary.md
```

## 実装者向けクイックガイド

### 着手条件

- Task01 / 02 の契約を読了している
- selective loading を初回から必須要件として扱うことに合意している
- `skill-creator` は単一固定 directory にあるとは限らない前提に合意している

### 想定変更ポイント

- `apps/desktop/src/main/services/skill/ResourceLoader.ts`
- `apps/desktop/src/main/services/skill/constants.ts`
- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/planPromptConstants.ts`
- 新規 `SkillCreatorSourceResolver` / `PhaseResourcePlanner` / `ResolvedResourceReader` 相当の定義

### 非対象

- UI 入力 component の設計
- verify / improve contract
- integrated / handoff への最終 route decision
- disclosure / approval の最終 rule

### 完了イメージ

- phase ごとに何を読むかの選択基準が説明できる
- `skill-creator` が別 directory / file layout にあっても読む順序と conflict rule を説明できる
- budget 超過時の degrade 条件がある
- budget / resource 起因の degrade trigger を lane-neutral signal として説明できる
- source provenance snapshot を Task04 / 05 / 06 / 08 へ渡せる

### 並列実行メモ

- Task04 と並列可能
- shared type を増やしすぎないこと
- degrade trigger は定義するが、lane choice / disclosure / handoff guidance への適用は Task07 が担う
- persistence / invalidation の最終意味論は Task08 が担う

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)

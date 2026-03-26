# Phase 2: 設計

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 2                                     |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

source discovery、resource 優先順位、budget tier、縮退ルールを設計し、`skill-creator` の可変 directory / file layout を安全に吸収できる構造へ落とす。

## 実行タスク

- `SkillCreatorSourceResolver` 相当の責務を設計する
- `PhaseResourcePlanner` 相当の選択ロジックを設計する
- `ContextBudgetManager` 相当の budget tier を設計する
- provenance handoff と downstream boundary を設計する

## 参照資料

| 資料名         | パス                                                                    | 説明                            |
| -------------- | ----------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件   | `phase-1-requirements.md`                                               | source discovery / degrade 要件 |
| Phase 1 抽出表 | `outputs/phase-1/spec-extraction-map.md`                                | spec source / code anchor 対応  |
| Task02 index   | `../step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md` | source snapshot の受け皿        |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                        | 内容                                    |
| ----------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| Skill reference         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `ResourceLoader` の current contract    |
| Runtime public IPC 契約 | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | runtime surface の current facts        |
| Runtime / handoff 設計  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | graceful degradation と public response |

### 現行コードアンカー

| ファイル                                                              | 設計観点                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/ResourceLoader.ts`              | source authority ではなく leaf reader / legacy adapter として維持する境界 |
| `apps/desktop/src/main/services/skill/constants.ts`                   | candidate root 列の供給源                                                 |
| `apps/desktop/src/main/services/runtime/ManifestLoader.ts`            | `LoadedWorkflowManifest` の foundation snapshot を供給する                |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | operation ごとの resource 要求を表現する入口                              |
| `apps/desktop/src/main/ipc/index.ts`                                  | source resolver を注入する配線点                                          |
| `packages/shared/src/types/skillCreator.ts`                           | `WorkflowManifestPhase.resourceIds` と public IPC response の境界         |

## 実行手順

### ステップ1: source resolver を設計する

- `ManifestLoader` が返す `LoadedWorkflowManifest` を foundation snapshot とし、`sourcePath` / `manifestDir` / `manifestMtimeMs` / `resourceDescriptorHash` / `cacheKey` をそのまま使う。
- `ManifestLoader` の validate / normalize 結果を Task03 が再定義しない。
- manifest で足りない場合は explicit path、env/config、home、repo bundle の順で candidate root を探索する。
- optional resource 欠落は manifest load failure にせず、Task03 側で `degrade` へ変換する。
- root ごとに structure signature を作り、required resource が揃う最小 root set を採択する。
- 探索ロジックは Task03、route/disclosure 判断は Task07 と分離する。

### ステップ2: phase resource planner を設計する

- planner の一次根拠は `WorkflowManifestPhase.resourceIds` とし、`operation` / `tier` / `required-optional` は二次選別に使う。
- resource を `agent` / `reference` / `schema` / `asset` に分ける。
- priority tier を `required-core` / `required-context` / `optional-quality` / `optional-deep-dive` に分ける。
- phase / operation 別に最大予算と優先順位を定義し、超過時は lower tier から落とす。
- absolute path 読み込みは `ResolvedResourceReader` のような薄い reader へ寄せ、`ResourceLoader` は category/name が合う legacy path に限定して使う。

### ステップ3: provenance と handoff を設計する

- provenance は foundation snapshot と Task03 extension snapshot の 2 層に分ける。
- foundation snapshot は `LoadedWorkflowManifest` そのもの、Task03 extension は `resolverMode`、`candidateRoots`、`selectedResourceIds`、`droppedResourceIds`、`structureSignature`、`degradeReasons` を持つ。
- Task04 は warning 表示、Task05 は mainline 表示、Task06 は verify 対象表示、Task08 は resume compatibility 判定に使う。
- lane choice に直接つながる signal へ変換するのは Task07 とする。
- `RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorExecuteResponse` / `RuntimeSkillCreatorImproveResponse` の public IPC shape は Task03 で変更しない。

## 統合テスト連携

- Phase 4 で source discovery matrix と budget/degrade matrix をテスト観点へ変換する。
- `ResourceLoader` の回帰では single-root / multi-root / manifest absolute path / missing optional / conflict を固定する。
- `RuntimeSkillCreatorFacade.plan()` の回帰では固定 3 agent 読み込みから resource planner 経由化した後も contract を崩さないことを確認する。

## 成果物

| 成果物                   | パス                                          | 説明                                       |
| ------------------------ | --------------------------------------------- | ------------------------------------------ |
| 設計書                   | `phase-2-design.md`                           | source discovery / budget / degrade の設計 |
| source resolution matrix | `outputs/phase-2/source-resolution-matrix.md` | 候補 root と採択条件の一覧                 |
| budget degrade matrix    | `outputs/phase-2/budget-degrade-matrix.md`    | budget tier と縮退条件の一覧               |

## 完了条件

- [ ] resource 選択基準が定義されている
- [ ] source discovery と fixed path fallback の境界が定義されている
- [ ] provenance snapshot と downstream boundary が定義されている
- [ ] budget overflow / missing resource / conflict の縮退ルールが定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

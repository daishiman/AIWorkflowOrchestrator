# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 1                                     |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

`RuntimeSkillCreatorFacade` と `SkillCreatorWorkflowEngine` の責務境界を定義し、state owner の曖昧さを Task02 の入口で解消する。

## 実行タスク

- 真の論点を 1 文で固定する
- `currentPhase` / `awaitingUserInput` / `verifyResult` / phase artifacts / `resumeToken` envelope の owner を棚卸しする
- `integrated_api` / `terminal_handoff` の lane response baseline を固定する
- dynamic source root / provenance snapshot をどこが持つか定義する
- Task03 / Task04 / Task08 へ委譲する非対象を分離する

## 要件レビュー一次結論

| 項目                       | 結論                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点                   | Task02 の主問題は feature 追加ではなく、workflow state owner を facade から剥がして engine に固定すること                                            |
| 依存関係・責務境界の問題点 | Task01 で固定した manifest contract / `ManifestLoader` boundary と、Task02 で新設する engine owner が文書上まだ接続されていない                      |
| 価値とコストの不均衡       | owner 分離は downstream 4 task の手戻りを下げる高価値項目だが、verify surface 詳細・UI 統合・resume semantics 完成までを同時に閉じると過剰投資になる |
| 改善優先順位               | 1. owner inventory 2. lane baseline 3. downstream handoff 4. non-scope sealing                                                                       |
| 4条件評価                  | 価値性: 高 / 実現性: 高 / 整合性: Task01 foundation を前提に確保可能 / 運用性: verify・resume・spec sync を後続 task へ明示委譲すれば維持可能        |

## 参照資料

| 資料名       | パス                                                                           | 説明                                      |
| ------------ | ------------------------------------------------------------------------------ | ----------------------------------------- |
| 要件草案     | `../requirements-draft.md`                                                     | lane 全体の背景、state owner 論点、非対象 |
| 親 workflow  | `../root-workflow-pack/index.md`                                               | predecessor / downstream matrix           |
| Task01 index | `../completed-tasks/step-01-seq-task-01-manifest-contract-foundation/index.md` | manifest 契約の基礎                       |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                                            | 内容                                                    |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Runtime public IPC 契約    | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | `skill-creator:plan/execute-plan/improve-skill` の正本  |
| RuntimePolicyResolver 契約 | `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | `integrated_api` / `terminal_handoff` の 3 パターン分岐 |
| IPC / preload lesson       | `.agents/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | public surface と graceful degradation の教訓           |

### 現行コードアンカー

| ファイル                                                              | 観察点                                                      |
| --------------------------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `plan()` / `execute()` / `improve()` の責務混在箇所         |
| `apps/desktop/src/main/services/skill/constants.ts`                   | current candidate path 解決が compile-time へ寄っていないか |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | public invoke handler の input / output contract            |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | renderer が見ている public surface                          |
| `packages/shared/src/types/skillCreator.ts`                           | runtime public union 型の現行定義                           |

## 実行手順

### ステップ1: 真の論点を固定する

- Task02 の主問題を「workflow state owner を public facade から切り離すこと」と定義する。
- route 分岐、phase 遷移、成果物管理、resume envelope を同じ owner に閉じ込めない。

### ステップ2: owner inventory を作る

- owner 候補を `facade` / `engine` / `renderer` / `downstream task` に分ける。
- `terminal_handoff` guidance の生成主体と、workflow state の保存主体を別に書く。
- `resumeToken` は envelope owner までを扱い、互換性意味論は Task08 へ渡す。
- Task01 で fixed になった `WorkflowManifest*` / `ManifestLoader` は engine へ入力を渡す foundation contract であり、runtime authority 自体は持たせない。
- source root の最終選択と provenance snapshot は engine input として保持し、単一固定 path を owner の代わりにしない。

### ステップ3: spec extraction map を出力する

- system spec source、current code anchor、固定 owner、後続 task へ渡す gap を 1 表へまとめる。
- `execute()` の current drift もここで明示する。

## 補助分析

### 因果ループ

- 強化ループ: owner が facade に滞留するほど route / state / UI 責務が再混在し、後続 task の前提がぶれる。
- バランスループ: owner を engine に固定すると facade の役割が public surface に限定され、Task03 / Task04 / Task08 の論点が縮退する。

### KJ 法クラスタ

- state owner cluster: `currentPhase`, `awaitingUserInput`, `verifyResult`, phase artifacts, `resumeTokenEnvelope`
- public surface cluster: `creatorHandlers.ts`, `skill-creator-api.ts`, shared union response
- deferred cluster: verify surface detail, governance hardening, resume compatibility semantics

### 戦略仮説

- Task02 は engine の本実装より先に owner boundary を文書で固定した方が、Task03 以降の設計コスト総量を下げる。

## 統合テスト連携

- Phase 4 で `RuntimeSkillCreatorFacade` と `SkillCreatorWorkflowEngine` の owner 分離を unit test 化する。
- Phase 4 で `creatorHandlers.ts` と `skill-creator-api.ts` の public contract test を作る。
- Phase 9 で `validate-phase-output` と `verify-all-specs` により owner 記述漏れを機械検証する。

## 成果物

| 成果物              | パス                                     | 説明                                |
| ------------------- | ---------------------------------------- | ----------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                | Task02 の要件固定                   |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | spec source と code anchor の対応表 |

## 完了条件

- [ ] `currentPhase` / `awaitingUserInput` / `verifyResult` / phase artifacts / `resumeToken` envelope の owner が定義されている
- [ ] `integrated_api` / `terminal_handoff` の baseline owner が定義されている
- [ ] source root / provenance snapshot の owner が定義されている
- [ ] Task03 / Task04 / Task08 へ委譲する項目が切り出されている
- [ ] `execute()` の current drift が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

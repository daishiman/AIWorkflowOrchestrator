# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001                       |
| Phase      | 11                                                                      |
| Phase名    | 手動テスト                                                              |
| カテゴリ   | 改善                                                                    |
| 優先度     | 中                                                                      |
| ステータス | completed                                                               |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| 後続Phase  | Phase 12                                                                |

## 目的

preflight bundle を current build capture の直前で実行し、success path と代表 failure path の挙動を人が確認する。

## 実行タスク

- タスク1: success path の手動テストを行う
- タスク2: failure path の手動テストを行う
- タスク3: 発見事項を記録する

### タスク1: success path 手動テスト

**目的**: current build capture へ進める状態を確認する

**実行順**:

1. `pnpm --filter @repo/desktop build`
2. `node apps/desktop/scripts/phase11-current-build-preflight.mjs --json`
3. `pnpm --filter @repo/desktop screenshot:light-theme-contrast-guard`

**確認項目**:

| 項目             | 合格条件                                          |
| ---------------- | ------------------------------------------------- |
| preflight result | 4 bucket が pass                                  |
| metadata         | shared core 由来の preflight summary が保存される |
| screenshot       | 既存 5 capture へ進める                           |

### タスク2: failure path 手動テスト

**目的**: guidance と停止条件を確認する

**代表ケース**:

| ケース              | 確認内容                                            |
| ------------------- | --------------------------------------------------- |
| build missing       | `out/renderer` 未生成時に build guidance を表示する |
| harness missing     | harness HTML 欠落時に input 設定確認を表示する      |
| baseUrl unreachable | localhost fallback の結果を表示する                 |

### タスク3: 発見事項記録

**目的**: Phase 12 で backlog と lessons を更新できる状態を作る

**記録対象**:

| 成果物                                   | 内容              |
| ---------------------------------------- | ----------------- |
| `outputs/phase-11/manual-test-plan.md`   | 実行手順と観測点  |
| `outputs/phase-11/manual-test-result.md` | 実行結果          |
| `outputs/phase-11/discovered-issues.md`  | 新規 backlog 候補 |

## テストケース

| テストケース | 種別   | 目的                                                   | 証跡                                                                |
| ------------ | ------ | ------------------------------------------------------ | ------------------------------------------------------------------- |
| TC-11-01     | visual | Settings light の hierarchy / contrast を確認する      | `outputs/phase-11/screenshots/TC-11-01-settings-light.png`          |
| TC-11-02     | visual | Dashboard light の representative shell を確認する     | `outputs/phase-11/screenshots/TC-11-02-dashboard-light.png`         |
| TC-11-03     | visual | Auth light の helper text / CTA readability を確認する | `outputs/phase-11/screenshots/TC-11-03-auth-light.png`              |
| TC-11-04     | visual | WorkspaceSearch light の baseline note を確認する      | `outputs/phase-11/screenshots/TC-11-04-workspace-search-light.png`  |
| TC-11-05     | visual | Dashboard dark baseline との比較軸を残す               | `outputs/phase-11/screenshots/TC-11-05-dashboard-dark-baseline.png` |

代表 failure path は非視覚ケースとして `outputs/phase-11/failure-*.json` に記録し、screen coverage の期待 TC には含めない。

## 画面カバレッジマトリクス

| テストケース | 画面            | 状態                       | 証跡                                                                |
| ------------ | --------------- | -------------------------- | ------------------------------------------------------------------- |
| TC-11-01     | Settings        | light / current build      | `outputs/phase-11/screenshots/TC-11-01-settings-light.png`          |
| TC-11-02     | Dashboard       | light / current build      | `outputs/phase-11/screenshots/TC-11-02-dashboard-light.png`         |
| TC-11-03     | Auth            | light / current build      | `outputs/phase-11/screenshots/TC-11-03-auth-light.png`              |
| TC-11-04     | WorkspaceSearch | light / current build      | `outputs/phase-11/screenshots/TC-11-04-workspace-search-light.png`  |
| TC-11-05     | Dashboard       | dark baseline / comparison | `outputs/phase-11/screenshots/TC-11-05-dashboard-dark-baseline.png` |

## 参照資料

| 参照資料                   | パス                                                                                            | 説明                             |
| -------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義           | `phase-1-requirements.md`                                                                       | AC と検証コマンド                |
| Phase 2 設計               | `phase-2-design.md`                                                                             | contract と integration          |
| Phase 5 実装               | `phase-5-implementation.md`                                                                     | 実装対象                         |
| Phase 6 テスト拡充         | `phase-6-test-expansion.md`                                                                     | CLI と metadata coverage         |
| Phase 7 カバレッジ確認     | `phase-7-coverage-check.md`                                                                     | command log                      |
| Phase 8 リファクタリング   | `phase-8-refactoring.md`                                                                        | helper 境界                      |
| Phase 9 品質保証           | `phase-9-quality-assurance.md`                                                                  | 品質ゲート結果                   |
| Phase 10 最終レビュー      | `phase-10-final-review.md`                                                                      | gate 判定                        |
| 親 workflow 手動テスト計画 | `../completed-tasks/light-theme-contrast-regression-guard/outputs/phase-11/manual-test-plan.md` | current build capture の既存動線 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                                  | 内容                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 親 workflow 正本   | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` | screenshot workflow の正本                  |
| feature catalog    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                       | representative screen の意味づけ            |
| design system      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                            | contrast guard と remediation の境界        |
| remediation 分離   | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-global-remediation.md`        | remediation task との責務分離               |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | build 先行、current と baseline 分離        |
| Phase 11/12 ガイド | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                           | evidence と screenshot 記録の定型           |
| desktop build      | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`                             | current build artifact と Electron の観点   |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           | shared core / wrapper / consumer の責務確認 |
| エラー処理         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 | guidance の手動確認観点                     |
| E2E品質            | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`                            | capture 品質と metadata 連携                |

## 実行手順

### ステップ1: success path を shared contract で確認する

build、thin CLI wrapper、capture を順に実行し、4 bucket と metadata が同じ bundle 名でつながることを確認する。

### ステップ2: representative failure path を確認する

build missing、harness missing、baseUrl unreachable の guidance と停止条件を確認する。

### ステップ3: 発見事項を Phase 12 へ渡せる形で記録する

manual test result、discovered issues、new backlog 候補を current/baseline の文脈で残す。

## 統合テスト連携

- Phase 11 の success path は Phase 7 の command log と Phase 9 の quality report を前提に実施する。
- representative failure path は Phase 4 と Phase 6 で定義した case を再利用する。
- 新規発見事項は Phase 12 の unassigned-task-detection と lessons-learned へそのまま連携する。

## 多角的チェック観点

| 観点               | この Phase での確認内容                                                      | 主要仕様                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| アーキテクチャ     | thin CLI wrapper、shared core、capture が同じ contract を使うかを見る        | `architecture-implementation-patterns.md`                                                                                                    |
| エラーハンドリング | representative failure path の guidance が manual 実行でも理解できるかを見る | `error-handling.md`                                                                                                                          |
| 品質               | command log と quality report の結果が手動確認と一致するかを見る             | `quality-requirements.md`, `quality-e2e-testing.md`                                                                                          |
| 文書同期           | Phase 12 が拾うべき発見事項が current/baseline 文脈で記録されるかを見る      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物         | パス                                     | 内容                      |
| -------------- | ---------------------------------------- | ------------------------- |
| 手動テスト計画 | `outputs/phase-11/manual-test-plan.md`   | 実行順と観測点            |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | success と failure の結果 |
| 発見事項       | `outputs/phase-11/discovered-issues.md`  | backlog 候補              |

## 完了条件

- [ ] success path の手順と結果が記録されている
- [ ] failure path の代表ケースが記録されている
- [ ] metadata と screenshot 進行結果が記録されている
- [ ] shared contract の bundle 名と guidance が手動確認で一致している
- [ ] new backlog 候補の有無が記録されている
- [ ] Phase 12 が参照できる manual test 成果物がそろっている

## 次Phase

Phase 12: ドキュメントへ進む。

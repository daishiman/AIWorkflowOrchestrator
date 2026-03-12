# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-UI-04-WORKSPACE-VIEW |
| Phase      | 4                         |
| Phase名    | テスト作成                |
| ステータス | completed                 |
| 前提Phase  | Phase 1, Phase 2, Phase 3 |
| 後続Phase  | Phase 5                   |

## 目的

親参照仕様が pointer / dependency / canonical path を保持していることを文書 contract test と validator command で検証できる形にする。

## 実行タスク

- タスク1: contract test case matrix を作成する
- タスク2: validator command set を作成する
- タスク3: red 条件を定義する

### タスク1: contract test case matrix

| テストID   | 検証対象               | コマンド                                                                                                                                                | 期待結果                              |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------ |
| T060-CT-01 | Phase 1-13 完備        | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view`       | PASS                                  |
| T060-CT-02 | 全体整合性             | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view` | PASS                                  |
| T060-CT-03 | child canonical path   | `rg -n "task-058b-ui-04a-workspace-layout-filebrowser                                                                                                   | task-059a-ui-04b-workspace-chat-panel | task-059b-ui-04c-workspace-preview-quicksearch" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/index.md docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/child-workflow-linkage-matrix.md` | 3 child path が検出される |
| T060-CT-04 | block / parallel 契約  | `rg -n "04A.\*block                                                                                                                                     | 04A.\*04B / 04C                       | 04B / 04C.\*並列" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-1-requirements.md docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-2-design.md`                               | 依存順序が検出される      |
| T060-CT-05 | Phase 11 evidence 継承 | `rg -n "evidence 継承                                                                                                                                   | 新規 UI 撮影を行わず                  | N/A" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-11-manual-test.md`                                                                                                                              | 継承方針が検出される      |
| T060-CT-06 | Phase 12 spec_created  | `rg -n "spec_created                                                                                                                                    | task-workflow                         | ui-ux-feature-components                                                                                                                                                                                                   | ui-ux-navigation          | lessons-learned" docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/phase-12-documentation.md` | 同期先が検出される |

### タスク2: validator command set

- `validate-phase-output.js` を構造検証の正本にする。
- `verify-all-specs.js` を整合性検証の正本にする。
- `rg` を child path、block 契約、Phase 11 / 12 ルール確認に使う。

### タスク3: red 条件定義

| 条件                           | 失敗の扱い     |
| ------------------------------ | -------------- |
| Phase ファイル欠落             | Phase 3 へ戻る |
| child canonical path 欠落      | Phase 2 へ戻る |
| Phase 11 evidence 継承方針欠落 | Phase 2 へ戻る |
| Phase 12 sync 先欠落           | Phase 2 へ戻る |

## 参照資料

| 参照資料                           | パス                                                                                                  | 説明            |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------- |
| Phase 1 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-1/`                    | requirements    |
| Phase 2 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-2/`                    | design          |
| Phase 3 成果物                     | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-3/`                    | review result   |
| requirements traceability          | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/requirements-traceability-matrix.md` | AC 対応表       |
| child linkage matrix               | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/child-workflow-linkage-matrix.md`    | child path 台帳 |
| requirements-definition            | `outputs/phase-1/requirements-definition.md`                                                          | Phase 1 成果物  |
| scope-boundary                     | `outputs/phase-1/scope-boundary.md`                                                                   | Phase 1 成果物  |
| acceptance-criteria                | `outputs/phase-1/acceptance-criteria.md`                                                              | Phase 1 成果物  |
| system-spec-entrypoints            | `outputs/phase-1/system-spec-entrypoints.md`                                                          | Phase 1 成果物  |
| parent-child-responsibility-matrix | `outputs/phase-2/parent-child-responsibility-matrix.md`                                               | Phase 2 成果物  |
| execution-lane-design              | `outputs/phase-2/execution-lane-design.md`                                                            | Phase 2 成果物  |
| sync-matrix                        | `outputs/phase-2/sync-matrix.md`                                                                      | Phase 2 成果物  |
| validator-strategy                 | `outputs/phase-2/validator-strategy.md`                                                               | Phase 2 成果物  |
| design-review-result               | `outputs/phase-3/design-review-result.md`                                                             | Phase 3 成果物  |
| review-findings                    | `outputs/phase-3/review-findings.md`                                                                  | Phase 3 成果物  |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                            | 内容                       |
| ------------------ | ------------------------------------------------------------------------------- | -------------------------- |
| task workflow      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | child 完了状態の参照先     |
| feature components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | child feature 名称の参照先 |

## 実行手順

### ステップ1: contract test 対象を固定する

Phase 1-3 の設計出力から、path / dependency / evidence / sync の検証対象を抽出する。

### ステップ2: validator と grep のコマンド群を固める

構造検証、全体整合性検証、path drift 検出のコマンドを Red 条件と結び付ける。

### ステップ3: Phase 5 / Phase 9 で再利用できる test set にする

Phase 5 の更新直後と Phase 9 の再監査でそのまま使える command set と判定条件を残す。

## 統合テスト連携

| 観点                       | 連携内容                                                     |
| -------------------------- | ------------------------------------------------------------ |
| contract to implementation | Phase 5 の文書更新前に path / dependency / sync 先を固定する |
| contract to QA             | Phase 9 で同じ command set を再実行する                      |
| contract to documentation  | Phase 12 の `spec_created` 同期先を test case に含める       |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                          |
| ------------------ | -------- | ----------------------------------------------------------------- |
| 設計整合           | 適用     | Phase 1-3 の gate で確定した契約だけを test case に入れていること |
| path drift         | 適用     | completed path を正本にした grep が用意されていること             |
| evidence           | 適用     | Phase 11 の継承 / N/A 判定まで検証対象になっていること            |
| documentation sync | 適用     | Phase 12 同期先の漏れ検知が test set に含まれていること           |

## 成果物

| 成果物                 | パス                                                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| test-case-matrix       | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-4/test-case-matrix.md`       |
| red-test-report        | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-4/red-test-report.md`        |
| validator-command-list | `docs/30-workflows/completed-tasks/task-060-ui-04-workspace-view/outputs/phase-4/validator-command-list.md` |

## 完了条件

- [ ] contract test case matrix が作成されている
- [ ] validator command set が作成されている
- [ ] red 条件が定義されている
- [ ] Phase 5 で実施する文書更新先が command と結び付いている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- contract test case の定義
- validator command list の確定
- Red 条件と戻り先の定義
- Phase 5 への引き継ぎ準備

## タスク100%実行確認【必須】

- [ ] T060-CT-01 から T060-CT-06 が本文に残っている
- [ ] `validate-phase-output.js` と `verify-all-specs.js` の両方が採用されている
- [ ] grep による child path / evidence / sync 検証が含まれている
- [ ] Fail 時の戻り先が Phase 2 または Phase 3 として定義されている

## 次Phase

Phase 5: 実装

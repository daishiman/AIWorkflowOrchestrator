# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | テスト拡充                      |
| タスクID   | TASK-SKILL-LIFECYCLE-04         |
| 前提Phase  | Phase 5（実装）                 |
| 後続Phase  | Phase 7（テストカバレッジ確認） |
| ステータス | completed                       |
| 作成日     | 2026-03-12                      |
| 機能名     | skill-lifecycle-evaluation-gate |

## 目的

境界値、再評価、history sync、failure path を追加検証し、warning と recommendation が回帰で壊れないようにする。

## 実行タスク

- 境界値拡充: 0 / 59 / 60 / 79 / 80 / 100 の score ケースを追加する
- Failure path 拡充: permission block、critical risk、実行失敗、再評価失敗を追加する
- History sync 拡充: `post_create` `post_execute` `post_improve` の順序保存と差分更新を追加する
- UI回帰拡充: warning badge、recommended badge、delta 表示、Task05 banner を追加する
- Cross-task 拡充: Task03 から Task05 へ遷移した後の再評価で state が再利用されることを追加する

## 参照資料

| 参照資料                      | パス                                                                                                                      | 説明         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Phase 5 実装                  | `phase-5-implementation.md`                                                                                               | 実装済み対象 |
| Phase 4 unit test plan        | `outputs/phase-4/unit-test-plan.md`                                                                                       | 基本ケース   |
| Phase 4 integration test plan | `outputs/phase-4/integration-test-plan.md`                                                                                | 接続ケース   |
| Phase 5 touch points          | `outputs/phase-5/component-touch-points.md`                                                                               | 変更対象     |
| Task03 設計                   | `../../skill-lifecycle-unification/tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | 入口側契約   |
| Task05 設計                   | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`               | 出口側契約   |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                     |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------ |
| quality-requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | coverage と test pyramid |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | lifecycle UI の回帰観点  |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | lifecycle 回帰の再発防止 |

## 実行手順

### ステップ1: 境界値ケースを追加する

score と delta の境界値を pure function と UI の両方へ追加する。

### ステップ2: failure path を追加する

hard block と再評価失敗時の state / UI 表示を検証する。

### ステップ3: history sync を追加する

各 stage の評価履歴が順序通り保持され、前回比較が正しく動くことを検証する。

### ステップ4: cross-task ケースを追加する

Task03 で作成した評価結果が Task05 usage surface に引き継がれ、再評価後に更新されることを検証する。

## 統合テスト連携

| 観点          | 追加する内容                             |
| ------------- | ---------------------------------------- |
| API接続       | 実行失敗と再評価失敗の伝播               |
| state         | history 更新順、latest gate 更新         |
| UI            | warning / recommended / revise の 3 系統 |
| manual bridge | Phase 11 TC-11-01〜TC-11-06 との対応     |

## 成果物

| 成果物          | パス                                  | 内容                     |
| --------------- | ------------------------------------- | ------------------------ |
| edge case 一覧  | `outputs/phase-6/edge-case-matrix.md` | 境界値と block ケース    |
| regression plan | `outputs/phase-6/regression-plan.md`  | 既存 UI / state 回帰観点 |

## 完了条件

- [x] 境界値 6 ケース以上が追加されている
- [x] hard block 系 failure ケースが追加されている
- [x] history sync ケースが追加されている
- [x] Task03 / Task05 跨ぎの regression ケースが追加されている
- [x] manual test との対応表が更新されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 7: テストカバレッジ確認](./phase-7-coverage-check.md) に進む

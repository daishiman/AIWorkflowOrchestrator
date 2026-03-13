# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| Phase      | 4                                                                   |
| Phase名    | テスト作成                                                          |
| タスクID   | TASK-SKILL-LIFECYCLE-04                                             |
| 前提Phase  | Phase 1（要件定義）, Phase 2（設計）, Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）                                                     |
| ステータス | completed                                                           |
| 作成日     | 2026-03-12                                                          |
| 機能名     | skill-lifecycle-evaluation-gate                                     |

## 目的

gate engine、hard block、state selector、UI badge、Task03 / Task05 handoff を Red で固定し、後続実装の判定基準を決める。

## 実行タスク

- Unit テスト計画: 合成スコア、閾値、hard block、差分計算の pure function テストを定義する
- Store テスト計画: `skillEvaluationSlice` の snapshot 保存、gate 更新、履歴比較を検証する
- UI テスト計画: `SkillLifecyclePanel` `SkillAnalysisView` `ScoreDisplay` の表示状態を検証する
- Integration テスト計画: Task03 event -> Task04 decision -> Task05 banner の接続を検証する
- Failure テスト計画: permission block、critical risk、実行失敗、再評価失敗の扱いを検証する

### テスト観点

| 区分        | 観点       | 代表ケース                                                         |
| ----------- | ---------- | ------------------------------------------------------------------ |
| unit        | 閾値       | 59 / 60 / 79 / 80 / 90 の境界値                                    |
| unit        | hard block | security 69、critical risk あり、permissionSafety 69               |
| store       | 履歴       | `post_create` -> `post_execute` -> `post_improve` の順序保存       |
| UI          | 可視化     | warning badge、recommended badge、理由文、delta 表示               |
| integration | handoff    | Task03 create / execute / improve 結果が Task04 state に連結される |
| integration | reuse      | Task05 usage surface が最新 gate decision を再利用する             |

## 参照資料

| 参照資料         | パス                                                                                                                      | 説明                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件     | `phase-1-requirements.md`                                                                                                 | checkpoint と gate 要件         |
| Phase 2 設計     | `phase-2-design.md`                                                                                                       | 型と判定設計                    |
| Phase 3 レビュー | `phase-3-design-review.md`                                                                                                | PASS 条件                       |
| gate engine 設計 | `outputs/phase-2/gate-decision-design.md`                                                                                 | unit test の正本                |
| state 設計       | `outputs/phase-2/state-management-design.md`                                                                              | store test の正本               |
| handoff 契約     | `outputs/phase-2/task03-task05-handoff-contract.md`                                                                       | integration test の正本         |
| Task03 設計      | `../../skill-lifecycle-unification/tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | create / execute / improve 接続 |
| Task05 index     | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/index.md`                        | use journey 接続                |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                                         |
| ------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------- |
| quality-requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | unit / integration / manual test の基準      |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | `SkillAnalysisView` と lifecycle integration |
| security-skill-execution | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | permission block 観点                        |

## 実行手順

### ステップ1: pure function テストを定義する

score 合成、hard block、delta 計算を pure function としてテストケース化する。

### ステップ2: store / selector テストを定義する

snapshot 保存、最新 gate decision 更新、history 比較、re-evaluate の state 遷移をケース化する。

### ステップ3: UI テストを定義する

warning、use ready、recommended、revise required の表示差分を component test で固定する。

### ステップ4: integration テストを定義する

Task03 の create / execute / improve イベントを入力し、Task05 usage banner まで連結するテストを定義する。

## 統合テスト連携

| 観点          | Phase 4 で定義する内容                           |
| ------------- | ------------------------------------------------ |
| API接続       | event source と evaluation input の接続順        |
| state         | slice 更新順と selector の参照先                 |
| UI            | gate badge / warning / recommendation の表示条件 |
| manual bridge | Phase 11 の TC と自動テスト ID の対応            |

## 成果物

| 成果物                | パス                                       | 内容                             |
| --------------------- | ------------------------------------------ | -------------------------------- |
| テストシナリオ一覧    | `outputs/phase-4/test-scenario-matrix.md`  | 全ケース一覧                     |
| unit test plan        | `outputs/phase-4/unit-test-plan.md`        | pure function / store / selector |
| integration test plan | `outputs/phase-4/integration-test-plan.md` | Task03 / Task05 接続             |

## 完了条件

- [x] 境界値ケース 59 / 60 / 79 / 80 / 90 が定義されている
- [x] hard block ケースが 3 種以上定義されている
- [x] store / selector テストケースが定義されている
- [x] Task03 / Task05 をまたぐ integration ケースが定義されている
- [x] Phase 11 manual test ID と対応付けられている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 5: 実装](./phase-5-implementation.md) に進む

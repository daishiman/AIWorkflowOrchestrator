# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| Phase      | 8                                                                                                             |
| Phase名    | リファクタリング                                                                                              |
| タスクID   | TASK-SKILL-LIFECYCLE-04                                                                                       |
| 前提Phase  | Phase 1（要件定義）, Phase 2（設計）, Phase 5（実装）, Phase 6（テスト拡充）, Phase 7（テストカバレッジ確認） |
| 後続Phase  | Phase 9（品質保証）                                                                                           |
| ステータス | completed                                                                                                     |
| 作成日     | 2026-03-12                                                                                                    |
| 機能名     | skill-lifecycle-evaluation-gate                                                                               |

## 目的

重複した閾値、gate 文言、history 変換、badge 表現を集約し、Task03 / Task05 の UI と store が同じ契約を使う状態へ整理する。

## 実行タスク

- 閾値定数集約: 60 / 80 と hard block 判定を共通定数へ集約する
- gate 表現集約: summary、badge、next action 文言を共通 map に集約する
- history 変換集約: snapshot 保存と delta 計算の重複を共通 util へ集約する
- selector 整理: Task03 / Task05 が共通 selector を使うよう整理する
- 追跡資料更新: refactor 後の責務表と gap 解消結果を更新する

## 参照資料

| 参照資料                | パス                                                                                                                      | 説明                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 要件            | `phase-1-requirements.md`                                                                                                 | checkpoint と gate の元要件         |
| Phase 7 coverage 分析   | `phase-7-coverage-check.md`                                                                                               | refactor 優先度                     |
| Phase 6 テスト拡充      | `phase-6-test-expansion.md`                                                                                               | 境界値と regression の確定結果      |
| coverage gap            | `outputs/phase-7/coverage-gap-analysis.md`                                                                                | 解消対象                            |
| Phase 6 regression plan | `outputs/phase-6/regression-plan.md`                                                                                      | refactor 後も保持する挙動           |
| Phase 5 touch points    | `outputs/phase-5/component-touch-points.md`                                                                               | 重複箇所                            |
| Task03 設計             | `../../skill-lifecycle-unification/tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | create / execute / improve 統合前提 |
| Task05 設計             | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`               | usage surface 統合前提              |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------- |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | selector / slice 責務       |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 共通 UI 表現                |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 重複排除と utility 化の指針 |

## 実行手順

### ステップ1: 重複判定を一覧化する

閾値、summary、badge、history util の重複箇所を抽出する。

### ステップ2: 共通定数と util へ寄せる

同じ条件式と表示文言を 1 箇所へ集約する。

### ステップ3: selector と UI 参照を整理する

Task03 / Task05 が同じ selector と badge map を使うよう整理する。

### ステップ4: refactor 影響を記録する

duplication ledger と refactor plan を更新し、Phase 9 の QA 前提を整える。

## 統合テスト連携

| 観点  | 保持する内容                                       |
| ----- | -------------------------------------------------- |
| unit  | refactor 後も境界値判定が変わらない                |
| UI    | Task03 / Task05 の badge 表現が揃う                |
| state | history と latest decision の更新順が変わらない    |
| docs  | refactor で system spec 更新対象が変わるか確認する |

## 成果物

| 成果物             | パス                                    | 内容           |
| ------------------ | --------------------------------------- | -------------- |
| refactor plan      | `outputs/phase-8/refactor-plan.md`      | リファクタ順序 |
| duplication ledger | `outputs/phase-8/duplication-ledger.md` | 集約対象一覧   |

## 完了条件

- [x] 閾値と hard block 判定が共通定数化されている
- [x] gate summary と badge 表現が共通化されている
- [x] history 変換の重複が除去されている
- [x] Task03 / Task05 が共通 selector を参照している
- [x] refactor 影響が成果物へ反映されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 9: 品質保証](./phase-9-quality-assurance.md) に進む

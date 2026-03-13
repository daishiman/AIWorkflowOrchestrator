# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 11                                                                                                                                                                                              |
| Phase名    | 手動テスト検証                                                                                                                                                                                  |
| タスクID   | TASK-SKILL-LIFECYCLE-04                                                                                                                                                                         |
| 前提Phase  | Phase 1（要件定義）, Phase 2（設計）, Phase 5（実装）, Phase 6（テスト拡充）, Phase 7（テストカバレッジ確認）, Phase 8（リファクタリング）, Phase 9（品質保証）, Phase 10（最終レビューゲート） |
| 後続Phase  | Phase 12（ドキュメント更新）                                                                                                                                                                    |
| ステータス | completed                                                                                                                                                                                       |
| 作成日     | 2026-03-12                                                                                                                                                                                      |
| 機能名     | skill-lifecycle-evaluation-gate                                                                                                                                                                 |

## 目的

低スコア、warning、recommended、re-evaluate の主要ケースを実画面で確認し、Task03 から Task05 までの品質ループが成立することを証跡で残す。

## 実行タスク

- TC 設計: Task03 create / execute / improve と Task05 use / re-evaluate の代表 6 ケースを定義する
- 環境準備: 手動検証に使う fixture skill、prompt、期待スコア帯を準備する
- 画面証跡取得: 各 TC の screenshot を取得する
- 結果記録: expected / actual / 判定 / issue を `manual-test-result.md` に記録する
- 残課題整理: Phase 12 へ渡す unassigned task 候補を列挙する

## テストケース

| テストケース | 目的                                          | 期待結果                                   |
| ------------ | --------------------------------------------- | ------------------------------------------ |
| TC-11-01     | 低品質 prompt で `revise_required` になる     | error badge と improve CTA が表示される    |
| TC-11-02     | 作成直後のスキルが `save_with_warning` になる | warning badge と保存導線が表示される       |
| TC-11-03     | 実行後に `use_ready` になる                   | Task05 への handoff 導線が表示される       |
| TC-11-04     | critical risk で hard block になる            | 利用導線が無効化される                     |
| TC-11-05     | 改善後に `recommended` になる                 | delta と recommendation badge が表示される |
| TC-11-06     | Task05 から再評価して最新状態が反映される     | usage surface の評価表示が更新される       |

## 画面カバレッジマトリクス

| テストケース | スクリーンショット                                                    | 着眼点                                     |
| ------------ | --------------------------------------------------------------------- | ------------------------------------------ |
| TC-11-01     | `outputs/phase-11/screenshots/TC-11-01-revise-required.png`           | `改善必須` badge と improve CTA の同時表示 |
| TC-11-02     | `outputs/phase-11/screenshots/TC-11-02-save-with-warning.png`         | warning badge と保存導線の共存             |
| TC-11-03     | `outputs/phase-11/screenshots/TC-11-03-use-ready.png`                 | `利用可` badge と Task05 handoff 表示      |
| TC-11-04     | `outputs/phase-11/screenshots/TC-11-04-hard-block.png`                | hard block 文言による利用停止              |
| TC-11-05     | `outputs/phase-11/screenshots/TC-11-05-recommended-after-improve.png` | `推奨` badge と delta 表示                 |
| TC-11-06     | `outputs/phase-11/screenshots/TC-11-06-task05-re-evaluate.png`        | Task05 再評価後の最新 gate 反映            |

## 参照資料

| 参照資料                | パス                                                                                                                      | 説明                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 10 最終レビュー   | `phase-10-final-review.md`                                                                                                | 手動検証の入口判定              |
| Phase 5 実装            | `phase-5-implementation.md`                                                                                               | 実装済み対象                    |
| Phase 4 test matrix     | `outputs/phase-4/test-scenario-matrix.md`                                                                                 | TC の元                         |
| Phase 6 regression plan | `outputs/phase-6/regression-plan.md`                                                                                      | 回帰観点                        |
| Phase 7 coverage gap    | `outputs/phase-7/coverage-gap-analysis.md`                                                                                | 手動検証で見るべき gap          |
| Phase 8 refactor plan   | `outputs/phase-8/refactor-plan.md`                                                                                        | refactor 後確認点               |
| Phase 9 QA report       | `outputs/phase-9/quality-gate-report.md`                                                                                  | QA 済み項目                     |
| Task03 設計             | `../../skill-lifecycle-unification/tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | create / execute / improve 入口 |
| Task05 設計             | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`               | use / re-evaluate 入口          |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                   |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------- |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | surface 遷移の正当性   |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 画面証跡の観点         |
| quality-requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | manual test の品質基準 |

## 実行手順

### ステップ1: fixture と期待値を準備する

各 TC で使う skill、prompt、期待 gate を固定する。

### ステップ2: Task03 側ケースを実行する

create / execute / improve の 5 ケースを順に確認し、badge と summary を撮影する。

### ステップ3: Task05 側ケースを実行する

usage surface の再評価ケースを実行し、最新状態が反映されることを確認する。

### ステップ4: 結果と issue を記録する

`manual-test-result.md` に `テストケース / 結果 / 証跡` を記録し、必要な未タスクを整理する。

## 統合テスト連携

| 観点             | 手動確認内容                               |
| ---------------- | ------------------------------------------ |
| Task03 -> Task04 | create / execute / improve 後の gate 表示  |
| Task04 -> Task05 | use ready / warning の handoff             |
| re-evaluate      | Task05 からの再評価で state 更新           |
| docs bridge      | Phase 12 に渡す screenshot と issue の整理 |

## 成果物

| 成果物             | パス                                                                  | 内容                                    |
| ------------------ | --------------------------------------------------------------------- | --------------------------------------- |
| manual test result | `outputs/phase-11/manual-test-result.md`                              | `テストケース / 結果 / 証跡 / 観察結果` |
| screenshot plan    | `outputs/phase-11/screenshot-plan.md`                                 | TC と画像名の対応                       |
| screenshot         | `outputs/phase-11/screenshots/TC-11-01-revise-required.png`           | 低品質 prompt ケース                    |
| screenshot         | `outputs/phase-11/screenshots/TC-11-02-save-with-warning.png`         | 作成直後 warning ケース                 |
| screenshot         | `outputs/phase-11/screenshots/TC-11-03-use-ready.png`                 | 実行後 use ready ケース                 |
| screenshot         | `outputs/phase-11/screenshots/TC-11-04-hard-block.png`                | critical risk ケース                    |
| screenshot         | `outputs/phase-11/screenshots/TC-11-05-recommended-after-improve.png` | 改善後 recommendation ケース            |
| screenshot         | `outputs/phase-11/screenshots/TC-11-06-task05-re-evaluate.png`        | Task05 再評価ケース                     |

## 完了条件

- [x] TC-11-01〜TC-11-06 が実施されている
- [x] 6 件の screenshot が取得されている
- [x] expected / actual / 判定が記録されている
- [x] Task03 -> Task05 の handoff が実画面で確認されている
- [x] Phase 12 へ渡す issue と証跡が整理されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 12: ドキュメント更新](./phase-12-documentation.md) に進む

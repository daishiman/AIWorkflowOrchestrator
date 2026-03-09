# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 11                                   |
| 機能名 | task-10a-f-store-driven-lifecycle-ui |
| 作成日 | 2026-03-09                           |

## 目的

analysis/create 導線の UI を実画面で確認し、Phase 11 の screenshot 証跡と workflow outputs を一致させる。

## 実行タスク

- analysis 表示確認: light / dark / mobile の描画を確認する
- error / loading / interaction 確認: error / toggle / apply / auto improve の状態遷移を確認する
- create wizard 導線確認: describe / configure / complete の step 遷移を確認する
- screenshot 保存: current workflow 配下へ TC 対応の png を保存する
- discovered issues 記録: blocker / minor の判定を discovered-issues.md へ残す

## 参照資料

| 資料名             | パス                                                                        | 説明                       |
| ------------------ | --------------------------------------------------------------------------- | -------------------------- |
| Phase 2            | `phase-2-design.md`                                                         | UI / state 境界            |
| Phase 5            | `phase-5-implementation.md`                                                 | 実装確認結果               |
| Phase 6            | `phase-6-test-expansion.md`                                                 | error / 再分析観点         |
| Phase 7            | `phase-7-coverage-check.md`                                                 | カバレッジ観点             |
| Phase 8            | `phase-8-refactoring.md`                                                    | 責務分離観点               |
| Phase 9            | `phase-9-quality-assurance.md`                                              | 品質ゲート                 |
| Phase 10           | `phase-10-final-review.md`                                                  | 最終レビュー結果           |
| Phase 11/12 ガイド | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | screenshot / evidence 手順 |

## 実行手順

### ステップ1: 関連テストを再実行する

- `SkillAnalysisView` / `SkillCreateWizard` の targeted tests が PASS することを確認する

### ステップ2: screenshot を取得する

- `capture-skill-analysis-view-screenshots.mjs`
- `capture-skill-create-wizard-screenshots.mjs`
- auto-fixable 状態は既存の補助 capture を流用して証跡を補完する

### ステップ3: evidence を current workflow 名へ正規化する

- `TC-11-*` 命名へ統一する
- `manual-test-result.md` の `テストケース` / `証跡` 表と一致させる

## テストケース

| テストケース | 機能                      | 期待結果                                     |
| ------------ | ------------------------- | -------------------------------------------- |
| TC-11-01     | analysis 初期表示         | light / dark / mobile で分析結果が描画される |
| TC-11-02     | analysis error            | `skillError` が alert 表示される             |
| TC-11-03     | suggestion toggle         | 選択状態が切り替わる                         |
| TC-11-04     | auto-fixable 一括選択     | autoFixable のみ選択される                   |
| TC-11-05     | apply selected            | 再分析結果へ更新される                       |
| TC-11-06     | auto improve              | confirm 後に再分析される                     |
| TC-11-07     | wizard describe/configure | step 遷移できる                              |
| TC-11-08     | wizard generate/complete  | 完了 step を確認できる                       |

## 画面カバレッジマトリクス

| テストケース | 画面状態            | 証跡                                                            |
| ------------ | ------------------- | --------------------------------------------------------------- |
| TC-11-01     | analysis light      | `outputs/phase-11/screenshots/TC-11-01-analysis-light.png`      |
| TC-11-01     | analysis dark       | `outputs/phase-11/screenshots/TC-11-01-analysis-dark.png`       |
| TC-11-01     | analysis mobile     | `outputs/phase-11/screenshots/TC-11-01-analysis-mobile.png`     |
| TC-11-02     | analysis error      | `outputs/phase-11/screenshots/TC-11-02-analysis-error.png`      |
| TC-11-03     | suggestion toggle   | `outputs/phase-11/screenshots/TC-11-03-suggestion-toggle.png`   |
| TC-11-04     | auto-fixable        | `outputs/phase-11/screenshots/TC-11-04-auto-fixable.png`        |
| TC-11-05     | apply result        | `outputs/phase-11/screenshots/TC-11-05-apply-result.png`        |
| TC-11-06     | auto improve result | `outputs/phase-11/screenshots/TC-11-06-auto-improve-result.png` |
| TC-11-07     | wizard describe     | `outputs/phase-11/screenshots/TC-11-07-wizard-describe.png`     |
| TC-11-07     | wizard configure    | `outputs/phase-11/screenshots/TC-11-07-wizard-configure.png`    |
| TC-11-08     | wizard complete     | `outputs/phase-11/screenshots/TC-11-08-wizard-complete.png`     |

## 統合テスト連携

- `manual-test-result.md` は `テストケース` / `証跡` 形式で記録する
- `validate-phase11-screenshot-coverage.js` を通す

## 成果物

| 成果物         | パス                                     | 説明                 |
| -------------- | ---------------------------------------- | -------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | TC 別結果            |
| 発見課題       | `outputs/phase-11/discovered-issues.md`  | blocker / minor 記録 |
| screenshot     | `outputs/phase-11/screenshots/`          | 11件の証跡           |

## 完了条件

- [ ] TC-11-01〜08 が定義されている
- [ ] screenshot 11件が current workflow 配下に存在する
- [ ] `validate-phase11-screenshot-coverage.js` が PASS する
- [ ] 本 Phase 内の全タスクを100%実行完了

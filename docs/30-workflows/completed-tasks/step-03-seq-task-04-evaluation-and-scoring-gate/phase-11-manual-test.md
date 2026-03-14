# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 11                      |
| Phase名    | 手動テスト              |
| タスクID   | TASK-SKILL-LIFECYCLE-04 |
| ステータス | completed               |
| 前提Phase  | Phase 10                |
| 後続Phase  | Phase 12                |

## 目的

作成→採点→改善→再採点→利用の導線を実画面で検証し、UI証跡を固定する。

## 実行タスク

- タスク1: 代表シナリオ（初回分析）を検証する。
- タスク2: 改善適用後のΔ表示（ScoreDeltaBadge）を検証する。
- タスク3: light/mobile を含む表示崩れを検証する。
- タスク4: 証跡と発見事項を記録する。

## 参照資料

| 参照資料         | パス                                                                                                                                                                                                                                                                                                 | 目的                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 手動テストガイド | `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md`                                                                                                                                                                                                                  | 証跡取得手順確認                      |
| 画面検証手順     | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`                                                                                                                                                                                                          | 検証観点確認                          |
| UI仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-reference.md`                                                                                                                                                                                                            | 期待UI挙動確認                        |
| 依存Phase成果物  | phase-1-requirements.md（Phase 1）, phase-2-design.md（Phase 2）, phase-5-implementation.md（Phase 5）, phase-6-test-expansion.md（Phase 6）, phase-7-coverage-check.md（Phase 7）, phase-8-refactoring.md（Phase 8）, phase-9-quality-assurance.md（Phase 9）, phase-10-final-review.md（Phase 10） | Phase 1/2/5/6/7/8/9/10 の成果物を参照 |

## テストケース

| TC-ID    | シナリオ                     | 期待結果                                        |
| -------- | ---------------------------- | ----------------------------------------------- |
| TC-11-01 | 初回分析表示（desktop/dark） | スコア表示・提案一覧が表示され、Δバッジは未表示 |
| TC-11-02 | 改善適用後（desktop/dark）   | `score-delta-badge` が表示される                |
| TC-11-03 | 改善適用後（desktop/light）  | light theme でも Δバッジと配色が崩れない        |
| TC-11-04 | 改善適用後（mobile/dark）    | mobile viewport で操作・表示が成立する          |

## 画面カバレッジマトリクス

| TC-ID    | 画面                         | 証跡                                                                             |
| -------- | ---------------------------- | -------------------------------------------------------------------------------- |
| TC-11-01 | 初回分析（desktop/dark）     | `outputs/phase-11/screenshots/TC-11-01-skill-analysis-baseline-dark-desktop.png` |
| TC-11-02 | 改善後Δ表示（desktop/dark）  | `outputs/phase-11/screenshots/TC-11-02-skill-analysis-delta-dark-desktop.png`    |
| TC-11-03 | 改善後Δ表示（desktop/light） | `outputs/phase-11/screenshots/TC-11-03-skill-analysis-delta-light-desktop.png`   |
| TC-11-04 | 改善後Δ表示（mobile/dark）   | `outputs/phase-11/screenshots/TC-11-04-skill-analysis-delta-dark-mobile.png`     |

## 実行手順

1. `node apps/desktop/scripts/capture-task-skill-lifecycle-04-phase11.mjs` で証跡を取得する。
2. 4ケースの画像と `capture-results.json` を確認する。
3. `manual-test-result.md` と `discovered-issues.md` に結果を記録する。

## 統合テスト連携

- `validate-phase11-screenshot-coverage.js --workflow <workflow>` で TC-ID と証跡の対応を機械検証する。
- 手動テストで見つかった不一致は Phase 12 の未タスク検出へ引き渡す。

## 多角的チェック観点（AIが判断）

- 改善前後の変化がUIで読めるか。
- dark/light/mobile の3条件で情報欠落がないか。
- 低スコア導線と高スコア導線の認知負荷が適正か。

## サブタスク管理

| SubAgent   | 責務         | 実行方式 | 出力                          |
| ---------- | ------------ | -------- | ----------------------------- |
| SubAgent-A | シナリオ実行 | 並列     | manual-test-result.md         |
| SubAgent-B | 証跡収集     | 並列     | outputs/phase-11/screenshots/ |
| SubAgent-C | 課題分類     | 並列     | discovered-issues.md          |

## 成果物

| 成果物         | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| 手動テスト仕様 | `./phase-11-manual-test.md`              | 手動検証手順     |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 判定と証跡対応   |
| 発見事項       | `outputs/phase-11/discovered-issues.md`  | 課題一覧         |
| 画面証跡       | `outputs/phase-11/screenshots/`          | 代表シナリオ証跡 |

## 完了条件

- [x] テストケースの結果が記録されている
- [x] 画面証跡が保存されている
- [x] 発見事項が分類されている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

## 次Phase

Phase 12（ドキュメント更新）で仕様同期と完了記録を実施する。

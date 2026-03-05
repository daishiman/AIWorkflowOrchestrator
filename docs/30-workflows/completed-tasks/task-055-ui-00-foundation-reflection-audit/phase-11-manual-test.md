# Phase 11: 手動テスト検証

## メタ情報

| 項目      | 値                                         |
| --------- | ------------------------------------------ |
| Phase     | 11                                         |
| Phase名   | 手動テスト検証                             |
| 機能名    | task-055-ui-00-foundation-reflection-audit |
| タスクID  | TASK-UI-00-FOUNDATION-REFLECTION-AUDIT     |
| 作成日    | 2026-03-05                                 |
| 前提Phase | Phase 10                                   |
| 後続Phase | Phase 12                                   |

## 目的

監査仕様書の再現性を手動検証で確認し、第三者が同じ判定結果へ到達できることを証明する。

## 実行タスク

- 手動検証: 監査手順書に従って同一判定へ到達できるか検証する。
- 証跡計画: `screenshot-plan.json` を作成し、テストケースごとの必要証跡を定義する。
- 証跡取得: 画面、リンク、判定ログの証跡を取得する。
- 網羅性検証: `validate-phase11-screenshot-coverage.js` で TC と証跡の紐付けを検証する。
- 課題記録: 再現不能箇所や解釈差を課題として記録する。

## 参照資料

| 参照資料                  | パス                                                                                        | 内容               |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| Phase 2 監査設計          | `outputs/phase-2/audit-matrix-design.md`                                                    | 手動検証手順の基準 |
| Phase 5 監査結果          | `outputs/phase-5/reflection-matrix.md`                                                      | 手動検証対象       |
| Phase 6 拡張監査          | `outputs/phase-6/expanded-audit-report.md`                                                  | 拡張対象の確認     |
| Phase 7 カバレッジ        | `outputs/phase-7/coverage-report.md`                                                        | 検証優先度の確認   |
| Phase 8 回帰検証          | `outputs/phase-8/regression-validation.md`                                                  | 判定一致の確認     |
| Phase 9 QA結果            | `outputs/phase-9/qa-report.md`                                                              | 品質前提の確認     |
| Phase 10 最終レビュー報告 | `outputs/phase-10/final-review-report.md`                                                   | 検証対象           |
| Phase 10 ゲート判定       | `outputs/phase-10/review-gate-decision.md`                                                  | 検証条件           |
| Phase 11/12 ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | 手動検証の必須手順 |
| 証跡手順                  | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md` | 証跡取得基準       |

## システム仕様（aiworkflow-requirements）

| 参照資料                    | パス                                                                         | このPhaseでの適用観点    |
| --------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| UIコンポーネント仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | 画面証跡の照合           |
| アクセシビリティテスト仕様  | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md` | 手動a11y観点の照合       |
| タスクワークフロー          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 手動検証記録形式         |
| タスクワークフローPhase定義 | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`  | Phase 11成果物粒度の確認 |
| 教訓集                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 記録漏れ防止             |

## 統合テスト連携

| 連携観点         | 実施内容                                                   | 出力先                                   |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------- |
| 手動テスト再現性 | 監査手順書どおりに第三者が同一判定へ到達できるか検証する。 | `outputs/phase-11/manual-test-result.md` |
| 証跡カバレッジ   | テストケースごとに画面証跡を紐付け、欠落を検証する。       | `outputs/phase-11/screenshots-index.md`  |
| 検出課題連携     | 再現不能箇所と解釈差を課題化し Phase 12 へ引き継ぐ。       | `outputs/phase-11/discovered-issues.md`  |

## 実行順序（直列/並列）

| 作業             | 実行方式 | 理由                     |
| ---------------- | -------- | ------------------------ |
| 検証条件確認     | 直列     | 判定条件を固定するため   |
| ケース別手動検証 | 並列     | ケースが独立しているため |
| 検証結果統合     | 直列     | 最終判定を一本化するため |

## SubAgent Team分担

| SubAgent                 | 関心ごと       | 担当成果物                               |
| ------------------------ | -------------- | ---------------------------------------- |
| SubAgent-MANUAL-CASE     | 手動ケース検証 | `outputs/phase-11/manual-test-result.md` |
| SubAgent-MANUAL-EVIDENCE | 証跡管理       | `outputs/phase-11/screenshots-index.md`  |
| SubAgent-MANUAL-ISSUE    | 課題管理       | `outputs/phase-11/discovered-issues.md`  |

## テストケース

| TC-ID      | 検証対象             | デバイス | テーマ | 期待結果                          |
| ---------- | -------------------- | -------- | ------ | --------------------------------- |
| TC-055-301 | Organisms default    | Desktop  | Dark   | Card/Grid階層が崩れない           |
| TC-055-302 | Organisms empty      | Desktop  | Light  | EmptyState文言・境界が判読できる  |
| TC-055-303 | Organisms loading    | Desktop  | Dark   | Skeleton配置が崩れない            |
| TC-055-304 | MasterDetail overlay | Mobile   | Dark   | Overlay遷移と戻る導線が視認できる |
| TC-055-305 | Search grid          | Mobile   | Dark   | Card密度と余白が破綻しない        |
| TC-055-306 | Search/filter        | Desktop  | Dark   | 条件変更と結果反映の因果が追える  |

## 画面カバレッジマトリクス

| TC-ID      | 画面/状態            | 証跡                                                        | 優先度 | 備考           |
| ---------- | -------------------- | ----------------------------------------------------------- | ------ | -------------- |
| TC-055-301 | Organisms default    | `screenshots/TC-055-301-organisms-default-desktop-dark.png` | A      | 基本表示       |
| TC-055-302 | Organisms empty      | `screenshots/TC-055-302-organisms-empty-desktop-light.png`  | A      | light境界確認  |
| TC-055-303 | Organisms loading    | `screenshots/TC-055-303-organisms-loading-desktop-dark.png` | A      | skeleton確認   |
| TC-055-304 | MasterDetail overlay | `screenshots/TC-055-304-master-detail-mobile-dark.png`      | B      | mobile導線確認 |
| TC-055-305 | Search grid          | `screenshots/TC-055-305-search-grid-mobile-dark.png`        | B      | mobile密度確認 |
| TC-055-306 | Search/filter        | `screenshots/TC-055-306-search-filter-desktop-dark.png`     | B      | 検索反映確認   |

## 成果物

| 成果物       | パス                                     | 内容             |
| ------------ | ---------------------------------------- | ---------------- |
| 手動検証結果 | `outputs/phase-11/manual-test-result.md` | ケース結果       |
| 証跡一覧     | `outputs/phase-11/screenshots-index.md`  | 証跡と対応ケース |
| 発見課題     | `outputs/phase-11/discovered-issues.md`  | 課題と再現手順   |

## 完了条件

- [x] 手動検証ケースが全件実施されている。
- [x] 証跡一覧がケースIDと紐付いている。
- [x] `validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit` が PASS している。
- [x] 発見課題に再現手順が記録されている。
- [x] Phase 12 へ反映すべき差分が抽出されている。
- [x] 本Phase内の全タスクを100%実行完了。

## サブタスク管理

1. 検証条件と TC 一覧を全SubAgentへ共有する。
2. `screenshot-plan.json` を作成してケースごとに証跡を取得する。
3. `validate-phase11-screenshot-coverage.js` で網羅性を確認する。
4. 課題を統合して優先度を設定する。

## タスク100%実行確認【必須】

- [x] 実行タスクの全項目を完了した。
- [x] 完了条件の全チェック項目を確認した。
- [x] Phase 12 反映差分を確定した。

## 依存関係

- 前提: Phase 10
- 後続: Phase 12
- 参照依存: Phase 1 / 2 / 5 / 6 / 7 / 8 / 9 / 10

## 次のPhase

- Phase 12: ドキュメント更新

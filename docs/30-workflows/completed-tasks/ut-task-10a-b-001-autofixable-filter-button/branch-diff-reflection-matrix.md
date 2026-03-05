# UT-TASK-10A-B-001 ブランチ差分反映マトリクス

## 目的

本ブランチ変更分に対し、`task-specification-creator` と `aiworkflow-requirements` の要求事項が仕様書へ反映済みかを1:1で追跡する。

## 差分取得コマンド

```bash
git ls-files --others --exclude-standard \
  docs/30-workflows/completed-tasks/ut-task-10a-b-001-autofixable-filter-button
```

## SubAgent 分担（関心ごと分離）

| SubAgent | 関心ごと           | 担当仕様書                                                                                                                                     |
| -------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| A        | 基本構造整合       | `index.md`, `artifacts.json`, `phase-1`〜`phase-3`                                                                                             |
| B        | 実装・品質整合     | `phase-4`〜`phase-9`                                                                                                                           |
| C        | ゲート・文書化整合 | `phase-10`〜`phase-13`                                                                                                                         |
| D        | 要件抽出整合       | `aiworkflow-requirements-extraction-matrix.md`                                                                                                 |
| E        | 監査統合           | `skill-compliance-audit.md`, `multi-thinking-improvement-matrix.md`, `elegant-consistency-check-report.md`, `branch-diff-reflection-matrix.md` |

## 仕様書別 SubAgent 割当（1仕様書=1責務）

| 仕様書                                         | SubAgent | 責務                     |
| ---------------------------------------------- | -------- | ------------------------ |
| `phase-1-requirements.md`                      | A1       | 要件定義の整合           |
| `phase-2-design.md`                            | A2       | UI/状態/API設計の整合    |
| `phase-3-design-review.md`                     | A3       | Gate判定基準の整合       |
| `phase-4-test-creation.md`                     | B1       | Redテスト設計の網羅      |
| `phase-5-implementation.md`                    | B2       | 実装手順と契約維持       |
| `phase-6-test-expansion.md`                    | B3       | 境界/回帰テスト拡充      |
| `phase-7-coverage-check.md`                    | B4       | カバレッジ基準整合       |
| `phase-8-refactoring.md`                       | B5       | 責務分離の維持           |
| `phase-9-quality-assurance.md`                 | B6       | 品質ゲート整合           |
| `phase-10-final-review.md`                     | C1       | 最終レビュー整合         |
| `phase-11-manual-test.md`                      | C2       | 手動検証整合             |
| `phase-12-documentation.md`                    | C3       | Step 1-A〜1-G/Step 2整合 |
| `phase-13-pr-creation.md`                      | C4       | 完了判定整合             |
| `index.md`                                     | D1       | 入口情報整合             |
| `artifacts.json`                               | D2       | 台帳スキーマ整合         |
| `aiworkflow-requirements-extraction-matrix.md` | D3       | 抽出完全性整合           |
| `skill-compliance-audit.md`                    | E1       | スキル準拠監査整合       |
| `multi-thinking-improvement-matrix.md`         | E2       | 20思考法監査整合         |
| `elegant-consistency-check-report.md`          | E3       | 矛盾/漏れ/依存監査整合   |
| `branch-diff-reflection-matrix.md`             | E4       | 反映漏れガード整合       |

## 差分反映トレース

| 変更ファイル                                   | 反映観点                          | 反映先                          | 状態 |
| ---------------------------------------------- | --------------------------------- | ------------------------------- | ---- |
| `index.md`                                     | 全体設計、SubAgent分担、Phase一覧 | 本仕様ディレクトリの入口情報    | ✅   |
| `phase-1-requirements.md`                      | FR/NFR/AC、依存固定               | Phase 1実行計画                 | ✅   |
| `phase-2-design.md`                            | UI/状態/API境界設計               | Phase 2実行計画                 | ✅   |
| `phase-3-design-review.md`                     | 設計ゲート判定                    | Phase 3実行計画                 | ✅   |
| `phase-4-test-creation.md`                     | テスト設計                        | Phase 4実行計画                 | ✅   |
| `phase-5-implementation.md`                    | 実装方針                          | Phase 5実行計画                 | ✅   |
| `phase-6-test-expansion.md`                    | テスト拡充                        | Phase 6実行計画                 | ✅   |
| `phase-7-coverage-check.md`                    | カバレッジ基準                    | Phase 7実行計画                 | ✅   |
| `phase-8-refactoring.md`                       | リファクタ基準                    | Phase 8実行計画                 | ✅   |
| `phase-9-quality-assurance.md`                 | 品質保証                          | Phase 9実行計画                 | ✅   |
| `phase-10-final-review.md`                     | 最終ゲート                        | Phase 10実行計画                | ✅   |
| `phase-11-manual-test.md`                      | 手動検証                          | Phase 11実行計画                | ✅   |
| `phase-12-documentation.md`                    | Phase 12 Step厳密化               | Step 1-A〜1-G/Step 2 の順序固定 | ✅   |
| `phase-13-pr-creation.md`                      | 完了判定                          | Phase 13実行計画                | ✅   |
| `artifacts.json`                               | 成果物台帳                        | Phase別成果物定義               | ✅   |
| `outputs/artifacts.json`                       | 成果物台帳同期                    | ルート台帳との同期保持          | ✅   |
| `aiworkflow-requirements-extraction-matrix.md` | 抽出根拠                          | 採用/非採用、再現コマンド       | ✅   |
| `skill-compliance-audit.md`                    | 準拠監査                          | 2スキル監査結果の固定           | ✅   |
| `multi-thinking-improvement-matrix.md`         | 20思考法                          | 多角思考の監査根拠              | ✅   |
| `elegant-consistency-check-report.md`          | 整合監査                          | 矛盾/漏れ/依存の総合判定        | ✅   |
| `outputs/verification-report.md`               | 機械検証証跡                      | validate/verify/schema結果      | ✅   |

## 反映漏れガード

- [ ] `index.md` から Phase 1〜13 へリンクできる
- [ ] Phase 12 に Step 1-A〜1-G と Step 2 が定義されている
- [ ] 抽出マトリクスに採用/非採用理由がある
- [ ] `artifacts.json` と `outputs/artifacts.json` が一致している
- [ ] `skill-compliance-audit.md` で2スキル監査結果を記録している
- [ ] 検証レポートに `validate-phase-output` / `verify-all-specs` / `validate-schema` の結果がある

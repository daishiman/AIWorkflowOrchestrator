# getfiletree-ipc ブランチ差分反映マトリクス

## 目的

本ブランチ差分に対して、`task-specification-creator` と `aiworkflow-requirements` の要求事項が仕様書へ反映済みかを 1:1 で追跡する。

## 差分取得コマンド

```bash
git diff --name-only HEAD -- docs/30-workflows/completed-tasks/getfiletree-ipc
```

## SubAgent 分担（仕様書単位）

| SubAgent | 責務                 | 担当仕様書                                                     |
| -------- | -------------------- | -------------------------------------------------------------- |
| A        | 基本構造整合         | `index.md`, `artifacts.json`, `phase-1`, `phase-2`, `phase-3`  |
| B        | 実装・品質整合       | `phase-4`〜`phase-9`                                           |
| C        | レビュー・文書化整合 | `phase-10`, `phase-11`, `phase-12`, `phase-13`                 |
| D        | 要件抽出整合         | `aiworkflow-requirements-extraction-matrix.md`                 |
| E        | 差分追跡・監査       | `branch-diff-reflection-matrix.md`, `spec-alignment-review.md` |

## 仕様書別 SubAgent 割当（1仕様書=1責務）

| 仕様書                                         | SubAgent | 責務                         |
| ---------------------------------------------- | -------- | ---------------------------- |
| `phase-1-requirements.md`                      | A1       | 要件定義と抽出仕様の整合     |
| `phase-2-design.md`                            | A2       | IPC/API/型の設計整合         |
| `phase-3-design-review.md`                     | A3       | ゲート判定基準の整合         |
| `phase-4-test-creation.md`                     | B1       | テスト設計の網羅性           |
| `phase-5-implementation.md`                    | B2       | 実装手順と契約準拠           |
| `phase-6-test-expansion.md`                    | B3       | 異常系・分岐テストの拡充整合 |
| `phase-7-coverage-check.md`                    | B4       | カバレッジ基準の整合         |
| `phase-8-refactoring.md`                       | B5       | リファクタ時の契約維持       |
| `phase-9-quality-assurance.md`                 | B6       | 品質ゲート整合               |
| `phase-10-final-review.md`                     | C1       | 最終レビュー観点整合         |
| `phase-11-manual-test.md`                      | C2       | 手動検証観点整合             |
| `phase-12-documentation.md`                    | C3       | Phase 12 必須5タスク整合     |
| `phase-13-pr-creation.md`                      | C4       | 完了判定とPR準備整合         |
| `artifacts.json`                               | D1       | 台帳スキーマ整合             |
| `index.md`                                     | D2       | エントリーポイント整合       |
| `aiworkflow-requirements-extraction-matrix.md` | D3       | 必要仕様抽出の完全性         |
| `spec-alignment-review.md`                     | E1       | 機械検証結果の監査           |
| `multi-thinking-improvement-matrix.md`         | E2       | 多角思考観点の矛盾検出       |

## 差分反映トレース

| 変更ファイル                                   | 反映観点                 | 反映先                             | 状態 |
| ---------------------------------------------- | ------------------------ | ---------------------------------- | ---- |
| `phase-1-requirements.md`                      | 要件定義・参照仕様抽出   | Phase 1 参照資料/統合テスト連携    | ✅   |
| `phase-2-design.md`                            | 設計・型境界             | Phase 2 参照資料/統合テスト連携    | ✅   |
| `phase-3-design-review.md`                     | レビュー観点             | Phase 3 ゲート項目/統合テスト連携  | ✅   |
| `phase-4-test-creation.md`                     | テスト設計               | Phase 4 テスト観点/統合テスト連携  | ✅   |
| `phase-5-implementation.md`                    | 実装手順                 | Phase 5 実行タスク/統合テスト連携  | ✅   |
| `phase-6-test-expansion.md`                    | テスト拡充               | Phase 6 参照資料・成果物名         | ✅   |
| `phase-7-coverage-check.md`                    | カバレッジ               | Phase 7 基準・依存参照             | ✅   |
| `phase-8-refactoring.md`                       | リファクタリング         | Phase 8 品質・契約維持観点         | ✅   |
| `phase-9-quality-assurance.md`                 | 品質保証                 | Phase 9 品質ゲート・整合確認       | ✅   |
| `phase-10-final-review.md`                     | 最終レビュー             | Phase 10 統合テスト連携追加        | ✅   |
| `phase-11-manual-test.md`                      | 手動テスト               | Phase 11 統合テスト連携追加        | ✅   |
| `phase-12-documentation.md`                    | Phase 12 必須5タスク整合 | 成果物名・SubAgent分割・参照資料   | ✅   |
| `phase-13-pr-creation.md`                      | 完了処理                 | Phase 13 ファイル名・参照整合      | ✅   |
| `artifacts.json`                               | 仕様書/成果物台帳        | リネーム反映・Phase 12成果物名補正 | ✅   |
| `index.md`                                     | メインタスク仕様         | Phase一覧・成果物・SubAgent分担    | ✅   |
| `aiworkflow-requirements-extraction-matrix.md` | 仕様抽出妥当性           | 必須仕様/条件付き仕様/再現コマンド | ✅   |
| `spec-alignment-review.md`                     | 機械検証結果記録         | validate/verify/search の結果要約  | ✅   |

## 反映漏れガード

- [ ] `index.md` が存在し、全13Phaseへのリンクがある
- [ ] Phase 1〜11 で `## 統合テスト連携` が定義されている
- [ ] Phase 12 の成果物名が `unassigned-task-detection.md` / `skill-feedback-report.md` になっている
- [ ] `artifacts.json` の `specFile` と実ファイル名が一致している
- [ ] 参照仕様抽出の根拠が `aiworkflow-requirements-extraction-matrix.md` に固定化されている

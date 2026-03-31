# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 11                                    |
| 機能名     | phase11-ui-ux-auto-eval-feedback-loop |
| タスクID   | TASK-UIUX-FEEDBACK-001                |
| 作成日     | 2026-03-31                            |
| ステータス | spec_created                          |
| 担当       | UI/UX 検証担当                        |

## 目的

3 層評価の実行手順、証跡配置、feedback loop の接続点を current workflow 配下に固定し、実行時に迷いなく `outputs/phase-11/` へ証跡を揃えられる状態にする。

## 実行タスク

- Layer 1〜3 の実行順序と必須証跡を固定する
- `manual-test-checklist.md`、`manual-test-result.md`、`manual-test-report.md` の役割分担を明文化する
- `screenshot-plan.json` と `phase11-capture-metadata.json` の更新責務を明示する
- TASK-RT-05 M11-1〜M11-4 の実行対象を current workflow から辿れるようにする

## 参照資料

| 資料名                    | パス                                                                                    | 説明                                   |
| ------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 10 最終レビュー     | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-10-final-review.md` | 実行前のゲート条件                     |
| Phase 11/12 ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | screenshot・coverage・close-out ルール |
| Phase 11 詳細テンプレート | `.claude/skills/task-specification-creator/references/phase-template-phase11-detail.md` | manual test の見出し基準               |

## 実行手順

### ステップ 1: 実行前チェック

- `outputs/phase-11/manual-test-checklist.md` で前提条件を確認する
- `outputs/phase-11/screenshot-plan.json` で TC-ID と撮影対象を確認する
- `outputs/phase-11/screenshots/phase11-capture-metadata.json` の `captureStatus` を更新前提で扱う

### ステップ 2: 3 層評価の実行

- Layer 1: semantic 確認
- Layer 2: screenshot / visual 確認
- Layer 3: AI UX 評価

### ステップ 3: 結果の記録

- `outputs/phase-11/manual-test-result.md` に TC 単位の結果を記録する
- `outputs/phase-11/manual-test-report.md` に総括を記録する
- 発見課題は `outputs/phase-11/discovered-issues.md` に集約する

## 統合テスト連携

| 連携先   | 連携内容                                                              |
| -------- | --------------------------------------------------------------------- |
| Phase 4  | テストケースと screenshot plan の対応を維持する                       |
| Phase 12 | 実行結果と discovered issues を system spec update summary に引き渡す |

## 成果物

| 成果物名       | パス                                                                                   | 説明                 |
| -------------- | -------------------------------------------------------------------------------------- | -------------------- |
| 手動テスト仕様 | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-11-manual-test.md` | 本フェーズの親仕様書 |
| チェックリスト | `outputs/phase-11/manual-test-checklist.md`                                            | 実行前確認           |
| テスト結果     | `outputs/phase-11/manual-test-result.md`                                               | TC 単位の実測値      |
| 総合レポート   | `outputs/phase-11/manual-test-report.md`                                               | 総括と blocker       |
| 発見課題       | `outputs/phase-11/discovered-issues.md`                                                | 高中低の課題一覧     |

## 完了条件チェックリスト

- [ ] Layer 1〜3 の実行順序が固定されている
- [ ] manual-test 系 3 成果物の役割分担が明示されている
- [ ] screenshot plan と metadata の更新責務が記載されている
- [ ] `outputs/phase-11/` 配下の証跡配置が current workflow 基準で定義されている
- [ ] spec_created 現在地として、実行導線と証跡配置が current facts に同期されている

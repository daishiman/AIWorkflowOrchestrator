# Phase 12: ドキュメント

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 12                                                            |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

Task03 の設計・実装・テスト・手動検証結果を仕様書群へ同期し、未反映項目と未タスクを整理する。

## 実行タスク

- 実装ガイド更新: create / execute / improve 単一導線の利用方法を記録する
- 仕様同期: UI / IPC / internal orchestration 関連仕様へ反映する
- 差分要約作成: 何を変更し、何を据え置いたかを記録する
- 未タスク検出: 今回のスコープ外または follow-up が必要な項目を整理する
- フィードバック整理: 実装中に判明した改善余地を記録する

## 参照資料

| 参照資料                     | パス                                               | 説明            |
| ---------------------------- | -------------------------------------------------- | --------------- |
| 要件定義書                   | `outputs/phase-1/requirements-definition.md`       | Phase 1 成果物  |
| アーキテクチャ設計           | `outputs/phase-2/architecture-design.md`           | Phase 2 成果物  |
| セッション状態設計           | `outputs/phase-2/session-state-design.md`          | Phase 2 成果物  |
| 内部オーケストレーション設計 | `outputs/phase-2/internal-orchestration-design.md` | Phase 2 成果物  |
| 実装記録                     | `outputs/phase-5/implementation-summary.md`        | Phase 5 成果物  |
| 変更ファイル一覧             | `outputs/phase-5/modified-files.md`                | Phase 5 成果物  |
| 統合フロー記録               | `outputs/phase-5/integration-flow.md`              | Phase 5 成果物  |
| テスト拡充結果               | `outputs/phase-6/test-expansion-report.md`         | Phase 6 成果物  |
| カバレッジレポート           | `outputs/phase-7/coverage-report.md`               | Phase 7 成果物  |
| リファクタリング記録         | `outputs/phase-8/refactoring-log.md`               | Phase 8 成果物  |
| 責務再配置マップ             | `outputs/phase-8/responsibility-map.md`            | Phase 8 成果物  |
| 品質保証レポート             | `outputs/phase-9/quality-assurance-report.md`      | Phase 9 成果物  |
| 最終レビュー結果             | `outputs/phase-10/final-review-report.md`          | Phase 10 成果物 |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`           | Phase 11 成果物 |
| Apple UI/UX レビュー         | `outputs/phase-11/apple-ui-ux-review.md`           | Phase 11 成果物 |

## 実行手順

### ステップ1: 更新対象ドキュメントを確定する

Task03 の差分が影響する仕様書、task workflow、補助ガイドを一覧化する。

### ステップ2: 実装内容と証跡を同期する

実装記録、品質レポート、手動テスト結果、視覚レビュー結果を各文書へ反映する。

### ステップ3: 未タスクと今後の改善余地を整理する

今回のスコープ外項目、依存タスク、将来の改善余地を明文化する。

## 成果物

| 成果物             | パス                                                     | 説明                                              |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------- |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`               | 利用方法と構成説明                                |
| 仕様更新要約       | `outputs/phase-12/spec-update-summary.md`                | 更新先と反映内容                                  |
| 変更履歴           | `outputs/phase-12/documentation-changelog.md`            | 文書更新ログ                                      |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 項目                                    |
| フィードバック報告 | `outputs/phase-12/skill-feedback-report.md`              | 実装中の学びと改善余地                            |
| 準拠チェック       | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 の再監査 |

## 完了条件

- [x] 更新対象仕様書と反映内容が整理されている
- [x] 手動テスト結果が文書へ同期されている
- [x] 未タスクと follow-up が整理されている
- [x] Phase 12 の必須成果物がすべて生成されている

# UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| 機能名     | ut-imp-runtime-workflow-verify-artifact-append-001                       |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001                       |
| 作成日     | 2026-03-26                                                               |
| ステータス | completed                                                                |
| 総Phase数  | 13                                                                       |
| Issue      | [#1652](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1652) |

## 概要

本 workflow pack は、runtime workflow failure path でも `verify_result` artifact を append 正本へ揃えるための Phase 1-13 実行仕様を定義する。親タスク `UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001` が固定した failure lifecycle 契約を前提に、今回スコープを「failure verify artifact append」「targeted regression test」「append 正本契約の同期」に限定する。

## 横断判断サマリー

| 観点               | 一次結論                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点           | failure path だけ `verify_result` 履歴が欠け、consumer が失敗履歴を再構成できないこと                                                               |
| 依存関係・責務境界 | write owner は `SkillCreatorWorkflowEngine`、`RuntimeSkillCreatorFacade` は read bridge に限定する                                                  |
| 価値とコスト       | 実装変更は小さいが、artifact 正本契約と failure 監査可能性の価値は高い                                                                              |
| 改善優先順位       | 1. source of truth 固定 2. engine/facade regression 固定 3. Phase 12 sync 記録                                                                      |
| 4条件評価          | 矛盾なし: parent workflow と整合、漏れなし: Phase 12 6成果物で補完、整合性あり: 命名/責務を統一、依存関係整合: task と aiworkflow spec の参照を明示 |

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了       |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了       |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked    |

## 実行フロー

```text
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
                         ↓
                    設計差戻し
                         ↓
Phase 8 -> Phase 9 -> Phase 10 -> Phase 11 -> Phase 12 -> Phase 13
```

## ディレクトリ構成

```text
ut-imp-runtime-workflow-verify-artifact-append-001/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── artifacts.json
    ├── verification-report.md
    ├── phase-1/spec-extraction-map.md
    ├── phase-2/ownership-matrix.md
    ├── phase-3/design-review-summary.md
    ├── phase-4/test-matrix.md
    ├── phase-5/implementation-scope.md
    ├── phase-6/test-expansion-summary.md
    ├── phase-7/coverage-traceability.md
    ├── phase-8/refactoring-summary.md
    ├── phase-9/quality-assurance-log.md
    ├── phase-10/final-review-summary.md
    ├── phase-11/manual-test-checklist.md
    ├── phase-11/manual-test-result.md
    └── phase-12/
        ├── implementation-guide.md
        ├── system-spec-update-summary.md
        ├── documentation-changelog.md
        ├── unassigned-task-detection.md
        ├── skill-feedback-report.md
        └── phase12-task-spec-compliance-check.md
```

## 成果物

| Phase | 主要成果物                                                                                                                        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義、受入基準、仕様抽出マップ                                                                                                |
| 2     | failure path 設計、ownership matrix                                                                                               |
| 3     | gate 判定、設計差戻し条件                                                                                                         |
| 4     | failure regression test matrix                                                                                                    |
| 5     | append 実装手順、変更対象一覧、実装スコープ記録                                                                                   |
| 6     | engine/facade 回帰テスト拡張結果                                                                                                  |
| 7     | 要件追跡と coverage 実績                                                                                                          |
| 8     | append helper 導入の整理結果                                                                                                      |
| 9     | validator 実行結果、verification report、targeted QA                                                                              |
| 10    | 最終レビューの合否判定と Go 根拠                                                                                                  |
| 11    | 手動確認チェックリストと実行記録                                                                                                  |
| 12    | implementation guide、system spec update summary、documentation changelog、unassigned detection、skill feedback、compliance check |
| 13    | PR 非実施条件の固定                                                                                                               |

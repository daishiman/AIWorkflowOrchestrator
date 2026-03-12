# Phase 7: テストカバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 7                                                                        |
| Phase名    | テストカバレッジ確認                                                     |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 6                                                                  |
| 後続Phase  | Phase 8                                                                  |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

受入基準と drift class に対して検証の網羅を確認する。テスト件数ではなく、manifest 項目、guard 契約、Phase 12 sync 条件が全て trace されていることを重視する。

## 実行タスク

- SubAgent-A: manifest 項目とテストケースの対応表を作る
- SubAgent-B: drift class と失敗ケースの対応表を作る
- Lead: 受入基準 AC-1 から AC-5 の traceability を確定する

## 参照資料

| 参照資料       | パス                                       | 説明                        |
| -------------- | ------------------------------------------ | --------------------------- |
| Phase 1        | `phase-1-requirements.md`                  | 受入基準の起点              |
| Phase 4        | `phase-4-test-creation.md`                 | テスト設計の起点            |
| Phase 5成果物  | `outputs/phase-5/implementation-log.md`    | 実装済み drift guard の確認 |
| Phase 6        | `phase-6-test-expansion.md`                | 拡充結果                    |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md` | coverage 評価の入力         |
| 失敗ケース分析 | `outputs/phase-6/failure-cases.md`         | uncovered 項目抽出          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容                          |
| -------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | traceability 基準             |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | Phase 12 sync coverage の確認 |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 再発パターンの網羅確認        |

## 統合テスト連携

- AC と test case の対応表を作る
- 未網羅項目があれば Phase 6 へ戻す条件を定義する
- Phase 10 の最終レビューで coverage 評価を再利用する

## 成果物

| 成果物         | パス                                                                                                                    |
| -------------- | ----------------------------------------------------------------------------------------------------------------------- |
| カバレッジ報告 | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-7/coverage-report.md`           |
| 要件追跡表     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-7/requirements-traceability.md` |
| 未網羅一覧     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-7/uncovered-items.md`           |

## 完了条件

- [x] AC-1 から AC-5 の traceability が埋まっている
- [x] manifest 項目と drift class の未網羅有無が記録されている
- [x] 未網羅がある場合の戻り先 Phase が決まっている
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 8: リファクタリングへ進む。

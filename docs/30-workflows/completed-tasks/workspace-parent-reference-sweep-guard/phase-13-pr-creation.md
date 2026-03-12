# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 13                                                                       |
| Phase名    | PR作成                                                                   |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | not_started                                                              |
| 前提Phase  | Phase 12                                                                 |
| 後続Phase  | 完了                                                                     |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

実装と文書更新が完了したあと、PR 説明、検証結果、未解決事項を整理する。PR 自体の作成はユーザーの明示指示が前提であり、自動実行しない。

## 実行タスク

- Task-A: PR に載せる変更概要を整理する
- Task-B: 検証結果、current / baseline、mirror sync、Phase 12 必須タスク完了を要約する
- Task-C: 未解決事項、follow-up、関連 Issue を整理する

## 参照資料

| 参照資料          | パス                                                     | 説明                      |
| ----------------- | -------------------------------------------------------- | ------------------------- |
| Phase 1成果物     | `outputs/phase-1/acceptance-criteria.md`                 | 受入基準の要約元          |
| Phase 2成果物     | `outputs/phase-2/concern-boundary-map.md`                | concern summary の要約元  |
| Phase 5成果物     | `outputs/phase-5/diff-summary.md`                        | 実装差分の要約元          |
| Phase 6成果物     | `outputs/phase-6/delta-report.md`                        | variation 結果の要約元    |
| Phase 7成果物     | `outputs/phase-7/coverage-report.md`                     | coverage の要約元         |
| Phase 8成果物     | `outputs/phase-8/regression-check.md`                    | refactor 後の安定性要約元 |
| Phase 9成果物     | `outputs/phase-9/quality-report.md`                      | 品質評価の要約元          |
| Phase 10成果物    | `outputs/phase-10/final-review-result.md`                | 最終判定の要約元          |
| Phase 11成果物    | `outputs/phase-11/manual-test-result.md`                 | 手動確認の要約元          |
| Phase 12          | `phase-12-documentation.md`                              | ドキュメント結果          |
| 実装ガイド        | `outputs/phase-12/implementation-guide.md`               | PR 説明の元資料           |
| 仕様更新サマリー  | `outputs/phase-12/spec-update-summary.md`                | PR 説明の元資料           |
| 更新履歴          | `outputs/phase-12/documentation-changelog.md`            | PR 説明の元資料           |
| 未タスク検出      | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 整理            |
| Phase 12 準拠確認 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 完了判定の根拠            |

## 実行手順

1. PR に載せる変更要約を「manifest / drift guard / Phase 12 sync」の 3 本柱で整理する
2. 検証結果を `rg`、`diff -qr`、`verify-unassigned-links`、`audit-unassigned-tasks`、manual review の順で並べる
3. 未解決事項があれば follow-up として分離し、現タスクの完了条件から切り離して記録する
4. PR 作成、commit、push はユーザーの明示指示があるときだけ実行する

## 成果物

| 成果物       | パス                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| PR 情報      | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-13/pr-info.md`        |
| 変更要約     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-13/change-summary.md` |
| 引き継ぎメモ | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-13/handoff-notes.md`  |

## 完了条件

- [ ] PR 説明ドラフトがある
- [ ] 検証結果の要約がある
- [ ] follow-up の整理がある
- [ ] commit / push / PR はユーザーの明示指示なしに実行しないと記録されている
- [ ] 本Phase内の全タスクを100%実行完了

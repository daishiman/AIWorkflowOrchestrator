# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 10                                                                       |
| Phase名    | 最終レビューゲート                                                       |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 9                                                                  |
| 後続Phase  | Phase 11                                                                 |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

実装と品質保証の結果が Phase 1-3 の設計意図から逸脱していないかを最終判定する。逸脱があれば Phase 5 か Phase 8 へ戻す。

## 実行タスク

- Reviewer-A: manifest と guard 契約の整合を確認する
- Reviewer-B: quality report と traceability の整合を確認する
- Reviewer-C: Phase 12 へ渡す更新対象と残課題を確認する
- Lead: PASS / MINOR / MAJOR / CRITICAL を判定する

## 参照資料

| 参照資料        | パス                                                                           | 説明           |
| --------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 1         | `phase-1-requirements.md`                                                      | 要件照合       |
| Phase 2         | `phase-2-design.md`                                                            | 設計照合       |
| Phase 5成果物   | `outputs/phase-5/implementation-log.md`                                        | 実装結果の照合 |
| Phase 9         | `phase-9-quality-assurance.md`                                                 | 品質結果       |
| 品質レポート    | `outputs/phase-9/quality-report.md`                                            | 判定入力       |
| 再現性ログ      | `outputs/phase-9/reproducibility-log.md`                                       | 判定入力       |
| 運用評価        | `outputs/phase-9/operation-readiness.md`                                       | 判定入力       |
| review criteria | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容                    |
| -------------------- | --------------------------------------------------------------------------- | ----------------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 最終ゲート基準          |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | Phase 12 引き継ぎの前提 |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | 再発確認                |

## 統合テスト連携

- Phase 1-3 の意図と Phase 9 の結果を照合する
- Phase 11 手動確認で見るべきポイントを抽出する
- 戻り先 Phase を明記して Phase 12 の早着手を防ぐ

## 成果物

| 成果物           | パス                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| 最終レビュー結果 | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-10/final-review-result.md`   |
| 指摘一覧         | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-10/final-review-findings.md` |
| 是正計画         | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-10/remediation-plan.md`      |

## 完了条件

- [x] PASS / MINOR / MAJOR / CRITICAL の判定がある
- [x] 戻り先 Phase が指摘ごとに明記されている
- [x] Phase 11 が見るべき手動確認ポイントが抽出されている
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 11: 手動テストへ進む。

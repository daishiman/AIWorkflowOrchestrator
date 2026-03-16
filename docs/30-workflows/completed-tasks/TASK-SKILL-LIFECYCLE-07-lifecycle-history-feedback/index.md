# TASK-SKILL-LIFECYCLE-07: ライフサイクル履歴・フィードバック統合

## 概要

作成、採点、実行、改善の全イベントを履歴化し、再利用、推薦、学習、改善優先度へ還流させる補助レイヤタスク。Task04（採点・評価ゲート）の品質スコアと Task05（利用導線）の CTA 制御を横断参照できる履歴モデルを設計する。

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-07                     |
| タスク種別   | 設計                                        |
| 優先度       | 中                                          |
| ステータス   | completed                                   |
| 依存タスク   | TASK-SKILL-LIFECYCLE-04（完了）, 05（完了） |
| ブロック対象 | TASK-SKILL-LIFECYCLE-08                     |
| 作成日       | 2026-03-11                                  |
| 仕様書更新日 | 2026-03-16                                  |

## 受入基準

| ID   | 基準                                                   |
| ---- | ------------------------------------------------------ |
| AC-1 | 作成/評価/実行/改善の履歴イベントが定義されている      |
| AC-2 | 再利用や推薦に使うフィードバックデータが定義されている |
| AC-3 | Task05 の再利用導線と連動している                      |
| AC-4 | Task08 の公開判断材料へ接続できる                      |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | completed  |

---

## 実行フロー

```
Phase 1 -> Phase 2 -> Phase 3 (Gate) -> Phase 4 -> Phase 5 -> Phase 6 -> Phase 7
                         |                                        |
                    (MAJOR->戻り)                           (未達->戻り)
                         |                                        |
Phase 8 -> Phase 9 -> Phase 10 (Gate) -> Phase 11 -> Phase 12 -> Phase 13 -> 完了
                         |
                    (MAJOR->戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                               |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | outputs/phase-1/lifecycle-event-catalog.md, feedback-collection-spec.md, task05-integration-contract.md, task08-metrics-definition.md, acceptance-criteria-matrix.md                                                                     |
| 2     | outputs/phase-2/event-model-design.md, aggregate-view-design.md, feedback-loop-design.md, publish-metrics-interface-design.md, data-flow-design.md                                                                                       |
| 3     | outputs/phase-3/requirements-design-matrix.md, technical-review-report.md, integration-review-report.md, gate-decision.md                                                                                                                |
| 4     | outputs/phase-4/event-model-test-spec.md, aggregate-logic-test-spec.md, feedback-loop-test-spec.md, ipc-contract-test-spec.md, test-data-factory-definition.md                                                                           |
| 5     | outputs/phase-5/event-model-impl-spec.md, lifecycle-history-slice-spec.md, aggregate-logic-impl-spec.md, feedback-model-impl-spec.md, publish-metrics-api-impl-spec.md                                                                   |
| 6     | outputs/phase-6/duplicate-prevention-test-spec.md, error-handling-test-spec.md, boundary-value-test-spec.md, regression-guard-test-spec.md                                                                                               |
| 7     | outputs/phase-7/event-category-coverage-matrix.md, aggregate-logic-coverage-matrix.md, feedback-path-coverage-matrix.md, coverage-gate-decision.md                                                                                       |
| 8     | outputs/phase-8/naming-unification-report.md, deduplication-report.md, data-flow-optimization-report.md, test-rerun-report.md                                                                                                            |
| 9     | outputs/phase-9/spec-quality-report.md, type-consistency-report.md, link-validity-report.md, quality-gate-report.md                                                                                                                      |
| 10    | outputs/phase-10/acceptance-criteria-fulfillment.md, design-implementation-gap-report.md, integration-final-verification.md, final-review-decision.md                                                                                    |
| 11    | outputs/phase-11/walkthrough-scenario-a.md, walkthrough-scenario-b.md, walkthrough-scenario-c.md, manual-test-checklist.md, manual-test-result.md, manual-test-report.md, screenshot-plan.json, discovered-issues.md, screenshots/\*.png |
| 12    | outputs/phase-12/implementation-guide.md, system-spec-update-summary.md（spec-update-summary.md 互換名）, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md, phase12-task-spec-compliance-check.md      |
| 13    | -（ユーザー承認後にPR作成）                                                                                                                                                                                                              |

---

_このファイルは Phase 1-13 タスク仕様書の再生成に伴い更新されました。_
_最終更新: 2026-03-16_

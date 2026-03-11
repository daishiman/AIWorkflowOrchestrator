# TASK-SKILL-LIFECYCLE-01 - タスク実行仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| 機能名     | TASK-SKILL-LIFECYCLE-01 |
| 作成日     | 2026-03-11              |
| ステータス | 完了                    |
| 総Phase数  | 13                      |

---

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
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 完了       |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .agents/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | phase-1-requirements.md, outputs/phase-1/requirements-definition.md, outputs/phase-1/scope-definition.md, outputs/phase-1/journey-entry-inventory.md, outputs/phase-1/surface-responsibility-candidates.md, outputs/phase-1/subagent-team-plan.md                                                                                                                                                                                                                                                                                                             |
| 2     | phase-2-design.md, outputs/phase-2/primary-journey-sequence.md, outputs/phase-2/surface-responsibility-matrix.md, outputs/phase-2/advanced-route-policy.md, outputs/phase-2/dependency-contracts.md, outputs/phase-2/spec-extraction-map.md                                                                                                                                                                                                                                                                                                                   |
| 3     | phase-3-design-review.md, outputs/phase-3/design-review-result.md, outputs/phase-3/design-review-findings.md, outputs/phase-3/remediation-plan.md                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4     | phase-4-test-creation.md, outputs/phase-4/test-cases.md, outputs/phase-4/route-contract-test-matrix.md, outputs/phase-4/surface-smoke-checklist.md, outputs/phase-4/phase11-screenshot-preplan.md, outputs/phase-4/red-checklist.md                                                                                                                                                                                                                                                                                                                           |
| 5     | phase-5-implementation.md, outputs/phase-5/implementation-log.md, outputs/phase-5/change-file-matrix.md, outputs/phase-5/green-test-log.txt, outputs/phase-5/journey-diff-summary.md                                                                                                                                                                                                                                                                                                                                                                          |
| 6     | phase-6-test-expansion.md, outputs/phase-6/test-expansion-result.md, outputs/phase-6/regression-case-matrix.md, outputs/phase-6/downstream-contract-tests.md                                                                                                                                                                                                                                                                                                                                                                                                  |
| 7     | phase-7-coverage-check.md, outputs/phase-7/coverage-report.md, outputs/phase-7/uncovered-journeys.md, outputs/phase-7/requirement-traceability.md                                                                                                                                                                                                                                                                                                                                                                                                             |
| 8     | phase-8-refactoring.md, outputs/phase-8/refactoring-log.md, outputs/phase-8/naming-alignment.md, outputs/phase-8/technical-debt-update.md                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 9     | phase-9-quality-assurance.md, outputs/phase-9/quality-report.md, outputs/phase-9/accessibility-audit.md, outputs/phase-9/contract-audit.md, outputs/phase-9/spec-extraction-audit.md                                                                                                                                                                                                                                                                                                                                                                          |
| 10    | phase-10-final-review.md, outputs/phase-10/final-review-result.md, outputs/phase-10/final-review-findings.md, outputs/phase-10/remediation-plan.md                                                                                                                                                                                                                                                                                                                                                                                                            |
| 11    | phase-11-manual-test.md, outputs/phase-11/manual-test-result.md, outputs/phase-11/discovered-issues.md, outputs/phase-11/screenshot-plan.json, outputs/phase-11/screenshot-coverage.md, outputs/phase-11/screenshots/TC-11-01-create-entry.png, outputs/phase-11/screenshots/TC-11-02-execute-entry.png, outputs/phase-11/screenshots/TC-11-03-improve-entry.png, outputs/phase-11/screenshots/TC-11-04-advanced-supporting.png, outputs/phase-11/screenshots/TC-11-05-surface-ownership.png, outputs/phase-11/screenshots/TC-11-06-settings-public-shell.png |
| 12    | phase-12-documentation.md, outputs/phase-12/implementation-guide.md, outputs/phase-12/spec-update-summary.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/phase12-task-spec-compliance-check.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md                                                                                                                                                                                                                                                   |
| 13    | PR要約ドラフト, 証跡一覧, 依存影響一覧, PR本文ドラフト, PR情報                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-03-11T10:19:13.212Z_

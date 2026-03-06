# task-056e-integration-gate-and-spec-sync - タスク実行仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| 機能名     | task-056e-integration-gate-and-spec-sync |
| 作成日     | 2026-03-06                               |
| ステータス | Phase 1〜12 完了（Phase 13 未実施）      |
| 総Phase数  | 13                                       |
| 親タスク   | `TASK-UI-01-STORE-IPC-ARCHITECTURE`      |

## 目的

`TASK-UI-01-C` と `TASK-UI-01-D` の成果物を統合し、後続タスクが参照するレビューゲート、仕様同期台帳、ブロッカー解除条件を1つの正本へ集約する。

## 設計改善判断

| 判断     | 結論   | 理由                                                                                                                                 |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 全面破棄 | 不採用 | 13Phase構造、親導線、検証スクリプト整合は既に成立しており、捨てると履歴価値より再作成コストが勝つ                                    |
| 部分破棄 | 採用   | 「validator pass = skill完全準拠」「参照仕様は最小8件で十分」「Phase 12 は最小手順でよい」の3前提を破棄し、skill正本準拠へ再設計した |

## SubAgent編成

| SubAgent                     | 関心ごと                          | 主要成果物                                   |
| ---------------------------- | --------------------------------- | -------------------------------------------- |
| E1: Gate Criteria Integrator | PASS / MINOR / MAJOR 判定軸の設計 | `outputs/phase-2/integration-gate-design.md` |
| E2: Spec Sync Ledger Curator | aiworkflow反映対象の台帳化        | `outputs/phase-5/spec-sync-targets.md`       |
| E3: Handoff Auditor          | 後続UIタスクへの引き渡し条件固定  | `outputs/phase-2/dependency-handoff-plan.md` |
| E4: Consistency Reviewer     | 全Phase横断の矛盾検査             | `outputs/phase-10/final-review-result.md`    |

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
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

## 実行フロー

```text
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

## Phase完了時の必須アクション

1. Phase内の全タスクを100%実行する。
2. `outputs/phase-N/` 配下の成果物を生成する。
3. `artifacts.json` の対象Phaseステータスを更新する。
4. 次Phaseへ渡す入力を `参照資料` と `成果物` に反映する。

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

## 主要成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/acceptance-criteria.md`, `outputs/phase-1/scope-definition.md`                                                                                                                                                                                                           |
| 2     | `outputs/phase-2/integration-gate-design.md`, `outputs/phase-2/spec-sync-matrix.md`, `outputs/phase-2/dependency-handoff-plan.md`, `outputs/phase-2/aiworkflow-requirements-extract.md`, `outputs/phase-2/traceability-matrix.md`                                                                                                       |
| 3     | `outputs/phase-3/design-review-result.md`, `outputs/phase-3/review-findings.md`                                                                                                                                                                                                                                                         |
| 4     | `outputs/phase-4/test-specification.md`, `outputs/phase-4/test-cases.md`, `outputs/phase-4/integration-test-matrix.md`                                                                                                                                                                                                                  |
| 5     | `outputs/phase-5/implementation-plan.md`, `outputs/phase-5/review-gate.md`, `outputs/phase-5/spec-sync-targets.md`                                                                                                                                                                                                                      |
| 6     | `outputs/phase-6/test-expansion-plan.md`, `outputs/phase-6/regression-matrix.md`                                                                                                                                                                                                                                                        |
| 7     | `outputs/phase-7/coverage-target-report.md`, `outputs/phase-7/coverage-gate-result.md`                                                                                                                                                                                                                                                  |
| 8     | `outputs/phase-8/refactoring-plan.md`, `outputs/phase-8/contract-consistency-check.md`                                                                                                                                                                                                                                                  |
| 9     | `outputs/phase-9/quality-checklist.md`, `outputs/phase-9/spec-sync-readiness.md`                                                                                                                                                                                                                                                        |
| 10    | `outputs/phase-10/final-review-result.md`, `outputs/phase-10/rework-decision-log.md`                                                                                                                                                                                                                                                    |
| 11    | `outputs/phase-11/manual-test-plan.md`, `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/evidence-index.md`, `outputs/phase-11/screenshot-matrix.md`, `outputs/phase-11/discovered-issues.md`                                                                                                                                |
| 12    | `outputs/phase-12/implementation-guide.md`, `outputs/phase-12/spec-update-summary.md`, `outputs/phase-12/documentation-changelog.md`, `outputs/phase-12/unassigned-task-detection.md`, `outputs/phase-12/skill-feedback-report.md`, `outputs/phase-12/recheck-multithinking-audit.md`, `outputs/phase-12/phase12-compliance-recheck.md` |
| 13    | `outputs/phase-13/pr-description.md`, `outputs/phase-13/review-request-note.md`                                                                                                                                                                                                                                                         |

## 監査成果物

| 成果物                               | 内容                                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| `outputs/verification-report.md`     | task-specification-creator / aiworkflow-requirements 観点の仕様監査と再検証結果 |
| `outputs/elegant-solution-review.md` | 全面破棄の要否、20思考フレーム、多層依存整合、aiworkflow抽出完全性の監査結果    |

## 注意事項

1. 本ディレクトリでは Phase 1〜12 を実施済みであり、コミットと PR 作成は未実施である。
2. `TASK-UI-01-C` と `TASK-UI-01-D` の正本は `completed-tasks/` 配下を参照する。
3. Phase 12 では `task-workflow.md`、`lessons-learned.md`、両方の `LOGS.md` を同期対象として扱う。

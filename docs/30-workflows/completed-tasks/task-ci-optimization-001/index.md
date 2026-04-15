# task-ci-optimization-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| 機能名     | task-ci-optimization-001  |
| 作成日     | 2026-04-14                |
| ステータス | Phase 12 完了（PR未着手） |
| 総Phase数  | 13                        |

---

## タスク概要

GitHub CI のテスト実行時間を削減し、開発サイクルを高速化する。

| 項目                | 現状    | 目標         |
| ------------------- | ------- | ------------ |
| CI 実行時間（平均） | ~15m21s | ~7分40秒以内 |

### 改善内容

1. **node_modules キャッシュ（最大インパクト）**: `actions/cache` を `pnpm-install-retry` に統合し、`node_modules` を再利用して `pnpm install` とネイティブ再構築の固定費を削減する。キャッシュキーは `pnpm-lock.yaml` のハッシュで管理する。
2. **テストシャード数 16→17**: `test-desktop` ジョブの matrix シャード数を 16 から 17 に微調整し、無料枠の並列上限を超えない範囲で各シャードの実行時間を短縮する。
3. **`CI_MAX_FORKS` 2→3**: vitest の並列度を制御する環境変数 `CI_MAX_FORKS` を 2 から 3 に引き上げる案を検証し、OOM なしで改善する場合のみ採用する。

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス                  |
| ----- | -------------------- | ------------------------------------------------------------ | --------------------------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了                        |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了                        |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了                        |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了                        |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了                        |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了                        |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了                        |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了                        |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了                        |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了                        |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了                        |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了                        |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | ユーザー指示待ち（blocked） |

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
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-ci-optimization-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | outputs/phase-1/acceptance-criteria.md, outputs/phase-1/scope-definition.md, outputs/phase-1/current-state-analysis.md                                                                                                                                                                  |
| 2     | outputs/phase-2/design-decisions.md, outputs/phase-2/cache-design.md, outputs/phase-2/validation-matrix.md                                                                                                                                                                              |
| 3     | outputs/phase-3/design-review-result.md, outputs/phase-3/risk-assessment.md, outputs/phase-3/minor-tracking.md                                                                                                                                                                          |
| 4     | outputs/phase-4/verification-plan.md, outputs/phase-4/rollback-criteria.md, outputs/phase-4/baseline-timing.md                                                                                                                                                                          |
| 5     | outputs/phase-5/implementation-result.md, outputs/phase-5/green-confirmation.md                                                                                                                                                                                                         |
| 6     | outputs/phase-6/edge-case-verification.md                                                                                                                                                                                                                                               |
| 7     | outputs/phase-7/ci-timing-report.md, outputs/phase-7/cache-effectiveness-report.md                                                                                                                                                                                                      |
| 8     | outputs/phase-8/refactoring-result.md                                                                                                                                                                                                                                                   |
| 9     | outputs/phase-9/quality-check-result.md                                                                                                                                                                                                                                                 |
| 10    | outputs/phase-10/final-review-result.md, outputs/phase-10/ac-verification.md                                                                                                                                                                                                            |
| 11    | outputs/phase-11/manual-test-result.md, outputs/phase-11/manual-test-report.md, outputs/phase-11/discovered-issues.md, outputs/phase-11/ci-timing-measurements.md, outputs/phase-11/phase11-capture-metadata.json                                                                       |
| 12    | outputs/phase-12/implementation-guide.md, outputs/phase-12/system-spec-update-summary.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md, outputs/phase-12/phase12-task-spec-compliance-check.md |
| 13    | outputs/phase-13/local-check-result.md, outputs/phase-13/change-summary.md, outputs/phase-13/pr-info.md, outputs/phase-13/pr-ready-report.md                                                                                                                                            |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-04-14T14:46:19Z_

# skill-validation-consistency - タスク実行仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| 機能名     | skill-validation-consistency |
| 作成日     | 2026-02-24                   |
| ステータス | phase_12_completed           |
| 総Phase数  | 13                           |

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
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

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
  --workflow docs/30-workflows/completed-tasks/skill-validation-consistency --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | phase-1-requirements.md:要件定義書（FR1-FR3, NFR1-NFR5）, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-1/requirements-result.md                                                                                                                                                                                                                                                           |
| 2     | phase-2-design.md:設計書（6ハンドラ修正前後比較、P42準拠パターン）, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-2/design-result.md                                                                                                                                                                                                                                                       |
| 3     | phase-3-design-review.md:設計レビュー結果書（PASS判定基準）, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-3/design-review-result.md:PASS判定                                                                                                                                                                                                                                              |
| 4     | phase-4-test-creation.md:テスト設計書, apps/desktop/src/main/ipc/**tests**/skillHandlers.validation.test.ts:59テスト作成                                                                                                                                                                                                                                                                                                  |
| 5     | phase-5-implementation.md:実装仕様書, apps/desktop/src/main/ipc/skillHandlers.ts:6ハンドラP42準拠バリデーション適用                                                                                                                                                                                                                                                                                                       |
| 6     | phase-6-test-expansion.md:テスト拡充仕様書, apps/desktop/src/main/ipc/**tests**/skillHandlers.execute.test.ts:TC-4-006テスト追加, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-6/coverage-gap-analysis.md:カバレッジ不足分析                                                                                                                                                              |
| 7     | phase-7-coverage-check.md:カバレッジ確認仕様書, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/verification-report.md:Line 71.8%, Branch 80.2%, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-7/coverage-results.md:Phase 7集計結果, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-7/gate-decision.md:ゲート判定                    |
| 8     | phase-8-refactoring.md:リファクタリング仕様書, 共通関数抽出不要と判断（6ハンドラの引数形式が異なるため）                                                                                                                                                                                                                                                                                                                  |
| 9     | phase-9-quality-assurance.md:品質保証仕様書, TypeCheck PASS, ESLint PASS, 181テスト全PASS, セキュリティ確認PASS                                                                                                                                                                                                                                                                                                           |
| 10    | phase-10-final-review.md:最終レビュー仕様書, PASS判定（MINOR 0件）, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-10/final-review-result.md:最終レビュー結果                                                                                                                                                                                                                               |
| 11    | phase-11-manual-test.md:手動テスト仕様書, worktree環境のため手動テスト代替検証完了, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-11/manual-test-summary.md:手動テスト結果                                                                                                                                                                                                                 |
| 12    | phase-12-documentation.md:ドキュメント仕様書, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/implementation-guide.md:実装ガイドPart1+Part2, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/documentation-changelog.md:全Step記録, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/unassigned-task-report.md:未タスク0件 |
| 13    | phase-13-pr-creation.md:PR作成仕様書（コミット準備、PR作成、CI確認）, docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-13/pr-info.md:PR未実施理由と引き継ぎ情報                                                                                                                                                                                                                               |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-02-24T01:24:34.384Z_

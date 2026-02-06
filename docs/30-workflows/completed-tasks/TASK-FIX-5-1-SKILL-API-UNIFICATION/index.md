# TASK-FIX-5-1-SKILL-API-UNIFICATION - タスク実行仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| 機能名     | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日     | 2026-02-05                         |
| ステータス | undefined                          |
| 総Phase数  | 13                                 |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 未実施     |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 未実施     |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 未実施     |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 未実施     |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 未実施     |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 未実施     |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 未実施     |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 未実施     |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 未実施     |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 未実施     |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 未実施     |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 未実施     |
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
  --workflow /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260205-220642-wt1/docs/30-workflows/TASK-FIX-5-1-SKILL-API-UNIFICATION --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                    |
| ----- | ------------------------------------------------------------- |
| 1     | API比較分析表, 呼び出し元マップ, 仕様書照合結果, 前提確認結果 |
| 2     | 統一API設計書, 移行計画書, 型変更設計書                       |
| 3     | 設計レビュー結果                                              |
| 4     | 統一APIユニットテスト, Red状態テスト結果                      |
| 5     | 統一SkillAPI実装, Green状態テスト結果                         |
| 6     | カバレッジレポート                                            |
| 7     | カバレッジ検証結果                                            |
| 8     | リファクタリング報告                                          |
| 9     | 品質レポート                                                  |
| 10    | 最終レビュー判定結果                                          |
| 11    | 手動テスト結果                                                |
| 12    | 実装ガイド, ドキュメント更新履歴, 未タスク検出レポート        |
| 13    | PR情報                                                        |

---

_このファイルは `generate-index.js` によって自動生成されました。_
_最終更新: 2026-02-05T22:57:40.547Z_

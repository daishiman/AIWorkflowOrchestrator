# UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001: SkillExecutionStatus型拡張のシステム仕様書同期

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001                         |
| タスク名     | SkillExecutionStatus型に3値追加後のシステム仕様書同期                    |
| タスク分類   | docs（仕様書同期）                                                       |
| 優先度       | 高                                                                       |
| 見積もり規模 | 小規模                                                                   |
| 作成日       | 2026-03-20                                                               |
| Issue        | [#1388](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1388) |
| 発見元       | Task12 仕様書作成時のシステム仕様書監査（2026-03-18）                    |
| 関連タスク   | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001（Task12）                     |

## 背景と目的

TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001（Task12）は SkillExecutionStatus 型に "review" / "improve_ready" / "reuse_ready" の3値を新規追加する設計が確定している。この型変更に対応するシステム仕様書の更新が先送りされており、P26（システム仕様書更新遅延）パターンの再発リスクがある。

本タスクは、Task12 の Phase 5 完了後に以下のシステム仕様書を確実に更新することを目的とする:

1. `interfaces-agent-sdk-integration.md` の SkillExecutionStatus テーブル（6値→9値）
2. `arch-state-management-core.md` の状態配置ルール追記（ReuseReady状態）
3. 関連する全仕様書の SkillExecutionStatus 参照箇所の整合性確認

## スコープ

| 含まれるもの                                         | 含まれないもの             |
| ---------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-integration.md の型テーブル更新 | プロダクションコードの変更 |
| arch-state-management-core.md の状態配置ルール追記   | Task12 の Phase 5 実装     |
| SkillExecutionStatus に関する全仕様書の grep 確認    | テストコードの変更         |
| topic-map.md の再生成                                | UI コンポーネントの変更    |

## 前提条件

- TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001 の Phase 5（実装）が完了していること
- `packages/shared/src/types/skill.ts` に3値が追加されていること

## 受入基準

- [ ] interfaces-agent-sdk-integration.md の SkillExecutionStatus テーブルに "review" / "improve_ready" / "reuse_ready" の3値が追記されている
- [ ] 各値の説明（意味、遷移条件）が明記されている
- [ ] arch-state-management-core.md に ReuseReady 状態の配置ルールが追記されている
- [ ] `grep -rn "SkillExecutionStatus" .claude/skills/` で全参照箇所が最新の9値定義と整合している
- [ ] topic-map.md が再生成されている

## Phase一覧

| Phase | 名称             | 仕様書                                                 | 状態    |
| ----- | ---------------- | ------------------------------------------------------ | ------- |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)     | pending |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                 | pending |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)   | pending |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)   | pending |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md) | pending |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md) | pending |
| 7     | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)             | pending |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)       | pending |
| 9     | 品質保証         | [phase-9-quality.md](phase-9-quality.md)               | pending |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)   | pending |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)     | pending |
| 12    | ドキュメント     | [phase-12-documentation.md](phase-12-documentation.md) | pending |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)     | pending |

## 参照資料

| 資料                                | パス                                                                                                                  | 用途           |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------- |
| 元タスク指示書                      | `docs/30-workflows/unassigned-task/task-lifecycle-execution-status-type-spec-sync-001.md`                             | タスク定義     |
| Task12 phase-2-design.md            | `docs/30-workflows/skill-lifecycle-unification/tasks/step-08-seq-task-12-reuse-improve-state-cycle/phase-2-design.md` | 型拡張設計     |
| interfaces-agent-sdk-integration.md | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md`                               | 更新対象       |
| arch-state-management-core.md       | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md`                                     | 更新対象       |
| lessons-learned P64/P65             | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                        | 苦戦箇所の教訓 |

# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 9                                                                        |
| Phase名    | 品質保証                                                                 |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 8                                                                  |
| 後続Phase  | Phase 10                                                                 |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

guard が docs-only parent workflow 向けに閉じており、不要な副作用を持たないことを確認する。deterministic execution、scope discipline、再現性の 3 点を品質軸にする。

## 実行タスク

- Reviewer-A: deterministic execution を確認する
- Reviewer-B: scope discipline と副作用の有無を確認する
- Reviewer-C: Phase 12 sync の再現性を確認する
- Lead: 品質判定と残リスクを整理する

## 参照資料

| 参照資料       | パス                                  | 説明           |
| -------------- | ------------------------------------- | -------------- |
| Phase 5成果物  | `outputs/phase-5/impact-analysis.md`  | 実装差分の確認 |
| Phase 8        | `phase-8-refactoring.md`              | 最終構造       |
| リファクタログ | `outputs/phase-8/refactoring-log.md`  | 品質評価の前提 |
| 回帰確認       | `outputs/phase-8/regression-check.md` | 品質評価の前提 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容                    |
| -------------------- | --------------------------------------------------------------------------- | ----------------------- |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 品質評価基準            |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`        | Phase 12 同期の完成条件 |
| error-handling       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | fail-fast 振る舞い      |

## 統合テスト連携

- deterministic execution を command transcript へ落とす
- scope discipline は diff summary と変更対象一覧で確認する
- Phase 10 の最終レビューに残リスクを引き継ぐ

## 成果物

| 成果物       | パス                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| 品質レポート | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-9/quality-report.md`      |
| 再現性ログ   | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-9/reproducibility-log.md` |
| 運用評価     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-9/operation-readiness.md` |

## 完了条件

- [x] deterministic execution の確認結果がある
- [x] child workflow UI 実装へ scope が広がっていない確認結果がある
- [x] Phase 12 sync の再現性確認結果がある
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 10: 最終レビューへ進む。

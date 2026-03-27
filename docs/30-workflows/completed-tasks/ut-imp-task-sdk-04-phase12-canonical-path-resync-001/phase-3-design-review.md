# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 3                                                    |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

Phase 1 と Phase 2 の設計が docs-only remediation として閉じているかを判定し、Phase 4 以降へ進める条件を固定する。

## 実行タスク

- Phase 1 の acceptance をレビューする
- Phase 2 の lane 設計をレビューする
- code change を持ち込まない境界をレビューする
- follow-up 導線の重複有無をレビューする

## 参照資料

| 資料名         | パス                                              | 説明                        |
| -------------- | ------------------------------------------------- | --------------------------- |
| Phase 1 要件   | `phase-1-requirements.md`                         | acceptance の妥当性         |
| Phase 2 設計   | `phase-2-design.md`                               | remediation lane の妥当性   |
| Phase 2 成果物 | `outputs/phase-2/stale-evidence-audit-matrix.md`  | 更新対象の妥当性            |
| Phase 2 判断   | `outputs/phase-2/completed-judgement-decision.md` | `spec_created` 判断の妥当性 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                              |
| ---------------- | ------------------------------------------------------------------------------------------------- | --------------------------------- |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | completed-tasks close-out の基準  |
| Phase 12 lessons | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | stale evidence remediation の基準 |

## 成果物

| 成果物             | パス                                    | 説明                   |
| ------------------ | --------------------------------------- | ---------------------- |
| design review gate | `outputs/phase-3/design-review-gate.md` | Phase 4 進行可否の記録 |

## 統合テスト連携

- Phase 4 は `outputs/phase-3/design-review-gate.md` の PASS 条件を test matrix の gate 観点へ写像する。
- Phase 10 は Phase 3 の blocker 判定が崩れていないかを再確認する。

## 完了条件

- [ ] Phase 1 と Phase 2 の参照が current fact に閉じている
- [ ] docs-only remediation の境界が明記されている
- [ ] follow-up 重複を増やさない設計になっている
- [ ] Phase 4 へ渡す検証観点が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

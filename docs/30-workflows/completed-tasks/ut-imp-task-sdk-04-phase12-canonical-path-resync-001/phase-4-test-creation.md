# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 4                                                    |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

Phase 1、Phase 2、Phase 3 の設計を validator と grep へ写像し、close-out 是正の検証観点を固定する。

## 実行タスク

- old path 0 hit テストを作成する
- validator path current 化テストを作成する
- `spec_created` judgement 一貫性テストを作成する
- follow-up 導線一貫性テストを作成する

## 参照資料

| 資料名            | パス                                              | 説明                    |
| ----------------- | ------------------------------------------------- | ----------------------- |
| Phase 1 要件      | `phase-1-requirements.md`                         | acceptance              |
| Phase 2 設計      | `phase-2-design.md`                               | lane 設計               |
| Phase 3 レビュー  | `phase-3-design-review.md`                        | gate 条件               |
| Phase 2 audit     | `outputs/phase-2/stale-evidence-audit-matrix.md`  | 旧 path と更新対象      |
| Phase 2 judgement | `outputs/phase-2/completed-judgement-decision.md` | `spec_created` 維持判断 |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                               |
| ---------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| backlog current  | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                      | follow-up 導線確認                 |
| Phase 12 lessons | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | stale evidence と validator の運用 |

## 成果物

| 成果物      | パス                             | 説明                       |
| ----------- | -------------------------------- | -------------------------- |
| test matrix | `outputs/phase-4/test-matrix.md` | コマンド、期待値、確認観点 |

## 統合テスト連携

- Phase 5 は `outputs/phase-4/test-matrix.md` に従って parent workflow の close-out 4 点を更新する。
- Phase 9 は Phase 4 の expected result を validator 実測値と比較する。

## 完了条件

- [ ] old path 0 hit 観点がある
- [ ] `validate-phase-output` と `verify-all-specs` の current path 観点がある
- [ ] `spec_created` judgement と follow-up 導線の一致確認観点がある
- [ ] Phase 5 へ渡す更新対象ファイルが固定されている
- [ ] **本Phase内の全タスクを100%実行完了**

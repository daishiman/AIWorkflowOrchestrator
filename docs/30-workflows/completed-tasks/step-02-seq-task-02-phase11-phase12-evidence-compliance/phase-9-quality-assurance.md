# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 9                                                          |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

docs-only task として必要な quality gate を一括判定する。

## 実行タスク

- 4 validator を再実行する
- unassigned task 検出を確認する
- 参照パスと成果物名の不整合を確認する

## 参照資料

| 資料名                 | パス                                            | 説明             |
| ---------------------- | ----------------------------------------------- | ---------------- |
| Phase 4 command matrix | `outputs/phase-4/validation-command-matrix.md`  | 実行コマンド正本 |
| Phase 5 change plan    | `outputs/phase-5/change-plan.md`                | 更新対象の正本   |
| Phase 6 rerun plan     | `outputs/phase-6/validator-rerun-plan.md`       | 再実行順序       |
| Phase 8 normalization  | `outputs/phase-8/content-normalization-plan.md` | wording 確認     |

## 実行手順

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/step-02-seq-task-02-phase11-phase12-evidence-compliance
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-02-seq-task-02-phase11-phase12-evidence-compliance --json
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/step-02-seq-task-02-phase11-phase12-evidence-compliance --json
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/step-02-seq-task-02-phase11-phase12-evidence-compliance --json
```

## 統合テスト連携

`validate-phase11-screenshot-coverage.js` と `validate-phase12-implementation-guide.js` を合わせて再実行し、Phase 11 / 12 の quality gate を QA 結果へ残す。

## 成果物

| 成果物         | パス                                | 説明             |
| -------------- | ----------------------------------- | ---------------- |
| qa gate report | `outputs/phase-9/qa-gate-report.md` | 実行結果と残課題 |

## 完了条件

- [ ] spec validator が PASS
- [ ] cross-phase validator が PASS
- [ ] 残課題があれば blocker / non-blocker に分離済み
- [ ] **本Phase内の全タスクを100%実行完了**

# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 7                                                          |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

AC-1〜AC-8 がどの文書・validator・manual review で担保されるかを可視化する。

## 実行タスク

- AC と更新ファイルの対応を作る
- AC と validator / human review の対応を作る

## 参照資料

| 資料名                       | パス                                      | 説明                |
| ---------------------------- | ----------------------------------------- | ------------------- |
| Phase 1 requirements         | `outputs/phase-1/requirements.md`         | AC 正本             |
| Phase 5 evidence linkage     | `outputs/phase-5/evidence-linkage-map.md` | TC-ID と成果物対応  |
| Phase 4 tc coverage          | `outputs/phase-4/tc-coverage-plan.md`     | TC 一覧             |
| Phase 6 regression checklist | `outputs/phase-6/regression-checklist.md` | fail path 一覧      |
| Phase 11 spec                | `phase-11-manual-test.md`                 | evidence contract   |
| Phase 12 spec                | `phase-12-documentation.md`               | completion contract |

## 統合テスト連携

coverage の単位はコードではなく docs 要件である。よって `AC -> artifact -> verification` の 3列で確認する。

## 4条件カバレッジ

| 条件   | 主担当 artifact                                                  | 主確認手段                   |
| ------ | ---------------------------------------------------------------- | ---------------------------- |
| 価値性 | `phase-12-documentation.md`, `implementation-guide.md`           | human review                 |
| 実現性 | `change-plan.md`, `validator-rerun-plan.md`                      | Phase 5 / 6                  |
| 整合性 | `coverage-audit.md`, `qa-gate-report.md`                         | `verify-all-specs.js --json` |
| 運用性 | `manual-test-result.md`, `phase12-task-spec-compliance-check.md` | Phase 11 / 12 review         |

## 成果物

| 成果物         | パス                                | 説明      |
| -------------- | ----------------------------------- | --------- |
| coverage audit | `outputs/phase-7/coverage-audit.md` | AC 対応表 |

## 完了条件

- [ ] AC-1〜AC-8 の対応表を作成済み
- [ ] validator と human review の重複 / 欠落を確認済み
- [ ] **本Phase内の全タスクを100%実行完了**

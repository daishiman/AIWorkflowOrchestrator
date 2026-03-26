# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 4                                                          |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

Phase 11 / 12 の docs 是正を検証する command matrix と testcase matrix を先に作る。

## 実行タスク

- validator command matrix を作成する
- manual test の TC-ID 設計を作成する
- compliance 文書の確認観点を列挙する

## 参照資料

| 資料名           | パス                                                                                                                                | 説明        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| issue 原票       | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-02-phase11-phase12-evidence-compliance-001.md`                 | 是正項目    |
| 親 Phase 11 / 12 | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-11-manual-test.md` / `phase-12-documentation.md` | 更新対象    |
| Phase 2 設計     | `outputs/phase-2/remediation-lane-plan.md`                                                                                          | lane 順序   |
| Phase 3 レビュー | `outputs/phase-3/design-review-result.md`                                                                                           | review 指摘 |

## 実行手順

1. `validate-phase-output.js`
2. `verify-all-specs.js --json`
3. `validate-phase11-screenshot-coverage.js --json`
4. `validate-phase12-implementation-guide.js --json`
5. `audit-unassigned-tasks.js --json --target-file ...`

### テストケース

- TC-11-01: visual / non-visual 判定が明示されている
- TC-11-02: `## テストケース` がある
- TC-11-03: `## 画面カバレッジマトリクス` がある
- TC-11-04: `manual-test-checklist.md` に TC-ID が載る
- TC-11-05: `manual-test-result.md` に evidence path が載る
- TC-12-01: implementation guide に Part 1 / Part 2 がある
- TC-12-02: Part 1 が why-first / 例え話を含む
- TC-12-03: Part 2 が型 / API / エラー / 設定一覧を含む
- TC-12-04: compliance check が Task 12-1〜12-5 の内容完了を確認する
- TC-12-05: changelog / feedback / unassigned detection の役割が分離されている

## 統合テスト連携

validator 群を Phase 4 で先に固定し、Phase 5 以降で文書更新のたびに再利用する。

## 成果物

| 成果物                    | パス                                           | 説明               |
| ------------------------- | ---------------------------------------------- | ------------------ |
| validation command matrix | `outputs/phase-4/validation-command-matrix.md` | コマンド一覧       |
| tc coverage plan          | `outputs/phase-4/tc-coverage-plan.md`          | TC-11 / TC-12 一覧 |

## 完了条件

- [ ] validator command matrix を作成済み
- [ ] TC-11 / TC-12 を定義済み
- [ ] docs 更新後に何を再実行するか明確である
- [ ] **本Phase内の全タスクを100%実行完了**

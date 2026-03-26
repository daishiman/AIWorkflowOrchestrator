# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 11                                                         |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |

## 目的

`TASK-SDK-02` の Phase 11 成果物が、人手レビューで追跡可能な証跡セットになっていることを確認する。

## 実行タスク

- visual / non-visual を判定する
- `## テストケース` を current workflow に定義する
- `## 画面カバレッジマトリクス` を current workflow に定義する
- `manual-test-checklist.md` と `manual-test-result.md` を TC-ID ベースへ更新する
- screenshot plan / metadata の current 化を行う

## 参照資料

| 資料名                    | パス                                                                                                                | 説明             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 親 Phase 11               | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/phase-11-manual-test.md`               | 是正対象         |
| 親 outputs phase-11       | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-11/`                     | 現行証跡         |
| issue 原票                | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task-sdk-02-phase11-phase12-evidence-compliance-001.md` | 指摘事項         |
| Phase 2 evidence decision | `outputs/phase-2/evidence-decision-record.md`                                                                       | 判定基準         |
| Phase 5 evidence linkage  | `outputs/phase-5/evidence-linkage-map.md`                                                                           | TC-ID 紐付け     |
| Phase 6 rerun plan        | `outputs/phase-6/validator-rerun-plan.md`                                                                           | validator 実行順 |
| Phase 7 coverage audit    | `outputs/phase-7/coverage-audit.md`                                                                                 | AC との対応      |
| Phase 8 normalization     | `outputs/phase-8/content-normalization-plan.md`                                                                     | wording 整理     |
| Phase 9 QA                | `outputs/phase-9/qa-gate-report.md`                                                                                 | quality gate     |
| Phase 10 review           | `outputs/phase-10/final-review-summary.md`                                                                          | 最終判定         |

## 実行手順

### ステップ1: visual / non-visual 判定

- UI の見た目確認が受入基準に必須である場合は visual。
- そうでない場合は、non-visual 根拠を `manual-test-result.md` と metadata に残す。
- placeholder を evidence として使わない。

### ステップ2: テストケースを固定する

`phase-11-manual-test.md` に次の節を必須追加する。

- `## テストケース`
- `## 画面カバレッジマトリクス`

### ステップ3: TC-ID と証跡を結び付ける

`manual-test-checklist.md` と `manual-test-result.md` に最低でも次を持たせる。

- `TC-ID`
- `テスト観点`
- `evidence path`
- `PASS / FAIL / NON_VISUAL`
- `備考`

## テストケース

| テストケース | 観点                     | 期待結果                             |
| ------------ | ------------------------ | ------------------------------------ |
| TC-11-01     | visual / non-visual 判定 | 判定理由が残る                       |
| TC-11-02     | testcase 節              | `## テストケース` がある             |
| TC-11-03     | coverage matrix 節       | `## 画面カバレッジマトリクス` がある |
| TC-11-04     | checklist                | TC-ID 列がある                       |
| TC-11-05     | result                   | evidence path が追跡できる           |

## 画面カバレッジマトリクス

| テストケース | 対象画面 / 文書 | 証跡                                    | 備考               |
| ------------ | --------------- | --------------------------------------- | ------------------ |
| TC-11-01     | visual 判定記録 | `manual-test-result.md` または metadata | 判定理由必須       |
| TC-11-02     | testcase 定義   | `phase-11-manual-test.md`               | 見出し必須         |
| TC-11-03     | coverage matrix | `phase-11-manual-test.md`               | 見出し必須         |
| TC-11-04     | checklist       | `manual-test-checklist.md`              | TC-ID 列必須       |
| TC-11-05     | result          | `manual-test-result.md`                 | evidence path 必須 |

## 統合テスト連携

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/step-02-seq-task-02-phase11-phase12-evidence-compliance --json
```

## 成果物

| 成果物           | パス                                             | 説明                                    |
| ---------------- | ------------------------------------------------ | --------------------------------------- |
| manual checklist | `outputs/phase-11/manual-test-checklist.md`      | TC-ID 確認表                            |
| manual result    | `outputs/phase-11/manual-test-result.md`         | 証跡結果                                |
| screenshot plan  | `outputs/phase-11/screenshot-plan.json`          | capture plan                            |
| capture metadata | `outputs/phase-11/phase11-capture-metadata.json` | current evidence の補足                 |
| screenshots      | `outputs/phase-11/screenshots/`                  | visual 判定時の representative evidence |

## 完了条件

- [ ] visual / non-visual 判定が明記されている
- [ ] `## テストケース` が定義されている
- [ ] `## 画面カバレッジマトリクス` が定義されている
- [ ] TC-ID と evidence path の紐付けルールが定義されている
- [ ] placeholder evidence を current workflow に残さない
- [ ] **本Phase内の全タスクを100%実行完了**

# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| Phase      | 13                                                         |
| タスクID   | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名     | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日     | 2026-03-26                                                 |
| ステータス | blocked                                                    |

## 目的

ユーザーが明示承認した場合のみ、PR 準備に進む条件を定義する。

## 実行タスク

- Phase 1〜12 の完了証跡を整理する
- blocked 条件を再確認する
- commit / PR はユーザー承認があるまで実行しない

## 参照資料

| 資料名                       | パス                                            | 説明                 |
| ---------------------------- | ----------------------------------------------- | -------------------- |
| Phase 2 evidence decision    | `outputs/phase-2/evidence-decision-record.md`   | evidence gate の前提 |
| Phase 5 change plan          | `outputs/phase-5/change-plan.md`                | 実更新対象の正本     |
| Phase 6 rerun plan           | `outputs/phase-6/validator-rerun-plan.md`       | validator 完了条件   |
| Phase 7 coverage audit       | `outputs/phase-7/coverage-audit.md`             | AC 対応の最終表      |
| Phase 8 normalization        | `outputs/phase-8/content-normalization-plan.md` | wording 整理結果     |
| Phase 9 qa gate report       | `outputs/phase-9/qa-gate-report.md`             | quality gate         |
| Phase 10 final review        | `outputs/phase-10/final-review-summary.md`      | blocker 判定         |
| Phase 10 blocker disposition | `outputs/phase-10/blocker-disposition.md`       | blocked 理由         |
| Phase 11 / 12 outputs        | `outputs/phase-11/` / `outputs/phase-12/`       | 完了証跡             |

## blocked 条件

- ユーザー承認なし
- Phase 10 blocker が残っている
- Phase 11 / 12 validator のいずれかが未達

## 成果物

| 成果物     | パス                             | 説明           |
| ---------- | -------------------------------- | -------------- |
| PR summary | `outputs/phase-13/pr-summary.md` | 承認後のみ作成 |

## 完了条件

- [ ] ユーザーが commit / PR を明示承認した
- [ ] blocker が 0 である
- [ ] それまでは blocked を維持する

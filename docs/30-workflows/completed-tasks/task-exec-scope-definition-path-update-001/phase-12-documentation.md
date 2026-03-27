# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 12                                         |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

docs-only follow-up の close-out を、implementation guide、summary、no-op 理由、未タスク有無まで含めて監査可能にする。

## 実行タスク

- implementation guide を Part 1 / Part 2 で作成する
- system spec update summary に Step 1 と Step 2 no-op 条件を書く
- documentation changelog を作成する
- unassigned task detection を作成する
- skill feedback report を作成する
- compliance check を作成する

## 参照資料

| 資料名                | パス                                                                                   | 説明                 |
| --------------------- | -------------------------------------------------------------------------------------- | -------------------- |
| Phase 1               | `phase-1-requirements.md`                                                              | why / scope          |
| Phase 2               | `phase-2-design.md`                                                                    | target path          |
| Phase 5               | `phase-5-implementation.md`                                                            | patch 順             |
| Phase 6 repeatability | `outputs/phase-6/repeatability-notes.md`                                               | 再実行時の注意       |
| Phase 7 coverage      | `outputs/phase-7/evidence-traceability.md`                                             | evidence の根拠      |
| Phase 8 wording       | `outputs/phase-8/wording-normalization.md`                                             | close-out 文言の統一 |
| Phase 9               | `phase-9-quality-assurance.md`                                                         | risk / no-op         |
| Phase 10 final result | `outputs/phase-10/final-review-result.md`                                              | close-out 判定       |
| Phase 11              | `phase-11-manual-test.md`                                                              | human audit          |
| guide                 | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | 必須構造             |
| spec update workflow  | `.agents/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1 / Step 2      |

## 成果物

| 成果物                     | パス                                                     | 説明            |
| -------------------------- | -------------------------------------------------------- | --------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | sync / no-op    |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 更新履歴        |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 判定  |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | skill 改善点    |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 完了確認        |

## 前Phase成果物の再利用

- Phase 4 の command suite を implementation guide Part 2 の検証節へ流用する
- Phase 9 の no-op / risk を summary と changelog へ転記する
- Phase 11 の human audit を compliance check の根拠に使う

## 完了条件

- [x] Phase 12 必須 6 成果物が定義されている
- [x] Step 2 no-op 条件が明記されている
- [x] duplicate source / ID collision を未タスク化しない条件が明記されている
- [x] `.claude` 正本の system spec / skill を更新し、`.agents` mirror parity まで確認した
- [x] **本Phase内の全タスクを100%実行完了**

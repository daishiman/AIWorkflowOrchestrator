# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 12                                                   |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

失敗系 lifecycle の実装ガイド、system spec 同期先、未タスク判定を Phase 12 必須成果物として固定する。

## 実行タスク

- implementation guide を 2 パート構成で作成する
- system spec update summary に同期先と no-op 条件を記録する
- documentation changelog を作成する
- unassigned task detection を作成する
- skill feedback report を作成する
- phase12 compliance check を作成する

## 参照資料

| 資料名   | パス                           | 説明                     |
| -------- | ------------------------------ | ------------------------ |
| Phase 1  | `phase-1-requirements.md`      | why / what               |
| Phase 2  | `phase-2-design.md`            | transition / append 決定 |
| Phase 5  | `phase-5-implementation.md`    | 想定変更点               |
| Phase 9  | `phase-9-quality-assurance.md` | 同期観点                 |
| Phase 11 | `phase-11-manual-test.md`      | 手動確認観点             |

## 成果物

| 成果物                     | パス                                                     | 説明                    |
| -------------------------- | -------------------------------------------------------- | ----------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | 初学者向け + 技術者向け |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | 同期先一覧              |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴                |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク有無            |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | skill 改善提案          |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認       |

### 前Phase成果物の再利用

- Phase 6: `phase-6-test-expansion.md` の edge case を unassigned 判定の入力に使う。
- Phase 7: `phase-7-coverage-check.md` の concern coverage を implementation guide の Part 2 補足に反映する。
- Phase 8: `phase-8-refactoring.md` の helper / accessor 境界を system spec 同期根拠へ使う。
- Phase 10: `phase-10-final-review.md` の Go / Hold 判定を compliance check の根拠へ使う。

## 完了条件

- [ ] Phase 12 必須 6 成果物が揃っている
- [ ] system spec 同期先と no-op 条件が明記されている
- [ ] 未タスク 0 件でも記録する方針が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

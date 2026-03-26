# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                              |
| ---------- | --------------------------------------------------------------------------------- |
| タスクID   | TASK-SDK-01                                                                       |
| Phase      | 12                                                                                |
| Phase名    | ドキュメント更新                                                                  |
| ステータス | completed                                                                         |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11 |
| 後続Phase  | Phase 13                                                                          |
| 作成日     | 2026-03-26                                                                        |

## 目的

Phase 12 の必須 5 タスクを manifest foundation 用に定義し、implementation guide、system spec sync、changelog、unassigned-task、skill feedback の出力先を固定する。docs-only task でも Step 1-A〜Step 2 を未完了表現なしで閉じられるよう、same-wave sync の責務を ledger / contract / discovery の3層で固定する。

## 実行タスク

- Task 12-1 implementation guide 作成: Part 1 は非技術者向け、Part 2 は実装者向けで書く
- Task 12-2 system spec sync 実施: Step 1-A〜1-C と条件付き Step 2 を ledger / contract / discovery の3層で閉じる
- Task 12-3 documentation changelog 作成: 変更点、validator 結果、4点同期結果を事後記録する
- Task 12-4 unassigned-task detection 実施: 0件でも report を出し、1件以上なら global canonical path へ formalize する
- Task 12-5 skill feedback report 作成: task-specification-creator と aiworkflow-requirements への改善点を記録する

## 参照資料

| 資料名   | パス                           | 説明                     |
| -------- | ------------------------------ | ------------------------ |
| Phase 1  | `phase-1-requirements.md`      | Why の再確認             |
| Phase 2  | `phase-2-design.md`            | schema / loader の説明元 |
| Phase 5  | `phase-5-implementation.md`    | 実装対象の説明元         |
| Phase 7  | `phase-7-coverage-check.md`    | AC trace の説明元        |
| Phase 9  | `phase-9-quality-assurance.md` | sync checklist           |
| Phase 10 | `phase-10-final-review.md`     | final gate               |
| Phase 11 | `phase-11-manual-test.md`      | manual issue             |

### システム仕様（aiworkflow-requirements）

| 参照資料                                   | パス                                                                                              | 内容                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| task-workflow                              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                              | 台帳正本の親入口                                        |
| task-workflow-completed                    | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | completed family の着地先                               |
| lessons-learned                            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                            | lessons family の親入口                                 |
| lessons-learned-phase12-workflow-lifecycle | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | Phase 12 / docs-only 再発防止                           |
| arch-electron-services-details-part2       | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`       | `RuntimeSkillCreatorFacade` と loader 境界の同期先      |
| arch-execution-capability-contract         | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`         | authority 非委譲の同期先                                |
| security-electron-ipc                      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                      | preload / main boundary の条件付き同期先                |
| api-ipc-system-core                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                        | public IPC 契約が増減した場合のみ更新する条件付き同期先 |
| resource-map                               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                  | current canonical set の discovery 入口                 |
| topic-map                                  | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                     | same-wave index 再生成対象                              |
| phase-11-12-guide                          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                       | Phase 12 必須タスク                                     |
| spec-update-workflow                       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                    | Step 1 / Step 2 手順                                    |
| unassigned-task-guidelines                 | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`              | 未タスク formalize ルール                               |

## 実行手順

1. implementation guide の Part 1 では「レシピの目次を別紙に分ける」比喩で manifest の役割を説明する。
2. Part 2 では schema field、loader boundary、cache invalidation、downstream handoff を技術者向けに説明する。
3. Task 12-2 Step 1-A は ledger sync として `task-workflow-completed*` と `lessons-learned*`、`LOGS.md`、必要なら `SKILL.md` の更新対象を先に確定する。
4. Task 12-2 Step 1-B は implementation task として `completed` を実装状況テーブルへ反映し、Phase 13 の `blocked` と混同しない。
5. Task 12-2 Step 1-C は関連タスク / 未タスク候補テーブルを grep で洗い、`docs/30-workflows/unassigned-task/` への formalize 要否を判断する。
6. Task 12-2 Step 2 は contract sync として `arch-electron-services-details-part2.md`、`arch-execution-capability-contract.md` を主対象にし、`security-electron-ipc.md` と `api-ipc-system-core.md` は public contract 変更時のみ更新する。
7. Task 12-2 の最後に discovery sync として `resource-map.md` を参照し、`topic-map.md` と関連 index を再生成して current canonical set を更新する。
8. Task 12-3 では `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の4点同期結果、validator 結果、mirror policy を事後記録する。
9. Task 12-4 の unassigned-task detection は 0 件でも report を残し、1 件以上なら global canonical path と関連 spec 追記を同ターンで閉じる。
10. Task 12-5 の skill feedback は改善点が 0 件でも report を残し、30種思考法のうち再利用価値が高い論点を next action へ要約する。

## 統合テスト連携

- Phase 9 の spec-sync-checklist を実更新順へ変換し、Phase 12 summary と一致させる。
- Phase 10 の open decision を changelog と unassigned-task detection に二重転記しない。
- Phase 11 の discovered-issues は Step 1-A と Task 4 の入力に限定し、未整理のまま system spec へ流さない。

## 成果物

| 成果物                             | パス                                                     | 説明                                          |
| ---------------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| implementation-guide               | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 ガイド                        |
| system-spec-update-summary         | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C / Step 2 の same-wave sync 結果 |
| documentation-changelog            | `outputs/phase-12/documentation-changelog.md`            | 更新履歴と validator / 4点同期結果            |
| unassigned-task-detection          | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出結果                              |
| skill-feedback-report              | `outputs/phase-12/skill-feedback-report.md`              | skill 改善提案                                |
| phase12-task-spec-compliance-check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須5タスクの完了確認                         |

## 完了条件

- [x] implementation-guide が Part 1 と Part 2 の2部構成で定義されている
- [x] system spec sync が ledger / contract / discovery の3層で記録されている
- [x] `task-workflow-completed*` と `lessons-learned*` の着地先が特定されている
- [x] `arch-electron-services-details-part2.md` と `arch-execution-capability-contract.md` が主同期先として記録されている
- [x] `api-ipc-system-core.md` が条件付き同期先として整理されている
- [x] `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の4点同期が changelog 対象になっている
- [x] unassigned-task detection が 0 件でも report 出力対象になっている
- [x] skill-feedback-report が改善点 0 件でも出力対象になっている
- [x] **本Phase内の全タスクを100%実行完了**

## 多角的チェック観点

| 観点       | このPhaseでの確認内容                                           | 根拠                               |
| ---------- | --------------------------------------------------------------- | ---------------------------------- |
| 演繹思考   | 必須 5 タスクが成果物へ 1:1 で落ちているか                      | phase-12-documentation / artifacts |
| MECE       | Step 1 と Step 2、guide と system spec sync が混ざっていないか  | spec-update-workflow               |
| 戦略的思考 | 初回価値で閉じる同期先と follow-up に回す同期先が分かれているか | system-spec-update-summary         |

## サブタスク管理

1. implementation guide の構成固定
2. system spec sync 先の確定
3. changelog / unassigned / feedback の出力
4. artifacts と outputs の同期
5. 完了条件の検証

## タスク100%実行確認

- [x] Task 12-1〜12-5 の成果物名が本文と `artifacts.json` で一致している
- [x] `outputs/artifacts.json` が root `artifacts.json` と一致している
- [x] Step 1 / Step 2 の判断根拠を summary 側へ残した
- [x] 未完了表現を残していない
- [x] Phase 13 を `blocked` のまま維持した

## 次のPhase

Phase 13: PR作成

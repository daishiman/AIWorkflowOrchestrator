# Phase 2: 設計

## メタ情報

| 項目     | 値                                                         |
| -------- | ---------------------------------------------------------- |
| Phase    | 2                                                          |
| タスクID | UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 |
| 機能名   | task-sdk-02-phase11-phase12-evidence-compliance            |
| 作成日   | 2026-03-26                                                 |
| 前Phase  | [Phase 1: 要件定義](./phase-1-requirements.md)             |

## 目的

Phase 11 と Phase 12 の是正を、依存関係が崩れない順序と lane に分けて設計する。

## 実行タスク

- remediation lane を設計する
- visual / non-visual 判定フローを設計する
- current workflow 更新対象を phase 単位で固定する
- validator 実行タイミングを設計する

## 参照資料

| 資料名              | パス                                                                                            | 説明             |
| ------------------- | ----------------------------------------------------------------------------------------------- | ---------------- |
| Phase 1 要件        | `outputs/phase-1/requirements.md`                                                               | 固定済み要件     |
| 親 workflow index   | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md`          | 更新対象全体     |
| 親 outputs phase-11 | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-11/` | 現行証跡         |
| 親 outputs phase-12 | `docs/30-workflows/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-12/` | 現行 docs 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                                                 | パス                                                                                                            | 内容                      |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------- |
| api-ipc-system-core                                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | Task02 の public surface  |
| architecture-overview-core                               | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`                               | parent contract           |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | stale docs 再発防止       |
| task-workflow-completed                                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                                  | completed ledger の親事実 |

## remediation lane 設計

| Lane   | 順序      | 責務                                                  | 主成果物                                                                                        |
| ------ | --------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Lane A | 先行      | Phase 11 判定と testcase/coverage/evidence 骨格の是正 | `phase-11-manual-test.md`, `manual-test-checklist.md`, `manual-test-result.md`                  |
| Lane B | Lane A 後 | Phase 12 6成果物の役割再定義                          | `phase-12-documentation.md`, `implementation-guide.md`, `phase12-task-spec-compliance-check.md` |
| Lane C | 最後      | validator 再実行と close 条件固定                     | changelog, compliance check, final review                                                       |

## 破棄判断

- runtime 実装や親 workflow 全体を破棄する必要はない
- ただし Phase 11 / 12 の close-out 設計は patch ではなく、責務境界から再構成する
- よって「実装は温存、documentation contract は再設計」が最小複雑性の解である

## visual / non-visual 判定設計

1. まず current workflow が UI state を人に見せて判断させる task かを確認する。
2. 見せる必要があるなら visual 扱いに昇格し、`TC-ID -> png` を必須化する。
3. 非視覚で閉じる場合も、`なぜ screenshot が不要か` を `manual-test-result.md` と metadata に残す。
4. placeholder を current evidence として残すことは禁止する。

## 更新対象ファイル設計

| グループ        | 対象                                                                      | 更新内容                                           |
| --------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| Phase spec      | `phase-11-manual-test.md`                                                 | testcase / matrix / decision gate を追加           |
| Phase spec      | `phase-12-documentation.md`                                               | 6成果物の役割差分と Task 12-1〜12-5 完了条件を追加 |
| Phase 11 output | `outputs/phase-11/manual-test-checklist.md`                               | TC-ID ベースへ再編                                 |
| Phase 11 output | `outputs/phase-11/manual-test-result.md`                                  | evidence path と理由を固定                         |
| Phase 11 output | `outputs/phase-11/screenshot-plan.json` / `phase11-capture-metadata.json` | capture policy の current 化                       |
| Phase 12 output | `outputs/phase-12/implementation-guide.md`                                | Part 1 / Part 2 必須骨格へ更新                     |
| Phase 12 output | `outputs/phase-12/documentation-changelog.md`                             | 実更新のみ記録                                     |
| Phase 12 output | `outputs/phase-12/skill-feedback-report.md`                               | next action 追加                                   |
| Phase 12 output | `outputs/phase-12/phase12-task-spec-compliance-check.md`                  | 内容完了ベース判定へ更新                           |

## validator 実行設計

| タイミング | コマンド                                   | 目的               |
| ---------- | ------------------------------------------ | ------------------ |
| Phase 4    | `validate-phase-output.js`                 | spec 骨格確認      |
| Phase 6    | `validate-phase11-screenshot-coverage.js`  | coverage 事前確認  |
| Phase 6    | `validate-phase12-implementation-guide.js` | guide 骨格確認     |
| Phase 9    | `verify-all-specs.js --json`               | cross-phase 整合性 |
| Phase 10   | 上記 4 コマンド再実行                      | release gate       |

## 2軸設計マトリクス

| 変更対象                               | 設計強度                               |
| -------------------------------------- | -------------------------------------- |
| current workflow Phase 11 / 12 本文    | 強い是正。契約そのものを再定義する     |
| outputs/phase-11 / outputs/phase-12    | 中程度の是正。本文契約に従って整列する |
| aiworkflow-requirements same-wave 判定 | 条件付き是正。Step 2 要否を明文化する  |
| runtime 実装                           | 非対象。親 workflow の責務に留める     |

## 責務境界と因果

| 観点               | 設計判断                                                      |
| ------------------ | ------------------------------------------------------------- |
| validator          | 構造・literal・リンク整合を確認する                           |
| human review       | why-first / evidence quality / no-op 理由の妥当性を確認する   |
| 強化ループ対策     | Lane C を最後に固定し、存在確認だけの PASS を防ぐ             |
| バランスループ対策 | Lane A/B の不足を Lane C で露出させ、再修正へ戻せる構造にする |

## 統合テスト連携

本 task は docs-only だが、manual test evidence と validator pass が結合ゲートの役割を担う。よって `validator pass` と `human review pass` の 2 系統を両方残す。

## 成果物

| 成果物                   | パス                                          | 説明                         |
| ------------------------ | --------------------------------------------- | ---------------------------- |
| remediation lane plan    | `outputs/phase-2/remediation-lane-plan.md`    | Lane A/B/C の順序            |
| evidence decision record | `outputs/phase-2/evidence-decision-record.md` | visual / non-visual 判定基準 |

## 完了条件

- [ ] Lane A/B/C を定義済み
- [ ] visual / non-visual 判定フローを定義済み
- [ ] 更新対象ファイルを固定済み
- [ ] validator 実行タイミングを定義済み
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 3: 設計レビュー（[phase-3-design-review.md](./phase-3-design-review.md)）

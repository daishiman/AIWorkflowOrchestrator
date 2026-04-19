# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 12                                |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 11                          |
| 後続Phase  | Phase 13                          |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

canonical 6成果物を揃え、task-specification-creator と aiworkflow-requirements の両基準に対する close-out を完了する。

## 背景

本 task は `NON_VISUAL` かつ cancel chain の Main 層更新を扱うため、Phase 12 では implementation guide、spec update judgment、changelog、未タスク検出、feedback、compliance check の6成果物を厳密なファイル名で揃える必要がある。

## 実行タスク

### タスク1: implementation guide 作成

**目的**: Part 1 / Part 2 の2部構成で close-out の一次説明を残す。

**実行手順**:

1. Part 1 では中学生向けに cancel chain を日常の比喩で説明する。
2. Part 2 では `AbortController`、handler、テスト構成、エッジケースを技術者向けに記述する。
3. `## 視覚証跡` に `UI/UX変更なしのため Phase 11 スクリーンショット不要` を明記する。

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

### タスク2: system spec update summary 作成

**目的**: Step 1 と Step 2 の更新判断を明記する。

**実行手順**:

1. Step 1-A〜1-C と validator 実行結果を整理する。
2. `aiworkflow-requirements` への Step 2 更新が必要か判定する。
3. 不要な場合も「不要理由」を記録する。

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`

### タスク3: documentation changelog 作成

**目的**: 変更ファイル、validator、current/baseline の差を残す。

**実行手順**:

1. workflow 本体と spec 更新先を一覧化する。
2. 実行した validator と結果を記録する。
3. planned wording を残さない。

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

### タスク4: 未タスク検出

**目的**: 本 task で閉じない事項を formalize する。

**実行手順**:

1. CANCEL-004 依存、E2E 未完了、追加 cleanup 論点を確認する。
2. 0件でも summary を記録する。
3. 配置先とリンク整合を確認する。

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

### タスク5: skill feedback report 作成

**目的**: task-specification-creator への改善点を記録する。

**実行手順**:

1. 旧「新規実装テンプレート」と既実装差分確認の混線を指摘する。
2. `NON_VISUAL` 既実装 verification モードの必要性を記録する。
3. 改善点がなくてもその旨を明記する。

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

### タスク6: Phase 12 準拠チェック

**目的**: 6成果物、artifact parity、validator 結果を集約する。

**実行手順**:

1. canonical 6成果物の存在を確認する。
2. `artifacts.json` と `outputs/artifacts.json` の parity を確認する。
3. planned wording、artifact 名、taskType、validator 結果を集約する。

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 参照資料

| 参照資料                         | パス                                                                             | 内容                      |
| -------------------------------- | -------------------------------------------------------------------------------- | ------------------------- |
| Phase 12 テンプレート            | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | canonical 6成果物         |
| spec update workflow             | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | Step 1 / Step 2           |
| system spec 正本                 | `.claude/skills/aiworkflow-requirements/SKILL.md`                                | update judgment           |
| Phase 2 差分確認設計             | `outputs/phase-2/design.md`                                                      | close-out 方針の起点      |
| Phase 5 差分確認                 | `outputs/phase-5/implementation-summary.md`                                      | 実装差分の close-out 入力 |
| Phase 6 テスト拡充記録           | `outputs/phase-6/test-expansion-record.md`                                       | edge case と未解決事項    |
| Phase 7 カバレッジ               | `outputs/phase-7/coverage-report.md`                                             | concern coverage          |
| Phase 8 リファクタリング記録     | `outputs/phase-8/refactoring-log.md`                                             | 変更点ログ                |
| Phase 9 品質保証                 | `outputs/phase-9/quality-report.md`                                              | validator と残存リスク    |
| Phase 11 結果                    | `outputs/phase-11/TASK-SW-CANCEL-003-manual-test-report.md`                      | implementation guide 入力 |
| Phase 10 レビュー結果            | `outputs/phase-10/final-review-result.md`                                        | close-out 判定根拠        |
| 要件定義書                       | `outputs/phase-1/requirements-definition.md`                                     | Phase 1 成果物            |
| 受け入れ基準                     | `outputs/phase-1/acceptance-criteria.md`                                         | Phase 1 成果物            |
| AbortSignal利用調査レポート      | `outputs/phase-1/abort-signal-usage-report.md`                                   | Phase 1 成果物            |
| SkillCreatorService実装確認対象  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                    | Phase 5 成果物            |
| skillCreatorHandlers実装確認対象 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                              | Phase 5 成果物            |
| 手動テストチェックリスト         | `outputs/phase-11/manual-test-checklist.md`                                      | Phase 11 成果物           |
| 発見事項一覧                     | `outputs/phase-11/discovered-issues.md`                                          | Phase 11 成果物           |

## 成果物

| 成果物                       | パス                                                     | 内容                            |
| ---------------------------- | -------------------------------------------------------- | ------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 / 視覚証跡      |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 判定            |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 更新ファイル、validator、差分   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 未解決事項または0件             |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点または改善点なし          |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物、parity、validator 集約 |

## 統合テスト連携【必須】

| 判定項目                                 | 基準 | 結果    |
| ---------------------------------------- | ---- | ------- |
| canonical 6成果物が定義されている        | 完了 | pending |
| Step 1 / Step 2 判定が定義されている     | 完了 | pending |
| parity と validator 集約が定義されている | 完了 | pending |

## 完了条件

- [ ] canonical 6成果物を定義している
- [ ] implementation guide の Part 1 / Part 2 要件を定義している
- [ ] Step 1 / Step 2 判定を定義している
- [ ] planned wording を残さない方針を明記している
- [ ] parity と validator 集約を定義している

# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 12                                    |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

source discovery、resource selection、context budget、provenance handoff の仕様同期対象を整理する。

## 実行タスク

| Task      | 名称                       | 内容                                                     |
| --------- | -------------------------- | -------------------------------------------------------- |
| Task 12-1 | implementation guide       | current facts と target delta を分離した実装ガイドを残す |
| Task 12-2 | system spec update summary | Step 1 / Step 2 no-op 根拠と docs pack sync を記録する   |
| Task 12-3 | documentation changelog    | 更新ファイル、validation、current/baseline を記録する    |
| Task 12-4 | unassigned detection       | SF-03 4パターンで follow-up を確認する                   |
| Task 12-5 | skill feedback report      | 2 skill への改善提案を記録する                           |
| Task 12-6 | compliance check           | Task 12-1〜12-5 の実質完了を確認する                     |

- Task 12-1: implementation guide を作成する
- Task 12-2: system spec update summary を作成する
- Task 12-3: documentation changelog を作成する
- Task 12-4: unassigned detection を実施する
- Task 12-5: skill feedback report を作成する
- Task 12-6: phase12 compliance check を作成する

## 参照資料

| 資料名                | パス                           | 説明                           |
| --------------------- | ------------------------------ | ------------------------------ |
| Phase 1 要件          | `phase-1-requirements.md`      | source discovery 要件          |
| Phase 2 設計          | `phase-2-design.md`            | source / budget / degrade 設計 |
| Phase 5 実装          | `phase-5-implementation.md`    | 実装対象と順序                 |
| Phase 6 テスト拡充    | `phase-6-test-expansion.md`    | edge case                      |
| Phase 7 coverage      | `phase-7-coverage-check.md`    | coverage 観点                  |
| Phase 8 refactoring   | `phase-8-refactoring.md`       | naming / boundary 整理         |
| Phase 9 QA            | `phase-9-quality-assurance.md` | QA 観点                        |
| Phase 10 最終レビュー | `phase-10-final-review.md`     | downstream handoff と未決事項  |
| Phase 11 手動テスト   | `phase-11-manual-test.md`      | manual walkthrough             |

## Phase 10 MINOR 追跡

| MINOR ID | 指摘内容                        | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| -------- | ------------------------------- | ------------- | ------------- | -------- | ---------- |
| なし     | Phase 10 gate で MINOR 指摘なし | —             | —             | —        | —          |

## 実行手順

### ステップ1: Task 12-1〜12-3 を更新する

- current canonical facts と Task03 target delta を `implementation-guide.md` に分離記録する。
- `system-spec-update-summary.md` に docs pack sync の実施結果と Step 2 no-op 根拠を exact path 付きで残す。
- `documentation-changelog.md` に current / baseline と validation 記録を残す。

### ステップ2: Task 12-4〜12-6 を更新する

- `unassigned-task-detection.md` で SF-03 4パターンを確認し、0件でも記録する。
- `skill-feedback-report.md` で `task-specification-creator` と `aiworkflow-requirements` への改善提案を残す。
- `phase12-task-spec-compliance-check.md` で Task 12-1〜12-5 の実質完了を確認する。

## 成果物

| 成果物                     | パス                                                     | 説明                         |
| -------------------------- | -------------------------------------------------------- | ---------------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | 概念説明と技術説明           |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | sync target の一覧           |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴と validation 結果   |
| unassigned detection       | `outputs/phase-12/unassigned-task-detection.md`          | follow-up の有無             |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | skill への改善フィードバック |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了確認            |

## サブタスク管理

1. Phase 11 walkthrough 結果の反映
2. Task 12-1〜12-3 の更新
3. Task 12-4〜12-6 の更新
4. validation 再実行
5. 完了条件の確認

## 完了条件

- [ ] sync 対象と未タスク候補が整理されている
- [ ] source discovery / provenance の lane-wide 反映先が整理されている
- [ ] Phase 12 の 6 成果物が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認

- [ ] Task 12-1〜12-6 を更新済み
- [ ] 計画系の仮置き表現を除去済み
- [ ] current / baseline と validation 結果を記録済み
- [ ] Phase 11 walkthrough 結果と矛盾しない

# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 12                                   |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify 拡張の実装ガイド、台帳同期、変更履歴、未タスク、skill feedback を spec_created 前提で閉じる。

## 実行タスク

| Task      | 名称                       | 内容                                                               |
| --------- | -------------------------- | ------------------------------------------------------------------ |
| Task 12-1 | implementation guide       | Part 1/2 で概念説明と技術説明を分離する                            |
| Task 12-2 | system spec update summary | backlog 同期有無と Step 2 不要理由を exact path 付きで記録する     |
| Task 12-3 | documentation changelog    | 新規 workflow pack と検証結果を記録する                            |
| Task 12-4 | unassigned detection       | follow-up 候補の有無を 0 件でも記録する                            |
| Task 12-5 | skill feedback report      | `task-specification-creator` と `aiworkflow-requirements` へ改善案 |

- Task 12-1: `outputs/phase-12/implementation-guide.md` を更新する
- Task 12-2: `outputs/phase-12/system-spec-update-summary.md` を更新する
- Task 12-3: `outputs/phase-12/documentation-changelog.md` を更新する
- Task 12-4: `outputs/phase-12/unassigned-task-detection.md` を更新する
- Task 12-5: `outputs/phase-12/skill-feedback-report.md` と `outputs/phase-12/phase12-task-spec-compliance-check.md` を更新する

## 参照資料

| 資料名                    | パス                                           | 説明               |
| ------------------------- | ---------------------------------------------- | ------------------ |
| Phase 1 要件              | `phase-1-requirements.md`                      | AC と boundary     |
| Phase 2 設計              | `phase-2-design.md`                            | contract matrix    |
| implementation sequencing | `outputs/phase-5/implementation-sequencing.md` | 実装順             |
| test expansion            | `outputs/phase-6/test-expansion-summary.md`    | edge case          |
| coverage summary          | `outputs/phase-7/coverage-summary.md`          | coverage           |
| refactoring summary       | `outputs/phase-8/refactoring-summary.md`       | naming / duplicate |
| qa summary                | `outputs/phase-9/qa-summary.md`                | quality gate       |
| Phase 10 review           | `phase-10-final-review.md`                     | close-out 前の判定 |
| Phase 11 manual           | `phase-11-manual-test.md`                      | walkthrough 証跡   |

## Phase 10 MINOR 追跡

| MINOR ID | 指摘内容                        | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| -------- | ------------------------------- | ------------- | ------------- | -------- | ---------- |
| なし     | Phase 10 gate で MINOR 指摘なし | —             | —             | —        | —          |

## 実行手順

### ステップ1: Task 12-1〜12-3 を更新する

- `implementation-guide.md` に中学生向け説明と技術者向け説明を分けて記録する。
- `system-spec-update-summary.md` に backlog 同期の有無と Step 2 不要判断を記録する。
- `documentation-changelog.md` に新規 workflow pack と validation を記録する。

### ステップ2: Task 12-4〜12-5 と補助検証を更新する

- `unassigned-task-detection.md` で新規 follow-up が不要であるかを記録する。
- `skill-feedback-report.md` で 2 skill への改善提案を記録する。
- `phase12-task-spec-compliance-check.md` で Task 12-1〜12-5 の完了を自己監査する。

## 成果物

| 成果物                     | パス                                                     | 説明                       |
| -------------------------- | -------------------------------------------------------- | -------------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | 概念説明と技術説明         |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | backlog 同期と Step 2 判断 |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴と validation      |
| unassigned detection       | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 有無             |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | skill 改善フィードバック   |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 補助監査          |

## サブタスク管理

1. Phase 11 walkthrough 結果の反映
2. Task 12-1〜12-3 の更新
3. Task 12-4〜12-5 の更新と補助検証
4. validation 再実行
5. 完了条件の確認

## 完了条件

- [ ] Task 12-1〜12-5 の成果物が揃っている
- [ ] backlog 同期有無と Step 2 判断理由が記録されている
- [ ] follow-up 候補の有無が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認

- [ ] Task 12-1〜12-5 を更新済み
- [ ] 計画文ではなく実績と判断理由を記録済み
- [ ] validation 結果を記録済み
- [ ] Phase 11 結果と矛盾しない

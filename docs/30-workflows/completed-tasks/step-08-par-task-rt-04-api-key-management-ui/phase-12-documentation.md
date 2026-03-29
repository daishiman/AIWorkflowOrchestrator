# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 12                    |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

spec_created UI task として close-out を行い、implementation guide、system spec 同期、未タスク検出、feedback を same-wave で閉じる。

## 実行タスク

- Task 12-1: implementation guide を2部構成で作成する
- Task 12-2: system spec update summary を作成する
- Task 12-3: documentation changelog を作成する
- Task 12-4: unassigned detection を実施する
- Task 12-5: skill feedback report を作成する
- Task 12-6: compliance check を実施する

## 参照資料

| 資料名            | パス                                                                                   | 説明            |
| ----------------- | -------------------------------------------------------------------------------------- | --------------- |
| Phase 11          | `phase-11-manual-test.md`                                                              | evidence 前提   |
| Phase 11/12 guide | `.agents/skills/task-specification-creator/references/phase-11-12-guide.md`            | close-out 基準  |
| Phase 12 guide    | `.agents/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 12-1〜12-6 |
| spec update       | `.agents/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1/2 判断   |

## 実行手順

### ステップ1: implementation guide を作る

1. Part 1 は中学生向け、`たとえば` を含む。
2. Part 2 は型、API、使用例、エラー、edge case を含む。
3. `spec_created` のため current contract と target delta を分離して書く。

### ステップ2: system spec を同期する

1. Step 1-A: 完了タスク記録、LOGS、関連リンク、topic-map を同期する。
2. Step 1-B: 実装状況テーブルを `spec_created` で更新する。
3. Step 1-C: 関連タスクテーブルを current facts へ更新する。
4. Step 2: public interface 変更がある場合のみ本文仕様を更新する。

### ステップ3: 監査成果物を閉じる

1. changelog
2. unassigned detection
3. skill feedback
4. compliance check

## 成果物

| 成果物                     | パス                                                     | 説明           |
| -------------------------- | -------------------------------------------------------- | -------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | 2部構成ガイド  |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/2 記録  |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 更新履歴       |
| unassigned detection       | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク結果   |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | skill 改善記録 |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終確認       |

## 完了条件

- [ ] implementation guide の Part 1 / Part 2 が揃っている
- [ ] Step 1-A〜1-C の same-wave sync が記録されている
- [ ] Step 2 実行要否が判定されている
- [ ] Phase 12 の6成果物が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**

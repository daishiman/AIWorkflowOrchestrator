# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 12                      |
| タスクID   | TASK-ELECTRON-BUILD-FIX |
| 前提Phase  | Phase 11                |
| 後続Phase  | Phase 13                |
| ステータス | completed               |
| 主担当     | Agent-D                 |

## 目的

implementation guide、system spec sync、未タスク検出、feedback report を完了し、close-out を仕様準拠で閉じる。

## 実行タスク

- Part 1 / Part 2 の implementation guide を作る
- Step 1-A〜1-C の close-out を実施する
- Step 2 が不要かを再判定する
- documentation changelog、unassigned task、feedback report を作る
- phase12-task-spec-compliance-check で根拠を集約する

## 参照資料

| 資料                          | パス                                                                  | 用途                 |
| ----------------------------- | --------------------------------------------------------------------- | -------------------- |
| workflow index                | `docs/30-workflows/electron-build-infra-fix/index.md`                 | AC と close-out 境界 |
| phase 10                      | `docs/30-workflows/electron-build-infra-fix/phase-10-final-review.md` | 最終判定結果         |
| phase 11                      | `docs/30-workflows/electron-build-infra-fix/phase-11-manual-test.md`  | 手動確認結果の参照元 |
| aiworkflow requirements skill | `.claude/skills/aiworkflow-requirements/SKILL.md`                     | 参照と更新原則       |

## 実行手順

### ステップ1: 実装ガイド

- Part 1 は中学生レベルの説明にする
- Part 2 は技術者向けの設定、コマンド、型、エッジケースを記述する

### ステップ2: close-out

- Step 1-A: 完了記録、LOGS、topic-map、関連記録を更新する
- Step 1-B: 実装状況テーブルを current facts に合わせる
- Step 1-C: 関連タスクの状態を current facts に合わせる
- Step 2: 新規 interface、型、定数、API 変更がある場合のみ更新する

### ステップ3: 未タスクと feedback

- 0 件でも unassigned task report を出力する
- 改善点が 0 件でも feedback report を出力する
- compliance check に validator / artifact / mirror parity を集約する

## 成果物

| 成果物                     | パス                                                     | 説明                     |
| -------------------------- | -------------------------------------------------------- | ------------------------ |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2          |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 結果     |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 更新履歴                 |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出             |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | workflow 改善点          |
| phase12 compliance check   | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 集約判定 |

## 完了条件

- [x] implementation guide が 2 パート構成である
- [x] Step 1-A〜1-C の実施結果が記録されている
- [x] Step 2 の要否が current facts で再判定されている
- [x] unassigned task report と feedback report が 0 件でも出力対象になっている
- [x] phase12-task-spec-compliance-check が root evidence として揃っている

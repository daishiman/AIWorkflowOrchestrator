# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 13                                  |
| Phase名    | PR作成                              |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 12: ドキュメント更新          |
| 次Phase    | -                                   |
| ステータス | blocked                             |
| 作成日     | 2026-04-06                          |

## 目的

ユーザー承認がある場合のみ change summary と local check をまとめる。現時点では blocked を維持する。

## 実行タスク

### Task 1: 変更要約準備

変更点を整理する:

- 修正対象タスク一覧（TASK-P0-01 〜 TASK-P0-09）
- artifacts.json の status 変更内容
- index.md のステータス変更内容
- completed-tasks への移動内容
- 残作業記録の追加内容
- executor-guide.md の更新内容
- 親 index.md の更新内容
- Phase 12 の成果物（implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check）

### Task 2: PR 実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- TASK-UI-01, TASK-UI-02, TASK-UI-03 の完了状況を PR 前提条件として記録する

### Task 3: PR 作成手順

- `/ai:diff-to-pr` スキルを使用して PR を作成する
- PR 本文のテンプレート:

  ```
  ## Summary
  - TASK-UI-04: 仕様書ステータス乖離修正
  - 7〜8件のタスク仕様書の artifacts.json / index.md ステータスを実装状態に合わせて更新
  - 完了タスクの completed-tasks/ 移動、残作業記録の追加

  ## Changed files
  - artifacts.json x N files (status field updates)
  - index.md x N files (status metadata updates)
  - executor-guide.md (status table updates)
  - lane index.md (task list updates)
  - outputs/phase-12/* (documentation pack)

  ## Test plan
  - [ ] 全 artifacts.json status が実装状態と一致
  - [ ] completed-tasks 移動後のリンク切れなし
  - [ ] 部分完了タスクに残作業記録あり
  - [ ] executor-guide.md が最新状態を反映
  ```

### Task 4: タスクディレクトリの完了時移動

PR マージ後、本タスク自体のディレクトリを以下に移動する:

- 移動元: `docs/30-workflows/step-13-seq-task-ui-04-spec-status-drift-correction/`
- 移動先: `docs/30-workflows/completed-tasks/`

## 参照資料

| 資料名               | パス                                                     | 説明                       |
| -------------------- | -------------------------------------------------------- | -------------------------- |
| 実装記録             | `outputs/phase-5/implementation-record.md`               | 修正内容                   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                     | coverage 要約              |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                     | 整理内容                   |
| 品質保証レポート     | `outputs/phase-9/qa-report.md`                           | 品質ゲート                 |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                | 判定                       |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                 | evidence                   |
| 修正計画             | `outputs/phase-2/correction-plan.md`                     | 上流設計                   |
| テスト拡充記録       | `outputs/phase-6/test-expansion.md`                      | 検証の参照                 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | 直前成果物                 |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | root / parity / no-op 判定 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | 更新差分と validator       |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 有無             |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善提案                   |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終監査                   |

## 成果物

| 成果物     | パス                                     | 説明             |
| ---------- | ---------------------------------------- | ---------------- |
| PR作成記録 | `outputs/phase-13/pr-creation-record.md` | PR URL、変更要約 |

## 完了条件

- [ ] ユーザー承認の有無が明記されている
- [ ] blocked 条件が明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] TASK-UI-01/02/03 の依存状況が記録されている
- [ ] 承認後に必要な成果物が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- blocked: ユーザー承認待ち

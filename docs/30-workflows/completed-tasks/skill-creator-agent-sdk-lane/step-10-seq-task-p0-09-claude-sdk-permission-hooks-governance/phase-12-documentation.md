# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 12                                     |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

policy / hooks / audit 契約を implementation guide と関連仕様へ反映する。

## 実行タスク

- implementation guide 更新
- system spec 更新要否確認
- changelog 記録
- unassigned-task 検出
- skill feedback 記録
- Phase 12 準拠確認

## 参照資料

| 資料名                | パス                                                                                   | 説明             |
| --------------------- | -------------------------------------------------------------------------------------- | ---------------- |
| Phase 5               | `phase-5-implementation.md`                                                            | 実装結果         |
| Phase 1-10            | `phase-1-requirements.md` 〜 `phase-10-final-review.md`                                | close-out 入力   |
| Phase 12 template     | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`       | 必須成果物の正本 |
| spec update workflow  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1/2 の正本  |
| unassigned task guide | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`   | 未タスク化基準   |
| elegance audit        | `.claude/skills/aiworkflow-requirements/references/spec-elegance-consistency-audit.md` | 30 思考法総括    |

## 実行手順

### Step 1-A: タスク完了記録

- 完了タスクの追記
- 関連ドキュメントリンクの追記
- 変更履歴の追記
- `LOGS.md` 2 ファイルの更新
- `topic-map.md` / index 再生成

### Step 1-B: 実装状況テーブル更新

- 実装完了は `completed`
- 仕様書作成のみは `spec_created`
- docs-only の場合も current facts へ同期する

### Step 1-C: 関連タスクテーブル更新

- 仕様書内の関連タスクを current facts に合わせる
- 未タスク候補は `spec_created` / `blocked` / `N/A` を明記する

### Step 2: システム仕様更新要否を判定する

- 新規 interface / type / constant / API 変更がある場合のみ更新する
- no-op の場合でも `system-spec-update-summary.md` に根拠を残す
- `spec_created` でも same-wave sync を省略しない

## 成果物

| 成果物                             | パス                                                     | 説明               |
| ---------------------------------- | -------------------------------------------------------- | ------------------ |
| implementation guide               | `outputs/phase-12/implementation-guide.md`               | 実装ガイド         |
| system spec update summary         | `outputs/phase-12/system-spec-update-summary.md`         | 更新要否の根拠     |
| documentation changelog            | `outputs/phase-12/documentation-changelog.md`            | 変更履歴           |
| unassigned-task detection          | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出       |
| skill feedback report              | `outputs/phase-12/skill-feedback-report.md`              | skill 改善案       |
| phase12 task spec compliance check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6 成果物の準拠確認 |

## 完了条件

- [x] 必須 6 成果物が揃っている
- [x] Step 1-A〜1-C と Step 2 が完了している
- [x] planned wording が残っていない
- [x] unassigned-task が 0 件でも結論がある
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- `validate-phase-output.js` と `verify-unassigned-links.js` の結果を反映する
- `generate-documentation-changelog.js` の結果を Phase 12 成果物へ転記する

## 多角的チェック観点（AIが判断）

- 6 成果物の名前が canonical filename と一致しているか
- `spec_created` でも no-op を理由に更新を省略していないか
- current facts と baseline が混同されていないか
- 変更理由が skill 原文と整合しているか

## サブタスク管理

| SubAgent   | 責務                                    |
| ---------- | --------------------------------------- |
| SubAgent-A | implementation guide / compliance check |
| SubAgent-B | system spec update / changelog          |
| SubAgent-C | unassigned-task / skill feedback        |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 13: PR作成

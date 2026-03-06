# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| Phase      | 13                                                                                          |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard                                             |
| タスクID   | UT-TASK-10A-B-008                                                                           |
| タスク名   | 未タスク件数再計算同期ガード                                                                |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| 後続Phase  | 完了                                                                                        |
| 作成日     | 2026-03-06                                                                                  |
| ステータス | pending                                                                                     |

## 目的

レビュー用の変更要約、検証結果、残余リスク、依頼事項を整理し、ユーザーの明示許可が出た時だけPR作成へ進める状態にする。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと       | 実行順序    | 役割                             |
| -------- | -------------- | ----------- | -------------------------------- |
| A        | 変更要約       | 先行        | 実施内容と対象ファイルを要約する |
| B        | 検証要約       | Aと並列     | 4本検証の結果を要約する          |
| C        | リスク要約     | A/B後に直列 | 残余リスクと保留事項を要約する   |
| D        | ハンドオフ整備 | C後に直列   | PR本文案と承認待ち条件を整える   |

## 実行タスク

- 変更要約作成: active set 導出、3台帳同期、教訓更新、検証記録を要約する
- 検証要約作成: `verify-all-specs`、`validate-phase-output`、`verify-unassigned-links`、`audit --diff-from HEAD` を要約する
- リスク要約作成: 残余リスクと保留事項を要約する
- ハンドオフ整備: PR本文案と承認待ち条件を記録する

## 参照資料

| 資料名                       | パス                                         | 用途                     |
| ---------------------------- | -------------------------------------------- | ------------------------ |
| Phase 1 要件定義             | `outputs/phase-1/requirements-definition.md` | 要約の基準に使う         |
| Phase 2 台帳同期設計         | `outputs/phase-2/ledger-sync-design.md`      | 変更要約の基準に使う     |
| Phase 5 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | 変更内容の要約に使う     |
| Phase 6 回帰テスト計画       | `outputs/phase-6/regression-test.md`         | 回帰要約に使う           |
| Phase 7 カバレッジ報告       | `outputs/phase-7/coverage-report.md`         | カバレッジ要約に使う     |
| Phase 8 再利用ガードパターン | `outputs/phase-8/reusable-guard-pattern.md`  | 再利用要約に使う         |
| Phase 9 品質報告             | `outputs/phase-9/quality-report.md`          | 品質要約に使う           |
| Phase 10 最終レビュー結果    | `outputs/phase-10/final-review-result.md`    | 通過条件の確認に使う     |
| Phase 11 手動テスト結果      | `outputs/phase-11/manual-test-result.md`     | 手動確認結果の要約に使う |
| Phase 12 仕様更新サマリー    | `outputs/phase-12/spec-update-summary.md`    | 最終要約の正本に使う     |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                            | 用途                                                  |
| ---------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------- |
| タスク運用正本   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | PR本文の完了タスク要約とリンク先を確認する            |
| タスク運用ルール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`      | 未タスク/完了タスクの配置表現を誤らないために確認する |
| UI機能仕様正本   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | UI関連の更新要約を確認する                            |
| 教訓正本         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再利用ポイントを PR 要約へ反映する                    |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | 検証サマリーの粒度を確認する                          |

## 実行手順

1. Phase 12 までの成果物から変更要約と検証要約を作成する。
2. 残余リスクと保留事項を Phase 9 のリスク登録表から転記する。
3. PR本文案を作成するが、実際の PR 作成はユーザーの明示許可が出るまで実行しない。
4. handoff-checklist に承認待ち条件を記録する。

## 多角的チェック観点（関心分離）

| 観点       | 確認内容                                               | 正本                 |
| ---------- | ------------------------------------------------------ | -------------------- |
| 変更要約   | 変更対象と理由が短く正確にまとまっているか             | pr-info.md           |
| 検証要約   | 4本検証の結果が漏れなく載っているか                    | pr-info.md           |
| リスク要約 | 残余リスクが省略されていないか                         | handoff-checklist.md |
| 承認境界   | ユーザー許可前に PR を作成しない条件が明記されているか | handoff-checklist.md |

## 成果物

| 成果物                   | パス                                    | 説明                         |
| ------------------------ | --------------------------------------- | ---------------------------- |
| PR情報                   | `outputs/phase-13/pr-info.md`           | PR本文案と変更要約を記録する |
| ハンドオフチェックリスト | `outputs/phase-13/handoff-checklist.md` | 承認待ち条件を記録する       |

## 完了条件

- [ ] 変更要約、検証要約、リスク要約を定義した
- [ ] ユーザー明示許可前に PR を作成しない条件を明記した
- [ ] handoff-checklist を定義した
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 1/2/5/6/7/8/9/10/11/12 成果物の確認
2. SubAgent-A/B の並列要約
3. SubAgent-C のリスク要約
4. SubAgent-D のハンドオフ整備
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載の2ファイルを定義した
- [ ] PR本文案と承認待ち条件を分離した
- [ ] 完了後にユーザー確認へ渡せる状態にした

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

完了

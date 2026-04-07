# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 12                                  |
| Phase名    | ドキュメント更新                    |
| 機能名     | spec-status-drift-correction        |
| 対象機能   | TASK-UI-04 仕様書ステータス乖離修正 |
| 前提Phase  | Phase 11: 手動テスト                |
| 次Phase    | Phase 13: PR作成                    |
| ステータス | completed                           |
| 作成日     | 2026-04-06                          |

## 目的

task-specification-creator の Phase 12 正本に合わせて、仕様書ステータス乖離修正の記録、更新履歴、未タスク、スキルフィードバック、準拠チェックを canonical filename で揃える。  
この Phase は docs-only であり、Step 2 が不要な場合は no-op 理由も明記する。

## docs-only モードフラグ

- `spec_created` な task では、実装完了と仕様書作成完了を混同しない。
- Step 2 が不要なら、その理由を `system-spec-update-summary.md` と `documentation-changelog.md` に残す。
- `outputs/phase-12/phase12-task-spec-compliance-check.md` で outputs / artifacts / root parity / validator を集約する。

## 実行タスク

| Task      | 名称                             | 内容                                                                 |
| --------- | -------------------------------- | -------------------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成（2パート構成）    | Part 1 は中学生レベル、Part 2 は current facts / target delta を整理 |
| Task 12-2 | システム仕様更新サマリー作成     | Step 1-A〜1-G と Step 2 の実施結果を exact path 付きで記録する       |
| Task 12-3 | ドキュメント更新履歴作成         | 更新ファイル、validator、current / baseline を記録する               |
| Task 12-4 | 未タスク検出レポート作成         | follow-up 候補の有無を 0 件でも記録する                              |
| Task 12-5 | スキルフィードバックレポート作成 | task-specification-creator と aiworkflow-requirements を改善する     |
| Task 12-6 | 準拠チェック                     | Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 を 1 ファイルに集約する     |

- Task 12-1: implementation guide を作成する
- Task 12-2: system spec update summary を作成する
- Task 12-3: documentation changelog を作成する
- Task 12-4: unassigned task detection を作成する
- Task 12-5: skill feedback report を作成する
- Task 12-6: `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する

## 参照資料

| 資料名               | パス                                                                                    | 説明                               |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                                | 直前成果物                         |
| 実装記録             | `outputs/phase-5/implementation-record.md`                                              | 修正内容の参照                     |
| 乖離インベントリ     | `outputs/phase-1/status-drift-inventory.md`                                             | 元の調査結果                       |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                                               | 品質確認結果                       |
| テスト拡充記録       | `outputs/phase-6/test-expansion.md`                                                     | 直前の検証範囲                     |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                                                    | 直前の検証結果                     |
| Phase 12 ガイド      | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Task 12-1〜12-6 の正本             |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1 / Step 2 の境界と同期ルール |
| validation matrix    | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator と pass 条件             |
| ステータス抽出マップ | `outputs/phase-1/spec-extraction-map.md`                                                | Phase 1 成果物                     |
| 修正計画             | `outputs/phase-2/correction-plan.md`                                                    | Phase 2 成果物                     |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                                                    | Phase 8 成果物                     |
| 品質保証レポート     | `outputs/phase-9/qa-report.md`                                                          | Phase 9 成果物                     |

## 成果物

| 成果物               | パス                                                     | 説明                                              |
| -------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1: 概念説明 / Part 2: 技術詳細               |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の結果、root parity、更新理由     |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル一覧と validator 結果                 |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | follow-up の有無（0 件でも出力）                  |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 2 skill への改善提案（なしでも出力）              |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6、Step 1-A〜1-G、Step 2 の集約監査 |

## 実行手順

### Task 12-1: 実装ガイド作成

`implementation-guide.md` に Part 1 / Part 2 を作成する。

**Part 1: 中学生レベルの概念説明**

- 仕様書のステータスとは何かを日常的な比喩で説明する
- たとえば を最低 1 回含める
- 「なぜ必要か」→「何をするか」の順序で説明する
- 専門用語は使わず、使う場合は即座に説明する

**Part 2: 技術詳細**

- 修正対象タスク一覧と before/after の要約
- artifacts.json の status フィールドの有効値と意味
- completed-tasks 移動の手順とリンク更新の注意点
- current facts と target delta を分けた記録
- Step 2 が no-op の場合は理由と境界を明記する

### Task 12-2: システム仕様更新サマリー作成

`system-spec-update-summary.md` に Step 1-A〜1-G と Step 2 の結果を記録する。

- Step 1-A: `index.md`、`artifacts.json`、`phase-*.md`、`executor-guide.md`、`.claude/skills/aiworkflow-requirements/references/task-workflow.md`、`LOGS.md` x2、`SKILL.md` x2 の実更新を記録する
- Step 1-B: 実装状況テーブルの更新内容を記録する
- Step 1-C: 関連タスクテーブルの更新内容を記録する
- Step 1-D: topic-map 再生成の要否と結果を記録する
- Step 1-E: 未タスク登録の有無と配置先を記録する
- Step 1-F: lessons learned / 補助成果物の同期要否を記録する
- Step 1-G: validator 実行結果と diff を記録する
- Step 2: interface / API / state / security / UI contract の変更がない場合は no-op として理由を記録する

### Task 12-3: ドキュメント更新履歴作成

`documentation-changelog.md` に以下を記録する。

- 更新した file 一覧
- before / after の差分要約
- validator 実行結果
- current / baseline の区別
- artifacts 同期結果
- future wording が残っていない確認結果

### Task 12-4: 未タスク検出レポート作成

`outputs/phase-12/unassigned-task-detection.md` を作成する。0 件でも出力する。

- Phase 3 / Phase 10 / Phase 11 の指摘から scope 外の follow-up を抽出する
- 1 件以上ある場合は配置先と formalize path を記録する
- `current` と `baseline` を分離して書く

### Task 12-5: スキルフィードバックレポート作成

`skill-feedback-report.md` に改善提案を記録する。

- task-specification-creator への改善提案
- aiworkflow-requirements への改善提案
- 改善点がない場合は理由付きで「なし」と書く

### Task 12-6: 準拠チェック

`outputs/phase-12/phase12-task-spec-compliance-check.md` に以下を集約する。

- Task 12-1〜12-5 の成果物存在確認
- Step 1-A〜1-G の実施結果
- Step 2 の更新要否と no-op / sync 判定
- `artifacts.json` と `outputs/artifacts.json` の parity
- validator 結果と future wording 0 件確認
- root parity と 4 条件（矛盾なし・漏れなし・整合性あり・依存関係整合）

## 完了条件

- [ ] 実装ガイドが Part 1 / Part 2 の 2 部構成で作成されている
- [ ] Part 1 に `たとえば` が最低 1 回含まれている
- [ ] `system-spec-update-summary.md` が作成されている
- [ ] `documentation-changelog.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている
- [ ] `skill-feedback-report.md` が作成されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている
- [ ] 本 Phase の 6 成果物がすべて揃っている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の整合が取れている

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)

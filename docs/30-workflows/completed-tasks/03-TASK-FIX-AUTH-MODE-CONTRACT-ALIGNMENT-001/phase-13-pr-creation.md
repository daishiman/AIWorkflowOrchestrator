# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 13                                        |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 契約整合の PR 準備と handoff    |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

PR 本文、review handoff、最終確認事項を文書化し、ユーザー承認後に commit / push / PR 作成 / CI確認まで実行する。

## 背景

初版仕様では Phase 13 の自動実行を行わず、文書を揃えて手動承認に渡すことを目的としていた。  
2026-03-06 にユーザーから `/.claude/commands/ai/diff-to-pr.md` に従う PR 作成指示を受けたため、本Phaseでは handoff 文書に加えて commit / push / PR 作成 / CI確認まで実行する。

## SubAgentチーム編成

| SubAgent                | 担当関心            | 実行形態 | Phase 13 の責務                                          |
| ----------------------- | ------------------- | -------- | -------------------------------------------------------- |
| SubAgent-Contract-Main  | change summary      | 並列     | Main / shared 側の変更要約を作る                         |
| SubAgent-Bridge-Preload | API summary         | 並列     | Preload public API 変更要約を作る                        |
| SubAgent-Renderer-State | UI / manual summary | 並列     | Settings UI と手動証跡の要約を作る                       |
| SubAgent-Spec-Sync      | handoff 統合        | 直列統合 | PR draft、handoff checklist、review handshake を確定する |

## 実行タスク

- PR 情報ドラフト: 変更背景、変更点、テスト、system spec 更新点を `pr-info.md` にまとめる。
- handoff checklist: reviewer が確認する観点を `handoff-checklist.md` にまとめる。
- review handshake: commit、push、PR 作成をいつ誰が行うかを `review-handshake.md` にまとめる。

## 参照資料

### 実装・コード

| 資料名                       | パス                                            | 用途                           |
| ---------------------------- | ----------------------------------------------- | ------------------------------ |
| Phase 1 仕様                 | `phase-1-requirements.md`                       | 背景と AC を要約する           |
| Phase 2 仕様                 | `phase-2-design.md`                             | canonical DTO を要約する       |
| Phase 5 仕様                 | `phase-5-implementation.md`                     | 実装順序を要約する             |
| Phase 6 仕様                 | `phase-6-test-expansion.md`                     | 回帰テストを要約する           |
| Phase 7 仕様                 | `phase-7-coverage-check.md`                     | coverage を要約する            |
| Phase 8 仕様                 | `phase-8-refactoring.md`                        | refactor を要約する            |
| Phase 9 仕様                 | `phase-9-quality-assurance.md`                  | quality / risk を要約する      |
| Phase 10 仕様                | `phase-10-final-review.md`                      | gate decision を要約する       |
| Phase 11 仕様                | `phase-11-manual-test.md`                       | 手動検証証跡を要約する         |
| Phase 12 仕様                | `phase-12-documentation.md`                     | system spec 同期結果を要約する |
| Phase 1 成果物               | `outputs/phase-1/`                              | 要件要約を確認する             |
| Phase 2 成果物               | `outputs/phase-2/`                              | contract summary を確認する    |
| Phase 5 成果物               | `outputs/phase-5/`                              | changed files を確認する       |
| Phase 6 成果物               | `outputs/phase-6/`                              | regression result を確認する   |
| Phase 7 成果物               | `outputs/phase-7/`                              | coverage を確認する            |
| Phase 8 成果物               | `outputs/phase-8/`                              | refactor summary を確認する    |
| Phase 9 成果物               | `outputs/phase-9/`                              | risk と audit を確認する       |
| Phase 10 成果物              | `outputs/phase-10/`                             | gate 判定を確認する            |
| Phase 11 成果物              | `outputs/phase-11/`                             | 手動証跡を確認する             |
| Phase 12 成果物              | `outputs/phase-12/`                             | spec update を確認する         |
| 最終レビュー結果             | `outputs/phase-10/final-review-result.md`       | Phase 10 成果物                |
| リリースリスクチェックリスト | `outputs/phase-10/release-risk-checklist.md`    | Phase 10 成果物                |
| ゲート判定                   | `outputs/phase-10/gate-decision.md`             | Phase 10 成果物                |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`        | Phase 11 成果物                |
| 証跡マトリクス               | `outputs/phase-11/evidence-matrix.md`           | Phase 11 成果物                |
| スクリーンショット計画       | `outputs/phase-11/screenshot-plan.md`           | Phase 11 成果物                |
| 発見事項一覧                 | `outputs/phase-11/discovered-issues.md`         | Phase 11 成果物                |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | Phase 12 成果物                |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | Phase 12 成果物                |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | Phase 12 成果物                |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | Phase 12 成果物                |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | Phase 12 成果物                |
| Task2実行ログ                | `outputs/phase-12/phase12-task2-step-log.md`    | Phase 12 成果物                |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                           | 用途                              |
| -------------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| task workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 完了記録と handoff 粒度を確認する |
| lessons learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 再発条件の記録有無を確認する      |
| spec update workflow | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Phase 12 完了条件を再確認する     |

## 実行手順

1. Phase 1 から Phase 12 の成果物を読み、 PR に必要な変更点、検証、更新仕様を抜き出す。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で change summary を作る。
3. SubAgent-Spec-Sync が `pr-info.md`, `handoff-checklist.md`, `review-handshake.md` を統合する。
4. ユーザーが明示承認したターンでは、commit、push、PR 作成、PRコメント、CI確認まで実行し、結果を成果物へ追記する。

## 多角的チェック観点

| 観点          | 確認内容                                                        |
| ------------- | --------------------------------------------------------------- |
| 説明責任      | なぜ直したか、何を直したか、どう検証したかが揃っているか        |
| reviewer 導線 | reviewer が見る file / spec / evidence を列挙しているか         |
| 手動承認      | commit、push、PR が自動実行されないと明記しているか             |
| 再利用性      | 次回の contract alignment に再利用できる handoff になっているか |

## 成果物

| 成果物            | パス                                    | 説明                  |
| ----------------- | --------------------------------------- | --------------------- |
| PR 情報           | `outputs/phase-13/pr-info.md`           | PR 本文ドラフト       |
| handoff checklist | `outputs/phase-13/handoff-checklist.md` | reviewer 向け確認項目 |
| review handshake  | `outputs/phase-13/review-handshake.md`  | 手動承認と実行順序    |

## 完了条件

- [x] `pr-info.md` に背景、変更点、テスト、system spec 更新点がある
- [x] `handoff-checklist.md` に reviewer の確認項目がある
- [x] `review-handshake.md` に承認条件と実行手順がある
- [x] ユーザー明示承認があるため `git commit` / PR 作成の実行条件を記録した
- [x] Phase 12 の成果物を参照している
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. change summary 作成
2. reviewer checklist 作成
3. handoff / approval 手順作成
4. 自動実行禁止事項確認
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] PR 情報、handoff、approval 手順を分離した
- [x] ユーザー明示承認に基づく実行条件を記録した
- [x] Phase 12 までの成果物を参照した
- [x] reviewer が見る証跡を列挙した

## 次のPhase

完了

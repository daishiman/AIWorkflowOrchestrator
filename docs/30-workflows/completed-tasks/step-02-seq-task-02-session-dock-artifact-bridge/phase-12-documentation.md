# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| Phase名    | ドキュメント更新                          |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1-11                                |
| 後続Phase  | Phase 13（PR作成）                        |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

Task02 の implementation guide、system spec update、未タスク検出、skill feedback を整理する。

## 実行タスク

| Task      | 内容                 | 主成果物                                                 |
| --------- | -------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成       | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec 更新要約 | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | 変更履歴作成         | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` |
| Task 12-6 | skill feedback 作成  | `outputs/phase-12/skill-feedback-report.md`              |

## 参照資料

| 参照資料         | パス                           | 内容                                 |
| ---------------- | ------------------------------ | ------------------------------------ |
| task 要件        | `phase-1-requirements.md`      | 受入基準・要件定義                   |
| task 設計        | `phase-2-design.md`            | アーキテクチャ・インターフェース設計 |
| task 実装計画    | `phase-5-implementation.md`    | プロダクションコード実装             |
| task 回帰拡張    | `phase-6-test-expansion.md`    | カバレッジ拡充テスト                 |
| task coverage    | `phase-7-coverage-check.md`    | カバレッジ確認結果                   |
| task 整理方針    | `phase-8-refactoring.md`       | リファクタリング内容                 |
| task 品質確認    | `phase-9-quality-assurance.md` | Lint・型チェック・テスト結果         |
| task 最終判定    | `phase-10-final-review.md`     | Phase 10 gate decision               |
| task manual test | `phase-11-manual-test.md`      | 手動テスト結果                       |

依存Phase: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11

## 実行手順

### ステップ1: Task 12-1 実装ガイドを作成する

Part 1（中学生レベル概念説明 — 日常例え必須）と Part 2（開発者向け技術詳細）の2パート構成で作成する。

### ステップ2: Task 12-2 システム仕様書更新を実施する

Step 1-A（タスク完了記録 + LOGS.md 2ファイル + topic-map.md）、Step 1-B（実装状況テーブル）、Step 1-C（関連タスクテーブル）を実施する。新規インターフェース追加がある場合のみ Step 2 を実施する。

### ステップ3: Task 12-3 変更履歴を作成する

全 Step の結果を個別に明記する（「該当なし」も記録）。全 Step 確認前に「完了」と記載しない（P4 対策）。

### ステップ4: Task 12-4 未タスク検出を実施する

0件でも出力必須。元タスク仕様書、Phase 3/10 レビュー結果、Phase 11 手動テスト、コードコメントの 4 ソースから検出する。

### ステップ5: Task 12-5 スキルフィードバックレポートを作成する

改善点なしでも出力必須。テンプレート改善・ワークフロー改善・ドキュメント改善の 3 観点で記録する。

### ステップ6: Task 12-6 準拠チェックを実施する

Task 12-1〜12-5 の完了を検証し、phase12-task-spec-compliance-check.md に記録する。

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点             | 適用判断                   | 仕様参照先                                                             |
| ---------------- | -------------------------- | ---------------------------------------------------------------------- |
| ドキュメント品質 | 実装ガイドの Part 1/2 構成 | `task-specification-creator: SKILL.md` Phase 12 仕様                   |
| 仕様同期         | システム仕様書との整合性   | `aiworkflow-requirements: references/`                                 |
| 未タスク検出     | スコープ外項目の formalize | `task-specification-creator: references/unassigned-task-guidelines.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成
3. Task 12-2: システム仕様書更新
4. Task 12-3: 変更履歴作成
5. Task 12-4: 未タスク検出
6. Task 12-5: スキルフィードバックレポート作成
7. Task 12-6: 準拠チェック
8. 完了条件の検証

## 成果物

| 成果物           | パス                                                     | 説明                     |
| ---------------- | -------------------------------------------------------- | ------------------------ |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`               | Part 1/2 ガイド          |
| system spec 要約 | `outputs/phase-12/system-spec-update-summary.md`         | 同期対象一覧             |
| changelog        | `outputs/phase-12/documentation-changelog.md`            | 変更履歴                 |
| 未タスク検出     | `outputs/phase-12/unassigned-task-detection.md`          | follow-up 抽出           |
| compliance check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 完了確認 |
| skill feedback   | `outputs/phase-12/skill-feedback-report.md`              | 改善提案                 |

## 完了条件

- [ ] Task 12-1〜12-6 が全て成果物に対応している
- [ ] persistence / aborted / share に関する follow-up 抽出ルールがある
- [ ] PR/commit が自動実行されない前提を明記している
- [ ] LOGS.md 2ファイル（aiworkflow-requirements + task-specification-creator）が更新されている
- [ ] Phase 13 が blocked 状態のままであることを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Task 12-1〜12-6 の全成果物が outputs/phase-12/ に存在する

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)

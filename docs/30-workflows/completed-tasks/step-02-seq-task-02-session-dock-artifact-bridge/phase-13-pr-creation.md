# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 13                                        |
| Phase名    | PR作成                                    |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1-12                                |
| 後続Phase  | なし                                      |
| ステータス | blocked                                   |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

ユーザーの明示指示があった場合のみ PR 情報を整理する。現時点では実行しない。

## 実行タスク

| Task      | 内容                  | 主成果物                                             |
| --------- | --------------------- | ---------------------------------------------------- |
| Task 13-1 | PR summary 下書き準備 | `outputs/phase-13/pr-preparation.md`                 |
| Task 13-2 | reviewer 観点整理     | `outputs/phase-13/pr-preparation.md`（同ファイル内） |
| Task 13-3 | blocked 理由明示      | `outputs/phase-13/pr-preparation.md`（同ファイル内） |

## 参照資料

| 参照資料           | パス                           | 内容                                 |
| ------------------ | ------------------------------ | ------------------------------------ |
| task 要件          | `phase-1-requirements.md`      | 受入基準・要件定義                   |
| task 設計          | `phase-2-design.md`            | アーキテクチャ・インターフェース設計 |
| task 実装計画      | `phase-5-implementation.md`    | プロダクションコード実装             |
| task 回帰拡張      | `phase-6-test-expansion.md`    | カバレッジ拡充テスト                 |
| task coverage      | `phase-7-coverage-check.md`    | カバレッジ確認結果                   |
| task 整理方針      | `phase-8-refactoring.md`       | リファクタリング内容                 |
| task 品質確認      | `phase-9-quality-assurance.md` | Lint・型チェック・テスト結果         |
| task 最終判定      | `phase-10-final-review.md`     | Phase 10 gate decision               |
| task manual test   | `phase-11-manual-test.md`      | 手動テスト結果                       |
| task documentation | `phase-12-documentation.md`    | ドキュメント更新結果                 |

依存Phase: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12

## 実行手順

### ステップ1: PR summary の下書きを準備する

Phase 1-12 の成果物を要約し、PR 本文の下書きを作成する。

### ステップ2: reviewer 観点を整理する

AC-1〜AC-5 の検証状況と、Phase 10 の gate decision を reviewer 向けに整理する。

### ステップ3: blocked 理由を明示する

ユーザーの明示指示がない限り PR を作成しない理由を記録する。

## 多角的チェック観点（AIが判断）

| 観点   | 適用判断                      | 仕様参照先                            |
| ------ | ----------------------------- | ------------------------------------- |
| PR品質 | summary と test plan の充実度 | `.claude/rules/07-git-and-tooling.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. PR summary 下書き準備
3. reviewer 観点整理
4. blocked 理由明示
5. 完了条件の検証

## 成果物

| 成果物     | パス                                 | 説明           |
| ---------- | ------------------------------------ | -------------- |
| PR準備メモ | `outputs/phase-13/pr-preparation.md` | 将来用の下書き |

## 完了条件

- [ ] ユーザー明示指示なしでは PR を作成しないと明記している
- [ ] commit / push / PR が blocked のままである
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- なし（本タスクの最終Phase）

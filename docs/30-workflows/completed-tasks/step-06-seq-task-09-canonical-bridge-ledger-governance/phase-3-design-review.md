# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 3                                               |
| Phase 名   | 設計レビュー                                    |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 2                                         |
| 後続 Phase | Phase 4（テスト作成）                           |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

bridge drift、status ambiguity、ledger inconsistency を review するための review gate を実施し、Phase 4 着手条件を確定する。

## 実行タスク

- 設計レビュー: bridge drift、status ambiguity、ledger inconsistency を review する
- 代替案比較: より単純な代替案と trade-off を記録する
- ゲート判定: PASS / MINOR / MAJOR / CRITICAL の戻り先を決める
- Phase 4 条件: Phase 4+ の着手条件と blocked 条件を固定する

## 参照資料

| 参照資料     | パス                                                                                              | 内容                                   |
| ------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Task index   | docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/index.md | 対象 task のメタ情報と受入基準         |
| Phase 1      | phase-1-requirements.md                                                                           | 要件定義の確定内容                     |
| Phase 2      | phase-2-design.md                                                                                 | 設計内容と validation matrix           |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: 設計レビューを実施する

bridge drift、status ambiguity、ledger inconsistency を review する観点で PASS / MINOR / MAJOR / CRITICAL を判定する。

### ステップ2: simpler alternative を再確認する

もっと単純な案で同じ責務を果たせるかを再評価する。

### ステップ3: Phase 4 着手条件を固定する

未解消の MINOR と、MAJOR 発生時の戻り先を gate-decision に記録する。

### ステップ4: Phase 13 blocked 条件を残す

ユーザー承認なしの commit / PR を禁止する条件を明記する。

## 統合テスト連携（Phase 1〜11は必須）

integration matrix をレビューし、戻り先・blocked 条件・phase gate を決定する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: bridge drift、status ambiguity、ledger inconsistency を review する

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                                    | 内容                                   |
| ---------------- | --------------------------------------- | -------------------------------------- |
| 設計レビュー報告 | outputs/phase-3/design-review-report.md | PASS/MINOR/MAJOR の判定と根拠          |
| ゲート判定       | outputs/phase-3/gate-decision.md        | Phase 4 着手条件・戻り先・blocked 条件 |

## 完了条件

- [x] PASS / MINOR / MAJOR / CRITICAL の判定基準が定義されている
- [x] Phase 4 着手条件と Phase 13 blocked 条件が残されている
- [x] MINOR の追跡先 phase が決まっている
- [x] 戻り先と再レビュー条件が明記されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-3/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] Phase 4 へ進む前提として Phase 1-3 の gate 条件が明記されている

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md)

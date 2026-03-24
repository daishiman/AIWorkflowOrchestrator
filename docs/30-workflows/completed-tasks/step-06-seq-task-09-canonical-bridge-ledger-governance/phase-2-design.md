# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 2                                               |
| Phase 名   | 設計                                            |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 1                                         |
| 後続 Phase | Phase 3（設計レビュー）                         |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

governance state machine、source table、same-wave sync steps を設計するための target topology と validation matrix を固める。

## 実行タスク

- concern 分解: governance state machine、source table、same-wave sync steps を設計する
- 契約設計: state / action / ownership / DTO を定義する
- 検証設計: Phase 3 / 4 / 11 / 12 で再利用する matrix を作る
- lane 制御: lane 数を 3 以下に保ち、責務重複を排除する

## 参照資料

| 参照資料     | パス                                                                                              | 内容                                   |
| ------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Task index   | docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/index.md | 対象 task のメタ情報と受入基準         |
| Phase 1      | phase-1-requirements.md                                                                           | 要件定義の確定内容                     |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: concern を 3 以下に分解する

governance state machine、source table、same-wave sync steps を設計する観点で concern を分け、所有境界を表にする。

### ステップ2: 契約と validation matrix を作る

state / action / DTO / screenshot / backlog のどこで確認するかをコマンド単位で定義する。

### ステップ3: simpler alternative を併記する

今の案より単純な代替案と、採用しない理由を記録する。

### ステップ4: Phase 3 review 観点を明示する

どこが drift しやすいか、どこが blocked 条件かを phase-3-design-review に handoff する。

## 統合テスト連携（Phase 1〜11は必須）

state / action / DTO / screenshot 契約を integration matrix として整理し、Phase 3 review の観点に渡す。

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

| 成果物         | パス                                 | 内容                              |
| -------------- | ------------------------------------ | --------------------------------- |
| 設計サマリー   | outputs/phase-2/design-summary.md    | 設計の結論と concern 分解         |
| 契約マトリクス | outputs/phase-2/contract-matrix.md   | state / action / ownership 契約   |
| 検証マトリクス | outputs/phase-2/validation-matrix.md | Phase 3 以降の review / test 観点 |

## 完了条件

- [x] concern が 3 つ以下に整理されている
- [x] state / action / ownership 契約が表で定義されている
- [x] validation matrix と simpler alternative が記録されている
- [x] Phase 3 review の論点が明記されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-2/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] Phase 4 へ進む前提として Phase 1-3 の gate 条件が明記されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md)

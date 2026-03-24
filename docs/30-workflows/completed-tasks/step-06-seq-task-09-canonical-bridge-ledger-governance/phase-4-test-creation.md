# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 4                                               |
| Phase 名   | テスト作成                                      |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 3                                         |
| 後続 Phase | Phase 5（実装）                                 |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance を future implementation で破綻なく実行できる test design を作る。

## 実行タスク

- 契約テスト設計: canonical bridge / workflow ledger governance の state / action / DTO 契約テストを設計する
- 統合シナリオ設計: surface 横断または IPC 連携の統合シナリオを定義する
- モック戦略: store / IPC / service dependency の mock 境界を決める

## 参照資料

| 参照資料     | パス                                                                                              | 内容                                   |
| ------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Task index   | docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/index.md | 対象 task のメタ情報と受入基準         |
| Phase 1      | phase-1-requirements.md                                                                           | 要件定義の確定内容                     |
| Phase 2      | phase-2-design.md                                                                                 | 設計内容と validation matrix           |
| Phase 3      | phase-3-design-review.md                                                                          | review gate の判定                     |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: Phase 3 のゲート判定を確認する

design-review-report.md と gate-decision.md を確認し、Phase 4 着手条件が満たされていることを検証する。

### ステップ2: 契約テストの設計

canonical source table / bridge rule / status 遷移の各契約について、state / action / DTO の検証ポイントを test-matrix.md に定義する。

### ステップ3: 統合シナリオとモック戦略を定義する

surface 横断（task-workflow / backlog / lessons）の統合シナリオを定義し、store / IPC / service の mock 境界を mock-strategy.md に記録する。

### ステップ4: Phase 5 実装計画との整合を確認する

テスト対象と実装計画の対応関係を確認し、未カバー領域を明文化する。

## 統合テスト連携（Phase 1〜11は必須）

unit / integration / manual の test type ごとに対象シナリオを切り分ける。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: Step-01 bridge、canonical source table、follow-up ledger、lessons learned を同じ governance task にまとめる

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                             | 内容                                              |
| ---------------- | -------------------------------- | ------------------------------------------------- |
| テストマトリクス | outputs/phase-4/test-matrix.md   | unit / integration / contract / manual の観点整理 |
| モック戦略       | outputs/phase-4/mock-strategy.md | dependency / IPC / store mock 方針                |

## 完了条件

- [x] テストタイプごとの責務分離が定義されている
- [x] contract / integration / manual の対象シナリオが網羅されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-4/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)

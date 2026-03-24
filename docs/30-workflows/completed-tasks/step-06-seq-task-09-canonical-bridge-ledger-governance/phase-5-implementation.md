# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 5                                               |
| Phase 名   | 実装                                            |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 4                                         |
| 後続 Phase | Phase 6（テスト拡充）                           |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance の実装順序・変更 ownership・禁止事項を future executor 向けに固定する。

## 実行タスク

- 実装順序設計: Step-01 bridge、canonical source table、follow-up ledger、lessons learned を同じ governance task にまとめる を崩さない変更順序を定義する
- ownership 固定: 変更ファイルと各 concern の所有境界を定義する
- 禁止事項明記: silent fallback / local 判定 / no-op を再発させないルールを固定する

## 参照資料

| 参照資料     | パス                                                                                              | 内容                                   |
| ------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Task index   | docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/index.md | 対象 task のメタ情報と受入基準         |
| Phase 1      | phase-1-requirements.md                                                                           | 要件定義の確定内容                     |
| Phase 2      | phase-2-design.md                                                                                 | 設計内容と validation matrix           |
| Phase 3      | phase-3-design-review.md                                                                          | review gate の判定                     |
| Phase 4      | phase-4-test-creation.md                                                                          | Phase 4（テスト作成）の仕様書          |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: Phase 4 のテスト設計を確認する

test-matrix.md と mock-strategy.md を確認し、実装対象の境界を固定する。

### ステップ2: 実装順序と file ownership を定義する

Step-01 bridge → canonical source table → follow-up ledger → lessons learned の変更順序を implementation-plan.md に記録する。

### ステップ3: 禁止事項と rollback risk を明記する

silent fallback / local 判定 / no-op の再発防止ルールを file-change-scope.md に固定する。

### ステップ4: 統合テスト連携の前提条件を記録する

変更順序が integration contract を壊さないことを確認し、Phase 6 への handoff 条件を残す。

## 統合テスト連携（Phase 1〜11は必須）

変更順序が integration contract を壊さないことを前提条件として書く。

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

| 成果物       | パス                                   | 内容                          |
| ------------ | -------------------------------------- | ----------------------------- |
| 実装計画     | outputs/phase-5/implementation-plan.md | 変更順序・責務分離・ownership |
| 変更スコープ | outputs/phase-5/file-change-scope.md   | 対象ファイルと除外ファイル    |

## 完了条件

- [x] 実装順序と file ownership が定義されている
- [x] 禁止事項と rollback risk が明記されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-5/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md)

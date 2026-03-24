# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 8                                               |
| Phase 名   | リファクタリング                                |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 7                                         |
| 後続 Phase | Phase 9（品質検証）                             |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance をより単純に保つ refactor boundary を定義する。

## 実行タスク

- simpler alternative 再評価: より単純な構造へ寄せられる箇所を洗い出す
- 責務再整列: component / service / doc の責務を再確認する
- 回帰条件確認: refactor で崩してはいけない contract を固定する

## 参照資料

| 参照資料     | パス                                                                                              | 内容                                   |
| ------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Task index   | docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/index.md | 対象 task のメタ情報と受入基準         |
| Phase 1      | phase-1-requirements.md                                                                           | 要件定義の確定内容                     |
| Phase 2      | phase-2-design.md                                                                                 | 設計内容と validation matrix           |
| Phase 3      | phase-3-design-review.md                                                                          | review gate の判定                     |
| Phase 4      | phase-4-test-creation.md                                                                          | Phase 4（テスト作成）の仕様書          |
| Phase 5      | phase-5-implementation.md                                                                         | Phase 5（実装）の仕様書                |
| Phase 6      | phase-6-test-expansion.md                                                                         | Phase 6（テスト拡充）の仕様書          |
| Phase 7      | phase-7-coverage-check.md                                                                         | Phase 7（カバレッジ確認）の仕様書      |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: Phase 7 のカバレッジ結果を確認する

coverage-targets.md と integration-gate.md を確認し、refactor 対象の安全領域を特定する。

### ステップ2: simpler alternative を再評価する

governance state machine / source table / same-wave sync の各 concern について、より単純な構造へ寄せられる箇所を simplification-candidates.md に記録する。

### ステップ3: 責務再整列と refactor boundary を定義する

component / service / doc の責務を再確認し、崩してはいけない contract を refactor-boundaries.md に固定する。

### ステップ4: 回帰条件を確認する

refactor で integration contract が崩れないことを確認し、Phase 9 品質検証への handoff 条件を残す。

## 統合テスト連携（Phase 1〜11は必須）

refactor 後も integration contract を維持するための invariants を記録する。

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

| 成果物         | パス                                         | 内容                           |
| -------------- | -------------------------------------------- | ------------------------------ |
| リファクタ境界 | outputs/phase-8/refactor-boundaries.md       | 安全に整理できる構造と禁止事項 |
| 簡素化候補     | outputs/phase-8/simplification-candidates.md | より単純な代替案の比較         |

## 完了条件

- [x] simpler alternative と refactor boundary が整理されている
- [x] 崩してはいけない contract が明文化されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-8/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md)

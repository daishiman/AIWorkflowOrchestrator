# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 7                                               |
| Phase 名   | カバレッジ確認                                  |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 6                                         |
| 後続 Phase | Phase 8（リファクタリング）                     |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance の coverage gate と統合再確認条件を定義する。

## 実行タスク

- coverage gate 設計: line / branch / function / scenario の最低基準を定義する
- 統合ゲート設計: 再実行すべき smoke / integration / walkthrough を決める
- 不足観点整理: Phase 9 へ持ち越す residual risk を整理する

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
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: Phase 6 の回帰拡張計画を確認する

regression-expansion-plan.md と edge-case-matrix.md を確認し、coverage 対象の範囲を固定する。

### ステップ2: coverage gate を定義する

line / branch / function / scenario の最低基準と、governance 固有の concern 別 coverage 目標を coverage-targets.md に記録する。

### ステップ3: 統合ゲートを設計する

再実行すべき smoke / integration / walkthrough シナリオを integration-gate.md に定義する。

### ステップ4: 不足観点を residual risk として Phase 9 へ渡す

未カバーの concern と risk を整理し、Phase 8-9 での対処方針を記録する。

## 統合テスト連携（Phase 1〜11は必須）

coverage と統合ゲートの不足を整理し、Phase 9 へ handoff する。

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

| 成果物         | パス                                | 内容                                     |
| -------------- | ----------------------------------- | ---------------------------------------- |
| カバレッジ計画 | outputs/phase-7/coverage-targets.md | line / branch / function / scenario 目標 |
| 統合ゲート     | outputs/phase-7/integration-gate.md | 再実行すべき統合観点                     |

## 完了条件

- [x] coverage gate と integration gate が定義されている
- [x] 不足観点が residual risk として整理されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-7/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md)

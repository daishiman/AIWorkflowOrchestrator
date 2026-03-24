# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 6                                               |
| Phase 名   | テスト拡充                                      |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 5                                         |
| 後続 Phase | Phase 7（カバレッジ確認）                       |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance の edge / fallback / regression 観点を拡張する。

## 実行タスク

- 回帰観点追加: error / blocked / fallback / permission 境界を追加する
- 性能・安定性観点: 再レンダー、二重登録、重複 handoff の観点を追加する
- 手戻り防止: Phase 7-10 で見るべき不足領域を明文化する

## 参照資料

| 参照資料     | パス                                                                                              | 内容                                   |
| ------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Task index   | docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/index.md | 対象 task のメタ情報と受入基準         |
| Phase 1      | phase-1-requirements.md                                                                           | 要件定義の確定内容                     |
| Phase 2      | phase-2-design.md                                                                                 | 設計内容と validation matrix           |
| Phase 3      | phase-3-design-review.md                                                                          | review gate の判定                     |
| Phase 4      | phase-4-test-creation.md                                                                          | Phase 4（テスト作成）の仕様書          |
| Phase 5      | phase-5-implementation.md                                                                         | Phase 5（実装）の仕様書                |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: Phase 5 の実装計画を確認する

implementation-plan.md の変更スコープに対して、回帰テスト観点の不足を洗い出す。

### ステップ2: edge / fallback / regression 観点を追加する

error / blocked / fallback / permission 境界のテストシナリオを regression-expansion-plan.md に記録する。

### ステップ3: 境界ケースを整理する

再レンダー、二重登録、重複 handoff、legacy coexistence の境界ケースを edge-case-matrix.md に定義する。

### ステップ4: Phase 7-9 で確認すべき不足領域を明文化する

残余の未検証領域を Phase 7 coverage gate への input として整理する。

## 統合テスト連携（Phase 1〜11は必須）

regression へ blocked / fallback / legacy coexistence の観点を追加する。

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

| 成果物         | パス                                         | 内容                               |
| -------------- | -------------------------------------------- | ---------------------------------- |
| 回帰拡張計画   | outputs/phase-6/regression-expansion-plan.md | edge / error / fallback 観点の追加 |
| 境界ケース一覧 | outputs/phase-6/edge-case-matrix.md          | 未検証境界の明文化                 |

## 完了条件

- [x] fallback / blocked / legacy の回帰観点が追加されている
- [x] Phase 7-9 で確認すべき不足が見える化されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-6/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md)

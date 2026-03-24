# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 10                                              |
| Phase 名   | 最終レビュー                                    |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 9                                         |
| 後続 Phase | Phase 11（手動テスト）                          |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance を final gate で再評価し、戻り先と unresolved risk を決める。

## 実行タスク

- 最終レビュー: task 全体の整合・漏れ・矛盾を最終確認する
- 戻り先決定: MAJOR / CRITICAL の戻り先を明記する
- 完了条件照合: AC と phase output の整合を確認する

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
| Phase 8      | phase-8-refactoring.md                                                                            | Phase 8（リファクタリング）の仕様書    |
| Phase 9      | phase-9-quality-assurance.md                                                                      | Phase 9（品質検証）の仕様書            |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: Phase 1-9 の全成果物を俯瞰確認する

requirements-definition、design-summary、gate-decision、test-matrix、implementation-plan、regression-expansion-plan、coverage-targets、refactor-boundaries、quality-checklist を一括で整合チェックし、AC-1〜AC-4 との対応を確認する。

### ステップ2: AC-1〜AC-4 の検証実績を記録する

canonical source table（AC-1）、状態遷移定義（AC-2）、same-wave 更新ルール（AC-3）、follow-up/baseline 切り分け（AC-4）の各検証結果を final-review-report.md に記録する。

### ステップ3: MINOR / MAJOR 判定を行う

検出された指摘を分類し、final-gate-decision.md に判定結果を記録する。MINOR 指摘は未タスク仕様書へ変換する（P4 / P51 対策: 省略不可）。

### ステップ4: Phase 11 への handoff 条件を確認する

gate 判定が PASS / MINOR であれば Phase 11 へ進行。MAJOR / CRITICAL であれば戻り先 Phase を明示する。

## 統合テスト連携（Phase 1〜11は必須）

最終 gate で integration completeness と documentation completeness を同時確認する。

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

| 成果物           | パス                                    | 内容                      |
| ---------------- | --------------------------------------- | ------------------------- |
| 最終レビュー報告 | outputs/phase-10/final-review-report.md | 最終 review の結論        |
| 最終ゲート判定   | outputs/phase-10/final-gate-decision.md | MAJOR / CRITICAL の戻り先 |

## 完了条件

- [x] 最終 gate と戻り先が明示されている
- [x] AC と成果物の整合が確認されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-10/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md)

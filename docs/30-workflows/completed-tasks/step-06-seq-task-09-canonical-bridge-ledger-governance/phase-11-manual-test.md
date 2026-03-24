# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 11                                              |
| Phase 名   | 手動テスト                                      |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 10                                        |
| 後続 Phase | Phase 12（ドキュメント）                        |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance の manual walkthrough / screenshot 証跡契約を定義する。

## 実行タスク

- walkthrough 設計: 手動確認のシナリオと順序を定義する
- screenshot 設計: capture すべき TC-ID と画面状態を定義する
- fallback 記録方針: live preview 不可時の代替証跡方針を決める

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
| Phase 10     | phase-10-final-review.md                                                                          | Phase 10（最終レビュー）の仕様書       |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: governance 仕様の walkthrough シナリオを定義する

canonical source table → bridge rule → status 遷移（spec_created → implementation_ready → completed）→ same-wave sync の順に手動確認シナリオを manual-test-plan.md に記録する。

### ステップ2: 変更対象ファイルの手動確認を行う

Phase 5 の implementation-plan.md に基づき、task-workflow / backlog / lessons / legacy register の同期手順が実際のファイル構造と一致することを walkthrough で確認する。

### ステップ3: 発見した issue を記録する

walkthrough で発見した矛盾・漏れ・drift を discovered-issues.md に記録する。P53（CLI環境でのスクリーンショット制約）に該当する場合はテスト結果ログで代替する。

### ステップ4: Phase 12 への handoff 条件を確認する

未解決 issue の severity を判定し、Phase 12 着手条件を明記する。

## 統合テスト連携（Phase 1〜11は必須）

manual walkthrough と screenshot coverage を task 固有の TC-ID で管理する。

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

| 成果物                 | パス                                  | 内容                            |
| ---------------------- | ------------------------------------- | ------------------------------- |
| 手動テスト計画         | outputs/phase-11/manual-test-plan.md  | walkthrough / screenshot の手順 |
| スクリーンショット計画 | outputs/phase-11/screenshot-plan.json | TC-ID と capture 対象           |
| 発見事項               | outputs/phase-11/discovered-issues.md | manual walkthrough の所見       |

## 完了条件

- [x] manual test plan と screenshot plan が定義されている
- [x] fallback capture 方針が明記されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-11/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md)

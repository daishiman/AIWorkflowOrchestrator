# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 12                                              |
| Phase 名   | ドキュメント                                    |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 11                                        |
| 後続 Phase | Phase 13（PR作成）                              |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance の system spec / workflow / backlog / lessons の更新手順を定義する。

## 実行タスク

- implementation guide: future executor 向けの実装順序と注意点を記述する
- system spec sync: workflow / backlog / lessons / canonical refs の同期先を整理する
- unassigned formalization: follow-up へ落とす項目と current/baseline 切り分けを定義する
- skill feedback: タスク実行を通じたスキル改善点を記録する（改善点なしでも出力必須）

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
| Phase 11     | phase-11-manual-test.md                                                                           | Phase 11（手動テスト）の仕様書         |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: implementation-guide.md を作成する

Part 1: 中学生レベル概念説明（governance を「学校の成績表と提出物管理」に例える日常アナロジー必須）。Part 2: 開発者向け実装詳細（canonical source table の構造、bridge rule の適用手順、状態遷移の判定ロジック）。

### ステップ2: system-spec-update-summary.md を作成する

task-workflow / backlog / lessons / legacy register の同期対象を特定し、更新計画を記録する。P26（仕様書更新遅延）対策として、PR マージを待たず Phase 12 完了時点で更新する。

### ステップ3: unassigned-task-detection.md を作成する

follow-up formalization 対象をスキャンし、未タスク化すべき項目を検出する。P3 / P38 準拠で3ステップ（①指示書作成 → ②task-workflow 残課題テーブル登録 → ③関連仕様書リンク追加）を全て完了する。0件でもレポート必須。

### ステップ4: skill-feedback-report.md を作成する

タスク実行を通じたスキル改善点を記録する。改善点なしの場合も「改善点なし」として出力必須（P28 対策）。

### ステップ5: documentation-changelog.md を作成する

全ステップの更新実績を記録する。P4 / P51 対策: 全 Step 完了前に「完了」と記載しない。P43 対策: サブエージェント完了後に `git diff --stat` で実際の変更ファイル数を検証する。

## 統合テスト連携（Phase 1〜11は必須）

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

| 成果物               | パス                                                   | 内容                                     |
| -------------------- | ------------------------------------------------------ | ---------------------------------------- |
| 実装ガイド           | outputs/phase-12/implementation-guide.md               | 後続実装者への handoff                   |
| 仕様同期サマリー     | outputs/phase-12/system-spec-update-summary.md         | system spec / workflow sync の要約       |
| 更新履歴             | outputs/phase-12/documentation-changelog.md            | 同ターン更新の記録                       |
| 未タスク検出         | outputs/phase-12/unassigned-task-detection.md          | formalize 対象の follow-up 一覧          |
| Phase12 準拠チェック | outputs/phase-12/phase12-task-spec-compliance-check.md | task-spec skill 準拠確認                 |
| スキルフィードバック | outputs/phase-12/skill-feedback-report.md              | スキル改善提案（改善点なしの場合も出力） |

## 完了条件

- [x] implementation-guide / system-spec-update-summary / unassigned formalization の構成が揃っている
- [x] same-wave sync 対象が漏れなく列挙されている
- [x] skill-feedback-report.md が出力されている（改善点なしでも「改善点なし」として出力必須）
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-12/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)

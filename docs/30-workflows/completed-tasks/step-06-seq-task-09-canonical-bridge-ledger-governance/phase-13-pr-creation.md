# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 13                                              |
| Phase 名   | PR作成                                          |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | Phase 12                                        |
| 後続 Phase | なし                                            |
| ステータス | blocked                                         |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance の PR 準備条件を整理する。ユーザー指示なしに PR は作成しない。

## 実行タスク

- PR blocked 条件確認: ユーザー指示なしに PR を作成しない前提を明記する
- CI / review 準備: 将来の PR に必要な evidence bundle を整理する
- handover: レビュー担当が見るべき docs / evidence / risk を整理する

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
| Phase 12     | phase-12-documentation.md                                                                         | Phase 12（ドキュメント）の仕様書       |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: Phase 1-12 の全成果物パスを検証する

artifacts.json に登録された全成果物が outputs/ ディレクトリに存在することを `ls` で確認する。

### ステップ2: PR blocked 条件を明記する

ユーザー指示なしに PR を作成しない前提を pr-preparation.md に記録する。依存タスク8件の完了状態も確認する。

### ステップ3: evidence bundle を整理する

gate-decision（Phase 3）、final-gate-decision（Phase 10）、quality-checklist（Phase 9）、coverage-targets（Phase 7）の summary を pr-preparation.md にまとめる。

### ステップ4: レビュー担当向け handover checklist を作成する

レビュー担当が見るべき docs / evidence / risk を整理し、pr-preparation.md に handover セクションとして追加する。

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

| 成果物     | パス                               | 内容                               |
| ---------- | ---------------------------------- | ---------------------------------- |
| PR準備メモ | outputs/phase-13/pr-preparation.md | PR 作成前の確認項目と blocked 条件 |

## 完了条件

- [ ] PR blocked 条件が明記されている
- [ ] future PR 用の handover 情報が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-13/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- なし（ユーザー指示待ち）

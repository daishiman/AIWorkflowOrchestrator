# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 13                                        |
| Phase名    | PR作成                                    |
| カテゴリ   | 完了                                      |
| ステータス | not_started                               |
| 前提Phase  | Phase 12                                  |
| 後続Phase  | なし                                      |

## 目的

リリース提出物を整備し、レビュー可能な状態で最終引き渡しを行う。

## 実行タスク

- タスク1: 提出物チェックを実行する
- タスク2: 変更説明を作成する
- タスク3: 実施許可条件を確認する

### タスク1: 提出物チェックを実行する

**目的**: 仕様・実装・検証の提出物欠落をゼロにする。

**手順**:

1. Phase 1-12 の成果物存在を確認する。
2. `artifacts.json` と成果物一覧の整合を確認する。
3. 残課題がある場合は未タスクへ分離する。

**期待される成果物**:

- 提出物チェック結果

### タスク2: 変更説明を作成する

**目的**: レビュー担当が短時間で判断できる説明を作る。

**手順**:

1. Team-A/B/C の変更点を分離して記述する。
2. 受入基準 AC-1..8 の達成根拠を記述する。
3. 検証結果と既知制約を記述する。

**期待される成果物**:

- PR説明ドラフト

### タスク3: 実施許可条件を確認する

**目的**: ユーザー指示に従いコミット/PRの実行条件を明示する。

**手順**:

1. ユーザーがコミット実行を許可したか確認する。
2. ユーザーが PR 作成を許可したか確認する。
3. 許可が無い場合は本Phaseを pending のまま維持する。

**期待される成果物**:

- 実施許可判定ログ

## 参照資料

| 参照資料       | パス                                                                                          | 説明             |
| -------------- | --------------------------------------------------------------------------------------------- | ---------------- |
| Phase 1成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-1/`  | 要件定義         |
| Phase 2成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-2/`  | 設計定義         |
| Phase 5成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/`  | 実装結果         |
| Phase 6成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-6/`  | テスト拡充結果   |
| Phase 7成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-7/`  | カバレッジ結果   |
| Phase 8成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-8/`  | リファクタ結果   |
| Phase 9成果物  | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-9/`  | 品質保証結果     |
| Phase 10成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-10/` | 最終レビュー結果 |
| Phase 11成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-11/` | 手動テスト結果   |
| Phase 12成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-12/` | 文書同期結果     |
| タスク仕様書   | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/index.md`          | 全体要件         |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                 | 内容       |
| ---------- | -------------------------------------------------------------------- | ---------- |
| タスク台帳 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 完了更新先 |

## 成果物

| 成果物         | パス                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------- |
| 提出物チェック | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-13/release-checklist.md` |
| PR説明ドラフト | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-13/pr-description.md`    |
| 実施許可ログ   | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-13/permission-log.md`    |

## 完了条件

- [ ] Phase 1-12 成果物の欠落が無い
- [ ] Team-A/B/C 変更説明が作成されている
- [ ] AC-1..8 達成根拠が記載されている
- [ ] コミット/PR 実施許可の有無が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

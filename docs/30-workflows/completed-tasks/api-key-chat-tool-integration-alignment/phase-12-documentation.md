# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 12                                        |
| Phase名    | ドキュメント更新                          |
| カテゴリ   | 文書化                                    |
| ステータス | completed                                 |
| 前提Phase  | Phase 11                                  |
| 後続Phase  | Phase 13                                  |

## 目的

実装結果と検証結果を仕様書正本へ同期し、再発防止情報を台帳へ固定する。

## 実行タスク

- タスク1: 実装ガイドを2部構成で作成する
- タスク2: system spec 同期タスクを実行する
- タスク3: ドキュメント更新履歴を作成する
- タスク4: 未タスク検出レポートを作成する
- タスク5: スキルフィードバックレポートを作成する

### タスク1: 実装ガイドを2部構成で作成する

**目的**: 初学者向け説明と開発者向け詳細を分離して記録する。

**手順**:

1. Part 1 を中学生向け説明で作成する。
2. Part 2 を型定義、API シグネチャ、エラー処理込みで作成する。
3. `validate-phase12-implementation-guide.js` で検証する。

**期待される成果物**:

- implementation-guide.md

### タスク2: system spec 同期タスクを実行する

**目的**: aiworkflow-requirements 正本へ完了情報を同期する。

**手順**:

1. Step 1-A: 完了タスク記録、LOGS、関連リンクを同期する。
2. Step 1-B: 実装状況テーブルを更新する。
3. Step 1-C: 関連タスクテーブルを更新する。
4. Step 2: 新規 I/F 変更がある場合だけ system spec 本文を更新する。

**期待される成果物**:

- spec-update-summary.md
- system spec 更新差分

### タスク3: ドキュメント更新履歴を作成する

**目的**: 今回作成/更新した成果物を監査可能な形で記録する。

**手順**:

1. Phase 12 で作成した成果物一覧を作成する。
2. system spec / スキル台帳 / 画面証跡の更新ファイルを記録する。
3. Step 1-A/1-B/1-C/Step2 の完了状態を記録する。

**期待される成果物**:

- documentation-changelog.md

### タスク4: 未タスク検出レポートを作成する

**目的**: 今回差分由来の未タスク有無を明示し、0件でも証跡を残す。

**手順**:

1. `detect-unassigned-tasks` を対象ディレクトリへ実行する。
2. `verify-unassigned-links` で参照切れを監査する。
3. `audit-unassigned-tasks --diff-from HEAD` で current violations を確認する。

**期待される成果物**:

- unassigned-task-detection.md

### タスク5: スキルフィードバックレポートを作成する

**目的**: 使用したスキルの改善点と運用上の有効点を記録する。

**手順**:

1. `aiworkflow-requirements` の使用結果を評価する。
2. `task-specification-creator` の使用結果を評価する。
3. 改善点がない場合も「改善点なし」を明示して出力する。

**期待される成果物**:

- skill-feedback-report.md

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
| Phase 11成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-11/` | 手動検証結果     |
| Phase 12ガイド | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                   | 実行手順         |
| 仕様更新フロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                | 同期手順         |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                         | 内容             |
| ------------ | ---------------------------------------------------------------------------- | ---------------- |
| IPC全体仕様  | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        | API/IPC 同期先   |
| LLM IPC型    | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`         | 型同期先         |
| Settings仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`        | UI同期先         |
| セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 安全性同期先     |
| 台帳         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 完了タスク同期先 |
| 教訓         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 苦戦箇所同期先   |

## 成果物

| 成果物               | パス                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 実装ガイド           | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-12/implementation-guide.md`      |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-12/spec-update-summary.md`       |
| 変更履歴             | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出         | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-12/unassigned-task-detection.md` |
| スキルフィードバック | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-12/skill-feedback-report.md`     |

## 完了条件

- [x] 実装ガイド2部構成が作成されている
- [x] Step 1-A/1-B/1-C が同期されている
- [x] Step 2 実行要否が判定記録されている
- [x] 変更履歴と未タスク検出とフィードバックが作成されている
- [x] 本Phase内の全タスクを100%実行完了

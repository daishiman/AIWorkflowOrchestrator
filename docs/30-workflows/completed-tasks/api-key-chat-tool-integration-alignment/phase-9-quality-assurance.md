# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 |
| Phase      | 9                                         |
| Phase名    | 品質保証                                  |
| カテゴリ   | 品質                                      |
| ステータス | completed                                 |
| 前提Phase  | Phase 8                                   |
| 後続Phase  | Phase 10                                  |

## 目的

機能品質・型品質・セキュリティ品質を横断検証し、最終レビューへ渡す。

## 実行タスク

- タスク1: 実行品質を検証する
- タスク2: セキュリティ品質を検証する
- タスク3: 仕様整合品質を検証する

### タスク1: 実行品質を検証する

**目的**: 変更範囲のビルド・型・テスト品質を確定する。

**手順**:

1. lint と typecheck を実行する。
2. Team-A/B/C テストスイートを実行する。
3. 失敗がある場合は原因と再現手順を記録する。

**期待される成果物**:

- 品質検証ログ

### タスク2: セキュリティ品質を検証する

**目的**: API キーと AuthKey の漏えい経路を遮断する。

**手順**:

1. エラーメッセージとログ出力のマスク処理を確認する。
2. preload 公開 API 範囲が過剰でないことを確認する。
3. IPC sender validation を確認する。

**期待される成果物**:

- セキュリティ検証ログ

### タスク3: 仕様整合品質を検証する

**目的**: 実装差分と Phase 1-8 成果物の整合を確定する。

**手順**:

1. AC-1..8 の達成証跡を整理する。
2. 未達項目を未タスク候補へ分離する。
3. Phase 10 で使うレビュー資料を固定する。

**期待される成果物**:

- 仕様整合検証結果

## 参照資料

| 参照資料      | パス                                                                                         | 説明           |
| ------------- | -------------------------------------------------------------------------------------------- | -------------- |
| Phase 5成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-5/` | 実装結果       |
| Phase 8成果物 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-8/` | リファクタ結果 |
| AC定義        | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/index.md`         | 受入基準       |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                         | 内容       |
| ------------ | ---------------------------------------------------------------------------- | ---------- |
| セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC防御    |
| タスク台帳   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 完了同期先 |
| 教訓集       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 苦戦記録先 |

## 統合テスト連携

- Team-A/B/C 統合テストを同一コミットで再実行し、検証ログを固定する。
- 実行ログは Phase 10 レビュー判定の入力にする。

## 成果物

| 成果物               | パス                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| 品質保証レポート     | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-9/quality-report.md`  |
| セキュリティ検証結果 | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-9/security-review.md` |
| AC達成証跡           | `docs/30-workflows/completed-tasks/api-key-chat-tool-integration-alignment/outputs/phase-9/ac-evidence.md`     |

## 完了条件

- [x] lint/typecheck/test が PASS している
- [x] 秘密情報漏えい経路の検証が完了している
- [x] AC-1..8 の達成証跡が整理されている
- [x] Phase 10 レビュー資料が確定している
- [x] 本Phase内の全タスクを100%実行完了

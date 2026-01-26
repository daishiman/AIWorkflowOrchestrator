# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 12                                        |
| 機能名 | TASK-4-2-permission-resolver-ipc-handlers |
| 作成日 | 2026-01-25                                |

## 目的

実装内容をドキュメントに反映し、システム仕様書を更新する。未タスクを検出・記録する。

## 実行タスク

### Task 12-1: 実装ガイド作成

**ファイル**: `outputs/phase-12/implementation-guide.md`

**Part 1: 概念的説明（初学者・非技術者向け）**

- 権限確認ダイアログの目的と役割
- ユーザーにとっての意味
- セキュリティ上の重要性

**Part 2: 技術的詳細（開発者向け）**

- アーキテクチャ概要
- IPC通信フロー
- 各コンポーネントの責務
- 使用例・コードサンプル
- トラブルシューティング

### Task 12-2: システム仕様書更新（aiworkflow-requirements）

📖 **必須**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を参照

**Step 1: タスク完了記録（必須）**

| 更新対象                | 更新内容                                      |
| ----------------------- | --------------------------------------------- |
| interfaces-agent-sdk.md | 「## 完了タスク」にTASK-4-2追加               |
| interfaces-agent-sdk.md | 「## 関連ドキュメント」に実装ガイドリンク追加 |
| LOGS.md                 | aiworkflow-requirementsスキルの使用履歴追加   |
| topic-map.md            | 必要に応じて更新                              |

**Step 2: システム仕様更新（条件付き）**

| 変更タイプ            | 更新対象ファイル         | 更新内容                    |
| --------------------- | ------------------------ | --------------------------- |
| IPC Handlerセクション | interfaces-agent-sdk.md  | permission-handlers.ts追加  |
| Preload APIセクション | interfaces-agent-sdk.md  | skillPermissionAPI追加      |
| セキュリティ          | security-api-electron.md | 権限確認IPC関連セキュリティ |

**更新チェックリスト:**

- [ ] 新規IPCチャンネル `skill:permission-request` / `skill:permission-response` 追加
- [ ] 新規Preload API `skillPermissionAPI` 追加
- [ ] 新規型定義 `SkillPermissionAPI` (Window型拡張) 追加
- [ ] 新規React Hook `usePermissionDialog` 追加
- [ ] 新規UIコンポーネント `PermissionDialog` 追加
- [ ] セキュリティ要件（validateIpcSender、ホワイトリスト）追加
- [ ] 変更履歴にバージョン追記

### Task 12-3: ドキュメント更新履歴作成

```bash
# 自動生成スクリプト使用（推奨）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/TASK-4-2-permission-resolver-ipc-handlers
```

**ファイル**: `outputs/phase-12/documentation-changelog.md`

| 更新ドキュメント         | 更新内容                     | 更新日 |
| ------------------------ | ---------------------------- | ------ |
| interfaces-agent-sdk.md  | IPC Handler/Preload API追加  | -      |
| security-api-electron.md | 権限確認セキュリティ要件追加 | -      |
| implementation-guide.md  | 新規作成                     | -      |

### Task 12-4: 未タスク検出レポート作成

```bash
# コードベースからTODO/FIXME検出
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/TASK-4-2-permission-resolver-ipc-handlers \
  --sources "apps/desktop/src/"
```

**ファイル**: `outputs/phase-12/unassigned-task-detection.md`

**検出対象:**

| ソース           | 検出基準           |
| ---------------- | ------------------ |
| テスト結果       | FAILテスト         |
| 発見課題         | 重要度「高」の課題 |
| アクセシビリティ | WCAG違反項目       |
| コードコメント   | TODO/FIXME         |

**レポート形式（0件の場合も出力必須）:**

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | X件     |
| 発見課題         | X件     |
| アクセシビリティ | X件     |
| コードコメント   | X件     |
| **合計**         | **X件** |

## 検出タスク一覧

（検出内容または「検出タスクなし」）
```

## 統合テスト連携【必須】

ドキュメント更新の整合性確認:

| 確認項目     | 内容                    | 結果 |
| ------------ | ----------------------- | ---- |
| 実装ガイド   | Part 1/Part 2両方作成   | -    |
| 仕様書更新   | Step 1/Step 2完了       | -    |
| 更新履歴     | 全変更記録              | -    |
| 未タスク検出 | レポート作成（0件含む） | -    |

## 参照資料

| 資料名         | パス                                                                           | 説明           |
| -------------- | ------------------------------------------------------------------------------ | -------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md`                                       | Phase 11成果物 |
| 発見課題       | `outputs/phase-11/discovered-issues.md`                                        | Phase 11成果物 |
| 仕様更新フロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様更新ガイド |

### システム仕様（aiworkflow-requirements）

> 実装内容をシステム仕様書に反映する際に参照

| 参照資料             | パス                                                                         | 内容                |
| -------------------- | ---------------------------------------------------------------------------- | ------------------- |
| Agent SDK仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | IPC/Preload API定義 |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | セキュリティ要件    |

## 成果物

| 成果物               | パス                                            | 説明                 |
| -------------------- | ----------------------------------------------- | -------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 実装説明ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 更新内容の記録       |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 残課題の記録         |

## 完了条件

- [ ] 実装ガイドが作成されている（Part 1/Part 2両方）
- [ ] システム仕様書が更新されている（Step 1必須、Step 2条件付き）
  - [ ] interfaces-agent-sdk.mdに完了タスク記録
  - [ ] interfaces-agent-sdk.mdにIPC Handler/Preload API追加
  - [ ] security-api-electron.mdにセキュリティ要件追加
  - [ ] LOGS.mdに使用履歴追加
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成

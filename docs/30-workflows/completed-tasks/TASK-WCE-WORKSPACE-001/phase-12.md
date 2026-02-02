# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 12                     |
| 機能名 | TASK-WCE-WORKSPACE-001 |
| 作成日 | 2026-02-02             |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

#### Part 1: 概念的説明（中学生でもわかる版）

| セクション   | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| なぜ必要か   | 「作業フォルダ」という概念と、なぜファイルを整理する必要があるかの説明           |
| 日常の例え   | パソコンのフォルダ整理と同様に、AIも「どのフォルダで作業するか」を知る必要がある |
| 何ができるか | AIがファイルを読み書きする際、指定したフォルダ内のファイルだけを扱えるようになる |

#### Part 2: 技術的詳細（開発者向け）

| セクション         | 内容                                                  |
| ------------------ | ----------------------------------------------------- |
| アーキテクチャ     | Main Process-Renderer Process間の連携図               |
| インターフェース   | FileReadRequest, FileWriteRequestの型定義             |
| API仕様            | chat-edit:read-file, chat-edit:write-fileのパラメータ |
| ユーティリティ     | extractFilesFromTree, flattenFileTreesの使用方法      |
| エラーハンドリング | PERMISSION_DENIEDエラーの発生条件と対処               |

### Task 2: システムドキュメント更新【必須】

#### Step 1-A: タスク完了記録【必須】

- [ ] `llm-workspace-chat-edit.md`に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加
- [ ] topic-map.mdに新規セクションエントリを追加（該当する場合）

**更新対象ファイル**:

| ファイル                                                                       | 更新内容                             |
| ------------------------------------------------------------------------------ | ------------------------------------ |
| `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | 完了タスクセクション追加             |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                               | タスク完了エントリ追加               |
| `.claude/skills/task-specification-creator/LOGS.md`                            | タスク完了記録追加                   |
| `.claude/skills/aiworkflow-requirements/references/topic-map.md`               | 新規セクションエントリ（該当時のみ） |

#### Step 1-B: 実装状況テーブル更新【必須】

| ファイル         | 更新内容                                    |
| ---------------- | ------------------------------------------- |
| api-endpoints.md | chat-edit関連エンドポイントのステータス確認 |

#### Step 1-C: 関連タスクテーブル更新【該当する場合】

| ファイル                   | 更新内容                           |
| -------------------------- | ---------------------------------- |
| llm-workspace-chat-edit.md | 関連タスクテーブルのステータス更新 |

#### Step 2: システム仕様更新【条件付き】

**更新判断**:

| 項目                     | 判断                                  |
| ------------------------ | ------------------------------------- |
| 新規インターフェース追加 | あり（FileReadRequest.workspacePath） |
| 既存インターフェース変更 | あり（型定義拡張）                    |
| 新規定数/設定値追加      | なし                                  |
| 結論                     | **更新必要**                          |

**更新対象**:

| ファイル                   | 更新内容                               |
| -------------------------- | -------------------------------------- |
| llm-workspace-chat-edit.md | IPCチャンネル仕様にworkspacePathを追加 |

### Task 3: ドキュメント更新履歴作成【必須】

```bash
# ドキュメント更新履歴生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js --workflow docs/30-workflows/TASK-WCE-WORKSPACE-001

# Phase 12完了登録
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-WCE-WORKSPACE-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

### Task 4: 未タスク検出【必須】

| #   | ソース               | 確認項目                       |
| --- | -------------------- | ------------------------------ |
| 1   | Phase 3レビュー結果  | MINOR判定の指摘事項            |
| 2   | Phase 10レビュー結果 | MINOR判定の指摘事項            |
| 3   | Phase 11手動テスト   | スコープ外の発見事項・改善提案 |
| 4   | コードベース         | TODO/FIXME/HACK/XXXコメント    |

```bash
# 未タスク検出スクリプト
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/handlers \
  --scan apps/desktop/src/renderer/features/workspace-chat-edit \
  --output .tmp/unassigned-candidates.json
```

## 参照資料

| 資料名     | パス                                     | 説明           |
| ---------- | ---------------------------------------- | -------------- |
| 手動テスト | `outputs/phase-11/manual-test-result.md` | Phase 11成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容     |
| ----------------------- | ------------------------------------------------------------------------------ | -------- |
| Workspace Chat Edit仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | 既存仕様 |
| 仕様更新フロー          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 更新手順 |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】llm-workspace-chat-edit.mdに「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】topic-map.mdに新規セクションエントリを追加した（該当する場合）**
- [ ] **【Task 2 Step 1-B】api-endpoints.mdの実装状況を確認した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 2】llm-workspace-chat-edit.mdにIPCチャンネル仕様を更新した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                            |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成                                                        |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成 |

## 次のPhase

Phase 13: PR作成

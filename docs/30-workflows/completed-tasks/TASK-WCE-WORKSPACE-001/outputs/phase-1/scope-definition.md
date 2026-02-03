# スコープ定義: TASK-WCE-WORKSPACE-001

## 含むもの

### 実装変更

| ファイル            | 変更内容                                               |
| ------------------- | ------------------------------------------------------ |
| chatEditHandlers.ts | getWorkspacePath()をリクエストパラメータから取得に変更 |
| chatEditHandlers.ts | handleReadFile/handleWriteFileにworkspacePath引数追加  |
| useFileContext.ts   | getAvailableFiles()でfolderFileTreesから一覧抽出       |
| fileTreeUtils.ts    | extractFilesFromTree()ユーティリティ関数新規作成       |

### テスト追加

| テストファイル                     | テスト内容                     |
| ---------------------------------- | ------------------------------ |
| chatEditHandlers.workspace.test.ts | ワークスペースパス検証テスト   |
| useFileContext.workspace.test.ts   | ファイル一覧取得テスト         |
| fileTreeUtils.test.ts              | ツリー走査ユーティリティテスト |

### ドキュメント更新

| ドキュメント                         | 更新内容                 |
| ------------------------------------ | ------------------------ |
| llm-workspace-chat-edit.md           | 完了タスクセクション追加 |
| LOGS.md (aiworkflow-requirements)    | タスク完了エントリ追加   |
| LOGS.md (task-specification-creator) | タスク完了記録追加       |

## 含まないもの

| 項目                            | 理由                                           |
| ------------------------------- | ---------------------------------------------- |
| Workspace管理機能自体の実装変更 | 既存実装を活用し、最小限の連携のみ             |
| ファイルウォッチャー実装        | リアルタイム更新は別タスクとして分離           |
| ファイルツリーUIコンポーネント  | UI実装は既存を活用                             |
| Preload API型定義の大幅変更     | 後方互換性維持のためオプションパラメータで対応 |

## 依存関係

### 依存するコンポーネント

| コンポーネント    | 依存内容                           |
| ----------------- | ---------------------------------- |
| workspaceSlice.ts | workspace.folders, folderFileTrees |
| workspace.ts (型) | FolderId, FileNode型定義           |
| chatEditAPI       | Preload API経由でのIPC呼び出し     |

### 被依存コンポーネント

| コンポーネント     | 影響                       |
| ------------------ | -------------------------- |
| ChatEditPanel      | attachFile()の動作変更なし |
| FileContextDisplay | 表示ロジック変更なし       |

## リスク評価

| リスク                         | 影響度 | 発生確率 | 対策                                  |
| ------------------------------ | ------ | -------- | ------------------------------------- |
| WorkspaceSliceの構造変更が必要 | 中     | 低       | folderFileTreesを直接参照し変更不要   |
| IPC通信追加による複雑化        | 低     | 低       | 既存IPCパターンを踏襲                 |
| セキュリティ制約の回避リスク   | 高     | 低       | パス検証ロジックを強化、テストを追加  |
| 後方互換性の破壊               | 中     | 低       | workspacePathをオプションパラメータ化 |

## 作成日

2026-02-02

# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 5                      |
| 機能名 | TASK-WCE-WORKSPACE-001 |
| 作成日 | 2026-02-02             |

## 目的

テストを通すための最小限の実装を行う。

## 実行タスク

### Task 1: chatEditHandlers.ts修正

`apps/desktop/src/main/handlers/chatEditHandlers.ts`

**修正内容**:

1. `getWorkspacePath()`関数をリクエストパラメータから取得する方式に変更
2. `handleReadFile`にworkspacePathパラメータを追加
3. `handleWriteFile`にworkspacePathパラメータを追加
4. ワークスペースパス検証ロジックの更新

| 関数名            | 修正内容                                            |
| ----------------- | --------------------------------------------------- |
| getWorkspacePath  | 引数でworkspacePath受け取り、nullの場合はnullを返す |
| handleReadFile    | リクエストからworkspacePathを取得して検証に使用     |
| handleWriteFile   | リクエストからworkspacePathを取得して検証に使用     |
| isWithinWorkspace | workspacePathがnullの場合は検証をスキップ           |

### Task 2: useFileContext.ts修正

`apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts`

**修正内容**:

1. `getAvailableFiles()`でfolderFileTreesからファイル一覧を抽出
2. extractFilesFromTreeユーティリティを使用
3. workspaceとfolderFileTreesをStore経由で取得

| 関数名            | 修正内容                                        |
| ----------------- | ----------------------------------------------- |
| getAvailableFiles | folderFileTreesを走査してファイルパス一覧を返す |

### Task 3: extractFilesFromTreeユーティリティ作成

`apps/desktop/src/renderer/features/workspace-chat-edit/utils/fileTreeUtils.ts`

| 関数名               | 実装内容                                         |
| -------------------- | ------------------------------------------------ |
| extractFilesFromTree | FileTreeNodeを再帰的に走査してファイル一覧を抽出 |
| flattenFileTrees     | Map<FolderId, FileTreeNode>を統合してフラット化  |
| isFileNode           | ノードがファイルかどうかを判定                   |

### Task 4: Preload API型定義更新

`apps/desktop/src/preload/chatEditAPI.ts` または関連型定義ファイル

| 更新内容                                       |
| ---------------------------------------------- |
| FileReadRequestにworkspacePath?: stringを追加  |
| FileWriteRequestにworkspacePath?: stringを追加 |

### Task 5: attachFile修正

`useFileContext.ts`の`attachFile`関数を修正し、workspacePathを取得してIPCに渡す。

| 関数名     | 修正内容                                            |
| ---------- | --------------------------------------------------- |
| attachFile | workspace.folders[0]?.pathをworkspacePathとして使用 |

## 参照資料

| 資料名       | パス                                     | 説明          |
| ------------ | ---------------------------------------- | ------------- |
| 設計書       | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容         |
| ----------------------- | ------------------------------------------------------------------------------ | ------------ |
| アーキテクチャパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | 実装パターン |
| Workspace Chat Edit仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | 既存仕様     |

## アーキテクチャ層別実装

| 層               | 実装観点                                | 実装ファイル配置                                                                 |
| ---------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| Main Process     | chatEditHandlersのworkspaceパス取得修正 | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                             |
| Renderer Process | useFileContextのファイル一覧取得修正    | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts` |
| Shared           | extractFilesFromTreeユーティリティ      | `apps/desktop/src/renderer/features/workspace-chat-edit/utils/fileTreeUtils.ts`  |

## 統合テスト連携

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                        |
| ------------------ | ------------------------------------------- |
| API接続            | IPCリクエストにworkspacePathを追加          |
| エラーハンドリング | PERMISSION_DENIEDエラーの適切な返却         |
| 状態同期           | Workspace Slice変更時のファイル一覧自動更新 |

## 実行手順

### 1. extractFilesFromTreeユーティリティ実装

```bash
# ユーティリティ実装後のテスト
pnpm --filter @repo/desktop test -- --run fileTreeUtils
```

### 2. useFileContext修正

```bash
# useFileContext修正後のテスト
pnpm --filter @repo/desktop test -- --run useFileContext.workspace
```

### 3. chatEditHandlers修正

```bash
# chatEditHandlers修正後のテスト
pnpm --filter @repo/desktop test -- --run chatEditHandlers.workspace
```

### 4. 全テスト実行

```bash
# 全テストがGreenになることを確認
pnpm --filter @repo/desktop test -- --run
```

## 成果物

| 成果物     | パス                                                                             | 説明             |
| ---------- | -------------------------------------------------------------------------------- | ---------------- |
| 実装コード | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                             | Main Process修正 |
| 実装コード | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts` | Renderer修正     |
| 実装コード | `apps/desktop/src/renderer/features/workspace-chat-edit/utils/fileTreeUtils.ts`  | ユーティリティ   |

## 完了条件

- [ ] chatEditHandlers.tsのgetWorkspacePath()が修正されている
- [ ] useFileContext.tsのgetAvailableFiles()が修正されている
- [ ] extractFilesFromTreeユーティリティが作成されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] フロント/バック接続が実装されている
- [ ] TODOコメント2箇所が削除されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充

# Phase 2: 設計

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 2                      |
| 機能名 | TASK-WCE-WORKSPACE-001 |
| 作成日 | 2026-02-02             |

## 目的

要件を実現可能な構造に落とし込み、Main Process-Renderer Process間の連携方式を設計する。

## 実行タスク

### Task 1: 連携方式の設計

**方式A: Main ProcessからRenderer経由でWorkspace情報を取得（推奨）**

Main ProcessはRenderer ProcessからのIPC呼び出し時にworkspaceパスを引数として受け取る方式。

```
Renderer Process                    Main Process
     │                                   │
     │  chat-edit:read-file              │
     │  { filePath, workspacePath }      │
     ├──────────────────────────────────>│
     │                                   │ workspacePathでアクセス検証
     │  FileReadResult                   │
     │<──────────────────────────────────┤
```

**理由**:

- Main ProcessはRenderer Processの状態（Zustand Store）に直接アクセスできない
- 既存のIPCパターンと整合性が取れる
- workspaceSliceは既にRenderer側で管理されている

### Task 2: useFileContext修正設計

```
useFileContext Hook
     │
     ├─ useStore(state => state.workspace)    // Workspace状態を取得
     ├─ useStore(state => state.folderFileTrees)  // ファイルツリーを取得
     │
     └─ getAvailableFiles()
           │
           └─ folderFileTreesからファイルパス一覧を抽出
                 └─ 再帰的にファイルノードを収集
```

### Task 3: chatEditHandlers修正設計

**修正点**:

1. `chat-edit:read-file`と`chat-edit:write-file`のリクエストに`workspacePath`パラメータを追加
2. `getWorkspacePath()`関数をリクエストパラメータから取得する方式に変更
3. Preload APIの型定義を更新

**型定義**:

| 型名             | フィールド                 | 説明                             |
| ---------------- | -------------------------- | -------------------------------- |
| FileReadRequest  | filePath: string           | 読み込むファイルパス             |
|                  | workspacePath?: string     | ワークスペースパス（オプション） |
| FileWriteRequest | filePath: string           | 書き込むファイルパス             |
|                  | content: string            | 書き込む内容                     |
|                  | workspacePath?: string     | ワークスペースパス（オプション） |
|                  | options?: FileWriteOptions | 書き込みオプション               |

### Task 4: ファイルツリー走査ユーティリティ設計

folderFileTreesからファイル一覧を抽出するユーティリティ関数を設計する。

| 関数名               | 引数                               | 戻り値                           | 説明                           |
| -------------------- | ---------------------------------- | -------------------------------- | ------------------------------ |
| extractFilesFromTree | tree: FileTreeNode                 | { path: string; name: string }[] | ツリーからファイル一覧を抽出   |
| flattenFileTrees     | trees: Map<FolderId, FileTreeNode> | { path: string; name: string }[] | 複数ツリーを統合してフラット化 |

## 参照資料

| 資料名         | パス                                                       | 説明          |
| -------------- | ---------------------------------------------------------- | ------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md`               | Phase 1成果物 |
| workspaceSlice | `apps/desktop/src/renderer/store/slices/workspaceSlice.ts` | Workspace実装 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                  |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------- |
| アーキテクチャパターン  | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | Electronパターン      |
| API設計                 | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`           | IPCエンドポイント仕様 |
| Workspace Chat Edit仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | 既存仕様              |

## アーキテクチャ層別設計

| 層                         | 設計観点                                         | 仕様参照先               |
| -------------------------- | ------------------------------------------------ | ------------------------ |
| フロントエンド（Renderer） | useFileContextでworkspaceとfolderFileTreesを参照 | ui-ux-\*.md              |
| バックエンド（Main）       | リクエストパラメータからworkspacePathを取得      | architecture-patterns.md |
| IPC通信                    | 既存チャンネルの型定義を拡張（後方互換性維持）   | api-endpoints.md         |

## 統合テスト連携

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント                   | 契約定義                                                         |
| ------------------------------ | ---------------------------------------------------------------- |
| Renderer→Main（read-file）     | FileReadRequest { filePath, workspacePath? }                     |
| Renderer→Main（write-file）    | FileWriteRequest { filePath, content, workspacePath?, options? } |
| Workspace Slice→useFileContext | workspace.folders, folderFileTrees                               |

## 成果物

| 成果物         | パス                                     | 説明         |
| -------------- | ---------------------------------------- | ------------ |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | システム構造 |
| API設計        | `outputs/phase-2/api-design.md`          | IPC API設計  |

## 完了条件

- [ ] 連携方式が決定している（方式A: Renderer経由）
- [ ] useFileContextの修正設計が完了している
- [ ] chatEditHandlersの修正設計が完了している
- [ ] ファイルツリー走査ユーティリティの設計が完了している
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート

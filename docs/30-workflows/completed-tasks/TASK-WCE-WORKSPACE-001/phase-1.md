# Phase 1: 要件定義

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 1                      |
| 機能名 | TASK-WCE-WORKSPACE-001 |
| 作成日 | 2026-02-02             |

## 目的

Chat Edit Workspace管理統合の目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

### Task 1: 要件抽出

ユーザー要求から機能要件・非機能要件を抽出する。

**機能要件（FR）**:

| ID    | 要件                                                                 | 優先度 |
| ----- | -------------------------------------------------------------------- | ------ |
| FR-01 | Main Processで現在のワークスペースパスを取得できること               | 高     |
| FR-02 | Renderer ProcessでWorkspaceのファイル一覧を取得できること            | 高     |
| FR-03 | ワークスペース外のファイルへのアクセスが拒否されること               | 高     |
| FR-04 | ワークスペースが未設定の場合、適切なデフォルト値またはnullを返すこと | 中     |

**非機能要件（NFR）**:

| ID     | 要件                                                      | 優先度 |
| ------ | --------------------------------------------------------- | ------ |
| NFR-01 | ワークスペースパス取得は同期的に行えること（10ms以内）    | 高     |
| NFR-02 | ファイル一覧取得はWorkspace Sliceの状態を即時反映すること | 高     |
| NFR-03 | 既存のchat-edit APIとの互換性を維持すること               | 高     |

### Task 2: 受け入れ基準作成

各要件に対して検証可能な受け入れ基準を定義する。

| FR/NFR | 受け入れ基準                                                               |
| ------ | -------------------------------------------------------------------------- |
| FR-01  | `getWorkspacePath()`がWorkspace Sliceの最初のフォルダパスを返す            |
| FR-02  | `getAvailableFiles()`がfolderFileTreesの全ファイルパスを配列で返す         |
| FR-03  | ワークスペース外パスで`chat-edit:read-file`を呼ぶとPERMISSION_DENIEDエラー |
| FR-04  | ワークスペース未設定時、`getWorkspacePath()`がnullを返す                   |
| NFR-01 | パス取得処理の実行時間が10ms未満であることをテストで検証                   |
| NFR-02 | Workspace Sliceの変更後、次のAPI呼び出しで最新の一覧が取得できる           |
| NFR-03 | 既存のchat-edit:read-file, chat-edit:write-file APIが正常動作する          |

### Task 3: スコープ定義

**含むもの**:

- `chatEditHandlers.ts`の`getWorkspacePath()`修正
- `useFileContext.ts`の`getAvailableFiles()`修正
- Main Process-Renderer Process間のワークスペース情報連携
- ユニットテスト・統合テスト

**含まないもの**:

- Workspace管理機能自体の実装変更
- ファイルウォッチャー（リアルタイム更新）
- ファイルツリーUIコンポーネント

## 参照資料

| 資料名              | パス                                                                                   | 説明                      |
| ------------------- | -------------------------------------------------------------------------------------- | ------------------------- |
| 元タスク仕様書      | `docs/30-workflows/unassigned-task/task-chat-edit-workspace-management-integration.md` | 発見元の未タスク仕様書    |
| workspaceSlice.ts   | `apps/desktop/src/renderer/store/slices/workspaceSlice.ts`                             | 現在のWorkspace Slice実装 |
| chatEditHandlers.ts | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                                   | TODO箇所（L77）           |
| useFileContext.ts   | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts`       | TODO箇所（L96）           |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                 |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------- |
| Workspace Chat Edit仕様 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | 既存chat-edit仕様    |
| インターフェース定義    | `.claude/skills/aiworkflow-requirements/references/interfaces-core.md`         | コアインターフェース |

## アーキテクチャ層別要件

| 層                         | 要件                                                           |
| -------------------------- | -------------------------------------------------------------- |
| フロントエンド（Renderer） | Workspace SliceからfolderFileTreesを参照してファイル一覧を取得 |
| バックエンド（Main）       | IPCまたはElectron設定からワークスペースパスを取得              |
| IPC通信                    | 必要に応じてworkspace情報取得用チャンネルを追加                |
| セキュリティ               | ワークスペース外パスへのアクセス拒否を維持                     |

## 統合テスト連携

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                          |
| ---------------- | ----------------------------------------------------------------- |
| API接続          | chat-edit:read-file, chat-edit:write-fileでワークスペースパス検証 |
| データフロー     | Workspace Slice → useFileContext → UI                             |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件（FR-01〜FR-04, NFR-01〜NFR-03）が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] 接続要件（API/データフロー）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計

# [#660] "[UT-WCE-WORKSPACE-001] Chat Edit Workspace管理統合"

## メタ情報

```yaml
task_id: UT-WCE-WORKSPACE-001
task_name: Chat Edit Workspace管理統合
category: 改善
target_feature: workspace-chat-edit / Workspace連携
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12（コードベースTODOスキャン）
created_date: 2026-02-02
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-chat-edit-workspace-management-integration.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

workspace-chat-edit機能において、ワークスペースパスの取得とファイル一覧の取得が仮実装のままになっている。具体的には以下のTODOが存在:

- `chatEditHandlers.ts:77` - `// TODO: 実際のワークスペース管理から取得`（`process.cwd()`を使用）
- `useFileContext.ts:96` - `// TODO: Workspace型にopenFilesプロパティを追加するか、別の方法でファイル一覧を取得する`

### 1.2 問題点・課題

1. **ワークスペースパス取得**: 現在は`process.cwd()`を使用しており、実際のElectron Workspaceとの連携がない
2. **ファイル一覧取得**: `openFiles`が空配列固定で、Workspaceの開いているファイル一覧を取得できない
3. **セキュリティ制約**: ワークスペース外のファイルアクセス制限が正しく機能しない可能性

### 1.3 放置した場合の影響

- ユーザーが開いているワークスペースと異なるディレクトリがワークスペースとして認識される
- `getAvailableFiles()`が常に空配列を返し、UIでのファイル選択機能が動作しない
- ワークスペース外ファイルへのアクセス制限が機能しない可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

chat-edit機能がElectronアプリのWorkspace管理と連携し、正しいワークスペースパスとファイル一覧を取得できるようにする。

### 2.2 最終ゴール

- `getWorkspacePath()`がWorkspace Sliceから現在のワークスペースパスを取得
- `getAvailableFiles()`がWorkspaceで開いているファイル一覧を返す
- ワークスペース外へのファイルアクセスが正しく制限される
- 関連テストが全てパス

### 2.3 スコープ

#### 含むもの

- `chatEditHandlers.ts`のワークスペースパス取得ロジック修正
- `useFileContext.ts`のファイル一覧取得ロジック修正
- Workspace型の拡張（必要に応じて）
- IPC経由でのワークスペース情報取得メカニズム
- ユニットテスト追加

#### 含まないもの

- Workspace管理機能自体の実装（既存実装を活用）
- ファイルウォッチャー実装（リアルタイム更新）
- ファイルツリーUI実装

### 2.4 成果物

| 成果物                  | 説明                                             |
| ----------------------- | ------------------------------------------------ |
| chatEditHandlers.ts修正 | Workspace連携によるパス取得                      |
| useFileContext.ts修正   | Workspace Sliceからファイル一覧取得              |
| workspaceSlice拡張      | openFilesプロパティ追加（必要に応じて）          |
| IPC通信追加             | ワークスペース情報取得チャンネル（必要に応じて） |
| ユニットテスト          | 新機能のテストコード                             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- workspace-chat-edit-main-process実装が完了していること
- WorkspaceSliceが存在し、現在のワークスペースパスを保持していること
- Electron IPCが適切に設定されていること

### 3.2 依存タスク

| タスク                           | ステータス | 関係     |
| -------------------------------- | ---------- | -------- |
| workspace-chat-edit-main-process | ✅ 完了    | 基盤実装 |
| WorkspaceSlice実装               | ✅ 完了    | 状態管理 |

### 3.3 必要な知識

- Electron IPC通信パターン
- Zustand状態管理（WorkspaceSlice）
- TypeScript型拡張
- Vitest テスティング

### 3.4 推奨アプローチ

1. WorkspaceSliceの現在の実装を確認し、必要なプロパティを特定
2. Main Process側でワークスペース情報を取得するIPC APIを実装（または既存を活用）
3. `chatEditHandlers.ts`を修正し、IPCまたは設定からワークスペースパスを取得
4. `useFileContext.ts`を修正し、WorkspaceSliceからファイル一覧を取得
5. ユニットテストを追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 概要                         |
| ----- | ---------------- | ---------------------------- |
| 1     | 調査             | 既存Workspace実装の確認      |
| 2     | 設計             | 連携方式の設計               |
| 4     | テスト作成       | ユニットテスト作成           |
| 5     | 実装             | コード修正                   |
| 6-9   | テスト・品質     | カバレッジ確認               |
| 12    | ドキュメント更新 | TODOコメント削除・仕様書更新 |

### Phase 1: 調査

#### 目的

既存のWorkspace管理実装を確認し、利用可能なAPIを特定する。

#### 手順

1. `workspaceSlice.ts`の現在の実装を確認
2. `workspaceHandlers.ts`（もしあれば）のIPC APIを確認
3. Workspace型定義を確認し、openFilesの有無を確認
4. Main ProcessとRenderer Processの通信パターンを確認

#### 成果物

- 調査結果ドキュメント（既存APIリスト、必要な拡張）

#### 完了条件

- 連携方式が決定している

### Phase 5: 実装

#### 目的

調査結果に基づいてコードを修正する。

#### 手順

1. （必要に応じて）WorkspaceSliceにopenFilesプロパティを追加
2. （必要に応じて）IPC APIを追加してワークスペースパスを取得可能にする
3. `chatEditHandlers.ts`の`getWorkspacePath()`を修正
4. `useFileContext.ts`の`getAvailableFiles()`を修正
5. TypeScript型チェック・テスト実行

#### 成果物

- 修正済みソースコード
- ユニットテスト

#### 完了条件

- TODOコメント2箇所が削除されている
- `pnpm typecheck`がエラー0
- `pnpm test`が全てパス

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `getWorkspacePath()`がWorkspace管理から正しいパスを取得している
- [ ] `getAvailableFiles()`がWorkspaceのファイル一覧を返している
- [ ] ワークスペース外のファイルアクセスが適切に制限されている

### 品質要件

- [ ] テストカバレッジ Line 80%以上
- [ ] TypeScript strict mode エラー0件
- [ ] ESLint エラー0件
- [ ] `grep -rn "TODO.*実際のワークスペース管理" apps/desktop/src/` の結果が0件
- [ ] `grep -rn "TODO.*openFilesプロパティ" apps/desktop/src/` の結果が0件

### ドキュメント要件

- [ ] api-endpoints.md更新（必要に応じて）
- [ ] aiworkflow-requirements/LOGS.md更新

---

## 6. 検証方法

### テストケース

| #   | テストケース                               | 期待結果                           |
| --- | ------------------------------------------ | ---------------------------------- |
| 1   | ワークスペースが開かれている場合のパス取得 | 正しいワークスペースパスが返される |
| 2   | ワークスペースが未設定の場合のパス取得     | null または適切なデフォルト値      |
| 3   | 開いているファイル一覧の取得               | ファイルパスと名前の配列が返される |
| 4   | ワークスペース外ファイルへのアクセス試行   | PERMISSION_DENIEDエラー            |

### 検証手順

1. `pnpm test -- --filter chat-edit` を実行し、全テストGREEN
2. `grep -rn "TODO.*ワークスペース管理" apps/desktop/src/` で0件を確認
3. `grep -rn "TODO.*openFiles" apps/desktop/src/` で0件を確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                   |
| ------------------------------ | ------ | -------- | -------------------------------------- |
| WorkspaceSliceの構造変更が必要 | 中     | 中       | 既存Sliceを調査し、最小限の拡張で対応  |
| IPC通信追加による複雑化        | 低     | 低       | 既存IPCパターンを踏襲し、一貫性を保つ  |
| セキュリティ制約の回避リスク   | 高     | 低       | パス検証ロジックを強化し、テストを追加 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント             | 用途                      |
| ------------------------ | ------------------------- |
| api-endpoints.md         | IPC APIエンドポイント仕様 |
| arch-state-management.md | Zustand状態管理パターン   |
| interfaces-core.md       | コアインターフェース定義  |

### 参考資料

| ファイルパス                                                                     | 該当行 | 内容                         |
| -------------------------------------------------------------------------------- | ------ | ---------------------------- |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`                             | L77    | TODO: ワークスペース管理取得 |
| `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts` | L96    | TODO: openFilesプロパティ    |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
// TODO: 実際のワークスペース管理から取得（chatEditHandlers.ts:77）
// TODO: Workspace型にopenFilesプロパティを追加するか、別の方法でファイル一覧を取得する（useFileContext.ts:96）
```

### 補足事項

- 本タスクはworkspace-chat-edit機能の完成度向上を目的としており、新機能追加ではなく既存機能の統合強化
- WorkspaceSliceの拡張が必要な場合は、他の機能への影響を考慮して設計すること
- テスト時は、実際のファイルシステムアクセスをモック化してテストの独立性を保つこと

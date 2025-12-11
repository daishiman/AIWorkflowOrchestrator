# ファイル監視(自動リロード)機能 - タスク指示書

## メタ情報

| 項目             | 内容                                                    |
| ---------------- | ------------------------------------------------------- |
| タスクID         | TASK-WS-NFR018                                          |
| タスク名         | ファイル監視(自動リロード)機能                          |
| 分類             | 改善                                                    |
| 対象機能         | Electronデスクトップアプリ - ワークスペースマネージャー |
| 優先度           | 高                                                      |
| 見積もり規模     | 中規模                                                  |
| ステータス       | 未実施                                                  |
| 発見元           | Phase 0 (非機能要件定義) - NFR-WS-001                   |
| 発見日           | 2025-12-11                                              |
| 発見エージェント | @req-analyst                                            |

---

## 1. なぜこのタスクが必要か(Why)

### 1.1 背景

現在の実装では、外部エディタでファイルを変更してもワークスペース内のファイルツリーは自動更新されません。ユーザーは手動でリフレッシュする必要があり、操作性が悪化しています。NFR-018で「ファイル監視の実装方針」が課題として特定され、設計レビュー(DR-WS-001)でも「ファイル監視の最適化」がSuggestionとして提案されました。

### 1.2 問題点・課題

- ファイルシステムの変更が自動検知されない
- 手動リフレッシュが必要で、ユーザー体験が悪い
- 他のエディタと並行作業時に同期がずれる
- リアルタイム性が求められるRAG連携の基盤として不十分

### 1.3 放置した場合の影響

- **ユーザビリティ**: 手動リフレッシュの手間が発生し、作業効率が低下
- **整合性**: ファイルツリーと実際のファイルシステムが不一致になる可能性
- **RAG連携**: 変更検知が必須のRAG連携実装に支障
- **影響度**: 高(Critical Path として優先実装推奨)

---

## 2. 何を達成するか(What)

### 2.1 目的

ファイルシステムの変更(追加・削除・変更)を自動検知し、ファイルツリーをリアルタイムで更新する機能を実装する。

### 2.2 最終ゴール

1. ファイル/フォルダの追加・削除・変更を自動検知
2. 検知から300ms以内にファイルツリーを更新
3. 過剰なイベント発生を防ぐデバウンス機能
4. 除外パターン(node_modules, .git等)のサポート
5. IPC イベント`workspace:folder-changed`の実装(設計済み)

### 2.3 スコープ

#### 含むもの

- chokidarによるファイル監視実装
- デバウンス設定(300ms推奨)
- 除外パターン設定(node_modules, .git, .DS_Store等)
- IPC イベント`workspace:folder-changed`の実装
- Rendererプロセスでの差分更新処理
- 変更通知のトースト表示(オプション)

#### 含まないもの

- ファイル内容の差分表示(Git統合で対応)
- リモートファイルシステムの監視(将来検討)
- 変更履歴の記録(将来検討)

### 2.4 成果物

| 成果物                | パス                                                                        | 完了時の配置先     |
| --------------------- | --------------------------------------------------------------------------- | ------------------ |
| 機能要件書            | docs/30-workflows/workspace-manager-enhancements/task-step00-watcher.md     | (完了後も同じ場所) |
| IPC API設計書         | docs/30-workflows/workspace-manager-enhancements/task-step01-watcher-ipc.md | (完了後も同じ場所) |
| FileWatcherハンドラー | apps/desktop/src/main/services/fileWatcher.ts                               | (実装済み)         |
| IPCハンドラー         | apps/desktop/src/main/ipc/watcherHandlers.ts                                | (実装済み)         |
| テストファイル        | apps/desktop/src/test/main/fileWatcher.test.ts                              | (実装済み)         |

---

## 3. どのように実行するか(How)

### 3.1 前提条件

- ワークスペースマネージャーの初期実装(TASK-WS-001)が完了していること
- IPC API`workspace:folder-changed`が設計済み(IPC-WS-001 §3.6)

### 3.2 依存タスク

- TASK-WS-001: ワークスペースマネージャー機能(完了必須)

### 3.3 必要な知識・スキル

- chokidarライブラリの使用経験
- Electron IPC イベント処理
- デバウンス/スロットル処理
- ファイルシステム監視のベストプラクティス

### 3.4 推奨アプローチ

**技術選定**: chokidar

- 理由: クロスプラットフォーム対応、高性能、広く使われている

**実装戦略**:

1. Mainプロセスで各FolderEntryに対してchokidar watcherを作成
2. デバウンス(300ms)を適用して過剰イベントを防止
3. IPC イベントでRendererに変更を通知
4. Rendererで差分更新(追加/削除/変更)を適用

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義
Phase 1: 設計(IPC API設計・セキュリティ設計)
Phase 2: 設計レビューゲート(セキュリティ重視)
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証(ファイル変更検証)
Phase 9: ドキュメント更新
```

---

### Phase 0: 要件定義

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements file-watcher
```

---

### Phase 1: 設計

#### T-01-1: IPC API設計

##### Claude Code スラッシュコマンド

```
/ai:design-api file-watcher-ipc
```

##### 使用エージェント

- **エージェント**: @electron-architect

---

#### T-01-2: セキュリティ設計

##### Claude Code スラッシュコマンド

```
/ai:secure-electron-app file-watcher-security
```

##### 使用エージェント

- **エージェント**: @electron-security

##### 活用スキル

| スキル名                    | 活用方法               |
| --------------------------- | ---------------------- |
| electron-security-hardening | 監視対象の制限         |
| event-driven-file-watching  | セキュアなイベント処理 |

---

### Phase 4: 実装 (TDD: Green)

#### T-04-1: 依存追加

##### Claude Code スラッシュコマンド

```
/ai:add-dependency chokidar
```

---

#### T-04-2: FileWatcherサービス実装

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic file-watcher-main
```

##### 実装内容(概要)

```typescript
import chokidar from "chokidar";

export class FileWatcherService {
  private watchers: Map<FolderId, chokidar.FSWatcher> = new Map();

  startWatching(folderId: FolderId, folderPath: string) {
    const watcher = chokidar.watch(folderPath, {
      ignored: ["**/node_modules/**", "**/.git/**", "**/.DS_Store"],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    });

    watcher.on(
      "all",
      debounce((event, path) => {
        mainWindow.webContents.send("workspace:folder-changed", {
          folderId,
          eventType: event,
          filePath: path,
          timestamp: new Date(),
        });
      }, 300),
    );

    this.watchers.set(folderId, watcher);
  }

  stopWatching(folderId: FolderId) {
    const watcher = this.watchers.get(folderId);
    if (watcher) {
      watcher.close();
      this.watchers.delete(folderId);
    }
  }
}
```

---

#### T-04-3: WorkspaceSlice統合

##### Claude Code スラッシュコマンド

```
/ai:refactor apps/desktop/src/renderer/store/slices/workspaceSlice.ts file-watcher
```

##### 実装内容(概要)

```typescript
export const createWorkspaceSlice: StateCreator = (set, get) => ({
  // ... existing

  // イベントリスナーを登録
  setupFileWatcher: () => {
    const unsubscribe = window.electronAPI.workspace.onFolderChanged(
      (event) => {
        const { workspace, folderFileTrees } = get();
        const folder = workspace.folders.find((f) => f.id === event.folderId);

        if (!folder) return;

        // ファイルツリーを再取得(差分更新)
        get().loadFolderTree(event.folderId, folder.path);
      },
    );

    return unsubscribe;
  },
});
```

---

### Phase 8: 手動テスト検証

#### 手動テストケース

| No  | カテゴリ       | テスト項目       | 前提条件           | 操作手順                                 | 期待結果                              |
| --- | -------------- | ---------------- | ------------------ | ---------------------------------------- | ------------------------------------- |
| 1   | 機能           | ファイル追加検知 | フォルダ監視中     | 1.外部エディタで新規ファイル作成         | 300ms以内にファイルツリーに表示される |
| 2   | 機能           | ファイル削除検知 | フォルダ監視中     | 1.Finderでファイルを削除                 | 300ms以内にファイルツリーから消える   |
| 3   | 機能           | ファイル変更検知 | フォルダ監視中     | 1.外部エディタでファイル内容を変更・保存 | 変更が検知される(トースト通知)        |
| 4   | 機能           | 除外パターン     | node_modulesが存在 | 1.node_modules内にファイル追加           | イベントが発火しない                  |
| 5   | 異常系         | 監視停止         | フォルダ監視中     | 1.フォルダをワークスペースから削除       | 監視が停止される                      |
| 6   | パフォーマンス | デバウンス動作   | フォルダ監視中     | 1.短時間に複数ファイルを連続作成         | イベントがまとめて処理される(300ms後) |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイル追加が自動検知される
- [ ] ファイル削除が自動検知される
- [ ] ファイル変更が自動検知される
- [ ] 除外パターンが動作する
- [ ] デバウンスが機能する

### 品質要件

- [ ] ユニットテストカバレッジ80%以上
- [ ] セキュリティレビュークリア(監視対象の制限)
- [ ] Lintエラー、型エラーなし

### ドキュメント要件

- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### 統合テスト

```typescript
describe("FileWatcher Integration", () => {
  it("should detect file creation", async () => {
    const watcher = new FileWatcherService();
    const events: WorkspaceFolderChangedEvent[] = [];

    watcher.startWatching("folder-id", "/test/path");
    watcher.on("change", (event) => events.push(event));

    await fs.writeFile("/test/path/new-file.txt", "content");
    await wait(400); // デバウンス待機

    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe("add");
  });
});
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                      |
| ---------------------------- | ------ | -------- | ----------------------------------------- |
| 過剰なイベント発生           | 高     | 高       | デバウンス(300ms)、イベントフィルタリング |
| メモリリーク(watcher未close) | 中     | 中       | フォルダ削除時に必ずclose処理             |
| ネットワークドライブの遅延   | 中     | 低       | ローカルドライブのみ監視推奨              |
| 権限エラー                   | 低     | 低       | try-catchでエラーハンドリング             |

---

## 8. 参照情報

### 関連ドキュメント

- [NFR-WS-001: 非機能要件定義書](../workspace-manager/task-step00-2-non-functional-requirements.md) - オープンな課題
- [IPC-WS-001: IPC API設計書](../workspace-manager/task-step01-2-ipc-api.md) - §3.6 workspace:folder-changed
- [DR-WS-001: 設計レビュー報告書](../workspace-manager/task-step02-1-design-review.md) - Suggestion #2

### 参考資料

- chokidar: https://github.com/paulmillr/chokidar
- Electron File System Watching: https://www.electronjs.org/docs/latest/api/browser-window

---

## 9. 備考

### 補足事項

**Critical Path として優先実装推奨**:

- ユーザー体験の大幅向上
- 運用上の必須機能
- RAG連携の前提条件

**デバウンス設定の根拠**:

- 300ms: ユーザーが体感的に「即座」と感じる閾値
- awaitWriteFinish: ファイル書き込み完了まで待機(部分的な内容を読まない)

**除外パターンの初期セット**:

```typescript
const DEFAULT_IGNORED_PATTERNS = [
  "**/node_modules/**",
  "**/.git/**",
  "**/.DS_Store",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
];
```

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容                    |
| ---------- | ---------- | ------------ | --------------------------- |
| 1.0.0      | 2025-12-11 | @req-analyst | 初版作成(NFR-018単一タスク) |

# Git統合機能 - タスク指示書

## メタ情報

| 項目             | 内容                                                    |
| ---------------- | ------------------------------------------------------- |
| タスクID         | TASK-WS-GIT                                             |
| タスク名         | Git統合機能(基本)                                       |
| 分類             | 新規機能                                                |
| 対象機能         | Electronデスクトップアプリ - ワークスペースマネージャー |
| 優先度           | 中                                                      |
| 見積もり規模     | 中規模                                                  |
| ステータス       | 未実施                                                  |
| 発見元           | Phase 0 (要件定義) - FR-WS-001                          |
| 発見日           | 2025-12-11                                              |
| 発見エージェント | .claude/agents/req-analyst.md                                            |

---

## 1. なぜこのタスクが必要か(Why)

### 1.1 背景

機能要件定義書(FR-WS-001)のスコープで「Git統合」が将来のスコープとして除外されています。開発者向けツールとして、Gitステータス表示やコミット操作は必須の機能です。VSCodeなどの競合製品では標準機能として提供されており、製品差別化に貢献します。

### 1.2 問題点・課題

- ファイルのGitステータス(変更・追加・削除)が視覚的に分からない
- コミット操作のために別のターミナルやGit GUIを開く必要がある
- 変更ファイルの一覧表示がない
- Gitワークフローがワークスペース内で完結しない

### 1.3 放置した場合の影響

- **開発者体験**: Git操作のためにツールを切り替える必要があり、作業効率が低下
- **競合優位性**: 開発者向けツールとして機能不足と見なされる
- **統合性**: ワークフローが分断され、生産性が低下
- **影響度**: 中(開発者向けの重要機能)

---

## 2. 何を達成するか(What)

### 2.1 目的

ワークスペース内のGitリポジトリを検知し、ファイルのGitステータスを表示、基本的なGit操作(ステージング、コミット、プッシュ)を可能にする。

### 2.2 最終ゴール

1. Gitリポジトリの自動検知
2. ファイルのGitステータス表示(M:変更、A:追加、D:削除、?:未追跡)
3. 変更ファイルのバッジ表示
4. ステージング操作(git add)
5. コミット操作(コミットメッセージ入力)
6. プッシュ操作(リモートへの送信)

### 2.3 スコープ

#### 含むもの

- Gitリポジトリ検知(simple-git)
- ファイルステータス表示(M, A, D, ?のバッジ)
- `FileNode`への`gitStatus`フィールド追加
- ステージング・コミット・プッシュの基本操作
- Gitパネル(サイドバー下部)
- コミットメッセージ入力UI

#### 含まないもの

- ブランチ操作(切り替え、マージ等、将来検討)
- コンフリクト解決UI(将来検討)
- Git履歴表示(将来検討)
- プルリクエスト統合(将来検討)
- マルチリポジトリの同時操作(将来検討)

### 2.4 成果物

| 成果物             | パス                                                                      | 完了時の配置先     |
| ------------------ | ------------------------------------------------------------------------- | ------------------ |
| 機能要件書         | docs/30-workflows/workspace-manager-enhancements/task-step00-git.md       | (完了後も同じ場所) |
| データモデル設計書 | docs/30-workflows/workspace-manager-enhancements/task-step01-git-model.md | (完了後も同じ場所) |
| IPC API設計書      | docs/30-workflows/workspace-manager-enhancements/task-step01-git-ipc.md   | (完了後も同じ場所) |
| UI設計書           | docs/30-workflows/workspace-manager-enhancements/task-step01-git-ui.md    | (完了後も同じ場所) |
| GitStatusBadge     | apps/desktop/src/renderer/components/atoms/GitStatusBadge/index.tsx       | (実装済み)         |
| GitPanel           | apps/desktop/src/renderer/components/organisms/GitPanel/index.tsx         | (実装済み)         |
| GitIPCハンドラー   | apps/desktop/src/main/ipc/gitHandlers.ts                                  | (実装済み)         |
| テストファイル     | apps/desktop/src/test/main/gitHandlers.test.ts                            | (実装済み)         |

---

## 3. どのように実行するか(How)

### 3.1 前提条件

- ワークスペースマネージャーの初期実装(TASK-WS-001)が完了していること
- Gitがシステムにインストールされていること

### 3.2 依存タスク

- TASK-WS-001: ワークスペースマネージャー機能(完了必須)

### 3.3 必要な知識・スキル

- Git CLIの基本コマンド
- simple-gitライブラリの使用経験
- Electron IPC通信
- React状態管理(Gitステータスの管理)

### 3.4 推奨アプローチ

**技術選定**: simple-git

- 理由: Promise ベース API、TypeScript 対応、クロスプラットフォーム

**実装戦略**:

1. Mainプロセスでsimple-gitを使用してリポジトリ検知
2. ファイルステータスを定期的に取得(または変更検知時)
3. `FileNode`に`gitStatus`フィールドを追加
4. サイドバーにGitパネルを追加(変更ファイル一覧)
5. コミット・プッシュのIPC APIを実装

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義
Phase 1: 設計(データモデル・IPC API・UI設計)
Phase 2: 設計レビューゲート
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証(Git操作検証)
Phase 9: ドキュメント更新
```

---

### Phase 0: 要件定義

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements git-integration
```

#### 使用エージェント

- **エージェント**: .claude/agents/devops-eng.md
- **選定理由**: Git統合の専門家

---

### Phase 1: 設計

#### T-01-1: データモデル設計(gitStatus追加)

##### Claude Code スラッシュコマンド

```
/ai:design-domain-model git-status
```

##### 使用エージェント

- **エージェント**: .claude/agents/domain-modeler.md

##### 成果物

| 成果物             | パス                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| データモデル設計書 | docs/30-workflows/workspace-manager-enhancements/task-step01-git-model.md |

##### 実装内容(概要)

```typescript
export type GitStatus = "M" | "A" | "D" | "?" | "!!" | null;

export interface FileNode {
  readonly id: FileId;
  readonly name: string;
  readonly type: FileType;
  readonly path: FilePath;
  readonly children?: readonly FileNode[];
  readonly isRagIndexed?: boolean;
  readonly gitStatus?: GitStatus; // 追加
}
```

---

#### T-01-2: IPC API設計

##### Claude Code スラッシュコマンド

```
/ai:design-api git-ipc
```

##### 使用エージェント

- **エージェント**: .claude/agents/electron-architect.md

##### IPC API概要

```typescript
export interface GitAPI {
  checkRepo: (folderPath: string) => Promise<{ isGitRepo: boolean }>;
  getStatus: (folderPath: string) => Promise<GitStatusResponse>;
  stage: (filePaths: string[]) => Promise<void>;
  commit: (message: string) => Promise<void>;
  push: () => Promise<void>;
}
```

---

#### T-01-3: UI設計

##### Claude Code スラッシュコマンド

```
/ai:create-component GitPanel organism
/ai:create-component GitStatusBadge atom
```

##### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md

---

### Phase 4: 実装 (TDD: Green)

#### T-04-1: 依存追加

##### Claude Code スラッシュコマンド

```
/ai:add-dependency simple-git
```

---

#### T-04-2: GitIPCハンドラー実装

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic git-handler
```

##### 実装内容(概要)

```typescript
import simpleGit from "simple-git";

ipcMain.handle("git:get-status", async (_event, folderPath) => {
  const git = simpleGit(folderPath);
  const status = await git.status();

  return {
    success: true,
    data: {
      modified: status.modified,
      created: status.created,
      deleted: status.deleted,
      not_added: status.not_added,
    },
  };
});

ipcMain.handle("git:commit", async (_event, { folderPath, message }) => {
  const git = simpleGit(folderPath);
  await git.commit(message);
  return { success: true };
});
```

---

#### T-04-3: FileNode拡張

##### Claude Code スラッシュコマンド

```
/ai:refactor packages/shared/src/types/fileNode.ts git-status
```

---

#### T-04-4: GitPanel UI実装

##### Claude Code スラッシュコマンド

```
/ai:create-component GitPanel organism
```

---

### Phase 8: 手動テスト検証

#### 手動テストケース

| No  | カテゴリ | テスト項目         | 前提条件                 | 操作手順                                          | 期待結果                          |
| --- | -------- | ------------------ | ------------------------ | ------------------------------------------------- | --------------------------------- |
| 1   | 機能     | Gitリポジトリ検知  | Gitリポジトリ追加        | 1.フォルダをワークスペースに追加                  | Gitパネルが表示される             |
| 2   | 機能     | ステータス表示     | リポジトリ内で変更       | 1.ファイルを変更                                  | ファイルに「M」バッジが表示される |
| 3   | 機能     | 未追跡ファイル表示 | 新規ファイル作成         | 1.新しいファイルを作成                            | ファイルに「?」バッジが表示される |
| 4   | 機能     | ステージング       | 変更ファイル存在         | 1.ファイルにチェックを入れる                      | ファイルがステージングされる      |
| 5   | 機能     | コミット           | ステージ済みファイル存在 | 1.コミットメッセージ入力 2.コミットボタンクリック | コミットが成功する                |
| 6   | 機能     | プッシュ           | コミット済み             | 1.プッシュボタンをクリック                        | リモートにプッシュされる          |
| 7   | 異常系   | 非Gitフォルダ      | 通常のフォルダ           | 1.非Gitフォルダを追加                             | Gitパネルが表示されない           |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Gitリポジトリが自動検知される
- [ ] ファイルのGitステータスが表示される
- [ ] ステージング操作ができる
- [ ] コミット操作ができる
- [ ] プッシュ操作ができる

### 品質要件

- [ ] Git操作のレスポンス時間: 2秒以内
- [ ] ユニットテストカバレッジ80%以上
- [ ] Lintエラー、型エラーなし

### ドキュメント要件

- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### 統合テスト

```typescript
describe("Git Integration", () => {
  it("should detect git repository", async () => {
    const result = await window.electronAPI.git.checkRepo("/path/to/repo");
    expect(result.isGitRepo).toBe(true);
  });

  it("should get file status", async () => {
    const status = await window.electronAPI.git.getStatus("/path/to/repo");
    expect(status.data.modified).toContain("file.ts");
  });
});
```

---

## 7. リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                               |
| --------------------------- | ------ | -------- | ---------------------------------- |
| Git操作のパフォーマンス劣化 | 中     | 中       | 非同期実行、キャッシュ             |
| 大規模リポジトリでの遅延    | 中     | 中       | ステータス取得の最適化             |
| コンフリクト発生時の処理    | 低     | 中       | エラーメッセージを明確に表示       |
| 認証情報の取り扱い          | 低     | 低       | システムの認証情報マネージャー活用 |

---

## 8. 参照情報

### 関連ドキュメント

- [FR-WS-001: 機能要件定義書](../workspace-manager/task-step00-1-functional-requirements.md) - スコープ外項目

### 参考資料

- simple-git: https://github.com/steveukx/git-js
- Git CLI: https://git-scm.com/docs

---

## 9. 備考

### 補足事項

**戦略的機能として中優先度**:

- 開発者向けの重要機能
- ワークフロー統合による生産性向上
- 製品差別化に貢献

**実装時の注意**:

- Git操作はすべて非同期で実行
- エラー時は詳細なメッセージを表示
- 大規模リポジトリではステータス取得を最適化(--porcelain v2使用)

**将来拡張**:

- ブランチ操作(切り替え、作成、削除)
- コンフリクト解決UI
- Git履歴表示(コミットログ)
- プルリクエスト統合(GitHub/GitLab)

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容                    |
| ---------- | ---------- | ------------ | --------------------------- |
| 1.0.0      | 2025-12-11 | .claude/agents/req-analyst.md | 初版作成(Git統合単一タスク) |

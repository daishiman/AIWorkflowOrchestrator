# ファイル検索機能 - タスク指示書

## メタ情報

| 項目             | 内容                                                    |
| ---------------- | ------------------------------------------------------- |
| タスクID         | TASK-WS-SEARCH                                          |
| タスク名         | ファイル検索機能                                        |
| 分類             | 新規機能                                                |
| 対象機能         | Electronデスクトップアプリ - ワークスペースマネージャー |
| 優先度           | 中                                                      |
| 見積もり規模     | 中規模                                                  |
| ステータス       | 未実施                                                  |
| 発見元           | Phase 0 (要件定義) - FR-WS-001                          |
| 発見日           | 2025-12-11                                              |
| 発見エージェント | @req-analyst                                            |

---

## 1. なぜこのタスクが必要か(Why)

### 1.1 背景

機能要件定義書(FR-WS-001)のスコープで「ファイル検索機能」が将来のスコープとして除外されています。ワークスペースに多数のフォルダを追加した際、目的のファイルを手動で探すのは非効率です。VSCodeのような競合製品では標準機能として提供されています。

### 1.2 問題点・課題

- ファイルを手動でツリーから探す必要があり、時間がかかる
- ファイル名を部分的にしか覚えていない場合に見つけられない
- ファイル内容で検索できない
- RAG連携の基盤として、セマンティック検索の前段階が必要

### 1.3 放置した場合の影響

- **生産性**: ファイル検索に時間がかかり、作業効率が低下
- **ユーザビリティ**: 大規模プロジェクトでの使用に不向き
- **RAG連携**: セマンティック検索の基盤が整わない
- **影響度**: 中(戦略的機能として中優先度)

---

## 2. 何を達成するか(What)

### 2.1 目的

ワークスペース内のファイルをファイル名または内容で検索できる機能を実装する。Fuzzy検索により、部分一致でも適切な結果を返す。

### 2.2 最終ゴール

1. ファイル名のFuzzy検索(部分一致、スペルミス許容)
2. ファイル内容の全文検索(ripgrep使用)
3. 検索結果のスコアリングとソート
4. 検索結果からのファイル即座オープン
5. 検索履歴の保存(最近の検索10件)

### 2.3 スコープ

#### 含むもの

- Fuzzy検索によるファイル名検索(fuse.js)
- 全文検索によるファイル内容検索(ripgrep)
- SearchBarコンポーネント(molecule)
- 検索結果リストコンポーネント
- IPC API: `workspace:search`
- 検索履歴の永続化

#### 含まないもの

- 正規表現検索(将来検討)
- セマンティック検索(RAG連携で対応)
- ファイルプレビュー(将来検討)
- 検索結果の置換機能(将来検討)

### 2.4 成果物

| 成果物                  | パス                                                                       | 完了時の配置先     |
| ----------------------- | -------------------------------------------------------------------------- | ------------------ |
| 機能要件書              | docs/30-workflows/workspace-manager-enhancements/task-step00-search.md     | (完了後も同じ場所) |
| IPC API設計書           | docs/30-workflows/workspace-manager-enhancements/task-step01-search-ipc.md | (完了後も同じ場所) |
| UI設計書                | docs/30-workflows/workspace-manager-enhancements/task-step01-search-ui.md  | (完了後も同じ場所) |
| SearchBarコンポーネント | apps/desktop/src/renderer/components/molecules/SearchBar/index.tsx         | (実装済み)         |
| SearchIPCハンドラー     | apps/desktop/src/main/ipc/searchHandlers.ts                                | (実装済み)         |
| テストファイル          | apps/desktop/src/test/components/SearchBar.test.tsx                        | (実装済み)         |

---

## 3. どのように実行するか(How)

### 3.1 前提条件

- ワークスペースマネージャーの初期実装(TASK-WS-001)が完了していること
- 複数フォルダが追加できる状態

### 3.2 依存タスク

- TASK-WS-001: ワークスペースマネージャー機能(完了必須)

### 3.3 必要な知識・スキル

- fuse.js(Fuzzy検索ライブラリ)の使用経験
- ripgrep CLIの使用経験
- React フォーム処理(検索入力)
- Electron IPC通信

### 3.4 推奨アプローチ

**技術選定**:

- **フロントエンド**: fuse.js (Fuzzy検索)
- **バックエンド**: ripgrep (全文検索、高速)

**実装戦略**:

1. SearchBarコンポーネントでクエリ入力を受付
2. ファイル名検索はRendererプロセスで fuse.js を使用(高速)
3. 内容検索はMainプロセスで ripgrep を実行(IPC経由)
4. 検索結果をスコア順にソートして表示

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義
Phase 1: 設計(IPC API設計・UI設計)
Phase 2: 設計レビューゲート
Phase 3: テスト作成 (TDD: Red)
Phase 4: 実装 (TDD: Green)
Phase 5: リファクタリング (TDD: Refactor)
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証
Phase 9: ドキュメント更新
```

---

### Phase 0: 要件定義

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements workspace-search
```

---

### Phase 1: 設計

#### T-01-1: IPC API設計

##### Claude Code スラッシュコマンド

```
/ai:design-api workspace-search-ipc
```

##### 使用エージェント

- **エージェント**: @electron-architect

---

#### T-01-2: UI設計

##### Claude Code スラッシュコマンド

```
/ai:create-component SearchBar molecule
```

##### 使用エージェント

- **エージェント**: @ui-designer

---

### Phase 4: 実装 (TDD: Green)

#### T-04-1: 依存追加

##### Claude Code スラッシュコマンド

```
/ai:add-dependency fuse.js
```

---

#### T-04-2: SearchIPCハンドラー実装

##### Claude Code スラッシュコマンド

```
/ai:implement-business-logic search-handler
```

##### 実装内容(概要)

```typescript
ipcMain.handle("workspace:search", async (_event, request) => {
  const { query, type, workspaceFolders } = request;

  if (type === "content") {
    // ripgrepで全文検索
    const results = await execRipgrep(query, workspaceFolders);
    return { success: true, data: results };
  } else {
    // ファイル名検索(Renderer側でfuse.js使用を推奨)
    return { success: true, data: [] };
  }
});
```

---

### Phase 8: 手動テスト検証

#### 手動テストケース

| No  | カテゴリ | テスト項目           | 前提条件           | 操作手順                                    | 期待結果                                             |
| --- | -------- | -------------------- | ------------------ | ------------------------------------------- | ---------------------------------------------------- |
| 1   | 機能     | ファイル名検索       | 複数ファイル存在   | 1.検索バーに「auth」と入力                  | ファイル名に「auth」を含むファイル一覧が表示される   |
| 2   | 機能     | ファイル内容検索     | 複数ファイル存在   | 1.検索バーに「auth」と入力 2.「内容」を選択 | ファイル内容に「auth」を含むファイル一覧が表示される |
| 3   | 機能     | Fuzzy検索            | 複数ファイル存在   | 1.検索バーに「auht」(スペルミス)と入力      | 「auth」を含むファイルがヒットする                   |
| 4   | 機能     | 検索結果からオープン | 検索結果が表示中   | 1.検索結果のファイルをクリック              | ファイルがエディターで開かれる                       |
| 5   | UI/UX    | 検索履歴             | 過去に検索実施済み | 1.検索バーをクリック                        | 最近の検索10件がドロップダウン表示される             |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイル名のFuzzy検索が動作する
- [ ] ファイル内容の全文検索が動作する
- [ ] 検索結果がスコア順にソートされる
- [ ] 検索結果からファイルを開ける
- [ ] 検索履歴が保存される

### 品質要件

- [ ] 検索レスポンス時間: 1万件で1秒以内
- [ ] ユニットテストカバレッジ80%以上
- [ ] Lintエラー、型エラーなし

---

## 6. 検証方法

### ユニットテスト

```typescript
describe("FileSearch", () => {
  it("should search by filename using fuzzy match", () => {
    const files = [
      { name: "authService.ts", path: "/a/authService.ts" },
      { name: "userAuth.ts", path: "/a/userAuth.ts" },
      { name: "config.ts", path: "/a/config.ts" },
    ];

    const results = searchFiles(files, "auth");
    expect(results).toHaveLength(2);
    expect(results[0].name).toMatch(/auth/i);
  });
});
```

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                            |
| ------------------------ | ------ | -------- | ------------------------------- |
| 大量ファイルでの検索遅延 | 中     | 中       | インデックス化、Webワーカー活用 |
| ripgrepの依存関係        | 低     | 低       | バイナリを同梱                  |
| 検索結果の精度不足       | 中     | 中       | スコアリングアルゴリズムの調整  |

---

## 8. 参照情報

### 関連ドキュメント

- [FR-WS-001: 機能要件定義書](../workspace-manager/task-step00-1-functional-requirements.md) - スコープ外項目

### 参考資料

- fuse.js: https://fusejs.io/
- ripgrep: https://github.com/BurntSushi/ripgrep

---

## 9. 備考

### 補足事項

**RAG連携の基盤**:
この検索機能の検索UIは、将来のRAG連携実装時にセマンティック検索UIとして再利用可能。

---

## 変更履歴

| バージョン | 日付       | 変更者       | 変更内容                         |
| ---------- | ---------- | ------------ | -------------------------------- |
| 1.0.0      | 2025-12-11 | @req-analyst | 初版作成(ファイル検索単一タスク) |

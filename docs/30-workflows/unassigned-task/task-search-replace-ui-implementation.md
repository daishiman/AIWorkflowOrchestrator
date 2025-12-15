# 検索・置換機能 UIコンポーネント実装 - タスク指示書

## メタ情報

| 項目             | 内容                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| タスクID         | UI-SR-001                                                                         |
| タスク名         | 検索・置換UIコンポーネント実装                                                    |
| 分類             | 機能実装                                                                          |
| 対象機能         | FileSearchPanel / FileReplacePanel / WorkspaceSearchPanel / WorkspaceReplacePanel |
| 優先度           | 高                                                                                |
| 見積もり規模     | 中規模                                                                            |
| ステータス       | 未実施                                                                            |
| 発見元           | Phase 8 - 手動テスト検証（UIなしのためN/A）                                       |
| 発見日           | 2025-12-12                                                                        |
| 発見エージェント | -                                                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

検索・置換機能の開発において、以下が完了済み：

- **Phase 1（設計）**: UI設計書が作成済み（T-01-1〜T-01-4）
- **Phase 3（テスト作成）**: UIコンポーネントのテストファイルが作成済み
- **Phase 4（実装）**: バックエンド/コアロジックのみ実装完了

しかし、**UIコンポーネントの実装が未完了**のため、ユーザーが検索・置換機能を使用できない状態。

### 1.2 問題点・課題

- UIコンポーネントが存在しないため、実装済みのコアロジックをユーザーが利用できない
- テストファイル（Red状態）は存在するが、コンポーネント本体が未実装
- 手動テスト（Phase 8）が実施不可能

### 1.3 放置した場合の影響

- 検索・置換機能が使用不可能
- 実装済みのバックエンドコードが無駄になる
- ユーザー体験の大幅な低下

---

## 2. 何を達成するか（What）

### 2.1 目的

UI設計書に基づいて、検索・置換機能のReactコンポーネントを実装し、バックエンドのコアロジックと接続する。

### 2.2 最終ゴール

- 4つのUIコンポーネントが実装される
- IPCハンドラーを通じてコアロジックと接続される
- 既存のテストファイルがすべてGreen状態になる
- Phase 8の手動テストが実施可能になる

### 2.3 スコープ

#### 含むもの

| コンポーネント        | 設計書                                         | テストファイル                      |
| --------------------- | ---------------------------------------------- | ----------------------------------- |
| FileSearchPanel       | `task-step01-1-file-search-ui-design.md`       | `FileSearchPanel.test.tsx` ✅       |
| FileReplacePanel      | `task-step01-2-file-replace-ui-design.md`      | `FileReplacePanel.test.tsx` ✅      |
| WorkspaceSearchPanel  | `task-step01-3-workspace-search-ui-design.md`  | `WorkspaceSearchPanel.test.tsx` ✅  |
| WorkspaceReplacePanel | `task-step01-4-workspace-replace-ui-design.md` | `WorkspaceReplacePanel.test.tsx` ✅ |

- IPCハンドラー実装（main↔renderer通信）
- キーボードショートカット実装
- アクセシビリティ対応（WCAG 2.1 AA）

#### 含まないもの

- コアロジックの変更（実装済み）
- 新規機能追加
- デザインの変更（設計書に従う）

### 2.4 成果物

| 種別             | 成果物                | 配置先                                                            |
| ---------------- | --------------------- | ----------------------------------------------------------------- |
| UIコンポーネント | FileSearchPanel       | `apps/desktop/src/renderer/components/organisms/SearchPanel/`     |
| UIコンポーネント | FileReplacePanel      | 同上（SearchPanelと統合）                                         |
| UIコンポーネント | WorkspaceSearchPanel  | `apps/desktop/src/renderer/components/organisms/WorkspaceSearch/` |
| UIコンポーネント | WorkspaceReplacePanel | 同上（WorkspaceSearchと統合）                                     |
| IPC              | IPCハンドラー         | `apps/desktop/src/main/ipc/`                                      |
| IPC              | プリロードスクリプト  | `apps/desktop/src/preload/`                                       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 検索・置換コアロジックが実装済み（212テスト、100%カバレッジ）
- UI設計書が完成済み（T-01-1〜T-01-4）
- テストファイルが作成済み（Red状態）

### 3.2 依存タスク

- なし（コアロジックは実装済み）

### 3.3 必要な知識・スキル

- React / TypeScript
- Electron IPC通信
- Tailwind CSS
- Vitest / React Testing Library
- アクセシビリティ（ARIA属性）

### 3.4 推奨アプローチ

1. **IPC層の実装**: main↔renderer間の通信を確立
2. **共通コンポーネント**: SearchInput, OptionToggle等の共通パーツを先に実装
3. **FileSearchPanel**: 単一ファイル検索UIを実装
4. **FileReplacePanel**: FileSearchPanelを拡張して置換UIを実装
5. **WorkspaceSearchPanel**: ワークスペース検索UIを実装
6. **WorkspaceReplacePanel**: WorkspaceSearchPanelを拡張して置換UIを実装

---

## 4. 実行手順

### Phase構成

```
Phase 3: テスト確認（既存テストがRed状態であることを確認）
Phase 4-1: IPC層実装
Phase 4-2: FileSearchPanel実装
Phase 4-3: FileReplacePanel実装
Phase 4-4: WorkspaceSearchPanel実装
Phase 4-5: WorkspaceReplacePanel実装
Phase 5: リファクタリング
Phase 6: 品質保証
Phase 8: 手動テスト（UI実装後に実施）
```

---

### Phase 4-1: IPC層実装

#### 目的

main↔renderer間の通信を確立し、コアロジックをUI から呼び出せるようにする。

#### Claude Code スラッシュコマンド

```
/ai:create-component ipc-search-replace
```

#### 使用エージェント

- **エージェント**: @electron-architect
- **選定理由**: Electron IPC通信の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装内容

```typescript
// main/ipc/searchHandlers.ts
ipcMain.handle("search:file", async (_, options) => {
  return searchService.search(options);
});

ipcMain.handle("replace:file", async (_, options) => {
  return replaceService.replace(options);
});

// preload/index.ts
contextBridge.exposeInMainWorld("searchAPI", {
  searchFile: (options) => ipcRenderer.invoke("search:file", options),
  replaceFile: (options) => ipcRenderer.invoke("replace:file", options),
});
```

#### 完了条件

- [ ] IPCハンドラーが実装されている
- [ ] プリロードスクリプトでAPIが公開されている
- [ ] 型定義が完了している

---

### Phase 4-2: FileSearchPanel実装

#### 目的

単一ファイル内検索のUIコンポーネントを実装する。

#### Claude Code スラッシュコマンド

```
/ai:create-component FileSearchPanel
```

#### 使用エージェント

- **エージェント**: @ui-designer, @frontend-tester
- **選定理由**: UIコンポーネント実装とテストの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 参照設計書

- `docs/30-workflows/search-replace/task-step01-1-file-search-ui-design.md`

#### 完了条件

- [ ] コンポーネントが設計書通りに実装されている
- [ ] 既存テスト（FileSearchPanel.test.tsx）がGreen状態
- [ ] キーボードショートカットが動作する
- [ ] ARIA属性が設定されている

---

### Phase 4-3: FileReplacePanel実装

#### 目的

単一ファイル内置換のUIコンポーネントを実装する（FileSearchPanelの拡張）。

#### Claude Code スラッシュコマンド

```
/ai:create-component FileReplacePanel
```

#### 使用エージェント

- **エージェント**: @ui-designer, @frontend-tester
- **選定理由**: UIコンポーネント実装とテストの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 参照設計書

- `docs/30-workflows/search-replace/task-step01-2-file-replace-ui-design.md`

#### 完了条件

- [ ] コンポーネントが設計書通りに実装されている
- [ ] 既存テスト（FileReplacePanel.test.tsx）がGreen状態
- [ ] 置換プレビュー機能が動作する
- [ ] 確認ダイアログが実装されている

---

### Phase 4-4: WorkspaceSearchPanel実装

#### 目的

ワークスペース全体検索のUIコンポーネントを実装する。

#### Claude Code スラッシュコマンド

```
/ai:create-component WorkspaceSearchPanel
```

#### 使用エージェント

- **エージェント**: @ui-designer, @frontend-tester
- **選定理由**: UIコンポーネント実装とテストの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 参照設計書

- `docs/30-workflows/search-replace/task-step01-3-workspace-search-ui-design.md`

#### 完了条件

- [ ] コンポーネントが設計書通りに実装されている
- [ ] 既存テスト（WorkspaceSearchPanel.test.tsx）がGreen状態
- [ ] ファイル別結果表示が動作する
- [ ] 除外パターン設定が動作する

---

### Phase 4-5: WorkspaceReplacePanel実装

#### 目的

ワークスペース全体置換のUIコンポーネントを実装する。

#### Claude Code スラッシュコマンド

```
/ai:create-component WorkspaceReplacePanel
```

#### 使用エージェント

- **エージェント**: @ui-designer, @frontend-tester
- **選定理由**: UIコンポーネント実装とテストの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 参照設計書

- `docs/30-workflows/search-replace/task-step01-4-workspace-replace-ui-design.md`

#### 完了条件

- [ ] コンポーネントが設計書通りに実装されている
- [ ] 既存テスト（WorkspaceReplacePanel.test.tsx）がGreen状態
- [ ] 複数ファイル一括置換が動作する
- [ ] Undo/Redo連携が動作する

---

### Phase 6: 品質保証

#### Claude Code スラッシュコマンド

```
/ai:run-all-tests --coverage
/ai:lint --fix
/ai:run-accessibility-audit --scope component
```

#### 完了条件

- [ ] 全テスト成功（コアロジック212 + UI新規テスト）
- [ ] カバレッジ80%以上維持
- [ ] Lintエラーなし
- [ ] アクセシビリティ監査PASS

---

### Phase 8: 手動テスト

#### 目的

UI実装完了後、手動テストを実施する。

#### テストケース

`docs/30-workflows/search-replace/task-step08-manual-test-result.md` に記載の19テストケースを実施。

#### 完了条件

- [ ] 19テストケースすべてPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] FileSearchPanelが動作する
- [ ] FileReplacePanelが動作する
- [ ] WorkspaceSearchPanelが動作する
- [ ] WorkspaceReplacePanelが動作する
- [ ] IPC通信でコアロジックと接続されている
- [ ] キーボードショートカットが動作する

### 品質要件

- [ ] 既存UIテストファイルがすべてGreen状態
- [ ] カバレッジ80%以上
- [ ] Lint/型チェッククリア
- [ ] WCAG 2.1 AA準拠

### ドキュメント要件

- [ ] 使用方法がコメントで説明されている

---

## 6. 検証方法

### テストケース

- 既存テストファイル（4ファイル）の実行
- 手動テスト19ケースの実施

### 検証手順

```bash
# UIテスト実行
pnpm --filter @repo/desktop test:run FileSearchPanel
pnpm --filter @repo/desktop test:run FileReplacePanel
pnpm --filter @repo/desktop test:run WorkspaceSearchPanel
pnpm --filter @repo/desktop test:run WorkspaceReplacePanel

# 全テスト実行
pnpm --filter @repo/desktop test:run
```

---

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                         |
| ----------------------- | ------ | -------- | ---------------------------- |
| 設計書と実装の乖離      | 中     | 低       | 設計書を厳密に参照           |
| IPC通信のパフォーマンス | 中     | 中       | バッチ処理、デバウンス適用   |
| アクセシビリティ不足    | 高     | 中       | 設計書のARIA属性を忠実に実装 |

---

## 8. 参照情報

### 関連設計書

- `docs/30-workflows/search-replace/task-step01-1-file-search-ui-design.md`
- `docs/30-workflows/search-replace/task-step01-2-file-replace-ui-design.md`
- `docs/30-workflows/search-replace/task-step01-3-workspace-search-ui-design.md`
- `docs/30-workflows/search-replace/task-step01-4-workspace-replace-ui-design.md`

### 関連実装（コアロジック）

- `apps/desktop/src/main/search/` - 検索モジュール
- `apps/desktop/src/main/replace/` - 置換モジュール
- `apps/desktop/src/main/transaction/` - トランザクションモジュール

### 参考資料

- [Electron IPC通信](https://www.electronjs.org/docs/latest/tutorial/ipc)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 9. 備考

### 既存テストファイル（Red状態）

```
apps/desktop/src/renderer/components/organisms/SearchPanel/__tests__/
├── FileSearchPanel.test.tsx
└── FileReplacePanel.test.tsx

apps/desktop/src/renderer/components/organisms/WorkspaceSearch/__tests__/
├── WorkspaceSearchPanel.test.tsx
└── WorkspaceReplacePanel.test.tsx
```

### 補足事項

- UI設計書（Phase 1）は詳細に記述されているため、実装時は設計書を厳密に参照すること
- コアロジックは212テスト、100%カバレッジで検証済みのため、UI側の問題に集中できる
- 手動テスト（Phase 8）はUI実装完了後に実施すること

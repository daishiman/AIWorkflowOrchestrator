# Phase 2: 設計

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 2                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 目的

E2Eテストの設計とIPC統合の詳細設計を行う。既存実装との整合性を確認する。

## 参照資料

| 資料名     | パス                                                                       | 説明          |
| ---------- | -------------------------------------------------------------------------- | ------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md`                               | Phase 1成果物 |
| UI設計仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`  | システム仕様  |
| API仕様    | `.claude/skills/aiworkflow-requirements/references/api-internal-search.md` | 内部API仕様   |

## 既存アーキテクチャ確認

### コンポーネント構成

```
apps/desktop/src/features/search/
├── components/
│   ├── SearchPanel.tsx           # ファイル内検索（実装済み）
│   ├── WorkspaceSearchPanel.tsx  # ワークスペース検索（実装済み）
│   └── SearchOptionButtons.tsx   # 検索オプション（実装済み）
├── stores/
│   └── useSearchStore.ts         # Zustand状態管理（実装済み）
├── hooks/
│   └── useSearchKeyboardShortcuts.ts  # キーボードショートカット（実装済み）
├── adapters/
│   └── TextAreaEditorAdapter.ts  # エディタアダプター（実装済み）
├── utils/
│   ├── executeSearch.ts          # 検索ロジック（実装済み）
│   ├── highlightUtils.tsx        # ハイライト処理（実装済み）
│   └── index.ts
├── types.ts
├── constants.ts
└── index.ts
```

### 状態管理設計（既存）

| Store          | 責務                 | 状態                                            |
| -------------- | -------------------- | ----------------------------------------------- |
| useSearchStore | 検索パネルの状態管理 | isOpen, searchMode, showReplace, query, options |

## E2Eテスト設計

### テストシナリオ一覧

| シナリオID | カテゴリ           | シナリオ名                   | 優先度 |
| ---------- | ------------------ | ---------------------------- | ------ |
| E2E-1      | ファイル内検索     | 基本検索フロー               | 高     |
| E2E-2      | ファイル内検索     | 検索オプション切り替え       | 高     |
| E2E-3      | ファイル内検索     | 検索結果ナビゲーション       | 高     |
| E2E-4      | ファイル内検索     | 置換操作                     | 高     |
| E2E-5      | ワークスペース検索 | ワークスペース検索基本フロー | 高     |
| E2E-6      | ワークスペース検索 | ファイルジャンプ             | 高     |
| E2E-7      | キーボード         | ショートカットによる開閉     | 高     |
| E2E-8      | アクセシビリティ   | スクリーンリーダー対応       | 中     |

### E2Eテストファイル構成

| ファイル                                | 内容                |
| --------------------------------------- | ------------------- |
| `apps/desktop/tests/e2e/search.spec.ts` | 検索・置換E2Eテスト |

### E2Eテスト技術設計

| 項目                 | 選定                                 |
| -------------------- | ------------------------------------ |
| テストフレームワーク | Playwright                           |
| ページオブジェクト   | SearchPanelPage, WorkspaceSearchPage |
| テストデータ         | フィクスチャファイル                 |

## IPC統合設計

### ワークスペース検索IPC

現在の`WorkspaceSearchPanel.tsx`では、デフォルト検索プロバイダがプレースホルダー実装になっている：

```typescript
// 現在の実装（プレースホルダー）
async function* defaultSearchProvider(
  _workspacePath: string,
  _query: string,
  _options: SearchProviderOptions,
): AsyncGenerator<FileSearchResult> {
  // This will be replaced with actual IPC call
  yield* [];
}
```

### IPC統合方針

| 方針         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| チャンネル名 | `search:workspace`                                               |
| リクエスト   | `{ workspacePath, query, options }`                              |
| レスポンス   | ストリーミング `AsyncGenerator<FileSearchResult>`                |
| Main側実装   | `packages/shared/src/search/WorkspaceSearchEngine.ts` を呼び出し |

### IPCチャンネル定義

| チャンネル                | 方向          | ペイロード                           |
| ------------------------- | ------------- | ------------------------------------ |
| `search:workspace`        | Renderer→Main | `WorkspaceSearchRequest`             |
| `search:workspace:result` | Main→Renderer | `FileSearchResult`（ストリーミング） |
| `search:workspace:done`   | Main→Renderer | `{ totalFiles, totalMatches }`       |
| `search:workspace:error`  | Main→Renderer | `{ error: string }`                  |

## キーボードショートカット統合設計

### グローバルショートカット登録

| ショートカット           | 登録場所                    | 処理                               |
| ------------------------ | --------------------------- | ---------------------------------- |
| Cmd+F/Ctrl+F             | EditorView または AppLayout | useSearchStore.openFileSearch      |
| Cmd+Shift+F/Ctrl+Shift+F | AppLayout                   | useSearchStore.openWorkspaceSearch |
| Escape                   | SearchPanel内               | onClose                            |

## 統合テスト連携【必須】

統合ポイント/契約を設計に反映:

| 統合ポイント          | 契約定義                                    |
| --------------------- | ------------------------------------------- |
| フロント→IPC          | `search:workspace` リクエストスキーマ       |
| IPC→SearchEngine      | `WorkspaceSearchEngine.search()` 呼び出し   |
| SearchEngine→フロント | `FileSearchResult` ストリーミングレスポンス |

## アーキテクチャ層別設計

| 層                         | 設計観点                             | 仕様参照先                 |
| -------------------------- | ------------------------------------ | -------------------------- |
| フロントエンド（Renderer） | 既存SearchPanel/WorkspaceSearchPanel | `ui-ux-search-panel.md`    |
| バックエンド（Main）       | IPCハンドラー実装                    | `architecture-*.md`        |
| IPC通信                    | チャンネル定義、ストリーミング       | `api-internal-search.md`   |
| Preload                    | contextBridge経由API公開             | `security-api-electron.md` |

## 成果物

| 成果物             | パス                                        | 説明        |
| ------------------ | ------------------------------------------- | ----------- |
| E2Eテスト設計書    | `outputs/phase-2/e2e-test-design.md`        | E2Eシナリオ |
| IPC統合設計書      | `outputs/phase-2/ipc-integration-design.md` | IPC詳細設計 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`    | 全体構造    |

## 完了条件

- [ ] E2Eテストシナリオが定義されている
- [ ] E2Eテストのページオブジェクト設計が完了している
- [ ] IPC統合設計が完了している
- [ ] 既存実装との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 既存アーキテクチャの確認
2. E2Eテスト設計（シナリオ定義）
3. E2Eテスト設計（ページオブジェクト設計）
4. IPC統合設計
5. キーボードショートカット統合設計
6. 成果物の作成

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各設計ドキュメントが生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/search-replace-ui --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート

# Desktop状態管理（RAG関連）

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/
>
> **親ドキュメント**: [architecture-rag.md](./architecture-rag.md)

---

## 概要

Electronデスクトップアプリにおける状態管理パターン。テーマ、ワークスペース、システムプロンプト、LLM選択の状態管理を定義。

---

## テーマ状態管理

| レイヤー         | 責務                                       | ファイル                |
| ---------------- | ------------------------------------------ | ----------------------- |
| Main Process     | nativeTheme API連携、永続化（IPC経由）     | themeHandlers.ts        |
| Preload          | contextBridgeによるAPI公開                 | preload/index.ts        |
| Renderer (Hook)  | システム監視、Zustand連携                  | useTheme.ts             |
| Renderer (Store) | テーマ状態保持（themeMode, resolvedTheme） | settingsSlice.ts        |
| Renderer (UI)    | ThemeSelectorコンポーネント                | ThemeSelector/index.tsx |

### IPCチャネル設計（テーマ）

| チャネル               | 方向            | 用途             |
| ---------------------- | --------------- | ---------------- |
| `theme:get`            | Renderer → Main | 現在のテーマ取得 |
| `theme:set`            | Renderer → Main | テーマ設定変更   |
| `theme:get-system`     | Renderer → Main | OSテーマ取得     |
| `theme:system-changed` | Main → Renderer | OSテーマ変更通知 |

---

## ワークスペース状態管理

| レイヤー         | 責務                                       | ファイル             |
| ---------------- | ------------------------------------------ | -------------------- |
| Main Process     | ファイルシステム操作、永続化（IPC経由）    | workspaceHandlers.ts |
| Preload          | contextBridgeによるAPI公開                 | preload/index.ts     |
| Renderer (Store) | Workspace状態保持（folders, selectedFile） | workspaceSlice.ts    |
| Renderer (UI)    | WorkspaceSidebar, FolderEntryItem          | components/          |

### IPCチャネル設計（ワークスペース）

| チャネル                   | 方向            | 用途               |
| -------------------------- | --------------- | ------------------ |
| `workspace:load`           | Renderer → Main | ワークスペース読込 |
| `workspace:save`           | Renderer → Main | ワークスペース保存 |
| `workspace:add-folder`     | Renderer → Main | フォルダ追加       |
| `workspace:validate-paths` | Renderer → Main | パス有効性検証     |
| `file:read`                | Renderer → Main | ファイル読込       |
| `file:write`               | Renderer → Main | ファイル書込       |
| `file:get-tree`            | Renderer → Main | ファイルツリー取得 |

---

## システムプロンプト状態管理

| レイヤー         | 責務                                  | ファイル                                   |
| ---------------- | ------------------------------------- | ------------------------------------------ |
| Main Process     | electron-store永続化（IPC経由）       | storeHandlers.ts                           |
| Preload          | contextBridgeによるAPI公開            | preload/index.ts                           |
| Renderer (Store) | テンプレート状態保持、バリデーション  | systemPromptTemplateSlice.ts, chatSlice.ts |
| Renderer (UI)    | SystemPromptPanel、SaveTemplateDialog | components/organisms/                      |

### 状態構造

| State                         | 型                 | 責務                            | Slice                        |
| ----------------------------- | ------------------ | ------------------------------- | ---------------------------- |
| `systemPrompt`                | `string`           | 現在のシステムプロンプト        | chatSlice.ts                 |
| `systemPromptUpdatedAt`       | `Date \| null`     | 最終更新日時                    | chatSlice.ts                 |
| `selectedTemplateId`          | `string \| null`   | 選択中のテンプレートID          | chatSlice.ts                 |
| `templates`                   | `PromptTemplate[]` | プリセット+カスタムテンプレート | systemPromptTemplateSlice.ts |
| `isSystemPromptPanelExpanded` | `boolean`          | パネル展開状態                  | chatSlice.ts                 |
| `isSaveTemplateDialogOpen`    | `boolean`          | 保存ダイアログ表示状態          | systemPromptTemplateSlice.ts |

### IPCチャネル設計（システムプロンプト）

| チャネル       | 方向            | 用途                     |
| -------------- | --------------- | ------------------------ |
| `store:get`    | Renderer → Main | electron-storeデータ取得 |
| `store:set`    | Renderer → Main | electron-storeデータ保存 |
| `store:delete` | Renderer → Main | electron-storeデータ削除 |

### データ永続化

- **保存先**: electron-store（`~/.config/AIWorkflowOrchestrator/config.json`）
- **キー**: `systemPromptTemplates`
- **形式**: `PromptTemplate[]` JSON配列
- **暗号化**: 不要（機密性低いユーザー設定）
- **同期**: 保存・削除時に即座にelectron-storeへ書き込み

---

## IPCチャネル設計（チャット・LLM選択）

| チャネル              | 方向            | 用途                            |
| --------------------- | --------------- | ------------------------------- |
| `AI_CHAT`             | Renderer → Main | LLMへのメッセージ送信と応答取得 |
| `AI_CHECK_CONNECTION` | Renderer → Main | LLM/RAG接続状態確認             |
| `AI_INDEX`            | Renderer → Main | RAGドキュメントインデックス作成 |

### プロセス間責務分離

| プロセス     | 責務                                                                 |
| ------------ | -------------------------------------------------------------------- |
| Renderer     | ユーザー入力、LLM/モデル選択、システムプロンプト編集、メッセージ表示 |
| Main Process | LLM API呼び出し、RAG処理、会話履歴管理、エラーハンドリング           |

### AI_CHAT チャネル詳細

リクエストにはユーザーメッセージ（必須）、システムプロンプト（任意）、RAG機能有効化フラグ（必須）、会話ID（任意）が含まれる。レスポンスには成功フラグ、AI応答メッセージ、会話ID、RAG参照元ファイルパス（任意）が含まれる。

型定義の詳細は[コアインターフェース 6.9.2](./06-core-interfaces.md#692-ipc-型定義)を参照。

---

## LLM選択アーキテクチャ

| コンポーネント | 責務                                                          |
| -------------- | ------------------------------------------------------------- |
| LLMSelector    | プロバイダー/モデル選択UI（Renderer）                         |
| chatSlice      | 選択状態管理（currentProviderId, currentModelId）（Renderer） |
| aiHandlers.ts  | IPC経由でメッセージ受信、LLM API呼び出し（Main）              |

### 統合仕様

- LLM選択（プロバイダー/モデル）とシステムプロンプトは独立して設定可能
- メッセージ送信時、両方の設定を`AI_CHAT` IPCリクエストに含める
- プロバイダー/モデル切り替え時もシステムプロンプトは保持される
- 会話履歴は保持されるが、各モデルは独立して動作

### 対応LLMプロバイダー

| プロバイダー | モデル例                         | コンテキストウィンドウ |
| ------------ | -------------------------------- | ---------------------- |
| OpenAI       | gpt-5.2-instant, gpt-4           | 400K, 8K               |
| Anthropic    | claude-sonnet-4.5, claude-3-opus | 200K (1M beta), 200K   |
| Google       | gemini-3-flash, gemini-pro       | 1M, 32K                |
| xAI          | grok-4.1-fast, grok-1            | 2M, 8K                 |

### 実装ファイル

- IPC Handler: `apps/desktop/src/main/ipc/aiHandlers.ts`
- 型定義: `apps/desktop/src/preload/types.ts`
- 状態管理: `apps/desktop/src/renderer/store/slices/chatSlice.ts`
- UIコンポーネント: `apps/desktop/src/renderer/components/molecules/LLMSelector/`

---

## セキュリティ考慮事項

| 項目                       | 対策                                             |
| -------------------------- | ------------------------------------------------ |
| APIキー保護                | Electron SafeStorageで暗号化保存                 |
| プロンプトインジェクション | ローカルアプリのため影響限定的                   |
| XSS攻撃                    | React自動エスケープ + IPC経由で文字列のみ送信    |
| レート制限対応             | プロバイダー側のレート制限エラーをRendererに通知 |

---

## 関連ドキュメント

- [RAGアーキテクチャ概要](./architecture-rag.md)
- [ベクトル検索・同期](./rag-vector-search.md)
- [IPC・永続化パターン](./arch-ipc-persistence.md)

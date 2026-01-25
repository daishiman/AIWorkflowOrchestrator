# Phase 1: 要件定義書 - 会話履歴UI実装

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| 作成日     | 2026-01-24                             |
| Phase      | 1                                      |
| 機能名     | conversation-history-ui-implementation |
| ステータス | 完了                                   |

---

## システム仕様理解メモ

### 1. 確認済みシステム仕様

#### UI/UXパネル仕様（ui-ux-history-panel.md）

- 履歴パネルのコンポーネント構造が定義済み
- VersionHistory、VersionDetail、ConversionLogs、RestoreDialogの参照実装あり
- Atomic Design原則（Atom/Molecule/Organism）に従う
- カスタムフックパターン：useVersionHistory、useVersionDetail等

#### LLMインターフェース仕様（interfaces-llm.md）

- 会話履歴永続化タスク（UT-LLM-HISTORY-001）完了済み
- IPCチャンネル7つが定義済み：
  - `conversation:create` / `conversation:get` / `conversation:list`
  - `conversation:update` / `conversation:delete`
  - `conversation:addMessage` / `conversation:search`
- テストカバレッジ100%達成済み（Repository + IPC Handlers）

#### アーキテクチャパターン（architecture-patterns.md）

- **Zustand Sliceパターン**: 状態とアクションを分離
  - `{Name}State` / `{Name}Actions` / `{Name}Slice`インターフェース
  - `initial{Name}State` / `create{Name}Slice`関数
- **Preload APIパターン**: safeInvoke/safeOnによるセキュリティ確保
  - ホワイトリストチャンネル検証
  - contextBridge経由のAPI公開

#### 型定義（conversation.ts）

- `Conversation` / `ConversationSummary` / `Message` 型定義済み
- IPC Request/Response型完備
- `ConversationAPI`インターフェース定義済み

### 2. 既存実装確認

| 項目                        | 状態   | 場所                                                 |
| --------------------------- | ------ | ---------------------------------------------------- |
| ConversationRepository      | 完了   | `apps/desktop/src/main/repositories/`                |
| conversationHandlers        | 完了   | `apps/desktop/src/main/ipc/`                         |
| 型定義                      | 完了   | `apps/desktop/src/shared/types/conversation.ts`      |
| IPCチャンネル定義           | 完了   | `apps/desktop/src/preload/channels.ts`               |
| Preload API conversationAPI | 未実装 | `apps/desktop/src/preload/index.ts`                  |
| UIコンポーネント            | 未実装 | `apps/desktop/src/renderer/components/conversation/` |
| カスタムフック              | 未実装 | `apps/desktop/src/renderer/hooks/`                   |
| Zustand Slice               | 未実装 | `apps/desktop/src/renderer/store/slices/`            |

---

## 機能要件定義

### FR-001: 会話一覧機能

| 要件ID    | 要件                             | 優先度 |
| --------- | -------------------------------- | ------ |
| FR-001-01 | 会話一覧をサイドパネルに表示する | 必須   |
| FR-001-02 | ページネーション対応（20件ずつ） | 必須   |
| FR-001-03 | 追加読み込みボタン（Load More）  | 必須   |
| FR-001-04 | キーワード検索機能               | 必須   |
| FR-001-05 | 新規会話作成ボタン               | 必須   |
| FR-001-06 | 会話削除（確認ダイアログ付き）   | 必須   |
| FR-001-07 | 会話選択時にハイライト表示       | 必須   |
| FR-001-08 | 最終メッセージプレビュー表示     | 推奨   |
| FR-001-09 | 日時フォーマット（相対時間表示） | 推奨   |

### FR-002: 会話詳細機能

| 要件ID    | 要件                                   | 優先度 |
| --------- | -------------------------------------- | ------ |
| FR-002-01 | メッセージ一覧表示                     | 必須   |
| FR-002-02 | user/assistantの視覚的区別（バブルUI） | 必須   |
| FR-002-03 | 自動スクロール（新規メッセージ時）     | 必須   |
| FR-002-04 | タイトル表示                           | 必須   |
| FR-002-05 | タイトル編集機能                       | 推奨   |
| FR-002-06 | メッセージ日時表示                     | 推奨   |
| FR-002-07 | LLMモデル情報表示                      | 推奨   |

### FR-003: メッセージ入力機能

| 要件ID    | 要件                         | 優先度 |
| --------- | ---------------------------- | ------ |
| FR-003-01 | テキスト入力エリア           | 必須   |
| FR-003-02 | Enter送信（Shift+Enter改行） | 必須   |
| FR-003-03 | 送信ボタン                   | 必須   |
| FR-003-04 | 送信中ローディング表示       | 必須   |
| FR-003-05 | 可変高さテキストエリア       | 推奨   |
| FR-003-06 | 送信無効化（空メッセージ時） | 必須   |

### FR-004: IPC接続機能

| 要件ID    | 要件                                     | 優先度 |
| --------- | ---------------------------------------- | ------ |
| FR-004-01 | `conversation:create` チャンネル接続     | 必須   |
| FR-004-02 | `conversation:get` チャンネル接続        | 必須   |
| FR-004-03 | `conversation:list` チャンネル接続       | 必須   |
| FR-004-04 | `conversation:update` チャンネル接続     | 必須   |
| FR-004-05 | `conversation:delete` チャンネル接続     | 必須   |
| FR-004-06 | `conversation:addMessage` チャンネル接続 | 必須   |
| FR-004-07 | `conversation:search` チャンネル接続     | 必須   |
| FR-004-08 | conversationAPI経由のアクセス            | 必須   |
| FR-004-09 | safeInvokeによるセキュリティ確保         | 必須   |

---

## UI要件定義

### UR-001: コンポーネント構成

#### UI-001: 会話一覧UIコンポーネント

| コンポーネント        | 種別     | 責務                     |
| --------------------- | -------- | ------------------------ |
| ConversationListPanel | Organism | 一覧パネル（サイドバー） |
| ConversationListItem  | Molecule | 個別会話アイテム         |
| ConversationSearch    | Molecule | 検索入力                 |
| NewConversationButton | Atom     | 新規作成ボタン           |

#### UI-002: 会話詳細UIコンポーネント

| コンポーネント         | 種別     | 責務                             |
| ---------------------- | -------- | -------------------------------- |
| ConversationDetailView | Organism | 詳細ビュー全体                   |
| ConversationHeader     | Molecule | 会話タイトル・操作ボタン         |
| MessageList            | Molecule | メッセージ一覧                   |
| MessageBubble          | Molecule | 個別メッセージ（user/assistant） |

#### UI-003: メッセージ入力UIコンポーネント

| コンポーネント | 種別     | 責務                 |
| -------------- | -------- | -------------------- |
| MessageInput   | Organism | 入力フォーム全体     |
| TextArea       | Atom     | 可変高さテキスト入力 |
| SendButton     | Atom     | 送信ボタン           |

### UR-002: レイアウト要件

| パネル         | 配置     | サイズ          | 備考                 |
| -------------- | -------- | --------------- | -------------------- |
| 会話一覧パネル | 左サイド | 幅300px（固定） | スクロール可能       |
| 会話詳細ビュー | メイン   | 残り幅          | フレックス成長       |
| メッセージ入力 | 下部固定 | 高さ自動        | 入力内容に応じて伸縮 |

### UR-003: アクセシビリティ要件（WCAG 2.1 AA準拠）

| 要件ID    | 要件                     | 実装方針                        |
| --------- | ------------------------ | ------------------------------- |
| UR-003-01 | キーボードナビゲーション | Tab, Enter, Space, Escapeで操作 |
| UR-003-02 | スクリーンリーダー対応   | 適切なrole/aria属性設定         |
| UR-003-03 | フォーカス管理           | フォーカストラップ実装          |
| UR-003-04 | 色に頼らない情報         | アイコン+テキストで状態表現     |
| UR-003-05 | コントラスト比4.5:1以上  | Tailwind CSS準拠                |

#### ARIA属性仕様

| コンポーネント        | 属性                            |
| --------------------- | ------------------------------- |
| ConversationListPanel | role="navigation", aria-label   |
| ConversationListItem  | role="button", aria-selected    |
| MessageList           | role="log", aria-live="polite"  |
| MessageBubble         | role="article", aria-label      |
| MessageInput          | role="textbox", aria-label      |
| LoadingIndicator      | role="status", aria-busy="true" |
| DeleteDialog          | role="alertdialog", aria-modal  |

### UR-004: パフォーマンス要件

| 指標             | 目標値 | 計測方法                |
| ---------------- | ------ | ----------------------- |
| 初期レンダリング | <100ms | React DevTools Profiler |
| リスト表示       | <200ms | パフォーマンス計測API   |
| 追加読み込み     | <100ms | IPC応答時間             |
| メッセージ送信   | <500ms | ユーザー体感            |

---

## 受け入れ基準

### AC-001: 機能要件受け入れ基準

| 基準ID    | 基準                                   | 検証方法             |
| --------- | -------------------------------------- | -------------------- |
| AC-001-01 | 会話一覧が正しく表示される             | 目視確認・自動テスト |
| AC-001-02 | ページネーションが20件単位で動作する   | 自動テスト           |
| AC-001-03 | 検索が正しく動作する                   | 自動テスト           |
| AC-001-04 | 新規会話が作成できる                   | 自動テスト           |
| AC-001-05 | 会話が削除できる（確認ダイアログ付き） | 自動テスト           |
| AC-001-06 | メッセージ一覧が正しく表示される       | 自動テスト           |
| AC-001-07 | user/assistantが視覚的に区別される     | 目視確認             |
| AC-001-08 | メッセージ送信が正しく動作する         | 自動テスト           |
| AC-001-09 | 全7つのIPCチャンネルが接続される       | 統合テスト           |

### AC-002: 品質要件受け入れ基準

| 基準ID    | 基準                 | 目標値  |
| --------- | -------------------- | ------- |
| AC-002-01 | Line Coverage        | 80%以上 |
| AC-002-02 | Branch Coverage      | 60%以上 |
| AC-002-03 | Function Coverage    | 80%以上 |
| AC-002-04 | TypeScriptエラーなし | 0件     |
| AC-002-05 | ESLintエラーなし     | 0件     |

### AC-003: アクセシビリティ受け入れ基準

| 基準ID    | 基準                                     | 検証方法   |
| --------- | ---------------------------------------- | ---------- |
| AC-003-01 | キーボードのみで全操作可能               | 手動テスト |
| AC-003-02 | スクリーンリーダーで内容が読み上げられる | 手動テスト |
| AC-003-03 | フォーカスが適切に管理される             | 手動テスト |
| AC-003-04 | axe-coreで重大な問題なし                 | 自動テスト |

### AC-004: テストケース目標

| カテゴリ    | テスト内容                     | 目標件数 |
| ----------- | ------------------------------ | -------- |
| Preload API | チャンネル登録・safeInvoke動作 | 10+      |
| 一覧UI      | 表示・ページネーション・検索   | 20+      |
| 詳細UI      | メッセージ表示・スクロール     | 20+      |
| 入力UI      | 入力・送信・ローディング       | 15+      |
| 統合テスト  | IPC接続・E2Eフロー             | 10+      |

---

## 統合テスト連携

### IPC接続要件

以下の7つのIPCチャンネルが`conversationAPI`経由で接続されること：

```typescript
interface ConversationAPI {
  list: (request: ConversationListRequest) => Promise<ConversationListResponse>;
  get: (request: ConversationGetRequest) => Promise<ConversationGetResponse>;
  create: (
    request: ConversationCreateRequest,
  ) => Promise<ConversationCreateResponse>;
  update: (
    request: ConversationUpdateRequest,
  ) => Promise<ConversationUpdateResponse>;
  delete: (
    request: ConversationDeleteRequest,
  ) => Promise<ConversationDeleteResponse>;
  addMessage: (
    request: ConversationAddMessageRequest,
  ) => Promise<ConversationAddMessageResponse>;
  search: (
    request: ConversationSearchRequest,
  ) => Promise<ConversationSearchResponse>;
}
```

### バックエンドAPI動作確認

バックエンドAPI（ConversationRepository + IPC Handlers）は以下のテストで動作確認済み：

- Repository層テスト: 75件 PASS
- IPC Handlers層テスト: 39件 PASS
- カバレッジ: Line 100%, Branch 100%, Function 100%

---

## 成果物一覧

| 成果物                    | 配置先                                               |
| ------------------------- | ---------------------------------------------------- |
| ConversationListPanel     | `apps/desktop/src/renderer/components/conversation/` |
| ConversationDetailView    | `apps/desktop/src/renderer/components/conversation/` |
| MessageInput              | `apps/desktop/src/renderer/components/conversation/` |
| conversationAPI (Preload) | `apps/desktop/src/preload/index.ts`                  |
| useConversation hooks     | `apps/desktop/src/renderer/hooks/`                   |
| conversationSlice         | `apps/desktop/src/renderer/store/slices/`            |
| ユニットテスト            | `apps/desktop/src/renderer/__tests__/`               |

---

## 完了条件チェックリスト

- [x] システム仕様書の確認完了
- [x] 機能要件（会話一覧・詳細・入力・IPC）の定義完了
- [x] UI要件（コンポーネント・レイアウト・アクセシビリティ）の定義完了
- [x] 受け入れ基準（機能・品質・テストケース目標）の定義完了
- [x] `outputs/phase-1/requirements-definition.md` 作成完了

---

## Phase末端アクション

- [x] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [x] 各タスクを100%完了し、完了を明記
- [x] 成果物が全て生成されていることを確認

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |

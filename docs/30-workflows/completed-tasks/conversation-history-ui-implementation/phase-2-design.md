# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| Phase名    | 設計                                   |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-24                             |
| 機能名     | conversation-history-ui-implementation |

---

## 目的

Phase 1で定義した要件に基づき、コンポーネント設計・状態管理設計・IPC接続設計を策定する。

## 背景

要件が明確化されたため、実装に向けた詳細設計を行い、TDDテスト作成の基盤を構築する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コンポーネント設計

**目的**: UIコンポーネントの構成と責務を設計する。

**実行手順**:

1. UI-001（会話一覧）のコンポーネント階層を設計する
   - ConversationListPanel（Organism）
   - ConversationListItem（Molecule）
   - ConversationSearch（Molecule）
   - NewConversationButton（Atom）
   - LoadingSkeleton, ErrorDisplay, EmptyState（Molecule）
2. UI-002（会話詳細）のコンポーネント階層を設計する
   - ConversationDetailView（Organism）
   - ConversationHeader（Molecule）
   - MessageList（Organism）
   - MessageBubble（Molecule）
3. UI-003（メッセージ入力）のコンポーネント階層を設計する
   - MessageInput（Organism）
   - TextArea（Atom）
   - SendButton（Atom）
4. 各コンポーネントのProps定義を設計する

**期待される成果物**:

- `outputs/phase-2/design-document.md`（コンポーネント設計セクション）

---

### タスク2: Preload API設計（UI-004）

**目的**: Renderer ProcessからMain ProcessへのIPC接続を設計する。

**実行手順**:

1. IPCチャンネル定義を設計する
   ```typescript
   CONVERSATION_CREATE: "conversation:create",
   CONVERSATION_GET: "conversation:get",
   CONVERSATION_LIST: "conversation:list",
   CONVERSATION_UPDATE: "conversation:update",
   CONVERSATION_DELETE: "conversation:delete",
   CONVERSATION_ADD_MESSAGE: "conversation:addMessage",
   CONVERSATION_SEARCH: "conversation:search",
   ```
2. conversationAPI オブジェクト設計
   ```typescript
   const conversationAPI = {
     create: (input) => safeInvoke(IPC_CHANNELS.CONVERSATION_CREATE, input),
     get: (id) => safeInvoke(IPC_CHANNELS.CONVERSATION_GET, id),
     list: (options) => safeInvoke(IPC_CHANNELS.CONVERSATION_LIST, options),
     update: (id, input) =>
       safeInvoke(IPC_CHANNELS.CONVERSATION_UPDATE, id, input),
     delete: (id) => safeInvoke(IPC_CHANNELS.CONVERSATION_DELETE, id),
     addMessage: (id, input) =>
       safeInvoke(IPC_CHANNELS.CONVERSATION_ADD_MESSAGE, id, input),
     search: (query, options) =>
       safeInvoke(IPC_CHANNELS.CONVERSATION_SEARCH, query, options),
   };
   ```
3. ホワイトリスト登録設計（ALLOWED_INVOKE_CHANNELS）
4. 型定義設計（window.conversationAPI の型）

**期待される成果物**:

- `outputs/phase-2/design-document.md`（Preload API設計セクション）

---

### タスク3: Hooks設計

**目的**: UIコンポーネントで使用するカスタムHooksを設計する。

**実行手順**:

1. useConversations Hookを設計する
   - 会話一覧取得・ページネーション
   - 検索機能
   - 新規作成・削除
   ```typescript
   interface UseConversationsReturn {
     conversations: ConversationSummary[];
     isLoading: boolean;
     error: Error | null;
     hasMore: boolean;
     loadMore: () => Promise<void>;
     search: (query: string) => Promise<void>;
     create: (input: CreateConversationInput) => Promise<Conversation>;
     delete: (id: string) => Promise<void>;
     refresh: () => Promise<void>;
   }
   ```
2. useConversation Hookを設計する
   - 単一会話詳細取得
   - タイトル更新
   ```typescript
   interface UseConversationReturn {
     conversation: Conversation | null;
     isLoading: boolean;
     error: Error | null;
     updateTitle: (title: string) => Promise<void>;
     refresh: () => Promise<void>;
   }
   ```
3. useMessages Hookを設計する
   - メッセージ追加
   - 送信状態管理
   ```typescript
   interface UseMessagesReturn {
     messages: Message[];
     isLoading: boolean;
     isSending: boolean;
     error: Error | null;
     addMessage: (content: string) => Promise<Message>;
   }
   ```

**期待される成果物**:

- `outputs/phase-2/design-document.md`（Hooks設計セクション）

---

### タスク4: 状態管理設計

**目的**: Zustand Storeまたはローカル状態の設計を行う。

**実行手順**:

1. 会話選択状態の管理方法を設計する
   - 選択中の会話ID
   - 一覧/詳細の表示状態
2. コンポーネント間の状態共有方法を設計する
   - Props経由
   - Context経由
   - Zustand Store経由
3. 既存のchatSliceとの統合方針を設計する

**期待される成果物**:

- `outputs/phase-2/design-document.md`（状態管理設計セクション）

---

### タスク5: データフロー設計

**目的**: コンポーネント間・IPC間のデータフローを設計する。

**実行手順**:

1. 会話一覧→詳細のデータフローを設計する
2. メッセージ送信→表示更新のデータフローを設計する
3. エラーハンドリングフローを設計する
4. ローディング状態管理フローを設計する

**期待される成果物**:

- `outputs/phase-2/design-document.md`（データフロー設計セクション）

---

## 参照資料

| 参照資料               | パス                                                                         | 内容                               |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| Phase 1成果物          | `outputs/phase-1/requirements-definition.md`                                 | 要件定義                           |
| UI/UXパネル仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | 履歴パネルのUI/UX仕様              |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Zustand Slice、Preload APIパターン |

---

## 成果物

| 成果物 | パス                                 | 内容                                                   |
| ------ | ------------------------------------ | ------------------------------------------------------ |
| 設計書 | `outputs/phase-2/design-document.md` | コンポーネント・API・Hooks・状態管理・データフロー設計 |

---

## 統合テスト連携

- Preload API/Renderer Store統合ポイントを設計に反映する
- IPC通信のモック方針を設計書に記載する

---

## 完了条件

- [ ] コンポーネント設計（Props定義含む）完了
- [ ] Preload API設計（7チャンネル）完了
- [ ] Hooks設計（useConversations, useConversation, useMessages）完了
- [ ] 状態管理設計完了
- [ ] データフロー設計完了
- [ ] `outputs/phase-2/design-document.md` 作成完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/conversation-history-ui-implementation/phase-3-design-review.md`

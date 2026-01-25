# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| Phase名    | 実装                                   |
| 前提Phase  | Phase 4                                |
| 後続Phase  | Phase 6                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-24                             |
| 機能名     | conversation-history-ui-implementation |

---

## 目的

TDD Green Phaseとして、Phase 4で作成したテストを通す実装を行う。

## 背景

テストファーストで作成したテストケースを通す最小限の実装を行い、機能を実現する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Preload API 実装（UI-004）

**目的**: conversationAPIを実装し、Renderer ProcessからバックエンドAPIにアクセスできるようにする。

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` にIPCチャンネルを追加する
   ```typescript
   // CONVERSATION_CHANNELS
   CONVERSATION_CREATE: "conversation:create",
   CONVERSATION_GET: "conversation:get",
   CONVERSATION_LIST: "conversation:list",
   CONVERSATION_UPDATE: "conversation:update",
   CONVERSATION_DELETE: "conversation:delete",
   CONVERSATION_ADD_MESSAGE: "conversation:addMessage",
   CONVERSATION_SEARCH: "conversation:search",
   ```
2. ALLOWED_INVOKE_CHANNELSにチャンネルを追加する
3. `apps/desktop/src/preload/index.ts` にconversationAPIを追加する
   ```typescript
   const conversationAPI = {
     create: (input: CreateConversationInput) =>
       safeInvoke(IPC_CHANNELS.CONVERSATION_CREATE, input),
     get: (id: string) => safeInvoke(IPC_CHANNELS.CONVERSATION_GET, id),
     list: (options?: ListConversationsOptions) =>
       safeInvoke(IPC_CHANNELS.CONVERSATION_LIST, options),
     update: (id: string, input: UpdateConversationInput) =>
       safeInvoke(IPC_CHANNELS.CONVERSATION_UPDATE, id, input),
     delete: (id: string) => safeInvoke(IPC_CHANNELS.CONVERSATION_DELETE, id),
     addMessage: (conversationId: string, input: AddMessageInput) =>
       safeInvoke(IPC_CHANNELS.CONVERSATION_ADD_MESSAGE, conversationId, input),
     search: (query: string, options?: ListConversationsOptions) =>
       safeInvoke(IPC_CHANNELS.CONVERSATION_SEARCH, query, options),
   };
   contextBridge.exposeInMainWorld("conversationAPI", conversationAPI);
   ```
4. 型定義を追加する（window.conversationAPI）
5. テストを実行して成功を確認する

**期待される成果物**:

- `apps/desktop/src/preload/channels.ts`（更新）
- `apps/desktop/src/preload/index.ts`（更新）
- `apps/desktop/src/preload/types.ts`（更新）

---

### タスク2: Hooks 実装

**目的**: UIコンポーネントで使用するカスタムHooksを実装する。

**実行手順**:

1. `apps/desktop/src/renderer/hooks/useConversations.ts` を実装する
   - conversationAPI.list()を呼び出して一覧取得
   - ページネーション状態管理
   - 検索機能実装
   - 作成・削除機能実装
   - エラーハンドリング実装
2. `apps/desktop/src/renderer/hooks/useConversation.ts` を実装する
   - conversationAPI.get()を呼び出して詳細取得
   - タイトル更新機能実装
   - エラーハンドリング実装
3. `apps/desktop/src/renderer/hooks/useMessages.ts` を実装する
   - conversationAPI.addMessage()を呼び出してメッセージ追加
   - 送信状態管理
   - エラーハンドリング実装
4. テストを実行して成功を確認する

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/useConversations.ts`
- `apps/desktop/src/renderer/hooks/useConversation.ts`
- `apps/desktop/src/renderer/hooks/useMessages.ts`

---

### タスク3: 会話一覧コンポーネント 実装（UI-001）

**目的**: 会話一覧関連のUIコンポーネントを実装する。

**実行手順**:

1. `apps/desktop/src/renderer/components/conversation/ConversationListPanel.tsx` を実装する
   - useConversationsを使用して一覧取得
   - ローディング・エラー・空状態の表示
   - ページネーション機能
2. `apps/desktop/src/renderer/components/conversation/ConversationListItem.tsx` を実装する
   - 会話タイトル・プレビュー表示
   - 選択状態のスタイル
   - 削除ボタン
3. `apps/desktop/src/renderer/components/conversation/ConversationSearch.tsx` を実装する
   - 検索入力フィールド
   - デバウンス処理
4. `apps/desktop/src/renderer/components/conversation/NewConversationButton.tsx` を実装する
   - 新規作成ボタン
   - ローディング状態
5. テストを実行して成功を確認する

**期待される成果物**:

- `apps/desktop/src/renderer/components/conversation/ConversationListPanel.tsx`
- `apps/desktop/src/renderer/components/conversation/ConversationListItem.tsx`
- `apps/desktop/src/renderer/components/conversation/ConversationSearch.tsx`
- `apps/desktop/src/renderer/components/conversation/NewConversationButton.tsx`
- `apps/desktop/src/renderer/components/conversation/index.ts`

---

### タスク4: 会話詳細コンポーネント 実装（UI-002）

**目的**: 会話詳細関連のUIコンポーネントを実装する。

**実行手順**:

1. `apps/desktop/src/renderer/components/conversation/ConversationDetailView.tsx` を実装する
   - useConversationを使用して詳細取得
   - ローディング・エラー状態の表示
   - ヘッダー・メッセージリスト・入力の配置
2. `apps/desktop/src/renderer/components/conversation/ConversationHeader.tsx` を実装する
   - タイトル表示
   - タイトル編集機能（インライン編集）
3. `apps/desktop/src/renderer/components/conversation/MessageList.tsx` を実装する
   - メッセージ一覧表示
   - 自動スクロール（新規メッセージ時）
4. `apps/desktop/src/renderer/components/conversation/MessageBubble.tsx` を実装する
   - user/assistantの視覚的区別（左右配置・色分け）
   - メッセージ内容表示
   - タイムスタンプ表示
5. テストを実行して成功を確認する

**期待される成果物**:

- `apps/desktop/src/renderer/components/conversation/ConversationDetailView.tsx`
- `apps/desktop/src/renderer/components/conversation/ConversationHeader.tsx`
- `apps/desktop/src/renderer/components/conversation/MessageList.tsx`
- `apps/desktop/src/renderer/components/conversation/MessageBubble.tsx`

---

### タスク5: メッセージ入力コンポーネント 実装（UI-003）

**目的**: メッセージ入力関連のUIコンポーネントを実装する。

**実行手順**:

1. `apps/desktop/src/renderer/components/conversation/MessageInput.tsx` を実装する
   - useMessagesを使用してメッセージ送信
   - 可変高さテキストエリア
   - Enter送信（Shift+Enter改行）
   - 送信ボタン
   - 送信中ローディング表示
   - 無効状態（空テキスト時）
2. アクセシビリティ対応
   - aria-label設定
   - キーボードナビゲーション
3. テストを実行して成功を確認する

**期待される成果物**:

- `apps/desktop/src/renderer/components/conversation/MessageInput.tsx`

---

### タスク6: Green Phase確認

**目的**: 全テストが成功することを確認する（TDD Green Phase）。

**実行手順**:

1. テスト実行コマンドを実行する
   ```bash
   pnpm --filter @repo/desktop test apps/desktop/src/renderer/components/conversation
   pnpm --filter @repo/desktop test apps/desktop/src/renderer/hooks
   pnpm --filter @repo/desktop test apps/desktop/src/preload/__tests__/conversationAPI
   ```
2. 全テストが成功することを確認する
3. 型チェックを実行する
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
4. Lintを実行する
   ```bash
   pnpm --filter @repo/desktop lint
   ```

**期待される成果物**:

- テスト実行結果ログ（全PASS）

---

## 参照資料

| 参照資料               | パス                                                                         | 内容                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| Phase 2成果物          | `outputs/phase-2/design-document.md`                                         | 設計書                 |
| Phase 4成果物          | `apps/desktop/src/renderer/components/conversation/__tests__/*.test.tsx`     | テストファイル         |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Preload APIパターン    |
| 型定義                 | `apps/desktop/src/shared/types/conversation.ts`                              | 会話・メッセージ型定義 |

---

## 成果物

| 成果物         | パス                                                 | 内容             |
| -------------- | ---------------------------------------------------- | ---------------- |
| Preload API    | `apps/desktop/src/preload/`                          | API接続実装      |
| Hooks          | `apps/desktop/src/renderer/hooks/`                   | カスタムHooks    |
| コンポーネント | `apps/desktop/src/renderer/components/conversation/` | UIコンポーネント |

---

## 統合テスト連携

- Preload API/UI接続の実装
- テスト支援コード（モック）の整備

---

## 完了条件

- [ ] Preload API 実装完了（7チャンネル）
- [ ] Hooks 実装完了（3つ）
- [ ] 会話一覧コンポーネント 実装完了（4コンポーネント）
- [ ] 会話詳細コンポーネント 実装完了（4コンポーネント）
- [ ] メッセージ入力コンポーネント 実装完了
- [ ] 全テストがGreen状態（成功）
- [ ] 型チェックエラーゼロ
- [ ] Lintエラーゼロ

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/conversation-history-ui-implementation/phase-6-test-expansion.md`

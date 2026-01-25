# 会話履歴UI実装 - タスク指示書

## メタ情報

```yaml
issue_number: 485
```

## メタ情報

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| タスクID     | UI-CONV-HISTORY-001                    |
| タスク名     | conversation-history-ui-implementation |
| 分類         | 改善（UI実装）                         |
| 対象機能     | 会話履歴表示・管理UI                   |
| 優先度       | 高                                     |
| 見積もり規模 | 中規模                                 |
| ステータス   | 完了                                   |
| 完了日       | 2026-01-25                             |
| 発見元       | Phase 11（手動テスト）                 |
| 発見日       | 2026-01-24                             |
| 依存タスク   | UT-LLM-HISTORY-001（完了）             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-LLM-HISTORY-001で会話履歴永続化のバックエンド（ConversationRepository + IPC Handlers）が完成した。しかし、UIコンポーネントが未実装のため、ユーザーは会話履歴機能を利用できない状態にある。

### 1.2 問題点・課題

| 課題                   | 説明                                              |
| ---------------------- | ------------------------------------------------- |
| 会話一覧が表示されない | 過去の会話をリストで確認する手段がない            |
| 会話詳細が表示されない | 特定の会話のメッセージ履歴を閲覧する手段がない    |
| メッセージ送信UIがない | 会話にメッセージを追加するUIがない                |
| Preload API未接続      | Renderer ProcessからバックエンドAPIにアクセス不可 |

### 1.3 放置した場合の影響

- バックエンド実装が活用されない
- ユーザー体験の大幅な欠落
- 会話履歴機能としての価値がゼロ

---

## 2. 何を達成するか（What）

### 2.1 目的

バックエンドAPIを活用したUIコンポーネントを実装し、ユーザーが会話履歴を閲覧・管理・操作できるようにする。

### 2.2 最終ゴール

- 会話一覧表示（ページネーション・検索対応）
- 会話詳細表示（メッセージ一覧）
- 新規会話作成・削除
- メッセージ追加（LLM連携対応）
- Preload API経由でのバックエンドアクセス

### 2.3 スコープ

#### 含むもの

| サブタスク | 説明                               |
| ---------- | ---------------------------------- |
| UI-001     | 会話一覧UIコンポーネント           |
| UI-002     | 会話詳細UIコンポーネント           |
| UI-003     | メッセージ入力UIコンポーネント     |
| UI-004     | Preload API接続（conversationAPI） |

#### 含まないもの

- バックエンドロジックの変更（完了済み）
- データベーススキーマの変更
- E2Eテスト（別タスクとして管理）

### 2.4 成果物

| 成果物                 | パス                                                 |
| ---------------------- | ---------------------------------------------------- |
| ConversationListPanel  | `apps/desktop/src/renderer/components/conversation/` |
| ConversationDetailView | `apps/desktop/src/renderer/components/conversation/` |
| MessageInput           | `apps/desktop/src/renderer/components/conversation/` |
| conversationAPI        | `apps/desktop/src/preload/index.ts`（拡張）          |
| useConversation hooks  | `apps/desktop/src/renderer/hooks/`                   |
| ユニットテスト         | `apps/desktop/src/renderer/__tests__/`               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [x] UT-LLM-HISTORY-001完了（バックエンド実装）
- [x] ConversationRepository + IPC Handlers動作確認済み
- [x] 共有型定義（Conversation, Message等）利用可能

### 3.2 依存タスク

| タスクID           | 状態 | 説明               |
| ------------------ | ---- | ------------------ |
| UT-LLM-HISTORY-001 | 完了 | バックエンド永続化 |

### 3.3 必要な知識

- React + TypeScript
- Zustand状態管理
- Electron Preload API（contextBridge）
- Tailwind CSS

### 3.4 推奨アプローチ

1. **Preload API接続**（UI-004）を先に実装
2. **Hooks実装**: useConversations, useConversation, useMessages
3. **UIコンポーネント実装**: ListPanel → DetailView → MessageInput
4. **Zustand Store統合**: chatSliceにconversation状態追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 説明                             |
| ----- | ---------------- | -------------------------------- |
| 1     | 要件定義         | UI要件・デザイン仕様策定         |
| 2     | 設計             | コンポーネント設計・状態管理設計 |
| 3     | 設計レビュー     | レビューゲート                   |
| 4     | テスト作成       | TDD Red Phase                    |
| 5     | 実装             | TDD Green Phase                  |
| 6     | テスト拡充       | カバレッジ向上                   |
| 7     | カバレッジ確認   | 80%+確認                         |
| 8     | リファクタリング | TDD Refactor Phase               |
| 9     | 品質保証         | 最終品質チェック                 |
| 10    | 最終レビュー     | レビューゲート                   |
| 11    | 手動テスト       | UIテスト                         |
| 12    | ドキュメント     | 実装ガイド・仕様更新             |
| 13    | PR作成           | マージ準備                       |

### Phase 4-5: Preload API接続（UI-004）

#### 目的

Renderer ProcessからConversation IPCチャンネルにアクセスするためのAPIを追加。

#### 手順

1. `apps/desktop/src/preload/channels.ts`に会話チャンネル追加

   ```typescript
   CONVERSATION_CREATE: "conversation:create",
   CONVERSATION_GET: "conversation:get",
   CONVERSATION_LIST: "conversation:list",
   CONVERSATION_UPDATE: "conversation:update",
   CONVERSATION_DELETE: "conversation:delete",
   CONVERSATION_ADD_MESSAGE: "conversation:addMessage",
   CONVERSATION_SEARCH: "conversation:search",
   ```

2. `apps/desktop/src/preload/index.ts`にconversationAPI追加

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
   contextBridge.exposeInMainWorld("conversationAPI", conversationAPI);
   ```

3. ホワイトリストにチャンネル追加
4. 型定義ファイル更新

#### 完了条件

- [ ] 7つのIPCチャンネルがホワイトリストに追加されている
- [ ] conversationAPIがwindowオブジェクトに公開されている
- [ ] TypeScript型定義が正しい
- [ ] テスト10件以上作成

### Phase 4-5: 会話一覧UI（UI-001）

#### 目的

会話一覧を表示し、選択・作成・削除を可能にする。

#### コンポーネント構成

| コンポーネント        | 責務                     |
| --------------------- | ------------------------ |
| ConversationListPanel | 一覧パネル（サイドバー） |
| ConversationListItem  | 個別会話アイテム         |
| ConversationSearch    | 検索入力                 |
| NewConversationButton | 新規作成ボタン           |

#### 完了条件

- [ ] 会話一覧が表示される
- [ ] ページネーション動作
- [ ] 検索フィルタ動作
- [ ] 新規作成ボタン動作
- [ ] 削除動作（確認ダイアログ付き）
- [ ] テスト20件以上作成

### Phase 4-5: 会話詳細UI（UI-002）

#### 目的

選択された会話のメッセージ履歴を表示する。

#### コンポーネント構成

| コンポーネント         | 責務                             |
| ---------------------- | -------------------------------- |
| ConversationDetailView | 詳細ビュー全体                   |
| ConversationHeader     | 会話タイトル・操作ボタン         |
| MessageList            | メッセージ一覧                   |
| MessageBubble          | 個別メッセージ（user/assistant） |

#### 完了条件

- [ ] メッセージ一覧が表示される
- [ ] user/assistantの視覚的区別
- [ ] スクロール動作（下部自動スクロール）
- [ ] タイトル編集動作
- [ ] テスト20件以上作成

### Phase 4-5: メッセージ入力UI（UI-003）

#### 目的

ユーザーがメッセージを入力・送信できるようにする。

#### コンポーネント構成

| コンポーネント | 責務                 |
| -------------- | -------------------- |
| MessageInput   | 入力フォーム全体     |
| TextArea       | 可変高さテキスト入力 |
| SendButton     | 送信ボタン           |

#### 完了条件

- [ ] テキスト入力可能
- [ ] Enter送信（Shift+Enterで改行）
- [ ] 送信ボタン動作
- [ ] 送信中ローディング表示
- [ ] テスト15件以上作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 会話一覧表示（ページネーション対応）
- [ ] 会話検索動作
- [ ] 会話選択→詳細表示連携
- [ ] 新規会話作成
- [ ] 会話削除（確認付き）
- [ ] メッセージ一覧表示
- [ ] メッセージ送信
- [ ] タイトル編集

### 品質要件

- [ ] テストカバレッジ80%以上
- [ ] TypeScript型エラーゼロ
- [ ] ESLintエラーゼロ
- [ ] アクセシビリティ基本対応（キーボード操作）

### ドキュメント要件

- [ ] 実装ガイド作成
- [ ] システム仕様書更新（ui-ux-history-panel.md）
- [ ] コンポーネントProps定義

---

## 6. 検証方法

### テストケース

| カテゴリ    | テスト内容                     | 件数 |
| ----------- | ------------------------------ | ---- |
| Preload API | チャンネル登録・safeInvoke動作 | 10+  |
| 一覧UI      | 表示・ページネーション・検索   | 20+  |
| 詳細UI      | メッセージ表示・スクロール     | 20+  |
| 入力UI      | 入力・送信・ローディング       | 15+  |

### 検証手順

1. `pnpm --filter @repo/desktop test` 全件PASS確認
2. `pnpm --filter @repo/desktop vitest run --coverage` カバレッジ確認
3. 手動テスト（UI操作確認）

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                                   |
| ------------------ | ------ | -------- | -------------------------------------- |
| 状態管理複雑化     | 中     | 中       | conversationSlice分離・テスト重視      |
| パフォーマンス低下 | 中     | 低       | 仮想スクロール検討（大量メッセージ時） |
| IPC通信エラー      | 中     | 低       | エラーハンドリング・リトライ実装       |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）【必須参照】

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                           | 内容                                   |
| ---------------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| UI/UXパネル仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`     | 履歴パネルのUI/UX仕様                  |
| 会話履歴永続化パターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | ConversationRepository/IPC設計パターン |
| LLMインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`          | Conversation/Message型定義、IPC契約    |
| チャット履歴仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | ChatSession/ChatMessage型定義          |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | Electronアプリ全体構成                 |

### 関連ドキュメント

| ドキュメント     | パス                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| バックエンド実装 | `docs/30-workflows/llm-conversation-history-persistence/outputs/phase-12/implementation-guide.md` |
| 型定義           | `apps/desktop/src/shared/types/conversation.ts`                                                   |
| Repository       | `apps/desktop/src/main/repositories/conversationRepository.ts`                                    |
| IPC Handlers     | `apps/desktop/src/main/ipc/conversationHandlers.ts`                                               |

### 参考資料

- Zustand Sliceパターン: `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`
- Preload APIパターン: Claude CLI Renderer API参照
- chatEditSliceパターン: `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`

---

## 9. 備考

### Phase 11 発見課題の原文

```
| 識別子 | 内容                           | 優先度 | 対応要否 |
| ------ | ------------------------------ | ------ | -------- |
| UI-001 | 会話一覧UIコンポーネント       | 高     | 別タスク |
| UI-002 | 会話詳細UIコンポーネント       | 高     | 別タスク |
| UI-003 | メッセージ入力UIコンポーネント | 高     | 別タスク |
| UI-004 | Preload API接続                | 高     | 別タスク |
```

### 補足事項

- 本タスクは4つのサブタスク（UI-001〜UI-004）を統合したもの
- バックエンド（UT-LLM-HISTORY-001）は完了済みのため、UI実装に専念可能
- LLM連携（メッセージ送信→AI応答）は既存のaiHandlers.tsを活用

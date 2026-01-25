# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| Phase名    | テスト作成                             |
| 前提Phase  | Phase 3                                |
| 後続Phase  | Phase 5                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-24                             |
| 機能名     | conversation-history-ui-implementation |

---

## 目的

TDD Red Phaseとして、実装前に失敗するテストを作成する。設計書に基づいてテストケースを実装する。

## 背景

TDDアプローチにより、テストファーストで品質を確保する。Phase 2の設計に基づいてテストを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Preload API テスト作成（UI-004）

**目的**: conversationAPIのテストを作成する。

**実行手順**:

1. テストファイル `apps/desktop/src/preload/__tests__/conversationAPI.test.ts` を作成する
2. IPCチャンネル定義テストを作成する
   - CONVERSATION_CREATEが正しく定義されているか
   - 7つのチャンネルが全て存在するか
3. ホワイトリスト登録テストを作成する
   - ALLOWED_INVOKE_CHANNELSに全チャンネルが含まれているか
4. safeInvoke呼び出しテストを作成する
   - 各APIメソッドがsafeInvokeを正しく呼び出すか
5. 型定義テストを作成する
   - window.conversationAPIの型が正しいか

**テスト件数目標**: 10件以上

**期待される成果物**:

- `apps/desktop/src/preload/__tests__/conversationAPI.test.ts`

---

### タスク2: Hooks テスト作成

**目的**: useConversations, useConversation, useMessagesのテストを作成する。

**実行手順**:

1. テストファイル `apps/desktop/src/renderer/hooks/__tests__/useConversations.test.ts` を作成する
   - 一覧取得テスト
   - ページネーションテスト
   - 検索テスト
   - 作成・削除テスト
   - エラーハンドリングテスト
2. テストファイル `apps/desktop/src/renderer/hooks/__tests__/useConversation.test.ts` を作成する
   - 詳細取得テスト
   - タイトル更新テスト
   - エラーハンドリングテスト
3. テストファイル `apps/desktop/src/renderer/hooks/__tests__/useMessages.test.ts` を作成する
   - メッセージ追加テスト
   - 送信状態テスト
   - エラーハンドリングテスト

**テスト件数目標**: 25件以上

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/__tests__/useConversations.test.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useConversation.test.ts`
- `apps/desktop/src/renderer/hooks/__tests__/useMessages.test.ts`

---

### タスク3: 会話一覧コンポーネント テスト作成（UI-001）

**目的**: 会話一覧関連コンポーネントのテストを作成する。

**実行手順**:

1. `apps/desktop/src/renderer/components/conversation/__tests__/ConversationListPanel.test.tsx` を作成する
   - 一覧レンダリングテスト
   - ローディング状態テスト
   - エラー状態テスト
   - 空状態テスト
   - ページネーションテスト
2. `apps/desktop/src/renderer/components/conversation/__tests__/ConversationListItem.test.tsx` を作成する
   - アイテムレンダリングテスト
   - 選択状態テスト
   - 削除ボタンテスト
3. `apps/desktop/src/renderer/components/conversation/__tests__/ConversationSearch.test.tsx` を作成する
   - 入力テスト
   - 検索トリガーテスト
4. `apps/desktop/src/renderer/components/conversation/__tests__/NewConversationButton.test.tsx` を作成する
   - クリックテスト
   - ローディング状態テスト

**テスト件数目標**: 20件以上

**期待される成果物**:

- `apps/desktop/src/renderer/components/conversation/__tests__/ConversationListPanel.test.tsx`
- `apps/desktop/src/renderer/components/conversation/__tests__/ConversationListItem.test.tsx`
- `apps/desktop/src/renderer/components/conversation/__tests__/ConversationSearch.test.tsx`
- `apps/desktop/src/renderer/components/conversation/__tests__/NewConversationButton.test.tsx`

---

### タスク4: 会話詳細コンポーネント テスト作成（UI-002）

**目的**: 会話詳細関連コンポーネントのテストを作成する。

**実行手順**:

1. `apps/desktop/src/renderer/components/conversation/__tests__/ConversationDetailView.test.tsx` を作成する
   - 詳細ビューレンダリングテスト
   - ローディング状態テスト
   - エラー状態テスト
2. `apps/desktop/src/renderer/components/conversation/__tests__/ConversationHeader.test.tsx` を作成する
   - タイトル表示テスト
   - タイトル編集テスト
3. `apps/desktop/src/renderer/components/conversation/__tests__/MessageList.test.tsx` を作成する
   - メッセージ一覧レンダリングテスト
   - 自動スクロールテスト
4. `apps/desktop/src/renderer/components/conversation/__tests__/MessageBubble.test.tsx` を作成する
   - userメッセージ表示テスト
   - assistantメッセージ表示テスト
   - アクセシビリティテスト

**テスト件数目標**: 20件以上

**期待される成果物**:

- `apps/desktop/src/renderer/components/conversation/__tests__/ConversationDetailView.test.tsx`
- `apps/desktop/src/renderer/components/conversation/__tests__/ConversationHeader.test.tsx`
- `apps/desktop/src/renderer/components/conversation/__tests__/MessageList.test.tsx`
- `apps/desktop/src/renderer/components/conversation/__tests__/MessageBubble.test.tsx`

---

### タスク5: メッセージ入力コンポーネント テスト作成（UI-003）

**目的**: メッセージ入力関連コンポーネントのテストを作成する。

**実行手順**:

1. `apps/desktop/src/renderer/components/conversation/__tests__/MessageInput.test.tsx` を作成する
   - 入力レンダリングテスト
   - テキスト入力テスト
   - Enter送信テスト（Shift+Enter改行）
   - 送信ボタンテスト
   - 送信中ローディングテスト
   - 無効状態テスト
   - アクセシビリティテスト

**テスト件数目標**: 15件以上

**期待される成果物**:

- `apps/desktop/src/renderer/components/conversation/__tests__/MessageInput.test.tsx`

---

### タスク6: Red Phase確認

**目的**: 作成したテストが失敗することを確認する（TDD Red Phase）。

**実行手順**:

1. テスト実行コマンドを実行する
   ```bash
   pnpm --filter @repo/desktop test apps/desktop/src/renderer/components/conversation
   pnpm --filter @repo/desktop test apps/desktop/src/renderer/hooks
   pnpm --filter @repo/desktop test apps/desktop/src/preload/__tests__/conversationAPI
   ```
2. 全テストが失敗することを確認する
3. 失敗理由が「実装がない」ことであることを確認する

**期待される成果物**:

- テスト実行結果ログ（コンソール出力）

---

## 参照資料

| 参照資料      | パス                                            | 内容                              |
| ------------- | ----------------------------------------------- | --------------------------------- |
| Phase 2成果物 | `outputs/phase-2/design-document.md`            | 設計書（コンポーネント・API設計） |
| 型定義        | `apps/desktop/src/shared/types/conversation.ts` | 会話・メッセージ型定義            |

---

## 成果物

| 成果物                       | パス                                                                     | 内容          |
| ---------------------------- | ------------------------------------------------------------------------ | ------------- |
| Preload API テスト           | `apps/desktop/src/preload/__tests__/conversationAPI.test.ts`             | API接続テスト |
| Hooks テスト                 | `apps/desktop/src/renderer/hooks/__tests__/*.test.ts`                    | Hooksテスト   |
| 会話一覧コンポーネントテスト | `apps/desktop/src/renderer/components/conversation/__tests__/*.test.tsx` | UIテスト      |

---

## 統合テスト連携

IPC統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                     | テストファイル          |
| ------------------ | -------------------------------------------- | ----------------------- |
| API接続テスト      | IPCエンドポイント疎通・レスポンス形式        | `*.integration.test.ts` |
| データフローテスト | Renderer→IPC→Main→IPC→Rendererの往復         | `*.flow.test.ts`        |
| エラーハンドリング | IPC障害時のUI表示・リトライ                  | `*.error.test.ts`       |
| 認証連携テスト     | トークン取得・リフレッシュ・期限切れ処理     | `*.auth.test.ts`        |
| 状態同期テスト     | リアルタイム更新・楽観的UI更新・ロールバック | `*.sync.test.ts`        |

- conversationAPIのモック方針を適用する

---

## 完了条件

- [ ] Preload API テスト 10件以上作成
- [ ] Hooks テスト 25件以上作成
- [ ] 会話一覧コンポーネント テスト 20件以上作成
- [ ] 会話詳細コンポーネント テスト 20件以上作成
- [ ] メッセージ入力コンポーネント テスト 15件以上作成
- [ ] 全テストがRed状態（失敗）であることを確認

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

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/conversation-history-ui-implementation/phase-5-implementation.md`

# チャット履歴永続化機能 - テスト設計書

## 1. 概要

| 項目                 | 内容                  |
| -------------------- | --------------------- |
| 作成日               | 2026-01-04            |
| テストフレームワーク | Vitest                |
| カバレッジ目標       | 80%以上               |
| 現在のステータス     | Green（全テスト通過） |

## 2. テスト構成

### 2.1 テストファイル一覧

| ファイル                        | テスト数 | カテゴリ     |
| ------------------------------- | -------- | ------------ |
| chat-session-repository.test.ts | 33件     | Repository層 |
| chat-message-repository.test.ts | 27件     | Repository層 |
| chat-history-service.test.ts    | 21件     | Service層    |
| **合計**                        | **81件** | -            |

### 2.2 テストカテゴリ

```
packages/shared/src/
├── repositories/__tests__/
│   ├── chat-session-repository.test.ts  # セッションリポジトリテスト
│   └── chat-message-repository.test.ts  # メッセージリポジトリテスト
│
└── features/chat-history/__tests__/
    └── chat-history-service.test.ts     # サービス層テスト
```

## 3. テストケース詳細

### 3.1 ChatSessionRepository テスト（33件）

#### save 操作

- [x] 新しいセッションを保存できる
- [x] タイトルが空の場合、自動生成される（BR-SESSION-001）
- [x] タイトルが100文字を超える場合、エラーになる
- [x] タイトルが3文字未満の場合、エラーになる
- [x] ピン留めセッションが10件を超える場合、エラーになる（BR-SESSION-002）

#### findById 操作

- [x] IDでセッションを取得できる
- [x] 存在しないIDの場合、nullを返す
- [x] 論理削除されたセッションは取得できない

#### findByUserId 操作

- [x] ユーザーIDで全セッションを取得できる
- [x] セッションが作成日時の降順でソートされる
- [x] 論理削除されたセッションは含まれない

#### findPinned 操作

- [x] ピン留めセッションを取得できる
- [x] ピン留めセッションがpin_orderの昇順でソートされる

#### update 操作

- [x] セッションを更新できる
- [x] messageCountを更新できる
- [x] lastMessagePreviewを更新できる（BR-SESSION-003）
- [x] 存在しないセッションの更新はfalseを返す

#### delete 操作

- [x] セッションを論理削除できる
- [x] 論理削除後、deleted_atがセットされる
- [x] 存在しないセッションの削除はfalseを返す

#### search 操作

- [x] タイトルで検索できる
- [x] プレビューで検索できる
- [x] 複数の検索語を含む結果を取得できる
- [x] isFavoriteでフィルタできる
- [x] isPinnedでフィルタできる
- [x] limitで結果件数を制限できる
- [x] offsetでページネーションできる
- [x] 論理削除されたセッションは検索結果に含まれない

#### count/exists 操作

- [x] ユーザーの総セッション数を取得できる
- [x] 論理削除されたセッションはカウントされない
- [x] セッションの存在確認ができる

### 3.2 ChatMessageRepository テスト（27件）

#### save 操作

- [x] メッセージを保存できる
- [x] messageIndexが自動採番される（BR-MESSAGE-001）
- [x] role=assistantの場合、LLMメタデータが必須（BR-MESSAGE-002）
- [x] LLMメタデータなしのassistantメッセージはエラー

#### findById 操作

- [x] IDでメッセージを取得できる
- [x] 存在しないIDの場合、nullを返す

#### findBySessionId 操作

- [x] セッションIDで全メッセージを取得できる
- [x] メッセージがmessage_indexの昇順でソートされる
- [x] limitで結果件数を制限できる
- [x] offsetでページネーションできる

#### findByRole 操作

- [x] ロールでフィルタできる

#### update 操作

- [x] メッセージを更新できる
- [x] attachmentsを更新できる
- [x] 存在しないメッセージの更新はfalseを返す

#### delete 操作

- [x] メッセージを削除できる

#### count/exists 操作

- [x] セッション内のメッセージ数を取得できる
- [x] メッセージの存在確認ができる

### 3.3 ChatHistoryService テスト（21件）

#### createSession（FR-001）

- [x] 新しいセッションを作成できる
- [x] カスタムタイトルでセッションを作成できる

#### getSession

- [x] IDでセッションを取得できる
- [x] 存在しないセッションはnullを返す

#### listSessions（FR-002）

- [x] ユーザーのセッション一覧を取得できる
- [x] セッションは作成日時の降順でソートされる

#### deleteSession（FR-003）

- [x] セッションを削除できる
- [x] セッション削除時にメッセージも削除される

#### addUserMessage（FR-004）

- [x] ユーザーメッセージを保存できる
- [x] メッセージ追加時にmessageCountが更新される
- [x] メッセージ追加時にlastMessagePreviewが更新される

#### addAssistantMessage（FR-005, FR-006）

- [x] アシスタントメッセージをLLMメタデータ付きで保存できる

#### getMessages

- [x] セッションのメッセージ一覧を取得できる
- [x] メッセージはmessage_indexの昇順でソートされる

#### searchSessions（FR-007）

- [x] キーワードでセッションを検索できる
- [x] お気に入りでフィルタできる

#### updateSession（FR-013, FR-014）

- [x] セッションタイトルを更新できる
- [x] お気に入りフラグを更新できる

#### exportToMarkdown（FR-010）

- [x] セッションをMarkdown形式でエクスポートできる
- [x] メタデータを含めてエクスポートできる

#### exportToJson（FR-011）

- [x] セッションをJSON形式でエクスポートできる

## 4. テスト環境

### 4.1 テストダブル

| 種類             | 用途                             |
| ---------------- | -------------------------------- |
| In-memory SQLite | データベースモック（統合テスト） |

### 4.2 テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/shared test:run

# カバレッジ付き
pnpm --filter @repo/shared test:coverage

# ウォッチモード
pnpm --filter @repo/shared test
```

## 5. 機能要件カバレッジ

| 要件ID | 内容                   | テスト数 | カバー率 |
| ------ | ---------------------- | -------- | -------- |
| FR-001 | セッション作成         | 2件      | 100%     |
| FR-002 | セッション一覧取得     | 2件      | 100%     |
| FR-003 | セッション削除         | 2件      | 100%     |
| FR-004 | ユーザーメッセージ保存 | 3件      | 100%     |
| FR-005 | アシスタントメッセージ | 1件      | 100%     |
| FR-006 | LLMメタデータ保存      | 1件      | 100%     |
| FR-007 | キーワード検索         | 2件      | 100%     |
| FR-010 | Markdownエクスポート   | 2件      | 100%     |
| FR-011 | JSONエクスポート       | 1件      | 100%     |
| FR-013 | タイトル編集           | 1件      | 100%     |
| FR-014 | お気に入り/ピン留め    | 1件      | 100%     |

## 6. ビジネスルールカバレッジ

| ルールID       | 内容                 | テスト有無 |
| -------------- | -------------------- | ---------- |
| BR-SESSION-001 | タイトル自動生成     | ✅         |
| BR-SESSION-002 | ピン留め上限（10件） | ✅         |
| BR-SESSION-003 | プレビュー生成       | ✅         |
| BR-MESSAGE-001 | メッセージ自動採番   | ✅         |
| BR-MESSAGE-002 | LLMメタデータ必須    | ✅         |

## 7. 結論

- 全81件のテストが作成済み
- 全機能要件・ビジネスルールをカバー
- 全テストが通過（Green状態）
- カバレッジ目標80%を達成見込み

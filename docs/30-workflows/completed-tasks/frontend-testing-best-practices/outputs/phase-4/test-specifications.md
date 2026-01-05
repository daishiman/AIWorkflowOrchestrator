# テスト仕様書 - フロントエンドテストベストプラクティス

## 実装日

2026-01-04

---

## MSW テスト仕様

### handlers.ts

| テストケース          | 入力                 | 期待結果             |
| --------------------- | -------------------- | -------------------- |
| Supabase認証成功      | 有効なEmail/Password | mockSessionを返却    |
| Supabase認証失敗      | invalid@example.com  | 400エラー            |
| サインアップ成功      | 新規Email            | ユーザー作成         |
| サインアップ重複      | existing@example.com | 400エラー            |
| サインアウト          | -                    | 204 No Content       |
| Anthropic API成功     | 有効なAPI Key        | メッセージレスポンス |
| Anthropic API認証失敗 | invalid-key          | 401エラー            |
| ストリーミング        | stream: true         | SSEイベント          |

---

## テストユーティリティ仕様

### utils.tsx

| 関数                   | パラメータ            | 戻り値       |
| ---------------------- | --------------------- | ------------ |
| renderWithRouter       | ReactElement          | RenderResult |
| renderWithMemoryRouter | ReactElement, options | RenderResult |
| renderWithProviders    | ReactElement          | RenderResult |

### test-helpers.ts

| 関数           | パラメータ          | 戻り値  |
| -------------- | ------------------- | ------- |
| mockStore      | store, mockState    | resetFn |
| resetStore     | store, initialState | void    |
| wait           | ms                  | Promise |
| createMockIpc  | responses           | ipcFn   |
| createErrorIpc | channel, error      | ipcFn   |

### factories.ts

| 関数                              | パラメータ       | 戻り値        |
| --------------------------------- | ---------------- | ------------- |
| createMockChatSession             | overrides        | ChatSession   |
| createMockChatMessage             | overrides        | ChatMessage   |
| createMockChatSessions            | count, overrides | ChatSession[] |
| createMockChatMessages            | count, overrides | ChatMessage[] |
| createMockChatSessionWithMessages | messageCount     | ChatSession   |
| resetFactories                    | -                | void          |

---

## E2Eテスト仕様

### 既存テスト（7本）

1. auth.spec.ts - 認証フロー
2. chat-history-export.spec.ts - チャット履歴エクスポート
3. chat-history-navigation.spec.ts - チャット履歴ナビゲーション
4. file-selection.spec.ts - ファイル選択
5. system-prompt.spec.ts - システムプロンプト
6. workspace.spec.ts - ワークスペース操作

### 新規テスト予定（3本）

7. settings.spec.ts - 設定操作
8. text-converter.spec.ts - テキスト変換
9. error-handling.spec.ts - エラー処理

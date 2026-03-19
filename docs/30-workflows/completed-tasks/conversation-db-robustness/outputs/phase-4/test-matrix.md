# Phase 4: テスト設計

## テストケース一覧（15件）

| ID     | テストケース                                                 | 結果 |
| ------ | ------------------------------------------------------------ | ---- |
| T-01-1 | initialize() で DB ファイルが自動作成される                  | PASS |
| T-01-2 | initialize() で WAL モードが設定される                       | PASS |
| T-01-3 | initialize() で foreign_keys が有効化される                  | PASS |
| T-01-4 | initialize() で busy_timeout が設定される                    | PASS |
| T-01-5 | getConversationDatabase() で初期化済み DB インスタンスを返す | PASS |
| T-01-6 | isConversationDatabaseInitialized() が true を返す           | PASS |
| T-02-1 | ディレクトリ作成失敗時にエラーを投げる                       | PASS |
| T-02-2 | DB ファイル作成失敗時にエラーを投げる                        | PASS |
| T-02-3 | 未初期化で getConversationDatabase() を呼ぶとエラー          | PASS |
| T-02-4 | 二重初期化は既存インスタンスを返す                           | PASS |
| T-02-5 | DBパスがスペースのみの場合はエラー（P42準拠）                | PASS |
| T-03-1 | closeConversationDatabase() で DB が安全にクローズされる     | PASS |
| T-03-2 | close() 後に isConversationDatabaseInitialized() が false    | PASS |
| T-03-3 | close() 後に getConversationDatabase() がエラー              | PASS |
| T-03-4 | \_resetForTesting() で内部状態がリセットされる               | PASS |

## テストファイル

- `apps/desktop/src/main/database/__tests__/conversationDatabase.test.ts` (15件)

## 備考

- 仕様書のT-04（DI統合テスト2件）は既存の `register-conversation-handlers.test.ts` の22件テストでカバー済み（後方互換パスが既にテストされている）
- DI パスの明示的テストは Phase 6 で追加予定

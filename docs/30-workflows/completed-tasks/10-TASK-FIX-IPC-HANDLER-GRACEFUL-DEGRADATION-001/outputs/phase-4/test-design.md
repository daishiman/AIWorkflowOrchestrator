# Phase 4: テスト設計書

## タスク情報

- **タスクID**: TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001
- **Phase**: 4 (テスト作成)
- **対象ファイル**: `apps/desktop/src/main/ipc/__tests__/ipc-graceful-degradation.test.ts`

## テストケース一覧

| テストID | カテゴリ | テスト名                              | 検証内容                                                |
| -------- | -------- | ------------------------------------- | ------------------------------------------------------- |
| T-01     | 正常系   | successCount が全ハンドラ数と一致する | 全ハンドラ正常登録時の successCount 検証                |
| T-02     | 正常系   | 全成功時に failures は空配列を返す    | failures 配列が空であること                             |
| T-03     | 異常系   | 1つのハンドラ失敗後も後続が登録される | registerFileHandlers 失敗後の後続ハンドラ呼び出し確認   |
| T-04     | 異常系   | 失敗情報が戻り値に含まれる            | handlerName, errorMessage, errorCode の検証             |
| T-05     | 異常系   | 複数ハンドラ失敗時に全て記録される    | 3件の失敗が全て failures に含まれること                 |
| T-06     | 異常系   | Error以外の例外も捕捉される           | 文字列 throw 時に "Unknown error" が記録されること      |
| T-07     | 境界値   | 先頭ハンドラ失敗後に後続全て登録      | registerFileHandlers 失敗後の全後続ハンドラ呼び出し確認 |
| T-08     | 境界値   | 末尾ハンドラ失敗でも先行は登録済み    | registerChatEditHandlers 失敗時の先行ハンドラ確認       |
| T-09     | 境界値   | 全ハンドラ失敗時も例外なし            | successCount=0, failureCount>0 の検証                   |
| T-10     | ログ     | 失敗時に console.error が呼ばれる     | エラーメッセージ含有の検証                              |
| T-11     | ログ     | 全成功時に warn が呼ばれない          | IPC 失敗関連の warn が存在しないこと                    |
| T-12     | 結合     | unregister -> register 再登録フロー   | 再登録後の戻り値が正常であること                        |

## モックパターン

既存の `ipc-double-registration.test.ts` から全モックパターンを流用し、以下を追加:

- 各 `registerXxxHandlers` を個別の `mockRegisterXxxHandlers` 変数で定義し、テストケースごとに `mockImplementationOnce` で失敗注入可能にした
- `mockSetupThemeWatcher` も個別変数で定義
- `vi.hoisted()` で全変数を事前定義
- `beforeEach` で `vi.clearAllMocks()` + `mockIpcMainHandle.mockReset()` + `mockSetupThemeWatcher.mockReset()` でクリーンアップ

## TDD Red 確認

実装前に全12テストが失敗することを確認済み（`registerAllIpcHandlers` が `void` を返すため型エラー、`IpcHandlerRegistrationResult` 型が未定義のためコンパイルエラー）。

# Phase 4: テスト設計・作成 成果物

## テスト実行結果

- chatSlice.test.ts: 57テスト全 PASS（うち chatError 関連 11テスト新規追加）
- ChatView.test.tsx: 31テスト全 PASS（うちエラーバナー関連 8テスト新規追加）

## chatSlice テストケース（C-1〜C-10, C-13）

| ID   | テスト名                                               | 結果 |
| ---- | ------------------------------------------------------ | ---- |
| C-1  | chatError の初期値が null                              | PASS |
| C-2  | sendMessage 成功時に chatError が null のまま          | PASS |
| C-3  | window.electronAPI 未定義時に AI_UNAVAILABLE           | PASS |
| C-4  | response.success=false かつ error あり                 | PASS |
| C-5  | response.success=false かつ error なし → UNKNOWN_ERROR | PASS |
| C-6  | catch ブロック例外時に API_CALL_FAILED                 | PASS |
| C-7  | sendMessage 呼び出し時に前回の chatError クリア        | PASS |
| C-8  | clearChatError でエラーが null に                      | PASS |
| C-9  | エラー時も isSending が false に戻る                   | PASS |
| C-10 | response.error が string 以外の場合 UNKNOWN_ERROR      | PASS |
| C-13 | clearChatError が null 状態で呼ばれても安全            | PASS |

## ChatView エラーバナー テストケース（V-1〜V-6, V-9, V-10）

| ID   | テスト名                                  | 結果 |
| ---- | ----------------------------------------- | ---- |
| V-1  | chatError が null の場合バナー非表示      | PASS |
| V-2  | chatError 設定時バナー表示                | PASS |
| V-3  | AI_UNAVAILABLE で日本語メッセージ         | PASS |
| V-4  | API_CALL_FAILED で日本語メッセージ        | PASS |
| V-5  | UNKNOWN_ERROR でフォールバックメッセージ  | PASS |
| V-6  | ×ボタンクリックで clearChatError 呼び出し | PASS |
| V-9  | エラーバナーに aria-label 設定            | PASS |
| V-10 | 未知エラーコードでフォールバック          | PASS |

## テスト環境の注意事項

- P39対策: happy-dom 環境で fireEvent を使用
- P13対策: タイマーテストは vi.useFakeTimers() + vi.advanceTimersByTime()
- P40対策: apps/desktop ディレクトリからテスト実行
- P63対策: 既存テストのインポートパスを参照

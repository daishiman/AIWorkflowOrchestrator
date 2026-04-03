# Phase 11: 手動テスト計画書

## 前提条件

- Electronアプリが起動可能
- TASK-SDK-SC-01（SDK Session Bridge）完了済み
- ExternalApiConfigForm が external-api-config-required イベントで表示可能

## テスト項目

| テストID | 内容                                             | 検証ポイント                                             | 結果                     |
| -------- | ------------------------------------------------ | -------------------------------------------------------- | ------------------------ |
| MT-01    | モックサーバー(localhost:3000)でGET/POST動作確認 | GETレスポンス取得 + HTTP警告ログ出力                     | 未実施（Electron起動後） |
| MT-02    | 認証エラー(401)時のエラー表示確認                | ExternalApiHttpError(401)がUIに表示 + 認証情報ログ非出力 | 未実施                   |
| MT-03    | タイムアウト(30秒超)時のメッセージ確認           | ExternalApiTimeoutErrorがUIに表示                        | 未実施                   |
| MT-04    | bearer認証でAuthorizationヘッダー確認            | httpbin.org/headersでAuthorization: Bearer確認           | 未実施                   |

## 備考

- 手動テストはTASK-SDK-SC-01完了後、Electron実環境で実施予定
- 自動テスト（T-01〜T-15）で全ロジックパスはカバー済み
- UI表示・実ネットワーク・フォーム操作の検証が手動テストの主目的

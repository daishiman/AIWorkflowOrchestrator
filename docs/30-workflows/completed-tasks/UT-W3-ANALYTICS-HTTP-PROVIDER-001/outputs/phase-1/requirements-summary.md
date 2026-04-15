# Phase 1 完了: 要件定義サマリー - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## P50 チェック（既存実装状態確認）

| チェック項目                         | 確認結果                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| `analyticsHandler.ts` の TODO残存    | Line 106 に `// TODO: 本番環境での HTTP 送信実装` が存在する ✅ |
| `IPC_CHANNELS.ANALYTICS_SEND` の定義 | `"analytics:send"` として `channels.ts` に定義済み ✅           |
| `ALLOWED_INVOKE_CHANNELS` 登録       | `ANALYTICS_SEND` が登録済み ✅                                  |
| `analytics/` サービスディレクトリ    | 未存在（本タスクで新規作成する） ✅                             |
| `analyticsStore` の現在のスキーマ    | `analyticsOptOut?: boolean` のみ定義 ✅                         |
| 既存テストファイル                   | `analyticsHandler.test.ts` が存在し TC-AH-01〜09 が通過中 ✅    |

## 機能要件（FR）確定

| ID    | 要件                                       | 優先度 |
| ----- | ------------------------------------------ | ------ |
| FR-01 | `AnalyticsHttpProvider` クラス新規作成     | 必須   |
| FR-02 | `ANALYTICS_ENDPOINT_URL` 未設定時は no-op  | 必須   |
| FR-03 | 指数バックオフで最大3回リトライ            | 必須   |
| FR-04 | タイムアウト5秒（AbortController）         | 必須   |
| FR-05 | `sentCount` / `failedCount` カウンター追加 | 必須   |
| FR-06 | `analytics:get-stats` IPC チャネル追加     | 必須   |
| FR-07 | `analyticsHandler.ts` TODO解消             | 必須   |
| FR-08 | エラー非伝播設計維持                       | 必須   |

## 非機能要件（NFR）確定

| ID     | 要件                                                          |
| ------ | ------------------------------------------------------------- |
| NFR-01 | Main プロセスブロッキング防止                                 |
| NFR-02 | fetch DI によるテスト容易性                                   |
| NFR-03 | 指数バックオフ（1s→2s→4s）、テスト時オーバーライド可能        |
| NFR-04 | `ANALYTICS_ENDPOINT_URL` は環境変数のみ（electron-store禁止） |
| NFR-05 | オプトアウト二重防衛維持                                      |
| NFR-06 | カウンター更新のアトミック性                                  |
| NFR-07 | typecheck && lint PASS                                        |
| NFR-08 | カバレッジ 80% 以上                                           |

## 受け入れ基準（AC）確定

| AC ID | 受け入れ基準                                               |
| ----- | ---------------------------------------------------------- |
| AC-1  | `ANALYTICS_ENDPOINT_URL` 設定済み時に HTTP POST 送信される |
| AC-2  | 送信失敗時に `success: false` が返る                       |
| AC-3  | リトライが最大3回実行される                                |
| AC-4  | `sentCount` / `failedCount` が正確に記録される             |
| AC-5  | `ANALYTICS_ENDPOINT_URL` 未設定時は no-op                  |
| AC-6  | `AnalyticsHttpProvider.test.ts` が green                   |
| AC-7  | 既存 `analyticsHandler.ts` テストが引き続き PASS           |
| AC-8  | `analytics:get-stats` IPC チャネルが追加される             |

## IPC 4層整合性チェック完了

| 層               | 対象ファイル                                    | 変更内容                                          |
| ---------------- | ----------------------------------------------- | ------------------------------------------------- |
| チャネル定義層   | `apps/desktop/src/preload/channels.ts`          | `ANALYTICS_GET_STATS: "analytics:get-stats"` 追加 |
| ホワイトリスト層 | `apps/desktop/src/preload/channels.ts`          | `ALLOWED_INVOKE_CHANNELS` に追加                  |
| IPC ハンドラー層 | `apps/desktop/src/main/ipc/analyticsHandler.ts` | `ipcMain.handle(ANALYTICS_GET_STATS, ...)` 追加   |
| contextBridge 層 | `apps/desktop/src/preload/index.ts`             | `analyticsAPI.getStats` 追加                      |

## 非採用案の明文化

- **Renderer 側での HTTP 送信案**: セキュリティ上禁止（Main プロセスで行う）
- **electron-store へのエンドポイント URL 保存案**: 環境変数で管理
- **IPC エラー時のスロー案**: analytics失敗はアプリ動作に影響させない

_Phase 1 完了: 2026-04-14_

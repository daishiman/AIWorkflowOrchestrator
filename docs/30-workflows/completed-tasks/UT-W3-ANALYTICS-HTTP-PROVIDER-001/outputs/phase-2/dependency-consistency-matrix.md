# 依存整合マトリクス

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 2                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 作成日     | 2026-04-13                                           |
| ステータス | 完了                                                 |

---

## 依存関係一覧

### 直接依存（analyticsHandler.ts が参照するモジュール）

| 依存先                     | 依存種別       | 変更有無 | 確認内容                                                 | 整合 |
| -------------------------- | -------------- | -------- | -------------------------------------------------------- | ---- |
| `electron` (`ipcMain`)     | 外部パッケージ | 変更なし | `ipcMain.handle` の使用方法を変更しなかった              | OK   |
| `electron-store` (`Store`) | 外部パッケージ | 変更なし | `analyticsStore.get("analyticsOptOut")` を変更しなかった | OK   |
| `../../preload/channels`   | 内部モジュール | 変更なし | `IPC_CHANNELS.ANALYTICS_SEND` の値を変更しなかった       | OK   |
| `global.fetch`             | ランタイム API | 新規使用 | Node.js 18+ / Electron の組み込み `fetch` を使用した     | OK   |
| `AbortController`          | ランタイム API | 新規使用 | Node.js 組み込みの `AbortController` を使用した          | OK   |

### 逆依存（analyticsHandler.ts に依存するモジュール）

| 依存元                                   | 依存種別       | 変更有無 | 確認内容                                                           | 整合 |
| ---------------------------------------- | -------------- | -------- | ------------------------------------------------------------------ | ---- |
| `apps/desktop/src/main/index.ts`（推定） | 内部モジュール | 変更なし | `registerAnalyticsHandlers()` の呼び出しシグネチャを変更しなかった | OK   |
| `analyticsHandler.test.ts`               | テストファイル | 追記     | 既存テストを破壊せず、新規テストケースを追加した                   | OK   |

---

## IPC 契約整合確認

| 契約要素                             | 期待値                                         | 確認結果 | 整合 |
| ------------------------------------ | ---------------------------------------------- | -------- | ---- |
| チャネル名                           | `IPC_CHANNELS.ANALYTICS_SEND`                  | 変更なし | OK   |
| リクエスト型 `AnalyticsSendRequest`  | `{ eventName, payload, timestamp, optedOut? }` | 変更なし | OK   |
| レスポンス型 `AnalyticsSendResponse` | `{ success, skipped?, error? }`                | 変更なし | OK   |
| バリデーション失敗時の応答           | `{ success: false, error: string }`            | 変更なし | OK   |
| オプトアウト時の応答                 | `{ success: true, skipped: true }`             | 変更なし | OK   |
| 正常時の応答                         | `{ success: true }`                            | 変更なし | OK   |

---

## 環境変数整合確認

| 変数名                   | 用途                            | 既存 / 新規 | 使用箇所                                                                 | 整合 |
| ------------------------ | ------------------------------- | ----------- | ------------------------------------------------------------------------ | ---- |
| `NODE_ENV`               | 環境判定（production チェック） | 既存使用    | `analyticsHandler.ts` Line 98（既存）+ `sendToAnalyticsProvider`（新規） | OK   |
| `ANALYTICS_ENDPOINT_URL` | HTTP 送信先 URL                 | 新規追加    | `sendToAnalyticsProvider` のみ                                           | OK   |

---

## 型整合確認

| 型名                           | 変更有無 | 確認内容                                                                | 整合 |
| ------------------------------ | -------- | ----------------------------------------------------------------------- | ---- |
| `AnalyticsSendRequest`         | 変更なし | フィールド追加・削除・型変更なし                                        | OK   |
| `AnalyticsSendResponse`        | 変更なし | フィールド追加・削除・型変更なし                                        | OK   |
| `AnalyticsStoreSchema`         | 変更なし | `analyticsOptOut?: boolean` を変更しなかった                            | OK   |
| `SendToAnalyticsProviderInput` | 新規追加 | `AnalyticsSendRequest` の一部フィールドを抜き出した型（非エクスポート） | OK   |

`SendToAnalyticsProviderInput` は `AnalyticsSendRequest` から `optedOut` を除いたサブセットであり、既存型との矛盾はなかった。

---

## 外部パッケージ整合確認

| パッケージ         | バージョン要件               | 確認内容                                                      | 整合 |
| ------------------ | ---------------------------- | ------------------------------------------------------------- | ---- |
| `electron`         | 既存バージョン維持           | `ipcMain` の API を変更しなかった                             | OK   |
| `electron-store`   | 既存バージョン維持           | `Store.get()` の呼び出しを変更しなかった                      | OK   |
| Node.js / Electron | `fetch` 組み込みサポート必要 | Electron 21+ / Node.js 18+ で `global.fetch` が使用可能だった | OK   |

---

## テスト依存整合確認

| テスト依存                     | 確認内容                                                         | 整合 |
| ------------------------------ | ---------------------------------------------------------------- | ---- |
| `vitest`                       | `vi.stubGlobal`, `vi.fn`, `vi.unstubAllGlobals` が使用可能だった | OK   |
| `vi.stubGlobal("fetch")`       | `global.fetch` のモックが Vitest でサポートされていた            | OK   |
| `vi.stubGlobal("window")` 禁止 | テストコードで使用しないことを設計に明記した                     | OK   |
| 既存テストとの共存             | 既存の `analyticsHandler.test.ts` テストを破壊しなかった         | OK   |

---

## 矛盾・問題なし確認

| 確認項目                                                          | 結果 |
| ----------------------------------------------------------------- | ---- |
| 循環依存がなかった                                                | OK   |
| 既存インターフェースを変更しなかった                              | OK   |
| 新規追加による既存テストへの影響がなかった                        | OK   |
| `global.fetch` / `AbortController` の実行環境要件が満たされていた | OK   |
| 環境変数追加による既存コードへの影響がなかった                    | OK   |

依存整合マトリクス全項目で矛盾・問題は検出されなかった。

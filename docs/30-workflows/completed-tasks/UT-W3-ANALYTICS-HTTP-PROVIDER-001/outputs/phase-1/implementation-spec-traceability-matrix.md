# 要件と仕様の対応表（トレーサビリティ行列）

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| 機能名     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                    |
| タスク名   | 本番 analytics HTTP 送信実装（外部分析基盤への接続） |
| 作成日     | 2026-04-13                                           |
| ステータス | 完了                                                 |

---

## トレーサビリティ行列

### 機能要件 → 受け入れ基準 → 実装箇所

| 機能要件 | 要件内容                                               | 受け入れ基準 | 実装箇所                                                       |
| -------- | ------------------------------------------------------ | ------------ | -------------------------------------------------------------- |
| FR-01    | `NODE_ENV=production` 時に HTTP POST する              | AC-01, AC-02 | `sendToAnalyticsProvider` 内の NODE_ENV チェック               |
| FR-02    | リクエストボディは `{ eventName, payload, timestamp }` | AC-01        | `JSON.stringify(event)` + `Content-Type` ヘッダー              |
| FR-03    | タイムアウトは 5000ms（AbortController）               | AC-04        | `AbortController` + `setTimeout(5000)`                         |
| FR-04    | HTTP 送信失敗時はエラーを握り潰す                      | AC-04, AC-05 | `try-catch` ブロック（再スローなし）                           |
| FR-05    | `ANALYTICS_ENDPOINT_URL` 未設定時はスキップ            | AC-03        | `if (!url) return` ガード                                      |
| FR-06    | オプトアウト二重防衛を破らない                         | AC-06        | `sendToAnalyticsProvider` 呼び出し前のオプトアウトチェック維持 |

### 非機能要件 → 受け入れ基準 → 実装箇所

| 非機能要件 | 要件内容                                        | 受け入れ基準 | 実装箇所                                                  |
| ---------- | ----------------------------------------------- | ------------ | --------------------------------------------------------- |
| NFR-01     | 送信失敗がアプリケーション全体を壊さない        | AC-04, AC-05 | `catch` ブロックで全例外を握り潰し                        |
| NFR-02     | `pnpm typecheck && pnpm lint && pnpm test` PASS | AC-07        | 実装・型定義・テスト全体                                  |
| NFR-03     | 既存型定義を変更しない                          | AC-06, AC-07 | `AnalyticsSendRequest` / `AnalyticsSendResponse` 変更なし |
| NFR-04     | テスト時は `global.fetch` をモック              | AC-01〜AC-05 | `vi.stubGlobal("fetch", mockFetch)`                       |

---

## 受け入れ基準 → 機能要件マッピング

| 受け入れ基準 | 基準内容                                        | 対応機能要件 | 対応非機能要件 |
| ------------ | ----------------------------------------------- | ------------ | -------------- |
| AC-01        | production + URL 設定時に HTTP POST が呼ばれる  | FR-01, FR-02 | NFR-04         |
| AC-02        | production 以外では HTTP POST を呼ばない        | FR-01        | NFR-04         |
| AC-03        | URL 未設定時は HTTP POST を呼ばず success: true | FR-05        | NFR-01         |
| AC-04        | タイムアウト後も success: true を返す           | FR-03, FR-04 | NFR-01, NFR-04 |
| AC-05        | fetch 例外時も success: true を返す             | FR-04        | NFR-01, NFR-04 |
| AC-06        | オプトアウト時は success: true, skipped: true   | FR-06        | NFR-03         |
| AC-07        | pnpm typecheck && pnpm lint && pnpm test PASS   | 全 FR        | NFR-02, NFR-03 |

---

## 実装箇所 → 要件マッピング

| 実装箇所                                               | 対応要件             |
| ------------------------------------------------------ | -------------------- |
| `sendToAnalyticsProvider` 関数定義                     | FR-01〜FR-05, NFR-01 |
| `SendToAnalyticsProviderInput` 型定義                  | FR-02, NFR-03        |
| `process.env.ANALYTICS_ENDPOINT_URL` チェック          | FR-05                |
| `process.env.NODE_ENV !== "production"` チェック       | FR-01, FR-02         |
| `AbortController` + `setTimeout(5000)`                 | FR-03                |
| `fetch(url, { method: "POST", body: JSON.stringify })` | FR-01, FR-02         |
| `try-catch`（例外を握り潰す）                          | FR-04, NFR-01        |
| `finally { clearTimeout(timeoutId) }`                  | FR-03                |
| `analyticsHandler.ts` Line 106 の TODO 解消            | FR-01〜FR-06         |
| オプトアウトチェック後への配置                         | FR-06                |

---

## テストケース → 受け入れ基準マッピング

| テストケース ID | テスト内容                           | 対応受け入れ基準 |
| --------------- | ------------------------------------ | ---------------- |
| TC-01           | production + URL 設定時の HTTP POST  | AC-01            |
| TC-02           | development 環境での非送信確認       | AC-02            |
| TC-03           | test 環境での非送信確認              | AC-02            |
| TC-04           | URL 未設定時のスキップ確認           | AC-03            |
| TC-05           | URL 空文字時のスキップ確認           | AC-03            |
| TC-06           | AbortError 後の success: true 確認   | AC-04            |
| TC-07           | ネットワークエラー後の success: true | AC-05            |
| TC-08           | オプトアウト時の skipped: true 確認  | AC-06            |

---

## 網羅率確認

| カテゴリ     | 総件数 | 対応済み | 網羅率 |
| ------------ | ------ | -------- | ------ |
| 機能要件     | 6 件   | 6 件     | 100%   |
| 非機能要件   | 4 件   | 4 件     | 100%   |
| 受け入れ基準 | 7 件   | 7 件     | 100%   |
| テストケース | 8 件   | 8 件     | 100%   |

---

## 矛盾・漏れ確認

| 確認項目                                         | 結果 | 備考                                                                    |
| ------------------------------------------------ | ---- | ----------------------------------------------------------------------- |
| 全 FR に対応する AC が存在した                   | OK   | FR-01〜FR-06 それぞれに対応 AC あり                                     |
| 全 AC に対応する FR/NFR が存在した               | OK   | AC-01〜AC-07 それぞれに対応要件あり                                     |
| 全 AC に対応するテストケースが存在した           | OK   | TC-01〜TC-08 が AC-01〜AC-06 をカバー（AC-07 は CI で確認）             |
| 要件間の矛盾がなかった                           | OK   | FR-01 と FR-05 の組み合わせ（URL 未設定時スキップ）は整合した           |
| NFR-03（型変更禁止）と新規型追加が矛盾しなかった | OK   | `SendToAnalyticsProviderInput` は新規追加であり既存型の変更ではなかった |

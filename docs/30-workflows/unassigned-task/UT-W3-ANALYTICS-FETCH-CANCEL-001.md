# UT-W3-ANALYTICS-FETCH-CANCEL-001: fetch レスポンスボディの明示的キャンセル

## 概要

`sendToAnalyticsProvider` は fire-and-forget 設計のため、HTTP レスポンスボディを読み取らずに終了する。
`ReadableStream` が開放されないケースを防ぐため、`response.body?.cancel()` による明示的なキャンセルを実装する。

## 背景

UT-W3-ANALYTICS-HTTP-PROVIDER-001 の Phase 9 リスクレジスター（RISK-04）にて記録。
現在の実装では `fetch` レスポンスのボディを消費しないまま終了する設計だが、
ブラウザ/Node.js ランタイムによっては `ReadableStream` のバックプレッシャーが残留する可能性がある。
イベント頻度が低い現状では実害はないが、将来的な高頻度送信やランタイム変更時のリスクとして記録された。

## 受入基準

- [ ] `sendToAnalyticsProvider` の `fetch` 呼び出し後に `response.body?.cancel()` を追加する
- [ ] キャンセル処理自体が例外を投げた場合でも握り潰すことを保証するテストを追加する
- [ ] 既存テスト（TC-01〜TC-08、TC-E01〜TC-E05、TC-R01〜TC-R03）が全て PASS すること

## 苦戦箇所（UT-W3-ANALYTICS-HTTP-PROVIDER-001 より）

- **エッジケース設計の後回し**: TC-E04（空文字 URL）はPhase 6 で発見されたが、Phase 4 設計時に識別可能だった。
  本タスクでは Phase 4 段階で `body.cancel()` の省略がリスクになるユースケースを列挙してから実装すること。
- **ESLint warnings の事前確認**: 既存コードの警告をタスク開始前に把握しておくと手戻りが減る。

## 優先度

LOW

## 関連

- UT-W3-ANALYTICS-HTTP-PROVIDER-001（発生元タスク）
- `apps/desktop/src/main/ipc/analyticsHandler.ts`
- `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`
- RISK-04（`docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-9/risk-register.md`）

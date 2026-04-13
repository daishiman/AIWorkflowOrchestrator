# UT-W3-ANALYTICS-HTTP-RETRY-001: アナリティクス HTTP 送信のリトライ機能実装

## 概要

`sendToAnalyticsProvider` にネットワーク一時障害時のリトライ機能を追加する。
現状は single-attempt の fire-and-forget 設計だが、データ損失リスクが顕在化した場合に備えた実装。

## 背景

UT-W3-ANALYTICS-HTTP-PROVIDER-001 の Phase 12 未タスク検出レポートにて将来タスク化候補として記録。
現在の要件ではリトライは不要だが、以下の状況になった場合に検討する:

- アナリティクスデータの損失がビジネス上の問題になった場合
- 外部サービス（analytics エンドポイント）の信頼性 SLA が設定された場合
- 送信成功率のモニタリングで閾値を下回るケースが検出された場合

## 受入基準

- [ ] ネットワークエラー（`TypeError: Failed to fetch` 等）発生時に指数バックオフでリトライする
- [ ] 最大リトライ回数を設定可能にする（デフォルト: 3回）
- [ ] リトライ間隔の最大待機時間を設定可能にする（デフォルト: 5秒）
- [ ] `AbortError`（タイムアウト）はリトライ対象外とする
- [ ] IPC ハンドラーの応答時間に影響しないようリトライは非同期で実行する
- [ ] リトライ処理を含む全テストが PASS すること

## 苦戦箇所（UT-W3-ANALYTICS-HTTP-PROVIDER-001 より）

- **AbortController と再試行の競合**: 現在の実装では AbortController が 5000ms タイムアウトで abort する。
  リトライ実装時は各試行ごとに新しい AbortController を生成することを忘れないこと（再利用すると即時 abort される）。
- **エッジケースの早期設計**: TC-E04（空文字 URL）のように、リトライでも「最終失敗時の処理」「永続化の必要性」を
  Phase 4 段階でリストアップしてからテストを書くこと。

## 優先度

LOW

## 関連

- UT-W3-ANALYTICS-HTTP-PROVIDER-001（発生元タスク）
- UT-FIX-LLM-FETCHPROVIDERS-RETRY-001（同様のリトライパターン参照）
- `apps/desktop/src/main/ipc/analyticsHandler.ts`
- `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`
- 未タスク検出レポート（`docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-12/unassigned-task-detection.md`）

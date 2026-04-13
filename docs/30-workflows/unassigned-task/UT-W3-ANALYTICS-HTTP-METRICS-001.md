# UT-W3-ANALYTICS-HTTP-METRICS-001: アナリティクス HTTP 送信の成功・失敗メトリクス収集

## 概要

`sendToAnalyticsProvider` の送信成功・失敗を計測するメトリクス収集機能を実装する。
外部 analytics エンドポイントの信頼性監視が必要になった際に対応する。

## 背景

UT-W3-ANALYTICS-HTTP-PROVIDER-001 の Phase 12 未タスク検出レポートにて将来タスク化候補として記録。
現在の設計は fire-and-forget であり、送信結果をログに残さない（セキュリティ上 URL や payload のログ出力禁止）。
ただし、以下の状況では送信の成功率・失敗率を把握する必要が生じる:

- analytics エンドポイントの可用性を監視したい場合
- 障害時のデータ損失量を見積もりたい場合
- SLA レポートの作成が必要になった場合

## 受入基準

- [ ] 送信成功・失敗のカウントを IPC 経由で取得できる内部メトリクス API を実装する
- [ ] メトリクスデータに analytics の payload 内容が含まれないこと（プライバシー保護）
- [ ] エンドポイント URL がログ・メトリクスに記録されないこと（セキュリティ）
- [ ] メトリクス収集が `sendToAnalyticsProvider` の応答時間に影響しないこと（非同期）
- [ ] `pnpm --filter @repo/desktop test` が PASS すること

## 苦戦箇所（UT-W3-ANALYTICS-HTTP-PROVIDER-001 より）

- **環境変数ドキュメンテーション**: `ANALYTICS_ENDPOINT_URL` の扱い（未設定時の静かなスキップ、
  ログ出力禁止）を `environment-variables.md` に追記する必要があった。
  本タスクでもメトリクス用の設定変数を追加する場合は仕様書への記載を Phase 5 完了の条件とすること。
- **セキュリティ境界の明確化**: analytics 関連機能では「何をログに残すか残さないか」の
  判断が難しい。Phase 2 設計時にセキュリティレビューチェックリストを作成してから実装に進むこと。

## 優先度

LOW

## 関連

- UT-W3-ANALYTICS-HTTP-PROVIDER-001（発生元タスク）
- `apps/desktop/src/main/ipc/analyticsHandler.ts`
- `.claude/skills/aiworkflow-requirements/references/environment-variables.md`
- 未タスク検出レポート（`docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-12/unassigned-task-detection.md`）
- リスクレジスター（`docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-9/risk-register.md`）

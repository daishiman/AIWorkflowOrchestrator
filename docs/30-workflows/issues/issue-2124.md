# [#2124] [UT-W3-ANALYTICS-HTTP-METRICS-001] アナリティクス HTTP 送信の成功・失敗メトリクス収集

## メタ情報

```yaml
issue_number: 2124
title: [UT-W3-ANALYTICS-HTTP-METRICS-001] アナリティクス HTTP 送信の成功・失敗メトリクス収集
state: OPEN
priority: 低
scale: 中規模
category: 改善
status: 未実施
created_date: 2026-04-13
updated_date: 2026-04-13
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2124
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 概要

アナリティクス HTTP 送信の成功・失敗カウントを取得できる内部メトリクス API を実装する。

## 背景

現在の実装では、アナリティクス送信の成功・失敗を追跡する手段がない。
内部メトリクス API を追加することで、送信状況の監視・デバッグが容易になる。
これにより、アナリティクス機能の信頼性評価や問題検出が可能になる。

## 受入基準

- [ ] 送信成功カウントを取得できる内部 API が実装される
- [ ] 送信失敗カウントを取得できる内部 API が実装される
- [ ] メトリクスのリセット機能が実装される（テスト容易性のため）
- [ ] メトリクス API に対応したテストが追加される
- [ ] 既存のテストが引き続き通過する
- [ ] メトリクスの型定義が適切に行われる

## 優先度

LOW

## タスクID

UT-W3-ANALYTICS-HTTP-METRICS-001

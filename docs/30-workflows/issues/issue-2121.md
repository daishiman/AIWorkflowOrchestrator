# [#2121] [UT-W3-ANALYTICS-FETCH-CANCEL-001] fetch レスポンスボディの明示的キャンセル

## メタ情報

```yaml
issue_number: 2121
title: [UT-W3-ANALYTICS-FETCH-CANCEL-001] fetch レスポンスボディの明示的キャンセル
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-13
updated_date: 2026-04-13
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2121
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`sendToAnalyticsProvider` 関数において、fetch レスポンスボディを明示的にキャンセルする実装を追加する。

## 背景

現在の実装では `response.body?.cancel()` による明示的なキャンセル処理が行われていない。
fetch レスポンスを受信した後にボディを読み込まない場合、リソースリークが発生する可能性がある。
明示的なキャンセルによって、不要なネットワークリソースを適切に解放する。

## 受入基準

- [ ] `sendToAnalyticsProvider` 内で `response.body?.cancel()` を呼び出すことで、レスポンスボディが明示的にキャンセルされる
- [ ] キャンセル処理が成功・失敗両方のケースで正しく動作する
- [ ] 既存のテストが通過する
- [ ] 新たなリソースリークが発生しない

## 優先度

LOW

## タスクID

UT-W3-ANALYTICS-FETCH-CANCEL-001

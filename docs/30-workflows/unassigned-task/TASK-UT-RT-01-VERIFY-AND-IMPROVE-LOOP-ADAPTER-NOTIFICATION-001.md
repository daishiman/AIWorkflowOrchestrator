# TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001

## メタ情報

```yaml
issue_number: 1959
```

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| タスクID   | TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001         |
| 機能名     | verify-and-improve-loop-adapter-notification                           |
| ステータス | open（未着手）                                                         |
| 作成日     | 2026-04-06                                                             |
| 親タスク   | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001（Phase 10 MINOR 指摘） |
| 優先度     | Medium                                                                 |
| タスク種別 | improvement（改善タスク）                                              |
| 関連Issue  | #1959                                                                  |

## 概要

`verifyAndImproveLoop()` 内で `improve()` が呼ばれた際の adapter error 通知処理が整理されておらず、review loop の feedback 文言が runtime guard とずれる可能性がある。

`execute()` / `improve()` 単体の adapter error 通知は `TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001` で整備済みだが、`verifyAndImproveLoop()` が内部で呼び出す `improve()` 経路での adapter error 通知パターンは未整理のまま残っている。これにより、verify→improve→re-verify のクローズドループ中に adapter 障害が発生した場合、通知文言と runtime guard のメッセージが乖離するリスクがある。

## スコープ

### 含む

- `verifyAndImproveLoop()` 内の `improve()` 呼び出しにおける adapter error 通知パターンの確認・整理
- `execute()` / `improve()` 単体ガードとの通知文言・エラーハンドリング一貫性確認
- 差異がある場合の修正（通知タイトル・メッセージの統一）
- `verifyAndImproveLoop()` テスト: adapter error 時の通知パターンシナリオ追加

### 含まない

- `notificationService` インターフェース自体の変更
- `verifyAndImproveLoop()` のアーキテクチャ変更
- 他クラスへの展開

## 受入基準

| ID   | 基準                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------- |
| AC-1 | `verifyAndImproveLoop()` の `improve()` 呼び出し経路で adapter error が発生した場合、通知が適切に行われる |
| AC-2 | 通知タイトル・メッセージが `execute()` / `improve()` 単体ガードと同等水準で統一されている                 |
| AC-3 | 既存の `verifyAndImproveLoop()` テストがリグレッションなしで PASS する                                    |

## 子タスク

| タスクID                                               | Issue | 状態 | 説明                                          |
| ------------------------------------------------------ | ----- | ---- | --------------------------------------------- |
| TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001          | #1936 | open | notify helper 統合（3箇所インライン重複解消） |
| TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001      | #1937 | open | executeAsync snapshot error propagation       |
| TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 | #1960 | open | executeAsync snapshot error message 形式統一  |

## 苦戦箇所（発見元コンテキスト）

TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 の実装時に以下の構造的な課題が判明した:

1. **通知パターンのインライン重複**: `execute()`・`improve()`・`verifyAndImproveLoop()` 内の3箇所にそれぞれ `try { notify() } catch {}` パターンが存在し、文言変更時の一元管理が困難。
2. **ループ内コンテキストの欠落**: `verifyAndImproveLoop()` が実行する `improve()` は「ループ第N回目の improve」という文脈を持つが、現状の通知メッセージはその文脈を持たない。
3. **re-verify 失敗時の通知欠落**: verify → improve → re-verify のサイクルで re-verify が失敗した場合、ループ終端での通知が定義されていない可能性がある。

これらは Phase 10 MINOR 指摘として記録され、子タスク（#1936, #1937）で部分的に対処されるが、親としての整合性確認タスクが残っている。

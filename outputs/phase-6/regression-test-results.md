# 回帰テスト結果 - TASK-UI-SCHEDULE-CRON-SEMANTIC-001

## 回帰確認結果

```
Tests  42 passed (42)
- scheduleConfigValidator.edge.test.ts: 25 tests passed
- scheduleConfigValidator.test.ts: 17 tests passed
```

## SCV-01〜SCV-12 回帰確認

| テスト                                                  | 状態    |
| ------------------------------------------------------- | ------- |
| SCV-01: 5フィールドの有効なcron式はnullを返す           | PASS ✅ |
| SCV-02: 空文字はエラーメッセージを返す                  | PASS ✅ |
| SCV-03: 4フィールドはエラーメッセージを返す             | PASS ✅ |
| SCV-04: 6フィールドはエラーメッセージを返す             | PASS ✅ |
| SCV-10: 前後の空白はtrimして判定される                  | PASS ✅ |
| SCV-11: semantic validationは行わない（月次指定はnull） | PASS ✅ |
| ワイルドカードのみは有効                                | PASS ✅ |
| 複雑なステップ値も構文的に有効                          | PASS ✅ |
| SCV-05: Asia/Tokyo はnullを返す                         | PASS ✅ |
| SCV-05: UTC はnullを返す                                | PASS ✅ |
| SCV-06: 未知の文字列はエラーを返す                      | PASS ✅ |
| 空文字はエラーを返す                                    | PASS ✅ |
| America/New_York は有効                                 | PASS ✅ |
| SCV-07: cronもtimezoneも有効ならエラーなし              | PASS ✅ |
| SCV-08: cron だけ無効ならcronのみエラー                 | PASS ✅ |
| SCV-09: timezone だけ無効ならtimezoneのみエラー         | PASS ✅ |
| SCV-12: 両方無効なら両方エラー                          | PASS ✅ |

## TC-01〜TC-08 回帰確認

| テスト            | 状態    |
| ----------------- | ------- |
| TC-01〜TC-08 全件 | PASS ✅ |

## AC-4 カバレッジ向上確認

| 観点                       | Phase 4 前   | Phase 6 後                              |
| -------------------------- | ------------ | --------------------------------------- |
| semantic=true エラーケース | 1件（TC-01） | 9件（TC-01,09,10,11,12,13,15,16+TC-08） |
| semantic=true PASSケース   | 4件          | 4件（維持）                             |
| 後方互換ガード             | 2件          | 3件（TC-14追加）                        |
| 空文字+semantic=true       | 未カバー     | カバー済み（TC-15）                     |

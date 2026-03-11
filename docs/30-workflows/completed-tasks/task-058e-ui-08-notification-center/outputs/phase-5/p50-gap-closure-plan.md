# Phase 5 P50差分収束計画

## 解消済み差分

| 差分            | 実施内容                                    | 状態 |
| --------------- | ------------------------------------------- | ---- |
| `通知履歴` 文言 | `お知らせ` へ置換                           | 完了 |
| `すべて削除` UI | Header から撤去                             | 完了 |
| 固定日時        | `Intl.RelativeTimeFormat("ja")` に変更      | 完了 |
| Portal 不足     | `createPortal(document.body)` に変更        | 完了 |
| keyboard/focus  | Escape / focus return / Tab wrap を追加     | 完了 |
| 個別削除        | swipe reveal + `notification:delete` を追加 | 完了 |
| empty state     | `EmptyState mood="celebrating"` を追加      | 完了 |

## 残留事項

- 本格的な touch/trackpad swipe の質感は手動検証で最終確認する
- `notification:clear` は後方互換のため残置しているが UI からは未使用

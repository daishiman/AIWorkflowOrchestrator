# Phase 6 テスト拡充サマリー

## 追加した観点

- 通知100件上限での削除優先順位（既読優先）
- 既読が存在しない場合の最古未読削除
- history検索での query trim 後バリデーション
- invalid sender 拒否
- notification clear(onlyRead) の差分削除

## 拡充効果

- 境界値ケースの明示化により、実装意図をテストで固定
- security/error 分岐がテストに入り、回帰検知範囲を拡張

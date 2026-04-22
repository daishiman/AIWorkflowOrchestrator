# 拡張テストケース一覧

## 追加したテストケース

### X-1: restoredPendingRequest が null のとき awaitingUserInput 更新でも影響なし

- **シナリオ**: restoredPendingRequest = null の状態で awaitingUserInput（requestId 変化）が届く
- **期待結果**: setRestoredPendingRequest は呼ばれない（null のまま）、新しい awaitingUserInput が pendingRequest になる
- **優先度**: 高

### X-2: 同一 requestId では restoredPendingRequest クリア useEffect が再実行されない

- **シナリオ**: undo状態（restoredPendingRequest 非 null）で、同一 requestId の awaitingUserInput オブジェクトが新参照で届く
- **期待結果**: useEffect は再実行されない（deps の requestId が変化していないため）、restoredPendingRequest は維持される
- **優先度**: 中

## 合計テスト数

| describe                               | テスト数 |
| -------------------------------------- | -------- |
| ConversationalInterview（既存）        | 19       |
| pendingRequest合成ロジック（S-1〜S-4） | 4        |
| pendingRequest合成ロジック（X-1〜X-2） | 2        |
| **合計**                               | **25**   |

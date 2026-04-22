# 境界値・異常系テスト結果

## X-1: restoredPendingRequest が null のとき

- **テスト**: awaitingUserInput の requestId が変化したとき、restoredPendingRequest = null のまま pendingRequest が新しい awaitingUserInput に切り替わる
- **結果**: ✅ PASS

## X-2: 同一 requestId の参照更新

- **テスト**: undo状態でオブジェクト参照だけが変わり requestId が同じ awaitingUserInput が届いても useEffect が再実行されず restoredPendingRequest が維持される
- **結果**: ✅ PASS

## 全結果サマリー

| シナリオ                   | 結果    |
| -------------------------- | ------- |
| X-1: null状態での更新      | ✅ PASS |
| X-2: 同一requestId参照更新 | ✅ PASS |

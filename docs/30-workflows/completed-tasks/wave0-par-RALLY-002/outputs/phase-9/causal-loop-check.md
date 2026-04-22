# Phase 9 成果物: 因果ループ監査

## タスクID: TASK-RALLY-002

## 強化ループ

1. 優先ルールが暗黙
2. 後続タスクで再調査が発生
3. close-out が遅れる
4. さらに暗黙知が増える

今回の対策:

- コメント追加
- シナリオテスト追加
- Phase 12 handoff 明文化

## バランスループ

1. requestId 変化で clear `useEffect` が走る
2. restored state が解放される
3. 通常フローへ戻る
4. 同一 requestId の参照更新では再実行しない

判定:

- `pendingRequest` 契約の説明とテストが揃ったため、ループは可観測になった
- UI追加や server rollback は別タスクの責務として分離されている

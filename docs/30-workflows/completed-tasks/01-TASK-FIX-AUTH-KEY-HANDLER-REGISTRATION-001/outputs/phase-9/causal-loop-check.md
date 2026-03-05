# Phase 9 因果ループ監査

## ループ1: 登録漏れ再発ループ

1. Main統合で個別ハンドラ接続が抜ける
2. `No handler registered` が発生
3. preflight失敗で機能検証が止まる
4. 実運用で発見が遅れ再発

- 断ち切り策: `ipc-double-registration.test.ts` で登録有無を明示検証。

## ループ2: 内部状態不整合ループ

1. `handlersRegistered=true` のまま解除漏れ
2. 再登録時にスキップ
3. 実体ハンドラ未登録状態が継続

- 断ち切り策: `unregisterAllIpcHandlers()` で `unregisterAuthKeyHandlers()` を必ず呼ぶ。

## ループ3: 品質判断の盲点ループ

1. 単体テストのみ通過
2. Main統合経路の欠落を見逃す
3. 実行時のみ障害化

- 断ち切り策: Main統合テスト + Renderer preflight回帰をセットで維持。

## 監査結論

- 今回修正はループ1/2の直接対策を実装済み。
- ループ3は運用ルール（Phase 9/10の統合証跡必須）で抑制可能。

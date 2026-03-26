# Phase 9: 品質保証

## 目的

verify の初回スコープが Layer 1 / 2 に抑制されていることを確認する。

## 実行タスク

- verify contract / improve contract の再点検
- hard fail / warning / re-verify の境界確認
- quality gate と補助評価の責務分離確認

## 品質観点

- verify が第二の巨大実行レーンになっていない
- improve は verify 結果または user feedback を構造化して返す
- apply 後に re-verify へ戻る導線がある

## 公式照合観点

- Agent SDK 主線の execute と verify を混同していない
- structured output や session 継続の考え方と verify surface が衝突していない

## 並列化観点

- Task05 と同時進行する場合、入口 UI と結果 surface の responsibility を分離する
- state owner が共通 store に集まる場合は ownership table を先に固定する

## 完了条件

- [ ] 初回スコープ過大化が防止されている
- [ ] hard fail / warning / re-verify の境界が読める
- [ ] Task05 並列時の state 衝突ポイントが読める
- [ ] **本Phase内の全タスクを100%実行完了**

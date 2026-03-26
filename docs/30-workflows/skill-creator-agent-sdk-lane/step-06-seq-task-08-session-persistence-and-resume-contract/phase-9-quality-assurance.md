# Phase 9: 品質保証

## 目的

resume 互換性が暗黙仕様ではなく契約として定義されていることを確認する。

## 実行タスク

- save target と invalidation rule の再点検
- manifest 更新後 resume 互換性の確認
- checkpoint と route state の保存境界確認

## 品質観点

- resume 可否判定が暗黙挙動ではなくルールとして読める
- session / checkpoint / runtime route の保存対象が分離されている
- 並行実行時の排他や破棄条件が最低限整理されている

## 公式照合観点

- Agent SDK の sessions 機能前提と local workflow session 契約が衝突していない
- checkpointing を使う場合の互換性境界が誤解されていない

## 完了条件

- [ ] 互換性境界が明記されている
- [ ] save / resume / invalidation ルールが読める
- [ ] sessions / checkpointing 前提とのズレがない
- [ ] **本Phase内の全タスクを100%実行完了**

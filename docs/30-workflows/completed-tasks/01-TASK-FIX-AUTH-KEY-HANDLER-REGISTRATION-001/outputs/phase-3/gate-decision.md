# Phase 3 ゲート判定

## 判定

- **Go**（条件付き）

## Go条件

- Condition-01: `registerAllIpcHandlers` 経由で auth-key 登録保証の Red テストを追加すること
- Condition-02: activate 再登録パスで解除/再登録の状態整合を検証すること
- Condition-03: 既存 fallback / theme watcher / skill chain の回帰を確認すること

## No-Goトリガー

- Main登録修正なしでテストだけ調整する案
- Preload契約変更で問題を隠蔽する案

## 是正タスク（Phase 4/5投入）

1. Phase 4: index統合テストに auth-key 登録ライフサイクル検証を追加
2. Phase 5: Main IPC index へ auth-key 登録/解除処理を実装
3. Phase 5: Green化と回帰確認

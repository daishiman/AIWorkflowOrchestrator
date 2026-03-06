# Phase 10 リリース判定

## 判定

| 対象                   | 判定  | 理由                                              |
| ---------------------- | ----- | ------------------------------------------------- |
| Step 1: 並行稼働       | Go    | rollback path を保持しつつ新ナビ導入が可能        |
| Step 2: AppLayout 統合 | Go    | default ON で安定動作し、手動検証対象も揃っている |
| Step 3: AppDock 削除   | No-Go | `AppDock` / feature flag / ownerView 参照が残る   |

## リリースノート要点

- 新ナビは段階移行の範囲で出荷可能。
- 完全削除ではなく、rollback 可能状態での前進。

## 記録

- feature flag のデフォルトは ON。
- rollback は `VITE_USE_GLOBAL_NAV_STRIP=false` で即時可能。

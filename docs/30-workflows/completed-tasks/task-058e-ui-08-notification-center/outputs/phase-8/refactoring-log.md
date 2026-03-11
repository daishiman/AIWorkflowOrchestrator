# Phase 8 リファクタ記録

## 実施内容

| 項目                     | 内容                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| focusable selector       | hidden delete button を focus trap 対象から除外した                                        |
| NotificationCenter state | domain state と一時 UI state（delete reveal / bell animation / status message）を分離した  |
| store history sync       | `setNotificationHistory` の重複排除を関数化せず既存 normalize 流れへ統合した               |
| IPC                      | `notification:delete` を既存 notification handler 群へ自然に追加し、`clear` 互換は維持した |

## 非実施

- ファイル分割の追加リファクタは今回見送った
  理由: 現時点で責務境界はテストと state 分離で担保できており、追加分割より screenshot/Phase 12 証跡を優先するため

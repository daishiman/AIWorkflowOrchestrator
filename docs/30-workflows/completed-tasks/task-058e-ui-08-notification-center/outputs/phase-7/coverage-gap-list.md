# Phase 7 カバレッジ不足一覧

## 残留 gap

| ファイル                                                         | 未到達箇所                                                  | 影響 | 対応方針                                                 |
| ---------------------------------------------------------------- | ----------------------------------------------------------- | ---- | -------------------------------------------------------- |
| `src/renderer/components/organisms/NotificationCenter/index.tsx` | invalid timestamp fallback、一部 delete reveal 分岐         | 低   | 手動テストで swipe 質感と併せて確認                      |
| `src/main/ipc/notificationHandlers.ts`                           | sender context 未設定 fallback、clear handler の error path | 低   | 互換経路なので Phase 9 で security/compat 観点として監査 |
| `src/renderer/store/slices/notificationSlice.ts`                 | timestamp fallback の一部分岐                               | 低   | 056c 契約との兼用部のため、必要時に専用 fixture を追加   |

## 判定

- gate は通過している
- 未到達は blocker ではなく低優先の補完候補

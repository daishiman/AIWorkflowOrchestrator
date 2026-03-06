# Phase 5 rollback 計画

## 逆順復旧

1. renderer 変更を戻す
2. preload 変更を戻す
3. main adapter 変更を戻す
4. shared DTO 変更を戻す

## 復旧条件

| 条件               | 対応                                                        |
| ------------------ | ----------------------------------------------------------- |
| Renderer だけ fail | slice / SettingsView / tests のみ戻す                       |
| Preload 契約 fail  | preload/types と preload/index を戻し、main/shared は保持可 |
| Main contract fail | handler adapter を戻し、shared DTO は温存して再実装可       |
| Shared export fail | shared を戻し、他層の import を同時に戻す                   |

## ロールバック時の確認

1. `channels.ts` の channel 名 / whitelist は触っていないことを確認する。
2. `useAuthModeStore` を再導入していないことを確認する。
3. 直近 green だったテスト群だけを再実行して failure 面を切り分ける。

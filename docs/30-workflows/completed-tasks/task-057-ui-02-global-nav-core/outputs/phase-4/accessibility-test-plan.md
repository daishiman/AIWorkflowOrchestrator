# Phase 4 アクセシビリティテスト計画

| 観点                                   | 自動 | 手動 |
| -------------------------------------- | ---- | ---- |
| `navigation` / `group` / `menu` role   | あり | あり |
| `aria-current="page"`                  | あり | あり |
| `aria-expanded` / `aria-haspopup`      | あり | あり |
| Arrow / Home / End / Enter / Space     | あり | あり |
| Escape / outside click / focus restore | あり | あり |
| editable guard                         | あり | あり |
| コントラスト                           | なし | あり |
| 3 モード視認性                         | なし | あり |

## 重点確認

- collapsed で tooltip の accessible name が失われない
- More メニュー open 時に最初の menuitem へ移動する
- More close 後に trigger へ戻る
- mobile bottom nav が main content を覆って操作不能にしない

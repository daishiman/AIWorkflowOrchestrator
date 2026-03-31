# Phase 11: 手動テスト詳細

## 実行コマンド

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer1
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
```

## 実測結果

| レイヤー | 結果                              | 補足                             |
| -------- | --------------------------------- | -------------------------------- |
| Layer 1  | 23 passed / 10 skipped / 2 failed | fail は `SEM-006` のみ           |
| Layer 2  | 7 passed / 3 failed               | fail は 3 画面とも 113px diff    |
| Layer 3  | PASS                              | HTML report と証跡導線を目視確認 |

## 証跡配置

- `screenshots/TC-11-01-chat-main.png`
- `screenshots/TC-11-02-skill-list.png`
- `screenshots/TC-11-03-settings-general.png`
- `screenshots/TC-11-04-sidebar-navigation.png`
- `screenshots/TC-11-05-error-display-current.png`
- `screenshots/TC-11-06-loading-state-current.png`
- `screenshots/TC-11-07-dark-mode-current.png`
- `screenshots/phase11-capture-metadata.json`

## 観察事項

- Layer 1 は false positive を減らした結果、未解消は dialog focus leak のみになった。
- Layer 2 は 3画面で同一規模の diff が出ており、baseline refresh か UI 変更の判断が必要。

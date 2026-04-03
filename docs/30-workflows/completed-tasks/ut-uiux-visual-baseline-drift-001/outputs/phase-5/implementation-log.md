# Phase 5: 実装

## 実施した変更

1. `apps/desktop/playwright.config.ts` の `ui-ux-layer2` に `colorScheme: "dark"` を追加した。
2. `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts` に `test.use({ colorScheme: "dark" })` を追加した。

## 判定

| 項目          | 結果                           |
| ------------- | ------------------------------ |
| 判定結果      | UI変更起因                     |
| baseline 更新 | 既に同期済みのため追加更新不要 |
| UI 修正       | 不要                           |

## 補足

- `git log --follow` では `OnboardingWizard` と snapshots が `51b3fc0c2` で同時更新されている。
- よって、今回の作業は regression 修正ではなく、実行環境の安定化に寄せた設定強化。
- 3 surface 以外の snapshot 変更は発生していない。

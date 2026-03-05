# Phase 6 テスト拡充計画（SubAgent-B）

## 追加観点

- 境界: `event.code === "Comma"` でも settings 解決
- 競合: 編集中ショートカットの無効化
- 回帰: integration allViews サイクルに新規ViewType追加

## 実装済み拡充

- `navContract.test.ts` に境界/競合ケースを追加
- `navigation.integration.test.ts` に新規ViewTypeを追加

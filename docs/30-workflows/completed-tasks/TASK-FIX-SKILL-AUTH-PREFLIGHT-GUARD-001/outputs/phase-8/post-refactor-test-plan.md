# Phase 8 リファクタ後テスト計画

## 再検証順序

1. 型整合: `pnpm --filter @repo/desktop typecheck`
2. 契約境界: Main/Preload テスト
3. UI導線: Hook/View/Store テスト
4. 手動確認: Phase 11 スクリーンショット検証

## 合格条件

- typecheck: exit code 0
- 7ファイル回帰テスト: 全PASS
- 手動検証: 設定誘導導線が視覚確認できる

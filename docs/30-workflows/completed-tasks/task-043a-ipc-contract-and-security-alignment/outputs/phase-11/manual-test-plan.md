# Phase 11 手動テスト計画

## 目的

- UI導線とIPC契約境界が実画面で崩れていないことを確認する。
- エラー表示が `ERR_1001/2004` 方針に整合することを確認する。

## 前提

- 撮影日: 2026-03-05
- 対象画面: `/advanced/skill-center?skipAuth=true`
- 取得スクリプト: `apps/desktop/scripts/capture-task-043a-phase11-screenshots.mjs`

## テスト手順

1. dev server 起動（vite.e2e）
2. TC-11-01〜04 を順に実行
3. 各TCでスクリーンショット取得
4. Apple HIG / WCAG AA 観点で視覚レビュー
5. `manual-test-result.md` に結果を記録

## テストケース

| テストケース | 目的                | 期待結果                                  |
| ------------ | ------------------- | ----------------------------------------- |
| TC-11-01     | import 正常系       | 画面が正常状態で表示される                |
| TC-11-02     | validation エラー   | `ERR_1001` がUIに表示される               |
| TC-11-03     | unauthorized エラー | sender拒否メッセージが表示される          |
| TC-11-04     | チャネル境界        | `import=1, importFromSource=0` が成立する |

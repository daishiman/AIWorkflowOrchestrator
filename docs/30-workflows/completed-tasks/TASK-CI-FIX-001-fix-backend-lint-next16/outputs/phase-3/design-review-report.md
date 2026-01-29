# 設計レビューレポート: TASK-CI-FIX-001

## 1. レビュー結果

| #   | レビュー観点              | 確認内容                                                                | 判定 |
| --- | ------------------------- | ----------------------------------------------------------------------- | ---- |
| 1   | スクリプト変更の妥当性    | `eslint .` コマンドが backend ソースに対して正しく lint を実行する      | PASS |
| 2   | FlatCompat 使用の妥当性   | `@eslint/eslintrc` の FlatCompat がレガシー設定変換として適切           | PASS |
| 3   | eslint-config-next 互換性 | `next/core-web-vitals` が ESLint 9.x flat config で FlatCompat 経由動作 | PASS |
| 4   | ignores 設定の網羅性      | テストファイル・ビルド出力・auto-generated ファイルが適切に除外         | PASS |
| 5   | キャッシュ設定の妥当性    | `.next/cache/eslint/` は .gitignore 対象で適切                          | PASS |
| 6   | ルート設定との非干渉      | ルートの `eslint .` と backend の `eslint .` が独立して動作             | PASS |
| 7   | 依存パッケージの充足      | 全必要パッケージ（eslint, eslint-config-next, @eslint/eslintrc）が既存  | PASS |

## 2. リスク評価

| リスク                                      | 影響度 | 発生確率 | 対策の妥当性                      | 判定     |
| ------------------------------------------- | ------ | -------- | --------------------------------- | -------- |
| FlatCompat 変換で一部ルール欠落             | 中     | 低       | 変換後の設定ダンプで確認可能      | 許容可能 |
| eslint-config-next@16 の flat config 非対応 | 高     | 低       | FlatCompat で変換するため対応可能 | 許容可能 |
| ルート設定とルールの重複                    | 低     | 中       | 各設定のスコープが分離されている  | 許容可能 |

## 3. 補足事項

- ルートの `eslint.config.js` は `**/*.mjs` を ignores に含んでおり、backend の `eslint.config.mjs` はルート lint の対象外
- ルートの lint スクリプト（`eslint .`）は CI の lint ジョブで実行される。backend 独自の `pnpm --filter @repo/backend lint` も動作する必要がある
- 全必要パッケージ（eslint ^9.39.1, eslint-config-next ^16.0.7, @eslint/eslintrc ^3.3.3）は既にインストール済み

## 4. ゲート判定

| 判定 | 理由                                                                 |
| ---- | -------------------------------------------------------------------- |
| PASS | 全7レビュー項目がPASS、リスク3件が全て許容可能レベル。Phase 4 へ進行 |

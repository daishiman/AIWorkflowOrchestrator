# 受け入れ基準: TASK-CI-FIX-001

## 受け入れ基準一覧

| 要件ID | 受け入れ基準                                                              | 検証方法                                                                |
| ------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| FR-01  | `pnpm --filter @repo/backend lint` が `eslint .` を実行し正常終了する     | コマンド実行し exit code 0 を確認                                       |
| FR-02  | `eslint.config.mjs` に eslint-config-next のルールが含まれている          | 設定ファイルの内容を確認                                                |
| FR-03  | backend ソースファイルに Next.js 推奨ルールが適用される                   | `eslint --print-config` で `@next/next/*` ルールの存在を確認            |
| FR-04  | `--cache --cache-location .next/cache/eslint/` オプションが設定されている | `package.json` の `lint` スクリプトを確認                               |
| NFR-01 | GitHub Actions CI の lint ジョブが成功する                                | CI 実行結果を確認                                                       |
| NFR-02 | ルートの `eslint .` 実行結果に変化がない                                  | ルートで `pnpm lint` を実行し正常終了を確認                             |
| NFR-03 | `git commit` 時の lint-staged が正常動作する                              | ファイル変更後 `git commit` を実行し lint-staged が正常に動作するか確認 |

## 検証チェックリスト

- [ ] FR-01: Backend lint コマンド正常終了
- [ ] FR-02: ESLint 設定に eslint-config-next ルール含有
- [ ] FR-03: Next.js 推奨ルール適用確認
- [ ] FR-04: キャッシュオプション設定確認
- [ ] NFR-01: CI lint ジョブ成功
- [ ] NFR-02: ルート lint 非干渉確認
- [ ] NFR-03: lint-staged 正常動作確認

# 受け入れ基準: settings:update ハンドラのディープマージ対応

| ID   | 受け入れ基準                                                                       | 検証方法                                                                                  |
| ---- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| AC-1 | ネストされた設定オブジェクトの部分更新で、同一親キー配下の他フィールドが保持される | テスト TC-01: `{ theme: { color, size } }` に `{ theme: { color } }` 更新後 `size` が保持 |
| AC-2 | 既存テストが全件 PASS                                                              | `pnpm --filter @repo/desktop test:run -- storeHandlers.test.ts` 全件 PASS                 |
| AC-3 | ネストオブジェクト部分更新テストケースが追加されている                             | `storeHandlers.test.ts` に TC-01〜TC-12 が追加済み                                        |
| AC-4 | `any` 型を使用しない                                                               | `pnpm --filter @repo/desktop typecheck` エラーなし                                        |
| AC-5 | 配列フィールドは上書き動作                                                         | テスト TC-03: 配列が結合されず上書きされることを検証                                      |
| AC-6 | 非 plain object payload が拒否される                                               | テスト TC-11: validation error を返し store が更新されないことを検証                      |
| AC-7 | prototype pollution が防止される                                                   | テスト TC-12: 危険キーが保存されず Object.prototype が汚染されないことを検証              |

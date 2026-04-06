# Phase 4: テスト仕様

## AC 対応表

| AC   | テスト/確認手段                                                              | ファイル                                                     |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| AC-1 | `dist/index.js` と `dist/index.cjs` の存在検証                               | `packages/shared/__tests__/build-verification.test.ts`       |
| AC-2 | exports に `require` 条件が存在し `.cjs` 拡張子であることを検証              | `packages/shared/__tests__/build-verification.test.ts`       |
| AC-3 | preload の externalize 設定で `@repo/shared` が exclude に含まれることを検証 | `apps/desktop/__tests__/preload-bundle-verification.test.ts` |
| AC-4 | shared ビルド検証テスト全件 PASS                                             | `pnpm --filter @repo/shared test:run`                        |
| AC-5 | Electron ABI 検査ロジックの存在を検証、afterPack スクリプトの存在検証        | `apps/desktop/__tests__/native-module-verification.test.ts`  |
| AC-6 | desktop ビルド検証テスト全件 PASS                                            | `pnpm --filter @repo/desktop test:run`                       |
| AC-7 | 手動確認（Phase 11）                                                         | —                                                            |
| AC-8 | `pnpm lint`                                                                  | 品質 gate                                                    |
| AC-9 | `pnpm typecheck`                                                             | 品質 gate                                                    |

## テスト一覧

### shared ビルド検証 (8 tests)

1. `dist/index.js` (ESM) が存在する
2. `dist/index.cjs` (CJS) が存在する
3. `dist/index.d.ts` が存在する
4. package.json の全 exports に `require` 条件がある
5. `require` パスが `.cjs` 拡張子である
6. `import` パスと `require` パスの整合性
7. exports に `types` 条件がある
8. `import` と `require` のベース名が一致する

### preload バンドル検証 (5 tests)

1. electron.vite.config.ts が存在する
2. preload セクションで externalizeDepsPlugin に exclude がある
3. exclude に `@repo/shared` が含まれる
4. main セクションには exclude が設定されていない
5. preload の output format が `cjs` である

### native module 検証 (14 tests)

1. setup-native-modules.sh が存在する
2. Electron ABI 検査コードが含まれる
3. ELECTRON_RUN_AS_NODE が使われている
4. rebuild-native-for-electron.mjs が存在する
5. afterPack export がある
6. better-sqlite3 パスの分岐がある
7. electron-builder.yml に afterPack が設定されている
8. desktop package.json に rebuild:electron がある
9. @electron/rebuild が devDependencies にある
   10-14. 各スクリプトの具体的内容検証

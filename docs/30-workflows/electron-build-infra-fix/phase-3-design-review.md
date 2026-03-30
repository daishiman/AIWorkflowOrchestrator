# Phase 3: 設計レビュー

## メタ情報

| 項目      | 内容                                   |
| --------- | -------------------------------------- |
| Phase     | 3                                      |
| 名称      | 設計レビュー                           |
| 前提Phase | Phase 2                                |
| 成果物    | レビュー結果、リスク分析、設計修正事項 |

## 目的

Phase 2 の設計に対してリスク分析・後方互換性確認・エッジケース洗い出しを行い、実装開始前に設計上の問題を検出・修正する。

## 実行タスク

### Task 3-1: 問題A 設計レビュー - CJS デュアル出力の影響

**レビュー観点**: `packages/shared` に CJS 出力を追加した場合の後方互換性

| チェック項目                              | 確認内容                                                                                                   | リスク         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| Web アプリ（`apps/web`）への影響          | `apps/web` は ESM で `@repo/shared` を import している。`exports` の `import` キーが変わらないため影響なし | 低             |
| tsup の `splitting: false` との組み合わせ | CJS + splitting:false は問題なく動作する。ESM の tree-shaking も維持される                                 | なし           |
| dts 出力                                  | `.d.ts` は ESM/CJS 共通。CJS 追加による型定義ファイルの変更はない                                          | なし           |
| ビルド時間の増加                          | CJS 出力が追加されるためビルド時間が約 1.5〜2 倍になる。entry が 42 個あるため最大 10-15 秒の増加          | 低（許容範囲） |
| `dist/` ディレクトリサイズの増加          | CJS ファイルが追加されるためサイズが約 2 倍になる。`.gitignore` で管理されているため問題なし               | なし           |

**判定**: 問題なし。設計変更不要。

### Task 3-2: 問題A 設計レビュー - externalizeDepsPlugin exclude の副作用

**レビュー観点**: `@repo/shared` をバンドルに含めた場合の preload バンドルサイズと依存関係

| チェック項目                            | 確認内容                                                                                                                                | リスク |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| preload バンドルサイズ                  | `@repo/shared` のうち preload が実際に使うのは `src/ipc/channels.ts` の定数定義のみ。tree-shaking により不要なコードは除外される        | なし   |
| `@repo/shared` が依存するサードパーティ | `better-sqlite3`, `@supabase/supabase-js`, `openai` 等が `@repo/shared` の dependencies にある。これらが preload にバンドルされると問題 | **中** |
| Electron contextIsolation との整合      | preload は contextIsolation: true で動作する。バンドルに含まれるコードが Node.js API を使う場合は問題なし                               | なし   |

**MR-01: サードパーティ依存のバンドル回避**

`externalizeDepsPlugin({ exclude: ['@repo/shared'] })` とすると `@repo/shared` のコードはバンドルされるが、`@repo/shared` が依存するサードパーティ（`better-sqlite3` 等）は依然として external のまま残る。これは `externalizeDepsPlugin` がパッケージの dependencies を再帰的に external 化する動作による。

ただし、preload の `channels.ts` は `@repo/shared/src/ipc/channels` のみを import しており、このモジュールはサードパーティ依存を持たない純粋な定数定義ファイルである。tree-shaking により `better-sqlite3` 等のコードはバンドルに含まれない。

**検証方法**: Phase 5 実装後に `out/preload/index.js` のファイルサイズと `require()` の残留を grep で確認する。

**判定**: リスクは存在するが、tree-shaking で回避可能。Phase 5 実装後に検証する。

### Task 3-3: 問題A 設計レビュー - CJS exports 追加の網羅性

**レビュー観点**: `packages/shared/package.json` の 37 個の exports エントリ全てに `require` を追加する際のミス防止

**対策**:

1. Phase 4 でテストを作成し、全 exports エントリに `require` キーが存在することを検証する
2. `require` キーの値が `.cjs` 拡張子で終わることを検証する
3. 対応する `.cjs` ファイルが `dist/` に存在することをビルド後に検証する

**判定**: テストで網羅性を保証する。

### Task 3-4: 問題B 設計レビュー - @electron/rebuild の実行タイミング

**レビュー観点**: `postinstall` でのリビルド実行が CI 環境や Web 開発者に影響しないか

| チェック項目           | 確認内容                                                                                                                                                                                                                          | リスク |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| CI 環境での実行        | CI では `pnpm install` 後に `postinstall` が実行される。Electron がインストールされていれば問題なし                                                                                                                               | 低     |
| Web 開発者への影響     | `apps/desktop/package.json` の `postinstall` は `pnpm install --filter @repo/desktop` 実行時のみ発火する。root の `pnpm install` では `apps/desktop` の postinstall も実行されるが、Electron がインストールされているため問題なし | 低     |
| postinstall の実行時間 | `electron-rebuild -f -w better-sqlite3` は約 10-30 秒。`pnpm install` の一部として許容範囲                                                                                                                                        | 低     |

**MR-02: Electron 未インストール時のフォールバック**

`electron-rebuild` は Electron パッケージの存在に依存する。`apps/desktop` の devDependencies に `electron` が含まれているため、`pnpm install` 後には Electron がインストール済みである。

ただし、`scripts/setup-native-modules.sh` を root から実行する場合、Electron がまだインストールされていない可能性がある。スクリプト内で Electron の存在チェックを行い、未インストール時はスキップする。

```bash
if ! npx electron --version >/dev/null 2>&1; then
  echo "Electron is not installed. Skipping Electron-specific rebuild."
  # Node.js 向けリビルドにフォールバック
  pnpm rebuild better-sqlite3
fi
```

**判定**: MR-02 を設計に反映する。

### Task 3-5: 問題B 設計レビュー - afterPack フックの動作確認

**レビュー観点**: `electron-builder` の `afterPack` フックが ESM スクリプトを正しく実行できるか

| チェック項目                           | 確認内容                                                                                                                      | リスク |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------ |
| ESM スクリプトの実行                   | `electron-builder` v26 は `.mjs` ファイルを ESM として実行できる                                                              | なし   |
| `@electron/rebuild` の `rebuild()` API | `rebuild({ buildPath, electronVersion, arch, force, onlyModules })` は公式 API。ドキュメントに記載あり                        | なし   |
| context オブジェクトの構造             | `context.appOutDir`, `context.electronVersion`, `context.arch` は electron-builder v26 の `AfterPackContext` の正式フィールド | なし   |

**判定**: 問題なし。

### Task 3-6: リスクサマリ

| リスク ID | 内容                                                               | 深刻度 | 対策                                                                |
| --------- | ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------- |
| MR-01     | preload バンドルにサードパーティ依存が混入する可能性               | 中     | tree-shaking で回避。Phase 5 で `out/preload/index.js` の内容を検証 |
| MR-02     | Electron 未インストール時に setup-native-modules.sh がエラーになる | 低     | Electron 存在チェックを追加してフォールバック                       |

### Task 3-7: 設計修正事項まとめ

| 修正 ID | 対象 Phase/Task  | 修正内容                                                                 |
| ------- | ---------------- | ------------------------------------------------------------------------ |
| FIX-01  | Phase 2 Task 2-5 | `setup-native-modules.sh` に Electron 存在チェックとフォールバックを追加 |
| FIX-02  | Phase 4          | exports の `require` キー網羅性テストを追加                              |
| FIX-03  | Phase 5          | `out/preload/index.js` のサードパーティ依存残留チェックを実装後に実施    |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                       | パス                                   |
| ---------------------------- | -------------------------------------- |
| セキュリティ（Electron IPC） | `references/security-electron-ipc.md`  |
| 開発ガイドライン             | `references/development-guidelines.md` |

## 成果物

| 成果物           | 配置先                                   | 説明                 |
| ---------------- | ---------------------------------------- | -------------------- |
| 設計レビュー結果 | `phase-3-design-review.md`（本ファイル） | リスク分析と設計修正 |

## 完了条件

- [ ] 問題A の設計レビュー（Task 3-1〜3-3）が完了し、リスクが評価されている
- [ ] 問題B の設計レビュー（Task 3-4〜3-5）が完了し、リスクが評価されている
- [ ] リスクサマリ（MR-01, MR-02）が記録されている
- [ ] 設計修正事項（FIX-01〜FIX-03）が特定され、対象 Phase に反映指示が出ている
- [ ] **本Phase内の全タスクを100%実行完了**

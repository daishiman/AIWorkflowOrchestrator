# Phase 2: 設計

## メタ情報

| 項目      | 内容                                             |
| --------- | ------------------------------------------------ |
| Phase     | 2                                                |
| 名称      | 設計                                             |
| 前提Phase | Phase 1                                          |
| 成果物    | 問題A/B の修正設計書、変更ファイル一覧、実装順序 |

## 目的

Phase 1 で確定した要件（REQ-A1〜A5、REQ-B1〜B5）に対する具体的な設計を行い、変更対象ファイルごとのコード変更方針を確定する。

## 実行トポロジー

| レーン | 対象                                                                                                                                                                            | 独立性         | 合流点                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------- |
| A      | `packages/shared/tsup.config.ts` / `packages/shared/package.json` / `apps/desktop/electron.vite.config.ts`                                                                      | B と並列実行可 | Phase 4 の Red テストで preload / exports / bundle を統合確認 |
| B      | `apps/desktop/package.json` / `scripts/setup-native-modules.sh` / `apps/desktop/electron-builder.yml` / `package.json` / `apps/desktop/scripts/rebuild-native-for-electron.mjs` | A と並列実行可 | Phase 4/6/11 の native rebuild 系テストと手動起動確認         |

## 検証パス

1. Phase 4 で Red テストを作成する
2. Phase 5 でレーン A/B を独立に実装する
3. Phase 6 でエッジケースを補強する
4. Phase 7 で要件カバレッジを集計する
5. Phase 9 で lint / typecheck / test / build を通す
6. Phase 11 で Electron 起動と ABI を確認する

## 実行タスク

### Task 2-1: 問題A 設計 - shared パッケージの CJS デュアル出力

**対象ファイル**: `packages/shared/tsup.config.ts`

**変更内容**: `format` を `["esm"]` から `["esm", "cjs"]` に変更する。

```typescript
// packages/shared/tsup.config.ts
export default defineConfig({
  // ... entry は変更なし ...
  format: ["esm", "cjs"], // 変更: ESM + CJS デュアル出力
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: "dist",
  target: "es2022",
  treeshake: true,
});
```

**出力結果**:

- 変更前: `dist/src/ipc/channels.js`（ESM のみ）
- 変更後: `dist/src/ipc/channels.js`（ESM）+ `dist/src/ipc/channels.cjs`（CJS）

**検証コマンド**: `pnpm --filter @repo/shared build && ls packages/shared/dist/src/ipc/channels.*`

### Task 2-2: 問題A 設計 - shared パッケージの exports に require 追加

**対象ファイル**: `packages/shared/package.json`

**変更方針**: 全 exports エントリに `require` キーを追加する。パターンは以下の通り：

```json
{
  "./src/ipc/channels": {
    "types": "./dist/src/ipc/channels.d.ts",
    "import": "./dist/src/ipc/channels.js",
    "require": "./dist/src/ipc/channels.cjs"
  }
}
```

**全エントリへの適用ルール**:

- 既存の `import` キーの値が `./dist/xxx.js` の場合、`require` キーの値は `./dist/xxx.cjs` とする
- `types` キーは変更しない（`.d.ts` は ESM/CJS 共通）
- エントリ数は現在 34 個。全てに `require` を追加する

### Task 2-3: 問題A 設計 - electron.vite.config.ts の preload 設定修正

**対象ファイル**: `apps/desktop/electron.vite.config.ts`

**変更箇所**: preload セクション（L39-56）の `externalizeDepsPlugin()` 呼び出し

**変更内容**:

```typescript
preload: {
  plugins: [
    externalizeDepsPlugin({ exclude: ['@repo/shared'] }),
    tsconfigPaths({ projects: [sharedTsconfig] }),
  ],
  build: {
    outDir: "out/preload",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/preload/index.ts"),
      },
      output: {
        format: "cjs",
        entryFileNames: "[name].js",
      },
    },
  },
},
```

**設計判断**: `@repo/shared` を external から除外してバンドルに含めることで、preload スクリプトが `@repo/shared` の CJS エクスポートに依存することなく、直接バンドル内にコードが展開される。これにより CJS/ESM の相互運用問題を根本的に回避する。

**main セクションも同様に修正する**:

```typescript
main: {
  plugins: [
    externalizeDepsPlugin({ exclude: ['@repo/shared'] }),
    tsconfigPaths({ projects: [sharedTsconfig] }),
  ],
  // ... 以下変更なし
},
```

main プロセスでも同じ問題が潜在するため、予防的に `@repo/shared` をバンドルに含める。

### Task 2-4: 問題B 設計 - @electron/rebuild 導入

**対象ファイル**: `apps/desktop/package.json`

**変更内容**: devDependencies に `@electron/rebuild` を追加する。

```bash
pnpm --filter @repo/desktop add -D @electron/rebuild
```

追加後の `apps/desktop/package.json` scripts / devDependencies セクション:

```json
{
  "scripts": {
    "rebuild:electron": "ELECTRON_ARCH=$(ELECTRON_RUN_AS_NODE=1 electron -p 'process.arch') && electron-rebuild -f -w better-sqlite3 -m ../../packages/shared -a \"$ELECTRON_ARCH\""
  },
  "devDependencies": {
    "@electron/rebuild": "^4.0.3"
  }
}
```

**設計判断**:

- desktop package には `postinstall` を置かず、root `postinstall` を唯一の bootstrap owner とする
- `rebuild:electron` は手動復旧・個別確認用の明示コマンドとして残す

**`rebuild:electron` のオプション説明**:

- `-f`: 強制リビルド（キャッシュを無視）
- `-w better-sqlite3`: better-sqlite3 のみをリビルド対象にする
- `-m ../../packages/shared`: workspace shared 配下の `better-sqlite3` を対象にする
- `-a "$ELECTRON_ARCH"`: Electron 実行アーキテクチャを明示する

### Task 2-5: 問題B 設計 - setup-native-modules.sh の Electron 対応

**対象ファイル**: `scripts/setup-native-modules.sh`

**変更方針**: 既存の Node.js 向けリビルドロジックに加え、root からでも desktop workspace を正しく参照できる Electron 向け検証 / 必要時のみのリビルドモードを追加する。

**主要な変更点**:

1. `desktop_exec()` / `desktop_electron_as_node_exec()` を追加して desktop workspace に CWD を固定する
2. Electron の ABI / arch を取得し、既存バイナリが Electron コンテキストで読めるかを先に検証する
3. 読めない場合だけ `electron-rebuild -f -w better-sqlite3 -m ../../packages/shared -a "$ELECTRON_ARCH"` を実行する
4. リビルド後の検証を Electron ランタイムで再実行する

```bash
desktop_exec() { pnpm --dir "$DESKTOP_DIR" exec "$@"; }
desktop_electron_as_node_exec() {
  ELECTRON_RUN_AS_NODE=1 pnpm --dir "$DESKTOP_DIR" exec electron "$@";
}

if desktop_exec electron --version >/dev/null 2>&1; then
  ELECTRON_ABI=$(desktop_electron_as_node_exec -p "process.versions.modules")
  ELECTRON_ARCH=$(desktop_electron_as_node_exec -p "process.arch")

  if ! verify_sqlite_with_electron; then
    desktop_exec electron-rebuild -f -w better-sqlite3 -m "$SHARED_WORKSPACE_DIR" -a "$ELECTRON_ARCH"
  fi
fi
```

### Task 2-6: 問題B 設計 - electron-builder.yml の afterPack フック

**対象ファイル**: `apps/desktop/electron-builder.yml`

**変更内容**: `afterPack` フックを追加し、本番ビルド時にネイティブモジュールをリビルドする。

```yaml
# 本番ビルド用ネイティブモジュールリビルド
afterPack: scripts/rebuild-native-for-electron.mjs
```

**新規ファイル**: `apps/desktop/scripts/rebuild-native-for-electron.mjs`

```javascript
// apps/desktop/scripts/rebuild-native-for-electron.mjs
import { rebuild } from "@electron/rebuild";

export default async function afterPack(context) {
  const { appOutDir, electronPlatformName, arch } = context;
  await rebuild({
    buildPath: appOutDir,
    electronVersion: context.electronVersion,
    arch,
    force: true,
    onlyModules: ["better-sqlite3"],
  });
}
```

### Task 2-7: 問題B 設計 - root package.json の postinstall を唯一の owner にする

**対象ファイル**: `package.json`（root）

**現行**:

```json
"postinstall": "bash scripts/setup-native-modules.sh || pnpm rebuild better-sqlite3 || true"
```

**変更後**:

```json
"postinstall": "bash scripts/setup-native-modules.sh"
```

`setup-native-modules.sh` 内で Electron 向け検証・必要時のみのリビルド・esbuild 再構築まで扱うため、root `postinstall` を唯一の bootstrap owner とする。desktop package には `postinstall` を追加しない。

### Task 2-8: 実装順序の確定

| 順序 | 対象                                                     | 要件ID         | 依存関係         |
| ---- | -------------------------------------------------------- | -------------- | ---------------- |
| 1    | `packages/shared/tsup.config.ts` に CJS 追加             | REQ-A1         | なし             |
| 2    | `packages/shared/package.json` に require エントリ追加   | REQ-A2         | 順序 1 完了後    |
| 3    | `electron.vite.config.ts` preload/main の exclude 追加   | REQ-A3, REQ-A4 | 順序 1, 2 と独立 |
| 4    | `@electron/rebuild` を devDependency 追加                | REQ-B1         | なし             |
| 5    | `scripts/setup-native-modules.sh` を Electron 対応に修正 | REQ-B2         | 順序 4 完了後    |
| 6    | `apps/desktop/package.json` に `rebuild:electron` 追加   | REQ-B3         | 順序 4, 5 完了後 |
| 7    | `electron-builder.yml` に afterPack 追加                 | REQ-B4         | 順序 4 完了後    |
| 8    | root `package.json` の postinstall owner 固定            | 補助           | 順序 5 完了後    |

問題A（順序 1-3）と問題B（順序 4-8）は並行実装可能。

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名                          | パス                                   |
| ------------------------------- | -------------------------------------- |
| Electron サービスアーキテクチャ | `references/arch-electron-services.md` |
| デプロイ設定                    | `references/deployment-electron.md`    |
| 技術スタック（デスクトップ）    | `references/technology-desktop.md`     |

### 外部ドキュメント

| 資料名                              | URL                                                            |
| ----------------------------------- | -------------------------------------------------------------- |
| electron-vite externalizeDepsPlugin | https://electron-vite.org/guide/dev#externalize-deps           |
| @electron/rebuild                   | https://github.com/electron/rebuild                            |
| tsup format オプション              | https://tsup.egoist.dev/#bundle-formats                        |
| Node.js ESM/CJS 相互運用            | https://nodejs.org/api/esm.html#interoperability-with-commonjs |

## 統合テスト連携

- Phase 4/6 の build guard tests が本設計の contract を固定する
- Phase 11 では root `postinstall` / Electron ABI / dev 起動を実測する

## 成果物

| 成果物 | 配置先                            | 説明               |
| ------ | --------------------------------- | ------------------ |
| 設計書 | `phase-2-design.md`（本ファイル） | 問題A/B の修正設計 |

## 完了条件

- [ ] 問題A の修正設計（Task 2-1〜2-3）が確定し、変更前後のコードが記述されている
- [ ] 問題B の修正設計（Task 2-4〜2-7）が確定し、変更前後のコードが記述されている
- [ ] 実装順序（Task 2-8）が確定し、依存関係が明記されている
- [ ] 新規作成ファイル `apps/desktop/scripts/rebuild-native-for-electron.mjs` の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

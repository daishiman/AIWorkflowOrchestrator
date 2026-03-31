# Implementation Guide: Electron ビルドインフラ修正

## Part 1: 概念説明（初学者向け）

### なぜこの修正が必要だったのか

なぜ必要かを先に言うと、`pnpm install` の直後に Electron アプリを起動しても、shared の読み込みや `better-sqlite3` の部品サイズ違いで落ちない状態にするためです。何をするかはその次で、shared の出力形式とネイティブモジュール bootstrap のやり方を揃えました。

Electron アプリは、3つの役割に分かれて動きます。

- **Main**: 裏方。ファイルやデータベースを触る
- **Preload**: Main と画面の間をつなぐ橋
- **Renderer**: 画面そのもの

たとえば、レストランで考えると、Main は厨房、Renderer は客席、Preload は注文を運ぶスタッフです。厨房と客席が勝手に直接やり取りすると危ないので、Preload が安全に橋渡しします。

今回の問題は2つありました。

### 問題A: Preload が shared を読めない

共有ライブラリ `@repo/shared` は新しい書き方の JavaScript だけで出力されていました。一方で Preload は昔からある `require()` 方式で動きます。つまり、橋渡し役だけ別の言葉で話していて、共有ライブラリを読めない状態でした。

**修正方針**:

- shared を 2 つの形式で出力する
- Preload 側には shared の必要部分を直接まとめて入れる

これで Preload が `@repo/shared` を実行時に探しに行かず、その場で使えるようになりました。

### 問題B: better-sqlite3 のサイズが合っていない

`better-sqlite3` は普通の JavaScript ではなく、機械向けに組み立てる部品です。この部品は、Node.js 用に作ったものと Electron 用に作ったものが同じとは限りません。

スマホケースで考えると分かりやすいです。見た目が似ていても、iPhone 用ケースを Android に付けることはできません。今回も同じで、Node.js 向けに作られた部品を Electron が使おうとして失敗していました。

**修正方針**:

- `pnpm install` 時に root の `postinstall` でネイティブモジュール確認を実行する
- Electron でそのまま読めるなら再利用する
- 読めないときだけ Electron 向けに組み直す
- 配布ビルドでは `afterPack` でも再ビルドする

### 今回の到達点

- `pnpm install` が成功し、Electron 向け確認まで自動で終わる
- `pnpm --filter @repo/desktop dev` が `start electron app...` まで進み、起動直後に preload / ABI エラーが出ない
- Electron コンテキストで `better-sqlite3` を実際に読み込める

## Part 2: 技術的詳細

### 変更ファイル一覧

| ファイル                                               | 変更種別 | 目的                                                          |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------- |
| `packages/shared/tsup.config.ts`                       | 修正     | ESM + CJS デュアル出力                                        |
| `packages/shared/package.json`                         | 修正     | 34 exports に `require` を追加                                |
| `apps/desktop/electron.vite.config.ts`                 | 修正     | main / preload で `@repo/shared` をバンドル対象に変更         |
| `apps/desktop/package.json`                            | 修正     | `@electron/rebuild` 追加、`rebuild:electron` を明示コマンド化 |
| `scripts/setup-native-modules.sh`                      | 修正     | root から desktop workspace を固定して Electron 検証 / 再構築 |
| `apps/desktop/scripts/rebuild-native-for-electron.mjs` | 新規     | `afterPack` で配布物向け再ビルド                              |
| `apps/desktop/electron-builder.yml`                    | 修正     | `afterPack` フック追加                                        |
| `package.json`                                         | 修正     | root `postinstall` を bootstrap owner に固定                  |

### 問題A: shared / preload の契約修正

#### current contract

```ts
// packages/shared/tsup.config.ts
format: ["esm"];

// packages/shared/package.json
"./src/ipc/channels": {
  "types": "./dist/src/ipc/channels.d.ts",
  "import": "./dist/src/ipc/channels.js"
}

// apps/desktop/electron.vite.config.ts
externalizeDepsPlugin(); // @repo/shared が runtime require として残る
```

#### target delta

```ts
// packages/shared/tsup.config.ts
format: ["esm", "cjs"];

// packages/shared/package.json
"./src/ipc/channels": {
  "types": "./dist/src/ipc/channels.d.ts",
  "require": "./dist/src/ipc/channels.cjs",
  "import": "./dist/src/ipc/channels.js"
}

// apps/desktop/electron.vite.config.ts
const createSharedPlugins = () => [
  externalizeDepsPlugin({ exclude: ["@repo/shared"] }),
  tsconfigPaths({ projects: [sharedTsconfig] }),
];
```

#### 検証ポイント

- `packages/shared/dist/src/ipc/channels.cjs` が存在する
- `apps/desktop/out/preload/index.js` に `require("@repo/shared")` が残っていない
- preload バンドルサイズが `56.77 kB` で、shared の必要部分だけが取り込まれている

### 問題B: ネイティブモジュール bootstrap の所有権修正

#### current contract

```json
// package.json
"postinstall": "bash scripts/setup-native-modules.sh || pnpm rebuild better-sqlite3 || true"
```

```json
// apps/desktop/package.json
{
  "scripts": {
    "rebuild:native": "pnpm rebuild better-sqlite3 && pnpm rebuild esbuild"
  }
}
```

#### target delta

```json
// package.json
"postinstall": "bash scripts/setup-native-modules.sh"
```

```json
// apps/desktop/package.json
{
  "scripts": {
    "rebuild:native": "pnpm rebuild better-sqlite3 && pnpm rebuild esbuild",
    "rebuild:electron": "ELECTRON_ARCH=$(ELECTRON_RUN_AS_NODE=1 electron -p 'process.arch') && electron-rebuild -f -w better-sqlite3 -m ../../packages/shared -a \"$ELECTRON_ARCH\""
  },
  "devDependencies": {
    "@electron/rebuild": "^4.0.3"
  }
}
```

#### 実装シグネチャ

```ts
import type { AfterPackContext } from "electron-builder";

export default async function afterPack(
  context: AfterPackContext,
): Promise<void> {
  // ...
}
```

#### root bootstrap スクリプトの要点

```bash
desktop_exec() { pnpm --dir "$DESKTOP_DIR" exec "$@"; }
desktop_electron_as_node_exec() {
  ELECTRON_RUN_AS_NODE=1 pnpm --dir "$DESKTOP_DIR" exec electron "$@";
}

rebuild_for_electron() {
  if desktop_exec electron --version >/dev/null 2>&1; then
    ELECTRON_ARCH=$(desktop_electron_as_node_exec -p "process.arch")

    if ! verify_sqlite_with_electron; then
      desktop_exec electron-rebuild -f -w better-sqlite3 -m "$SHARED_WORKSPACE_DIR" -a "$ELECTRON_ARCH"
    fi
  else
    rebuild_for_nodejs
  fi
}
```

#### `rebuild:electron` の設定値

| 項目                     | 値                      | 役割                                                    |
| ------------------------ | ----------------------- | ------------------------------------------------------- |
| `-f`                     | true                    | キャッシュを無視して強制再構築                          |
| `-w`                     | `better-sqlite3`        | 対象モジュールを限定                                    |
| `-m`                     | `../../packages/shared` | workspace shared 配下のネイティブ依存を指す             |
| `-a`                     | `process.arch`          | Electron 実行アーキテクチャを固定                       |
| `ELECTRON_RUN_AS_NODE=1` | 有効                    | Electron 本体を Node 互換モードで使い ABI / arch を取る |

### 使用例

```bash
# root install 後に手動で Electron 向け再構築だけやり直す
pnpm --filter @repo/desktop run rebuild:electron

# Electron ABI を確認する
ELECTRON_RUN_AS_NODE=1 pnpm --filter @repo/desktop exec electron -p "process.versions.modules"
```

### 設定項目と定数一覧

| 名前                   | 種別             | 値 / 由来            | 役割                              |
| ---------------------- | ---------------- | -------------------- | --------------------------------- |
| `DESKTOP_DIR`          | shell 変数       | `apps/desktop`       | desktop workspace 固定            |
| `SHARED_WORKSPACE_DIR` | shell 変数       | `packages/shared`    | shared 配下の native module 解決  |
| `ELECTRON_RUN_AS_NODE` | 環境変数         | `1`                  | Electron から ABI / arch を取得   |
| `ELECTRON_ARCH`        | shell 変数       | `process.arch`       | `electron-rebuild` の target arch |
| `onlyModules`          | afterPack option | `["better-sqlite3"]` | 再構築対象の限定                  |

### afterPack フック

```ts
import { rebuild } from "@electron/rebuild";

export default async function afterPack(context: AfterPackContext) {
  const { appOutDir, arch } = context;

  try {
    await rebuild({
      buildPath: appOutDir,
      electronVersion: context.electronVersion,
      arch,
      force: true,
      onlyModules: ["better-sqlite3"],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `[afterPack] Native module rebuild failed for ${appOutDir}: ${message}`,
    );
  }
}
```

### エラーハンドリングとエッジケース

| ケース                                     | 対応                                             |
| ------------------------------------------ | ------------------------------------------------ |
| root から `electron` を呼ぶと CWD がずれる | `pnpm --dir apps/desktop exec ...` に固定        |
| Electron 未インストール                    | Node.js 向け検証へフォールバック                 |
| 既存バイナリが既に Electron 互換           | 再ビルドせず再利用                               |
| 配布ビルド時だけ壊れる                     | `afterPack` で再ビルド                           |
| `@electron/rebuild` 失敗時                 | `appOutDir` を含む文脈付きエラーで失敗箇所を明示 |

### 検証結果

| コマンド / 観測                                                                                   | 結果                                                   |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `pnpm --filter @repo/shared exec npx vitest run src/__tests__/build/`                             | 7 PASS                                                 |
| `pnpm --filter @repo/desktop exec npx vitest run src/__tests__/build/`                            | 23 PASS                                                |
| `pnpm --filter @repo/shared build`                                                                | 成功                                                   |
| `pnpm --filter @repo/desktop build`                                                               | 成功                                                   |
| `pnpm lint`                                                                                       | 0 errors, 10 warnings                                  |
| `pnpm typecheck`                                                                                  | 0 errors                                               |
| `node -p "process.versions.modules"`                                                              | `127`                                                  |
| `ELECTRON_RUN_AS_NODE=1 pnpm --filter @repo/desktop exec electron -p "process.versions.modules"`  | `140`                                                  |
| `ELECTRON_RUN_AS_NODE=1 pnpm --filter @repo/desktop exec electron -e "require('better-sqlite3')"` | `OK: better-sqlite3 loaded`                            |
| `grep -c 'require.*@repo/shared' apps/desktop/out/preload/index.js`                               | `0`                                                    |
| `pnpm install`                                                                                    | root `postinstall` 成功、Electron コンテキスト検証成功 |
| `pnpm --filter @repo/desktop dev`                                                                 | `start electron app...` まで到達、起動直後エラーなし   |

Phase 11 の補助証跡は `docs/30-workflows/electron-build-infra-fix/outputs/phase-11/screenshot-plan.json` と `docs/30-workflows/electron-build-infra-fix/outputs/phase-11/screenshots/phase11-runtime-evidence.png` に保存した。

### まとめ

- 問題Aは「shared の出力形式」と「preload の取り込み方」を両方直して閉じた
- 問題Bは「いつ rebuild するか」ではなく「誰が bootstrap を所有するか」を整理して閉じた
- root `postinstall` が自動 bootstrap、desktop `rebuild:electron` が明示復旧、`afterPack` が配布物保険、という三層構成に整理できた

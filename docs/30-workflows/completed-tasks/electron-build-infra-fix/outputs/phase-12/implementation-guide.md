# Implementation Guide: Electron ビルドインフラ修正

## Part 1: 概要（中学生レベル）

### なぜ必要だったの？

この修正は、「アプリの中身は合っているのに、起動するための土台がずれていた」問題を直すために必要でした。

たとえると、教室の鍵は合っているのに、

- 入口のドアが別の鍵穴の形をしている
- 電源プラグの形がコンセントと合っていない

という 2 つのズレが同時に起きていた状態です。

今回のタスクは、画面を作り直したのではなく、
「入口の形式」と「電源のつなぎ方」を合わせて、起動できる状態へ戻す作業です。

### 何を直したの？

Electron デスクトップアプリが起動できなかった2つの問題を修正しました。

**問題1: モジュールの形式が合わなかった**

パソコンのプログラムには「話す言葉」のような形式があります。
`packages/shared` パッケージは「ESM」という新しい形式だけで出力していましたが、
Electron の preload（セキュリティの門番のようなもの）は「CJS」という古い形式しか理解できませんでした。
そこで、shared パッケージが「ESM」と「CJS」の両方の形式で出力するように変更しました。

**問題2: ネイティブモジュールのバージョンが違った**

`better-sqlite3`（データベースのライブラリ）は C++ で書かれた部品を使います。
この部品は Node.js 用にビルドされていましたが、Electron は別のバージョンを使うため、
「バージョンが違う！」とエラーになっていました。
そこで、Electron 用に自動で再ビルドする仕組みを整備しました。さらに packaging 後にも再ビルドされるようにして、配布物でも同じ問題が出にくいようにしました。

### どう使うの？

```bash
# 通常の開発起動
pnpm --filter @repo/desktop dev

# Electron 用に better-sqlite3 を再ビルド（ABI エラーが出たとき）
pnpm --filter @repo/desktop run rebuild:electron

# 全ネイティブモジュールのセットアップ（install 時に自動実行される）
bash scripts/setup-native-modules.sh
```

### 画面の証跡はあるの？

あります。ただしこのタスクは UI を変えていないので、Phase 11 では画像比較ではなく、NON_VISUAL 判定として「UI 差分なし」という判断根拠を review-board 証跡で残しています。

- 手動確認ログ: `outputs/phase-11/manual-test-result.md`
- NON_VISUAL 判定: `outputs/phase-11/screenshot-plan.json`
- 代表証跡 PNG: `outputs/phase-11/screenshots/phase11-build-infra-review-board.png`
- 補助 metadata: `outputs/phase-11/phase11-capture-metadata.json`

---

## Part 2: 技術詳細

### 変更の中心

- `@repo/shared` を ESM/CJS dual output にして preload の CJS 実行条件と揃えた
- preload では `@repo/shared` を外部依存にせず bundle に含めるようにした
- Node ABI だけでなく Electron ABI でも better-sqlite3 を検査する導線を追加した
- packaged app 向け afterPack rebuild を追加した
- `context.arch` の enum 値を electron-rebuild CLI が受け取れる arch 文字列へ正規化した

### 変更ファイル一覧

| ファイル                                               | 変更内容                                                                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json` (root)                                  | `@esbuild/darwin-x64` と `@rollup/rollup-darwin-x64` を devDeps から削除。tsup/vite が使う esbuild/rollup と platform binary のバージョン衝突を解消 |
| `packages/shared/tsup.config.ts`                       | `format: ["esm"]` → `format: ["esm", "cjs"]`。dual output により CJS 消費者（preload）にも対応                                                      |
| `packages/shared/package.json`                         | 全34 exports エントリに `"require": "./dist/xxx.cjs"` 条件を追加                                                                                    |
| `apps/desktop/electron.vite.config.ts`                 | preload の `externalizeDepsPlugin()` → `externalizeDepsPlugin({ exclude: ["@repo/shared"] })`。shared をバンドルに含めることで外部 require を排除   |
| `apps/desktop/package.json`                            | `rebuild:electron` スクリプト追加。`@electron/rebuild` を devDeps に追加                                                                            |
| `scripts/setup-native-modules.sh`                      | Electron ABI 検査ブロックを追加。pnpm strict resolution 対応で絶対パスによる require テスト                                                         |
| `apps/desktop/electron-builder.yml`                    | `afterPack: scripts/rebuild-native-for-electron.mjs` を追加                                                                                         |
| `apps/desktop/scripts/rebuild-native-for-electron.mjs` | afterPack hook: パッケージング時に better-sqlite3 を Electron ABI で再ビルド。electron-builder の arch enum を electron-rebuild 用文字列に正規化    |
| `apps/desktop/scripts/rebuild-sqlite-for-electron.mjs` | 開発用: Electron バイナリの arch を自動検出して electron-rebuild を実行                                                                             |

### テストファイル

| ファイル                                                     | テスト数 | 内容                                              |
| ------------------------------------------------------------ | -------- | ------------------------------------------------- |
| `packages/shared/__tests__/build-verification.test.ts`       | 8        | dual output 存在確認、exports 整合性              |
| `apps/desktop/__tests__/preload-bundle-verification.test.ts` | 5        | externalize exclude 設定確認                      |
| `apps/desktop/__tests__/native-module-verification.test.ts`  | 15       | ABI 関連設定・スクリプト存在確認、arch 正規化回帰 |

### 主要インターフェース / シグネチャ

```ts
// apps/desktop/scripts/rebuild-native-for-electron.mjs
export function normalizeElectronBuilderArch(
  arch: number | string | undefined,
): "x64" | "arm64" | "ia32" | NodeJS.Architecture;

export default async function afterPack(context: {
  appOutDir: string;
  electronPlatformName: string;
  arch?: number | string;
}): Promise<void>;
```

```ts
// apps/desktop/scripts/rebuild-sqlite-for-electron.mjs
function detectElectronArch(): "x64" | "arm64" | NodeJS.Architecture;
```

### 実行コマンド

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/shared exec vitest run __tests__/build-verification.test.ts
pnpm --filter @repo/desktop exec vitest run __tests__/preload-bundle-verification.test.ts __tests__/native-module-verification.test.ts
pnpm --filter @repo/desktop run rebuild:electron
```

### 設定項目と定数一覧

| 項目                                      | 現在値 / 由来                                         | 役割                                     |
| ----------------------------------------- | ----------------------------------------------------- | ---------------------------------------- | --------------------------- | --- | ----- | -------------------------- |
| `packages/shared/tsup.config.ts` `format` | `["esm", "cjs"]`                                      | shared dual output                       |
| preload externalize exclude               | `["@repo/shared"]`                                    | preload から shared を bundle 内へ含める |
| root `postinstall`                        | `bash scripts/setup-native-modules.sh                 |                                          | pnpm rebuild better-sqlite3 |     | true` | 初回セットアップの自動復旧 |
| desktop `rebuild:native`                  | `pnpm rebuild better-sqlite3 && pnpm rebuild esbuild` | Node 側 native toolchain 復旧            |
| desktop `rebuild:electron`                | `node scripts/rebuild-sqlite-for-electron.mjs`        | Electron ABI rebuild                     |
| electron-builder `afterPack`              | `scripts/rebuild-native-for-electron.mjs`             | packaged app の native rebuild           |

### エッジケース

| ケース                                   | 対応                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| Rosetta 2 (x64 Node.js + arm64 Electron) | `rebuild-sqlite-for-electron.mjs` が Electron バイナリから arch を自動検出        |
| pnpm strict module resolution            | `setup-native-modules.sh` が `find` で絶対パスを取得して `require`                |
| CI で Electron がない場合                | `setup-native-modules.sh` が Electron 未検出時にスキップ                          |
| worktree 環境                            | postinstall で `setup-native-modules.sh` が自動実行                               |
| packaged app                             | `afterPack` hook が unpacked `node_modules` を対象に `@electron/rebuild` を再実行 |
| electron-builder arch enum               | `normalizeElectronBuilderArch()` が `1 -> x64`, `3 -> arm64` に正規化             |

### エラーハンドリング

- `setup-native-modules.sh`
  - Electron バイナリが無い場合はスキップする
  - better-sqlite3 のロード失敗時は `rebuild:electron` を案内または実行する
- `rebuild-native-for-electron.mjs`
  - unpacked resources に `better-sqlite3` が無ければ rebuild をスキップする
  - rebuild 失敗時は packaging を fail fast させる
- `rebuild-sqlite-for-electron.mjs`
  - Electron binary の arch 判定に失敗した場合は `process.arch` へフォールバックする

### AC 達成状況

| AC   | 状態    | 検証方法                                       |
| ---- | ------- | ---------------------------------------------- |
| AC-1 | PASS    | `dist/index.js` + `dist/index.cjs` の生成確認  |
| AC-2 | PASS    | exports の `require` 条件確認                  |
| AC-3 | PASS    | externalize exclude 設定確認                   |
| AC-4 | PASS    | ビルド検証テスト 8/8 PASS                      |
| AC-5 | PASS    | Electron ABI 140 でのロード・クエリ成功        |
| AC-6 | PASS    | desktop 検証テスト 20/20 PASS                  |
| AC-7 | PENDING | ユーザー環境での GUI 手動確認が必要            |
| AC-8 | PASS    | `pnpm lint` 0 errors, ignore migration warning |
| AC-9 | PASS    | `pnpm typecheck` 0 errors                      |

### 残リスク

- AC-7（desktop dev 起動）は GUI テストのため手動確認が必要
- `@electron/rebuild` 3.7.2 の将来のバージョンアップで動作変更の可能性
- root 全体の lint / typecheck / 回帰一括実行は別 wave の追加確認余地がある

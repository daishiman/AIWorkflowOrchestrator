# Phase 5: 実装

## メタ情報

| 項目      | 内容                                                     |
| --------- | -------------------------------------------------------- |
| Phase     | 5                                                        |
| 名称      | 実装                                                     |
| 前提Phase | Phase 4                                                  |
| 成果物    | 修正済みコード（設定ファイル、スクリプト、新規ファイル） |

## 目的

Phase 4 で作成した Red テストを Green にするために、問題A（Preload モジュール解決）と問題B（ネイティブモジュールリビルド）の修正を実装する。実装順序は Phase 2 Task 2-8 で確定した順序に従う。

## 変更ファイル一覧

| 種別 | ファイル                                               | 担当レーン |
| ---- | ------------------------------------------------------ | ---------- |
| 修正 | `packages/shared/tsup.config.ts`                       | A          |
| 修正 | `packages/shared/package.json`                         | A          |
| 修正 | `apps/desktop/electron.vite.config.ts`                 | A          |
| 修正 | `apps/desktop/package.json`                            | B          |
| 修正 | `scripts/setup-native-modules.sh`                      | B          |
| 新規 | `apps/desktop/scripts/rebuild-native-for-electron.mjs` | B          |
| 修正 | `apps/desktop/electron-builder.yml`                    | B          |
| 修正 | `package.json`（root）                                 | B          |

## 実行タスク

### Task 5-1: shared パッケージに CJS 出力を追加（REQ-A1）

**対象ファイル**: `packages/shared/tsup.config.ts`

**変更内容**: `format` 配列に `"cjs"` を追加する。

```typescript
// 変更前
format: ["esm"],

// 変更後
format: ["esm", "cjs"],
```

**検証**:

```bash
pnpm --filter @repo/shared build
ls packages/shared/dist/src/ipc/channels.cjs  # ファイルが存在すること
```

**Green になるテスト**: SC-02, SC-03, SC-04

### Task 5-2: shared パッケージの exports に require エントリ追加（REQ-A2）

**対象ファイル**: `packages/shared/package.json`

**変更方針**: 全 34 個の exports エントリに `require` キーを追加する。変換ルールは以下の通り：

- `"import": "./dist/xxx.js"` に対して `"require": "./dist/xxx.cjs"` を追加
- `types` キーの直後、`import` キーの前に `require` を配置

**変更例**（1 エントリ分）:

```json
// 変更前
"./src/ipc/channels": {
  "types": "./dist/src/ipc/channels.d.ts",
  "import": "./dist/src/ipc/channels.js"
}

// 変更後
"./src/ipc/channels": {
  "types": "./dist/src/ipc/channels.d.ts",
  "require": "./dist/src/ipc/channels.cjs",
  "import": "./dist/src/ipc/channels.js"
}
```

全 34 エントリに同じパターンを適用する。`.js` を `.cjs` に変換するだけの機械的な変更。

**検証**:

```bash
# require キーの数を確認（34 個あること）
grep -c '"require"' packages/shared/package.json
```

**Green になるテスト**: SC-01

### Task 5-3: electron.vite.config.ts の externalizeDepsPlugin 修正（REQ-A3, REQ-A4）

**対象ファイル**: `apps/desktop/electron.vite.config.ts`

**変更箇所**: main セクション（L12）と preload セクション（L40）の `externalizeDepsPlugin()` 呼び出し

```typescript
// 変更前（main）
plugins: [
  externalizeDepsPlugin(),
  tsconfigPaths({ projects: [sharedTsconfig] }),
],

// 変更後（main）
plugins: [
  externalizeDepsPlugin({ exclude: ['@repo/shared'] }),
  tsconfigPaths({ projects: [sharedTsconfig] }),
],

// 変更前（preload）
plugins: [
  externalizeDepsPlugin(),
  tsconfigPaths({ projects: [sharedTsconfig] }),
],

// 変更後（preload）
plugins: [
  externalizeDepsPlugin({ exclude: ['@repo/shared'] }),
  tsconfigPaths({ projects: [sharedTsconfig] }),
],
```

**検証**:

```bash
pnpm --filter @repo/desktop build
# preload バンドルに @repo/shared の require が残っていないことを確認
grep -c 'require.*@repo/shared' apps/desktop/out/preload/index.js
# 期待値: 0
```

**Green になるテスト**: VC-01, VC-02, BA-01〜BA-05

### Task 5-4: @electron/rebuild をインストール（REQ-B1）

```bash
pnpm --filter @repo/desktop add -D @electron/rebuild
```

**検証**: `apps/desktop/package.json` の devDependencies に `@electron/rebuild` が追加されていること。

**Green になるテスト**: NR-01

### Task 5-5: apps/desktop/package.json にスクリプト追加（REQ-B3）

**対象ファイル**: `apps/desktop/package.json`

**変更内容**: scripts セクションに以下を追加する。desktop package には `postinstall` を置かず、手動復旧コマンドだけを持たせる。

```json
{
  "scripts": {
    "rebuild:electron": "ELECTRON_ARCH=$(ELECTRON_RUN_AS_NODE=1 electron -p 'process.arch') && electron-rebuild -f -w better-sqlite3 -m ../../packages/shared -a \"$ELECTRON_ARCH\""
  }
}
```

既存の `rebuild:native` スクリプトは残す（後方互換性のため）。

**Green になるテスト**: NR-02

### Task 5-6: setup-native-modules.sh を Electron 対応に修正（REQ-B2 + MR-02）

**対象ファイル**: `scripts/setup-native-modules.sh`

**変更方針**: root からでも desktop workspace を正しく参照できるように CWD を固定し、Electron コンテキストで既存バイナリを先に検証したうえで必要時のみリビルドする。

**挿入位置**: esbuild リビルドセクション（L109）の前に以下を挿入する。

```bash
desktop_exec() { pnpm --dir "$DESKTOP_DIR" exec "$@"; }
desktop_electron_as_node_exec() {
  ELECTRON_RUN_AS_NODE=1 pnpm --dir "$DESKTOP_DIR" exec electron "$@";
}

if desktop_exec electron --version >/dev/null 2>&1; then
  ELECTRON_VERSION=$(desktop_exec electron --version | sed 's/^v//')
  ELECTRON_ABI=$(desktop_electron_as_node_exec -p "process.versions.modules")
  ELECTRON_ARCH=$(desktop_electron_as_node_exec -p "process.arch")

  if verify_sqlite_with_electron; then
    log "既存の better-sqlite3 バイナリをそのまま使用します"
  else
    desktop_exec electron-rebuild -f -w better-sqlite3 -m "$SHARED_WORKSPACE_DIR" -a "$ELECTRON_ARCH"
  fi
else
  echo "Electron 未インストール。Node.js 向けビルドを維持します。"
  rebuild_for_nodejs
fi
```

**Green になるテスト**: NR-05, SF-01〜SF-03

### Task 5-7: afterPack フックスクリプト作成（REQ-B4）

**新規ファイル**: `apps/desktop/scripts/rebuild-native-for-electron.mjs`

```javascript
// apps/desktop/scripts/rebuild-native-for-electron.mjs
import { rebuild } from "@electron/rebuild";

/**
 * electron-builder の afterPack フック。
 * パッケージング後にネイティブモジュールを対象 Electron バージョンで再ビルドする。
 *
 * @param {import('electron-builder').AfterPackContext} context
 */
export default async function afterPack(context) {
  const { appOutDir, arch } = context;

  console.log(
    `[afterPack] Rebuilding native modules for Electron ${context.electronVersion} (${arch})`,
  );

  await rebuild({
    buildPath: appOutDir,
    electronVersion: context.electronVersion,
    arch,
    force: true,
    onlyModules: ["better-sqlite3"],
  });

  console.log("[afterPack] Native module rebuild completed.");
}
```

**Green になるテスト**: NR-04

### Task 5-8: electron-builder.yml に afterPack 追加（REQ-B4）

**対象ファイル**: `apps/desktop/electron-builder.yml`

**変更内容**: `afterSign` の直後に `afterPack` を追加する。

```yaml
# macOS公証（CI環境で自動実行）
afterSign: scripts/notarize.mjs

# ネイティブモジュールリビルド（本番ビルド用）
afterPack: scripts/rebuild-native-for-electron.mjs
```

**Green になるテスト**: NR-03

### Task 5-9: root package.json の postinstall 修正

**対象ファイル**: `package.json`（root）

**変更内容**:

```json
// 変更前
"postinstall": "bash scripts/setup-native-modules.sh || pnpm rebuild better-sqlite3 || true"

// 変更後
"postinstall": "bash scripts/setup-native-modules.sh"
```

`setup-native-modules.sh` 内で Electron 向けリビルドが行われるため、フォールバックの `pnpm rebuild better-sqlite3` を削除する。

### Task 5-10: 全テスト Green 確認

```bash
# shared ビルド → desktop ビルド → テスト
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build

# Phase 4 で作成した全テストを実行
pnpm --filter @repo/shared vitest run src/__tests__/build/
pnpm --filter @repo/desktop vitest run src/__tests__/build/
```

**期待結果**: 19 テスト全て PASS

### Task 5-11: 既存テストの回帰確認

```bash
# shared パッケージの既存テスト
pnpm --filter @repo/shared test:run

# desktop パッケージの既存テスト
pnpm --filter @repo/desktop test:run
```

**期待結果**: 既存テストに回帰（regression）がないこと

## 実装順序まとめ

| 順序 | Task | 対象ファイル                                                   | Green になるテスト   |
| ---- | ---- | -------------------------------------------------------------- | -------------------- |
| 1    | 5-1  | `packages/shared/tsup.config.ts`                               | SC-02〜04            |
| 2    | 5-2  | `packages/shared/package.json`                                 | SC-01                |
| 3    | 5-3  | `apps/desktop/electron.vite.config.ts`                         | VC-01〜02, BA-01〜05 |
| 4    | 5-4  | `apps/desktop/package.json`（dep追加）                         | NR-01                |
| 5    | 5-5  | `apps/desktop/package.json`（script追加）                      | NR-02                |
| 6    | 5-6  | `scripts/setup-native-modules.sh`                              | NR-05, SF-01〜03     |
| 7    | 5-7  | `apps/desktop/scripts/rebuild-native-for-electron.mjs`（新規） | NR-04                |
| 8    | 5-8  | `apps/desktop/electron-builder.yml`                            | NR-03                |
| 9    | 5-9  | `package.json`（root）                                         | -                    |
| 10   | 5-10 | -                                                              | 全 19 テスト         |
| 11   | 5-11 | -                                                              | 既存テスト回帰なし   |

## 参照資料

| 資料名           | パス                       | 説明                        |
| ---------------- | -------------------------- | --------------------------- |
| Phase 2 設計     | `phase-2-design.md`        | 各ファイルの変更設計        |
| Phase 3 レビュー | `phase-3-design-review.md` | MR-01, MR-02 対応           |
| Phase 4 テスト   | `phase-4-test-creation.md` | テストケース BA/SC/VC/NR/SF |

## 統合テスト連携

- Phase 4/6 のテストを Green にする実装単位として本変更を配置する
- root `postinstall` / desktop `rebuild:electron` / `afterPack` の責務は Phase 11/12 の実測と文書同期で閉じる

## 成果物

| 成果物           | 配置先                                                 | 説明                 |
| ---------------- | ------------------------------------------------------ | -------------------- |
| tsup 設定修正    | `packages/shared/tsup.config.ts`                       | CJS 出力追加         |
| exports 修正     | `packages/shared/package.json`                         | require エントリ追加 |
| Vite 設定修正    | `apps/desktop/electron.vite.config.ts`                 | exclude 追加         |
| スクリプト修正   | `scripts/setup-native-modules.sh`                      | Electron 対応        |
| afterPack フック | `apps/desktop/scripts/rebuild-native-for-electron.mjs` | 新規作成             |
| builder 設定修正 | `apps/desktop/electron-builder.yml`                    | afterPack 追加       |
| desktop pkg 修正 | `apps/desktop/package.json`                            | dep + script 追加    |
| root pkg 修正    | `package.json`                                         | postinstall 修正     |

## 完了条件

- [ ] Task 5-1: `packages/shared/tsup.config.ts` で `format: ["esm", "cjs"]` が設定されている
- [ ] Task 5-2: `packages/shared/package.json` の全 34 exports エントリに `require` キーが追加されている
- [ ] Task 5-3: `electron.vite.config.ts` の main と preload の両方で `exclude: ['@repo/shared']` が設定されている
- [ ] Task 5-4: `@electron/rebuild` が `apps/desktop/package.json` の devDependencies に追加されている
- [ ] Task 5-5: `rebuild:electron` スクリプトが追加され、desktop package に `postinstall` がない
- [ ] Task 5-6: `setup-native-modules.sh` に Electron 存在チェックと `electron-rebuild` 呼び出しが追加されている
- [ ] Task 5-7: `apps/desktop/scripts/rebuild-native-for-electron.mjs` が作成されている
- [ ] Task 5-8: `electron-builder.yml` に `afterPack` フックが追加されている
- [ ] Task 5-9: root `package.json` の postinstall から冗長なフォールバックが削除されている
- [ ] Task 5-10: Phase 4 の 19 テストが全て PASS
- [ ] Task 5-11: 既存テストに回帰がない
- [ ] **本Phase内の全タスクを100%実行完了**

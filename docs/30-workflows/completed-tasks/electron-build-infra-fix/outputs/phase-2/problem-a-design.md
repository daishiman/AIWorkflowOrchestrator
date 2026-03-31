# Phase 2: 問題A設計 — shared / preload モジュール解決

## 設計方針

**二段構えの解決**: shared の dual output + preload でのインライン化

### 方針1: shared の ESM/CJS dual output

`packages/shared/tsup.config.ts` の `format` を `["esm", "cjs"]` に変更する。
tsup は CJS 出力時に `.cjs` 拡張子を使う（`"type": "module"` パッケージのため）。

**変更箇所:**

```ts
// packages/shared/tsup.config.ts
format: ["esm", "cjs"],  // was: ["esm"]
```

`packages/shared/package.json` の各 exports エントリに `require` 条件を追加:

```json
{
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js",
    "require": "./dist/index.cjs"
  }
}
```

**根拠:**

- shared は desktop (main/preload) 以外にも web パッケージから使われる可能性がある
- ESM/CJS dual output は Node.js エコシステムの標準的なアプローチ

### 方針2: preload で @repo/shared をバンドルに含める

`electron.vite.config.ts` の preload セクションで `externalizeDepsPlugin` に `exclude` オプションを追加し、`@repo/shared` をインライン化する。

**変更箇所:**

```ts
// apps/desktop/electron.vite.config.ts - preload section
plugins: [
  externalizeDepsPlugin({ exclude: ["@repo/shared"] }),
  tsconfigPaths({ projects: [sharedTsconfig] }),
],
```

**根拠:**

- preload はサンドボックス環境で動作し、外部モジュール解決が不安定
- workspace パッケージはバンドルに含めるのが最も確実
- `@repo/shared` は pure TypeScript（native module なし）なのでバンドル可能
- これにより AC-3（外部 require が残らない）が確実に満たされる

### 方針3: esbuild バージョン衝突の解消

root `package.json` の `@esbuild/darwin-x64: "0.21.5"` を削除する。
これは古い固定値で、tsup/vite が使う esbuild 0.27.2 と衝突している。

**変更箇所:**

```json
// package.json (root) - devDependencies
// 削除: "@esbuild/darwin-x64": "0.21.5"
```

**根拠:**

- esbuild は自分の platform binary を自動解決する
- 手動固定は version skew の原因になる
- rollup の同様の固定 `@rollup/rollup-darwin-x64` も合わせて確認（必要なら削除）

## AC 接続

| AC   | 達成手段                                       |
| ---- | ---------------------------------------------- |
| AC-1 | 方針1: tsup.config.ts の format 変更           |
| AC-2 | 方針1: package.json の exports に require 追加 |
| AC-3 | 方針2: preload で @repo/shared をインライン化  |
| AC-4 | 方針1+3: ビルドが通れば既存テストも PASS       |

## リスク

| リスク                                | 対策                                                  |
| ------------------------------------- | ----------------------------------------------------- |
| CJS 出力でトップレベル await が壊れる | shared 内にトップレベル await がないことを確認        |
| バンドルサイズ増加                    | preload は軽量であり、shared の型定義が主なので影響小 |
| esbuild 削除後の他パッケージへの影響  | ビルド全体を再確認                                    |

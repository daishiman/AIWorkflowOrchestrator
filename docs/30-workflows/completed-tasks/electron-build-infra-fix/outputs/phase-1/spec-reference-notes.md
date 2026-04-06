# Phase 1: 仕様参照メモ

## 引用した仕様と根拠

### 1. preload は CJS 前提

- **出典**: `apps/desktop/electron.vite.config.ts` L50-51
- **内容**: preload の output format が `cjs` で固定
- **影響**: `@repo/shared` を外部参照する場合、CJS 解決経路が必須

### 2. shared の現在の出力形式

- **出典**: `packages/shared/tsup.config.ts` L45
- **内容**: `format: ["esm"]` — ESM のみ
- **影響**: CJS 消費者（preload）が `require()` できない

### 3. externalizeDepsPlugin の動作

- **出典**: `apps/desktop/electron.vite.config.ts` L41
- **内容**: preload で `externalizeDepsPlugin()` を使用。全依存を外部化
- **影響**: `@repo/shared` が外部化され、ランタイムで `require('@repo/shared')` が発行される

### 4. Electron バージョンと ABI

- **出典**: `node_modules/.pnpm/electron@39.8.5/`
- **内容**: Electron 39.8.5、Node.js 22 ベース
- **影響**: Node.js 22 の ABI と Electron 39 の ABI は異なる。native module は Electron 向けに再ビルドが必要

### 5. esbuild バージョン衝突

- **出典**: root `package.json` devDependencies `@esbuild/darwin-x64: "0.21.5"`
- **内容**: tsup が使う esbuild 0.27.2 と platform binary 0.21.5 が衝突
- **影響**: shared ビルドが即座に失敗する

### 6. better-sqlite3 の使用箇所

- **出典**: `apps/desktop/src/main/` 内 9 ファイル
- **内容**: conversationRepository, conversationDatabase, ipc handlers で使用
- **影響**: Electron main プロセスで native module が正しくロードされる必要がある

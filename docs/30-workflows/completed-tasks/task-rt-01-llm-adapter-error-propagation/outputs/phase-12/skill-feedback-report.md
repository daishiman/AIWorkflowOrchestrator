# Phase 12: skill フィードバックレポート

## 今回の workflow 実行で詰まった点

### esbuild バイナリバージョン不一致

worktree 環境で `pnpm --filter @repo/desktop test:run` 実行時に
esbuild のホスト/バイナリバージョン不一致エラーが発生した。
`pnpm install` の後 `node_modules/.bin/vitest run` を直接呼ぶことで回避できた。

**改善案**: phase-05-implementation.md のテスト実行コマンドに worktree 環境での注意事項を追記する。

### validateIpcSender の引数形式

`validateIpcSender(event, channel, mainWindow)` と想定してテストを書いたが、
実際の呼び出しは `validateIpcSender(event, channel, { getAllowedWindows: () => [mainWindow] })` だった。
仕様書の IPC セキュリティセクションに `validateIpcSender` の引数形式を明記すれば防げた。

**改善案**: `api-ipc-agent-core.md` の セキュリティ強化仕様に `validateIpcSender` のシグネチャ例を追記する。

### Playwright capture の pnpm 解決

スクリーンショット再生成時に Node の child_process から `pnpm` を spawn すると `ENOENT` になった。
worktree の Node 実行環境では PATH がそのまま引き継がれないケースがあるため、capture スクリプトは absolute path か shell 起動に寄せるべきだった。

**改善案**: phase-11 の撮影スクリプト例に、`/usr/local/bin/pnpm` のような絶対パスか shell 経由の起動パターンを追記する。

### 同期 throw vs async rejects

T-IPC-12 で handler が同期的に throw するのに `await expect(...).rejects.toThrow()` を書いてしまい RED になった。
ハンドラが同期/非同期どちらかを仕様書に明記すれば防げた。

## `task-specification-creator` への改善案

- phase-04-test-creation.md に「ハンドラが同期か非同期かの確認」チェック項目を追加する
- phase-05-implementation.md に worktree 環境でのテスト実行方法を追記する

## `aiworkflow-requirements` への改善案

- `api-ipc-agent-core.md` のセキュリティ強化仕様に `validateIpcSender` のシグネチャと引数オブジェクト形式を明記する
- IPC push チャネル（on/push）の Preload 実装パターン例（`safeOn` + unsubscribe 返却）を追記する

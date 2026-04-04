# Phase 11: 手動テストチェックリスト

## 起動確認

- [ ] `pnpm --filter @repo/desktop dev` が起動開始点まで進む (AC-7)
  - 注: preload ビルドが成功し、main プロセスが起動するかを確認

## runtime 確認

- [x] Electron ABI でのロードテスト (AC-5)
  - コマンド: `ELECTRON_RUN_AS_NODE=1 <electron-path> -e "require('better-sqlite3')"`
  - 結果: OK — NODE_MODULE_VERSION 140 で正常動作
  - better-sqlite3 のクエリ実行も成功

- [x] Electron バイナリアーキテクチャ確認
  - Electron: arm64
  - Node.js (Rosetta 2): x64
  - rebuild:electron: arch 自動検出で arm64 リビルド成功

## preload bundle 確認

- [x] `@repo/shared` が externalize から除外されている
  - `externalizeDepsPlugin({ exclude: ["@repo/shared"] })` を確認

## UI / Evidence 確認

- [x] 本タスクに UI 差分がないことを確認
  - 対象変更は build 設定、package exports、native rebuild script のみ
  - `outputs/phase-11/screenshots/phase11-build-infra-review-board.png` を代表証跡として保存
  - `outputs/phase-11/phase11-capture-metadata.json` に review-board 理由を保存
- [x] `outputs/phase-11/screenshot-coverage.md` で `TC-11-NONVISUAL-01` と PNG を紐付ける

## 発見事項

| 分類    | 内容                                                                 | 対応                                                                         |
| ------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| blocker | なし                                                                 | -                                                                            |
| minor   | Rosetta 2 環境で electron-rebuild がホスト arch (x64) でビルドする   | rebuild-sqlite-for-electron.mjs で Electron バイナリ arch を自動検出して解決 |
| note    | setup-native-modules.sh の pnpm strict resolution                    | 絶対パスで require する方式に修正                                            |
| info    | 旧 `phase11-placeholder.png` は PNG ではなく壊れたテキスト資産だった | review-board PNG と metadata へ置換                                          |

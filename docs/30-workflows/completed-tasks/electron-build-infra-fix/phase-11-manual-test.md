# Phase 11: 手動テスト

## メタ情報

| 項目      | 内容                                         |
| --------- | -------------------------------------------- |
| Phase     | 11                                           |
| 名称      | 手動テスト                                   |
| 前提Phase | Phase 10                                     |
| 成果物    | 手動テスト結果、起動ログ、ランタイム検証記録 |

## 目的

Electron アプリを実際に起動し、問題A（Preload モジュール解決エラー）と問題B（better-sqlite3 ABI 不整合）が再発しないことを確認する。本タスクは画面仕様変更を含まないため、Phase 11 はビルド・起動・ABI・ログの確認を中心に実施する。

## スコープ判定

- **対象**: `pnpm install` 後のネイティブモジュール bootstrap、shared/desktop build、Electron 起動、ABI 値、`better-sqlite3` 読込、起動直後のエラーログ
- **対象外**: 画面仕様変更に対する追加画像取得、画面操作フローの追加検証
- **理由**: 今回の差分はビルドインフラ修正であり、画面 contract / 画面構成 / 操作導線に変更がないため

## 実行タスク

### 実行結果

### Task 11-1: クリーンインストール相当の bootstrap 確認

実行コマンド:

```bash
pnpm install
```

確認結果:

- [x] `pnpm install` が正常に完了した
- [x] root `postinstall` として `scripts/setup-native-modules.sh` が実行された
- [x] `Electron バージョン: 39.8.5 (ABI: 140, arch: arm64)` が記録された
- [x] `✅ Electron コンテキストで better-sqlite3 を読み込めました` が出力された
- [x] `✅ 既存の better-sqlite3 バイナリをそのまま使用します` が出力された
- [x] `✅ esbuild のリビルド完了` が出力された
- [x] エラー終了なし（`Done in 33.6s using pnpm v10.9.0`）

### Task 11-2: 問題A の修正確認 - preload モジュール解決

実行コマンド:

```bash
pnpm --filter @repo/shared build
ls -la packages/shared/dist/src/ipc/channels.cjs
pnpm --filter @repo/desktop build
grep -c 'require.*@repo/shared' apps/desktop/out/preload/index.js
pnpm --filter @repo/desktop dev
```

確認結果:

- [x] `packages/shared/dist/src/ipc/channels.cjs` が存在する
- [x] `apps/desktop/out/preload/index.js` に `require("@repo/shared")` が残っていない（結果: `0`）
- [x] `pnpm --filter @repo/desktop dev` が起動し、起動直後に `module not found: @repo/shared` が再発しない
- [x] preload build が成功し、`out/preload/index.js  56.77 kB` を確認した

### Task 11-3: 問題B の修正確認 - better-sqlite3 ABI 一致

実行コマンド:

```bash
node -p "process.versions.modules"
ELECTRON_RUN_AS_NODE=1 pnpm --filter @repo/desktop exec electron -p "process.versions.modules"
ELECTRON_RUN_AS_NODE=1 pnpm --filter @repo/desktop exec electron -e "try { require('better-sqlite3'); console.log('OK: better-sqlite3 loaded'); } catch (e) { console.error('FAIL:', e.message); process.exit(1); }"
```

確認結果:

- [x] Node.js ABI を記録した（`127`）
- [x] Electron ABI を記録した（`140`）
- [x] Electron コンテキストで `OK: better-sqlite3 loaded` を確認した
- [x] `NODE_MODULE_VERSION` 不整合エラーが再発しない

### Task 11-4: 画面系・基本機能の追加確認

| 項目                               | 判定 | 理由                                   |
| ---------------------------------- | ---- | -------------------------------------- |
| 追加画像取得                       | N/A  | 画面変更なし。追加出力不要             |
| 画面表示・ナビゲーションの追加確認 | N/A  | 本タスクの変更対象はビルドインフラのみ |
| IPC / DB の新規操作シナリオ確認    | N/A  | IPC contract / DB schema の変更なし    |

### Task 11-5: エラーログ確認

- [x] `pnpm --filter @repo/desktop dev` の起動ログに `module not found` がない
- [x] `pnpm --filter @repo/desktop dev` の起動ログに `NODE_MODULE_VERSION` エラーがない
- [x] `pnpm install` / `setup-native-modules.sh` / Electron 読込テストのすべてで fatal error がない

### Task 11-6: ワークツリー環境での動作確認

- [x] 現在のワークツリーで `pnpm install` が成功した
- [x] ワークツリー配下の `pnpm --filter @repo/desktop dev` が起動した
- [x] root `postinstall` から `apps/desktop` 配下の Electron 実行と workspace shared パス解決が成功した

## 手動テスト結果サマリ

| テスト項目                         | 結果 | 備考                                   |
| ---------------------------------- | ---- | -------------------------------------- |
| クリーンインストール相当 bootstrap | PASS | root `postinstall` 成功                |
| preload モジュール解決             | PASS | `grep` 結果 `0`、起動直後エラーなし    |
| better-sqlite3 ABI 一致            | PASS | Node `127` / Electron `140` / 読込成功 |
| 追加画像取得                       | N/A  | 画面変更なし                           |
| エラーログ確認                     | PASS | module/ABI エラーなし                  |
| ワークツリー環境                   | PASS | install + dev 起動確認                 |

## 補助証跡

- 補助計画: `docs/30-workflows/electron-build-infra-fix/outputs/phase-11/screenshot-plan.json`
- 補助画像: `docs/30-workflows/electron-build-infra-fix/outputs/phase-11/screenshots/phase11-runtime-evidence.png`
- 用途: 表示差分の確認ではなく、Phase 11 の install / build / ABI / runtime evidence を画像カードとして固定する

## 成果物

| 成果物         | 配置先                                                               | 説明       |
| -------------- | -------------------------------------------------------------------- | ---------- |
| 手動テスト結果 | `docs/30-workflows/electron-build-infra-fix/phase-11-manual-test.md` | 本ファイル |

## 完了条件

- [x] `pnpm install` からの bootstrap が成功している
- [x] preload モジュール解決エラーが再発しないことを確認した
- [x] better-sqlite3 ABI 不整合エラーが再発しないことを確認した
- [x] 起動ログに重大なエラーがないことを確認した
- [x] ワークツリー環境での install / dev 起動を確認した
- [x] 画面変更なしのため追加画像取得要件が N/A であることを明記した
- [x] 手動テスト結果サマリを記録した
- [x] **本Phase内の全タスクをスコープに沿って実行完了**

## 参照資料

| 資料名                   | パス                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| デプロイ仕様             | `.claude/skills/aiworkflow-requirements/references/deployment-electron.md` |
| デスクトップ技術スタック | `.claude/skills/aiworkflow-requirements/references/technology-desktop.md`  |

## 統合テスト連携

- Phase 9 の `lint` / `typecheck` / build 結果を前提として runtime evidence を確認した
- Phase 12 では本ファイルの実測値を `implementation-guide.md` と `system-spec-update-summary.md` に反映した

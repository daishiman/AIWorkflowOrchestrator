# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 内容                             |
| --------- | -------------------------------- |
| Phase     | 12                               |
| 名称      | ドキュメント更新                 |
| 前提Phase | Phase 11                         |
| 成果物    | CHANGELOG 更新、ビルド設定ガイド |

## 目的

本タスクで行った変更を開発者が理解できるようにドキュメントを更新する。ビルドインフラの変更は開発者全員に影響するため、変更の「なぜ」と「何が変わったか」を明確に記述する。

## 背景知識（この変更が解決する問題の説明）

### Electron アプリの3層構造

Electron アプリは以下の3つのプロセスで構成される：

- **Main プロセス**: Node.js で動作する。ファイルシステム操作やデータベースアクセスを行う
- **Preload スクリプト**: Main と Renderer の間の橋渡し役。Node.js API を安全に Renderer に公開する
- **Renderer プロセス**: ブラウザ（Chromium）で動作する。React を使って画面を描画する

### ESM と CJS の違い

JavaScript のモジュールシステムには2種類ある：

- **ESM (ECMAScript Modules)**: `import`/`export` を使う。ブラウザやモダンな Node.js で使われる
- **CJS (CommonJS)**: `require()`/`module.exports` を使う。Node.js の従来のモジュールシステム

Electron の Preload スクリプトは CJS 形式で動作する。ESM のみで提供されるパッケージを CJS から `require()` で読み込むことはできない。

### ネイティブモジュールの ABI 互換性

better-sqlite3 のようなネイティブモジュール（C/C++ で書かれたモジュール）は、ビルド時の Node.js バージョンに紐付いたバイナリを生成する。Electron は独自の Node.js バージョンを内蔵しているため、OS の Node.js でビルドしたバイナリは Electron では動作しない。

## 実行タスク

### Task 12-1: CHANGELOG エントリ追加

**対象ファイル**: `CHANGELOG.md`（存在する場合）

以下のエントリを追加する：

```markdown
## [Unreleased]

### Fixed

- Electron preload スクリプトの `@repo/shared` モジュール解決エラーを修正
  - `externalizeDepsPlugin` で `@repo/shared` をバンドルに含めるよう設定変更
  - `packages/shared` に CJS デュアル出力を追加
- better-sqlite3 の NODE_MODULE_VERSION 不整合エラーを修正
  - `@electron/rebuild` を導入し、Electron 向けにネイティブモジュールをリビルド
  - `electron-builder.yml` に `afterPack` フックを追加（本番ビルド対応）

### Changed

- `packages/shared/tsup.config.ts`: `format` を `["esm"]` から `["esm", "cjs"]` に変更
- `packages/shared/package.json`: 全 exports エントリに `require`（CJS）キーを追加
- `scripts/setup-native-modules.sh`: Electron 向けリビルドモードを追加
- `apps/desktop/package.json`: `@electron/rebuild` を devDependencies に追加、`rebuild:electron` スクリプト追加

### Added

- `apps/desktop/scripts/rebuild-native-for-electron.mjs`: electron-builder の afterPack フック
- ビルドインフラ検証テスト（30 テストケース）
```

### Task 12-2: CLAUDE.md への開発情報追加

**対象ファイル**: `CLAUDE.md`

Electron ビルド関連の注意事項を追記する：

```markdown
## Electron ビルド注意事項

### ネイティブモジュール

- `pnpm install` 後に `@electron/rebuild` が自動実行され、better-sqlite3 が Electron 向けにリビルドされる
- 手動リビルドが必要な場合: `pnpm --filter @repo/desktop run rebuild:electron`

### shared パッケージ

- `packages/shared` は ESM + CJS デュアル出力。Electron の preload（CJS）と Web アプリ（ESM）の両方から使用可能
- `electron.vite.config.ts` では `@repo/shared` を `externalizeDepsPlugin` の除外対象にしている（バンドルに含める）
```

### Task 12-3: 既存ドキュメントの更新チェック

以下のファイルが存在する場合、内容が本タスクの変更と矛盾しないか確認し、矛盾がある場合は更新する：

| ファイル                             | 確認内容                                                   | 更新要否                           |
| ------------------------------------ | ---------------------------------------------------------- | ---------------------------------- |
| `docs/` 配下のビルド関連ドキュメント | shared パッケージの出力形式が ESM のみと記述されている箇所 | ESM + CJS に更新                   |
| `apps/desktop/README.md`             | ネイティブモジュールのセットアップ手順                     | `rebuild:electron` コマンドの追加  |
| `.github/workflows/`                 | CI ワークフローでの Electron ビルド手順                    | 変更不要（postinstall で自動実行） |

### Task 12-4: コードコメントの追加

以下のファイルにコメントが不足している場合は追加する：

| ファイル                                               | コメント内容                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------- |
| `apps/desktop/electron.vite.config.ts`                 | `exclude: ['@repo/shared']` の理由（ESM-only パッケージをバンドルに含める） |
| `packages/shared/tsup.config.ts`                       | `format: ["esm", "cjs"]` の理由（Electron preload の CJS 対応）             |
| `apps/desktop/scripts/rebuild-native-for-electron.mjs` | スクリプトの目的と electron-builder との連携方法                            |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                   |
| ---------------- | -------------------------------------- |
| ディレクトリ構造 | `references/directory-structure.md`    |
| 開発ガイドライン | `references/development-guidelines.md` |

## 成果物

| 成果物         | 配置先           | 説明                    |
| -------------- | ---------------- | ----------------------- |
| CHANGELOG 更新 | `CHANGELOG.md`   | 変更履歴の追記          |
| 開発ガイド更新 | `CLAUDE.md`      | Electron ビルド注意事項 |
| コードコメント | 各ソースファイル | 変更理由のコメント      |

## 完了条件

- [ ] CHANGELOG.md に本タスクの変更内容が記載されている（ファイルが存在する場合）
- [ ] CLAUDE.md に Electron ビルド注意事項が追記されている
- [ ] 既存ドキュメントが本タスクの変更と矛盾していないことを確認した
- [ ] 主要な変更箇所にコードコメントが追加されている
- [ ] **本Phase内の全タスクを100%実行完了**

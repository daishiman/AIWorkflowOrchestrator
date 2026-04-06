# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 1                                        |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

`better-sqlite3` の Electron ABI 不一致によるランタイムエラーの根本原因を確定し、即時修正と再発防止の両方の要件を定義する。

## 問題の現状

### 症状

Electron 起動時に以下のエラーが発生し、アプリが DB 初期化フェーズでクラッシュする:

```
Error: The module '/path/to/node_modules/better-sqlite3/build/Release/better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION <installed_abi>. This version of Node.js requires
NODE_MODULE_VERSION <runtime_abi>.
```

### 根本原因

`better-sqlite3` の native addon（`better_sqlite3.node`）は「ビルドしたランタイムの ABI」と「読み込むランタイムの ABI」が一致しないとロードできない。

この不一致が起きる典型パターン:

- `pnpm install` により Node.js 向けの prebuilt / build 産物が配置されたが、Electron（Main Process）が別 ABI を要求する
- Node.js のバージョン/アーキテクチャが変わったのに、古い `.node` が残存している（pnpm store / worktree / Rosetta 等）

native addon（`.node` 拡張子のバイナリ）は ABI が一致しないと `dlopen` の段階でロードに失敗する。

### 事実の確定（宣言値 / lock 解決値 / 障害バイナリ）

このタスクでは、次の3つを必ず分離して記録する（混同すると原因分析が崩れる）。

| 区分         | 確認コマンド                                                                        | 期待                                                                       |
| ------------ | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------- |
| 宣言値       | `node -p \"require('./apps/desktop/package.json').dependencies['better-sqlite3']\"` | 例: `^12.5.0`                                                              |
| lock解決値   | `rg -n \"better-sqlite3@\" pnpm-lock.yaml                                           | head`                                                                      | 例: `better-sqlite3@12.8.0` |
| 障害バイナリ | エラーログから path を抜粋して記録                                                  | `.../node_modules/.pnpm/better-sqlite3@<resolved>/.../better_sqlite3.node` |

### ABI バージョンの採取（固定値にしない）

**重要**: ABI 値（`process.versions.modules`）は将来の Node/Electron 更新で変わるため、仕様書には固定値として書かず「採取して記録する」。

| ランタイム | 採取コマンド                                                                | 記録する値     |
| ---------- | --------------------------------------------------------------------------- | -------------- |
| Node.js    | `node -p \"process.versions.modules\"`                                      | `NODE_ABI`     |
| Electron   | `pnpm --filter @repo/desktop exec electron -p \"process.versions.modules\"` | `ELECTRON_ABI` |

### 既存の修正スクリプト

`apps/desktop/package.json` には既に `rebuild:native` スクリプトが定義されている:

```json
"rebuild:native": "pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)"
```

このスクリプトは「現状の `node_modules` に対して native モジュールを再構築する」ための恒久手段である。ただし、**どのランタイム（Node/Electron）向けに何を rebuild すべきか**は実際の障害（どの ABI で失敗するか）に依存するため、Phase 2 で因果と前提を確定する。

### 問題の発生タイミング

- 開発者が初めてリポジトリをクローンして `pnpm install` した後
- `node_modules` をクリアして `pnpm install` をやり直した後
- CI/CD 環境でのビルド（native rebuild が自動化されていない場合）

## 要件

### 機能要件

- **REQ-1**: Electron（Main Process）が `better-sqlite3` をロードでき、`NODE_MODULE_VERSION mismatch` / `ERR_DLOPEN_FAILED` が発生しないこと
- **REQ-2**: クリーン環境（`node_modules` を消して再インストール）でも、手動 rebuild なしで Electron が起動できること
- **REQ-3**: `pnpm --filter @repo/desktop rebuild:native` が「再現可能な修復コマンド」として維持されていること（ローカル復旧手順の正本）
- **REQ-4**: 既存のテスト・ビルドが破壊されないこと（副作用がある場合は、どのコマンドが影響を受けるかを明示して設計で制御する）

### 非機能要件

- **NFR-1**: `postinstall` の実行時間が開発者体験を著しく損なわないこと（rebuild は数十秒程度）
- **NFR-2**: CI 環境での `pnpm install --frozen-lockfile` でも `postinstall` が実行されること
- **NFR-3**: Windows・macOS・Linux の各プラットフォームで `postinstall` が正常動作すること

## 受け入れ条件

- AC-1: Electron 起動時に `NODE_MODULE_VERSION mismatch` / `ERR_DLOPEN_FAILED` が発生しないこと（Phase 11 の手動テストでログ証跡を残す）
- AC-2: Electron 起動後、DB 初期化が成功し、IPC ハンドラ登録が成功し（失敗件数 0）、会話履歴の一覧取得（IPC チャネル `conversation:list`）が正常に応答すること
  - 用語: `CONVERSATION_LIST` は **定数名**、`conversation:list` は **チャネル文字列**。受け入れ条件はチャネル文字列で記述し、定数名は補足に留める。
- AC-3: クリーン環境で `pnpm install` 後に手動 rebuild を要求しない（postinstall または同等の自動化が実行される）
- AC-4: 再発防止の恒久手段（`apps/desktop/package.json` の `postinstall` と `rebuild:native`）が git 管理されていること

## 参照資料

| 資料名                           | パス                                        | 説明                                        |
| -------------------------------- | ------------------------------------------- | ------------------------------------------- |
| desktop package.json（修正対象） | `apps/desktop/package.json`                 | postinstall 追加先・rebuild:native 定義場所 |
| Electron バージョン定義          | `apps/desktop/package.json` devDependencies | `"electron": "^39.2.4"`                     |
| better-sqlite3 バージョン定義    | `apps/desktop/package.json` dependencies    | `"better-sqlite3": "^12.5.0"`               |
| lock 解決値                      | `pnpm-lock.yaml`                            | better-sqlite3 の解決版数（例: 12.8.0）     |
| 既存 postinstall 正本            | `scripts/setup-native-modules.sh`           | Node 側の native module 検証と rebuild      |

## 統合テスト連携

- Electron 起動テスト（E2E）での DB 初期化成功確認
- `better-sqlite3` モジュールを `require()` した際にエラーが発生しないことのユニットテスト

## 多角的チェック観点

### プラットフォーム互換性の観点

- `postinstall` で実行する `pnpm rebuild:native` が macOS（Intel / Apple Silicon）・Windows・Linux でそれぞれ正しいバイナリを生成すること
- electron-builder のパッケージング時にも rebuild 済みバイナリが使用されること

### モノレポ依存関係の観点

- `postinstall` は workspace install 中に実行されうるため、**モノレポ全体の install 時間・前提ツールチェーンに影響する**。無影響ではないため、影響範囲と許容条件を設計で明示する。
- ルートの `postinstall` との衝突がないこと

### CI/CD の観点

- GitHub Actions 等での `pnpm install` 後に `postinstall` が確実に実行されること
- キャッシュ戦略（`node_modules` キャッシュ）との相性確認

## 成果物

| 成果物     | パス                                         | 説明                            |
| ---------- | -------------------------------------------- | ------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 本ドキュメントの outputs コピー |

## 完了条件

- [ ] ABI 不一致の根本原因（`installed_abi` vs `runtime_abi`）が文書化されている
- [ ] 既存 `rebuild:native` スクリプトの内容と効果が確認されている
- [ ] `postinstall` 追加による即時修正と再発防止の両要件が定義されている
- [ ] 受け入れ条件（AC-1〜AC-4）が検証可能な形で定義されている

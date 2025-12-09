# インストール詳細手順書

## 目次

1. [Homebrew](#1-homebrew)
2. [Node.js](#2-nodejs)
3. [pnpm](#3-pnpm)
4. [Xcode Command Line Tools](#4-xcode-command-line-tools)
5. [プロジェクト依存関係](#5-プロジェクト依存関係)
6. [ネイティブモジュール再ビルド](#6-ネイティブモジュール再ビルド)
7. [環境検証](#7-環境検証)
8. [開発サーバー起動](#8-開発サーバー起動)

---

## 1. Homebrew

### 1.1 概要

HomebrewはmacOS用のパッケージマネージャーです。Node.jsやその他のツールを簡単にインストールできます。

### 1.2 インストール手順

**コマンド**:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**実行例**:

```
==> Checking for `sudo` access (which may request your password)...
Password: [パスワードを入力]
==> This script will install:
/opt/homebrew/bin/brew
...
```

### 1.3 インストール後の設定

M1/M2 Macの場合、PATHを設定する必要があります:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 1.4 確認方法

```bash
brew --version
```

**期待される出力**:

```
Homebrew 4.x.x
```

### 1.5 トラブルシューティング

**問題**: `command not found: brew`
**原因**: PATHが設定されていない
**解決策**: 上記の「インストール後の設定」を実行

---

## 2. Node.js

### 2.1 概要

Node.jsは、JavaScriptランタイム環境です。Electronアプリの開発に必要です。

### 2.2 推奨バージョン

- Node.js 22.x LTS（Jod）
- Node.js 24.x LTS（Krypton）

### 2.3 Homebrew経由でのインストール

**コマンド**:

```bash
brew install node@22
```

**所要時間**: 3-5分

### 2.4 nvm経由でのインストール（代替方法）

**nvmのインストール**:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**Node.jsのインストール**:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

### 2.5 確認方法

```bash
node --version
npm --version
```

**期待される出力**:

```
v22.12.0
10.9.2
```

### 2.6 トラブルシューティング

**問題**: バージョンが古い
**解決策**:

```bash
brew upgrade node@22
# または
nvm install 22 --reinstall-packages-from=current
```

---

## 3. pnpm

### 3.1 概要

pnpmは、高速で効率的なパッケージマネージャーです。npmの代替として使用します。

### 3.2 推奨バージョン

- pnpm 10.x

### 3.3 corepack経由での有効化（推奨）

**コマンド**:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### 3.4 npm経由でのインストール（代替方法）

```bash
npm install -g pnpm
```

### 3.5 確認方法

```bash
pnpm --version
```

**期待される出力**:

```
10.24.0
```

### 3.6 トラブルシューティング

**問題**: `command not found: pnpm`
**解決策**:

```bash
corepack enable
# または
npm install -g pnpm
```

---

## 4. Xcode Command Line Tools

### 4.1 概要

Xcode Command Line Toolsは、ネイティブモジュール（better-sqlite3など）をビルドするために必要なコンパイラとライブラリを提供します。

### 4.2 インストール手順

**コマンド**:

```bash
xcode-select --install
```

**ダイアログが表示される**:

1. 「インストール」ボタンをクリック
2. ライセンス契約に同意
3. ダウンロードとインストールを待つ（5-15分）

### 4.3 確認方法

```bash
xcode-select -p
```

**期待される出力**:

```
/Library/Developer/CommandLineTools
```

**コンパイラ確認**:

```bash
gcc --version
```

**期待される出力**:

```
Apple clang version 15.0.0 (clang-1500.x.x.x)
```

### 4.4 トラブルシューティング

**問題**: `xcode-select: error: command line tools are already installed`
**解決策**: 既にインストール済みです。次のステップに進んでください。

**問題**: ダウンロードが遅い
**解決策**: App Storeから完全版のXcodeをインストールすることも可能です（ただし、8GB以上のダウンロードが必要）。

---

## 5. プロジェクト依存関係

### 5.1 概要

プロジェクトに必要なすべてのnpmパッケージをインストールします。

### 5.2 インストール手順

**コマンド**:

```bash
cd /path/to/AIWorkflowOrchestrator
pnpm install --frozen-lockfile
```

**所要時間**: 3-5分（初回）、30秒-1分（2回目以降）

### 5.3 インストール内容

インストールされる主要なパッケージ:

- Electron 39.x
- electron-vite 2.x
- electron-builder 26.x
- React 18.x
- TypeScript 5.x
- better-sqlite3
- Drizzle ORM 0.39.x
- Tailwind CSS 3.x
- Vitest 2.x
- その他400+パッケージ

### 5.4 確認方法

```bash
ls node_modules
# 多数のディレクトリが表示される

pnpm list --depth=0
# インストールされたパッケージ一覧が表示される
```

### 5.5 トラブルシューティング

**問題**: `ERR_PNPM_LOCKFILE_MISSING_DEPENDENCY`
**解決策**:

```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

**問題**: ネットワークエラー
**解決策**:

```bash
# リトライ
pnpm install --frozen-lockfile
```

---

## 6. ネイティブモジュール再ビルド

### 6.1 概要

better-sqlite3などのネイティブモジュールは、Electronのバージョンに合わせて再ビルドする必要があります。

### 6.2 再ビルド手順

**コマンド**:

```bash
pnpm exec electron-rebuild
```

**所要時間**: 1-2分

**実行例**:

```
✔ Rebuild Complete
```

### 6.3 確認方法

```bash
node -e "require('better-sqlite3')"
```

**成功時**: エラーが表示されない
**失敗時**: `Error: Cannot find module 'better-sqlite3'`

### 6.4 トラブルシューティング

**問題**: `gyp ERR! stack Error: not found: make`
**原因**: Xcode Command Line Toolsがインストールされていない
**解決策**: Step 4を実行

**問題**: `Error: The module was compiled against a different Node.js version`
**原因**: Node.jsのバージョン不一致
**解決策**:

```bash
pnpm exec electron-rebuild
```

---

## 7. 環境検証

### 7.1 概要

すべての依存関係が正しくインストールされているか、最終確認を行います。

### 7.2 検証コマンド

```bash
node scripts/verify-dependencies.mjs
```

### 7.3 検証項目

- Node.js 22.x または 24.x
- pnpm 10.x
- Electron 39.x
- TypeScript 5.x
- better-sqlite3（ロードテスト）
- Vitest 2.x
- React 18.x
- Drizzle 0.39.x

### 7.4 トラブルシューティング

**問題**: 一部の依存関係がインストールされていない
**解決策**: 該当するステップに戻ってインストールをやり直す

---

## 8. 開発サーバー起動

### 8.1 起動コマンド

```bash
pnpm dev
```

### 8.2 期待される動作

1. Viteが開発サーバーを起動
2. Electronウィンドウが表示される
3. ホットリロード（HMR）が有効になる

**コンソール出力例**:

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Press h + enter to show help

Electron app started
```

### 8.3 トラブルシューティング

**問題**: ポート競合エラー
**解決策**:

```bash
# ポート5173を使用しているプロセスを終了
lsof -ti:5173 | xargs kill -9

# または別のポートを使用
VITE_PORT=5174 pnpm dev
```

**問題**: Electronウィンドウが表示されない
**解決策**: ログを確認し、エラーメッセージを特定

---

## チェックリスト

環境構築が完了したら、以下をすべて確認してください:

- [ ] Homebrewがインストールされている
- [ ] Node.js 22.x LTSがインストールされている
- [ ] pnpm 10.xがインストールされている
- [ ] Xcode Command Line Toolsがインストールされている
- [ ] `pnpm install` が成功した
- [ ] `pnpm exec electron-rebuild` が成功した
- [ ] `node scripts/verify-dependencies.mjs` が成功した
- [ ] `pnpm dev` でElectronウィンドウが表示される
- [ ] .envファイルが作成されている

---

## 参考資料

- [環境構築ガイド](step-05-environment-setup-guide.md)
- [トラブルシューティングガイド](step-07-troubleshooting-environment.md)
- [環境構築要件書](../00-requirements/environment-setup-requirements.md)

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 作成者         |
| ---------- | ---------- | -------- | -------------- |
| 1.0.0      | 2025-12-03 | 初版作成 | @manual-writer |

# 環境構築トラブルシューティングガイド

## 概要

このガイドは、環境構築中に発生する可能性のある問題と解決策を提供します。

---

## エラーコード一覧

| コード | エラー                   | セクション                          |
| ------ | ------------------------ | ----------------------------------- |
| E001   | Homebrewインストール失敗 | [1](#e001-homebrewインストール失敗) |
| E002   | Node.jsバージョン不一致  | [2](#e002-nodejsバージョン不一致)   |
| E003   | pnpm not found           | [3](#e003-pnpm-not-found)           |
| E004   | Xcode CLT未インストール  | [4](#e004-xcode-clt未インストール)  |
| E005   | pnpm install失敗         | [5](#e005-pnpm-install失敗)         |
| E006   | electron-rebuild失敗     | [6](#e006-electron-rebuild失敗)     |
| E007   | better-sqlite3エラー     | [7](#e007-better-sqlite3エラー)     |
| E008   | 開発サーバー起動失敗     | [8](#e008-開発サーバー起動失敗)     |

---

## E001: Homebrewインストール失敗

### 症状

```
curl: (7) Failed to connect to raw.githubusercontent.com
```

### 原因

- ネットワーク接続の問題
- ファイアウォール・プロキシの制限
- GitHubへのアクセス制限

### 解決策

**方法1: ネットワーク確認**

```bash
ping raw.githubusercontent.com
```

**方法2: プロキシ設定**

```bash
export https_proxy=http://proxy.example.com:8080
```

**方法3: 手動インストール**

1. [Homebrew公式サイト](https://brew.sh/)からインストーラーをダウンロード
2. 指示に従ってインストール

---

## E002: Node.jsバージョン不一致

### 症状

```bash
node --version
v18.20.0  # 古いバージョン
```

### 原因

- 古いNode.jsがインストールされている
- 複数バージョンがインストールされている

### 解決策

**方法1: Homebrewでアップグレード**

```bash
brew upgrade node@22
```

**方法2: nvmでバージョン切り替え**

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

**方法3: 古いバージョンをアンインストール**

```bash
brew uninstall node
brew install node@22
```

---

## E003: pnpm not found

### 症状

```bash
pnpm --version
zsh: command not found: pnpm
```

### 原因

- corepackが有効化されていない
- pnpmがインストールされていない

### 解決策

**方法1: corepackで有効化（推奨）**

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**方法2: npm経由でグローバルインストール**

```bash
npm install -g pnpm
```

**方法3: Homebrew経由でインストール**

```bash
brew install pnpm
```

---

## E004: Xcode CLT未インストール

### 症状

```
xcrun: error: invalid active developer path
```

### 原因

- Xcode Command Line Toolsがインストールされていない
- macOSアップデート後に再インストールが必要

### 解決策

**方法1: コマンドラインからインストール**

```bash
xcode-select --install
```

**方法2: App StoreからXcodeをインストール**

1. App Storeを開く
2. "Xcode"を検索
3. インストール（8GB以上、時間がかかる）

**方法3: 既存インストールのリセット**

```bash
sudo rm -rf /Library/Developer/CommandLineTools
xcode-select --install
```

---

## E005: pnpm install失敗

### 症状

```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/...
```

### 原因

- ネットワーク接続の問題
- npmレジストリへのアクセス制限
- pnpm-lock.yamlの破損

### 解決策

**方法1: リトライ**

```bash
pnpm install --frozen-lockfile
```

**方法2: キャッシュクリア**

```bash
pnpm store prune
pnpm install
```

**方法3: ロックファイル再生成**

```bash
rm pnpm-lock.yaml
pnpm install
```

**方法4: レジストリ変更**

```bash
# npmレジストリミラーを使用
pnpm config set registry https://registry.npmmirror.com
pnpm install
```

---

## E006: electron-rebuild失敗

### 症状

```
gyp ERR! stack Error: not found: make
```

### 原因

- Xcode Command Line Toolsがインストールされていない
- ビルドツールのパスが通っていない

### 解決策

**方法1: Xcode CLTを確認**

```bash
xcode-select -p
# 出力がない場合はインストール
xcode-select --install
```

**方法2: 強制再ビルド**

```bash
pnpm exec electron-rebuild --force
```

**方法3: ビルドキャッシュクリア**

```bash
rm -rf node_modules/.cache
pnpm exec electron-rebuild
```

---

## E007: better-sqlite3エラー

### 症状

```javascript
Error: Cannot find module 'better-sqlite3'
```

### 原因

- ネイティブバインディングがElectronと不一致
- 再ビルドが必要

### 解決策

**方法1: electron-rebuildを実行**

```bash
pnpm exec electron-rebuild
```

**方法2: better-sqlite3を再インストール**

```bash
pnpm remove better-sqlite3
pnpm install better-sqlite3
pnpm exec electron-rebuild
```

**方法3: node-gypのクリーンビルド**

```bash
cd node_modules/better-sqlite3
node-gyp rebuild --target=39.0.0 --arch=x64 --dist-url=https://electronjs.org/headers
```

---

## E008: 開発サーバー起動失敗

### 症状

```
Error: listen EADDRINUSE: address already in use :::5173
```

### 原因

- ポート5173が既に使用されている
- 前回の開発サーバーが終了していない

### 解決策

**方法1: 既存プロセスを終了**

```bash
lsof -ti:5173 | xargs kill -9
pnpm dev
```

**方法2: 別のポートを使用**

```bash
VITE_PORT=5174 pnpm dev
```

**方法3: プロセス確認**

```bash
# ポート使用状況確認
lsof -i:5173

# プロセスを手動で終了
kill -9 <PID>
```

---

## よくある質問（FAQ）

### Q1: 環境構築にどのくらい時間がかかりますか？

**A**:

- 自動セットアップ: 約30分
- 手動セットアップ: 約45-60分
- 2回目以降（キャッシュあり）: 約5-10分

### Q2: インターネット接続がない環境でも開発できますか？

**A**:
初回セットアップにはインターネット接続が必要です。依存関係をキャッシュした後は、オフラインでも開発可能です。

### Q3: M1/M2 Macで動作しますか？

**A**:
はい。Rosetta 2のインストールが必要な場合があります:

```bash
softwareupdate --install-rosetta
```

### Q4: Homebrewなしでインストールできますか？

**A**:
可能ですが、推奨しません。各ツールを個別に公式サイトからダウンロードする必要があります。

### Q5: ディスク容量を節約する方法は？

**A**:

```bash
# pnpmキャッシュのクリーンアップ
pnpm store prune

# 未使用の依存関係を削除
pnpm prune

# ビルド成果物の削除
rm -rf dist out
```

### Q6: 環境をリセットする方法は？

**A**:

```bash
# node_modulesを削除
rm -rf node_modules

# pnpmキャッシュをクリア
pnpm store prune

# 再インストール
pnpm install --frozen-lockfile
pnpm exec electron-rebuild
```

---

## パフォーマンス最適化

### ビルド速度の改善

**方法1: pnpmキャッシュの活用**

```bash
# キャッシュが有効か確認
pnpm store path
```

**方法2: 並列ビルドの有効化**

```bash
# .npmrcに追加
network-concurrency=16
```

**方法3: SSDの使用**

- HDDではなくSSDを使用すると、インストール速度が2-3倍向上

---

## ログの確認方法

### セットアップログ

```bash
# 最新のログを確認
ls -lt logs/setup-*.log | head -1 | awk '{print $NF}' | xargs cat

# すべてのログを確認
ls logs/setup-*.log
```

### 開発サーバーログ

開発サーバー実行時のログは、ターミナルに直接表示されます。

---

## サポート

### ドキュメント

- [環境構築ガイド](step-05-environment-setup-guide.md)
- [インストール詳細手順](step-06-installation-instructions.md)
- [環境構築要件書](../00-requirements/environment-setup-requirements.md)

### コミュニティ

- [Electron公式Discord](https://discord.gg/electron)
- [GitHub Issues](https://github.com/electron/electron/issues)

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 作成者         |
| ---------- | ---------- | -------- | -------------- |
| 1.0.0      | 2025-12-03 | 初版作成 | @manual-writer |

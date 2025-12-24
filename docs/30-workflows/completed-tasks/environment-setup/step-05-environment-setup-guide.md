# Electronデスクトップアプリ 環境構築ガイド

## 概要

このガイドは、Electronデスクトップアプリケーション開発のための環境構築手順を説明します。

### 対象読者

- Electronアプリの開発を始める開発者
- プロジェクトに新しく参加する開発者
- 環境を再構築する必要がある開発者

### 所要時間

- 自動セットアップ: 約30分
- 手動セットアップ: 約45-60分

---

## クイックスタート（自動セットアップ）

最速で環境を構築するには、自動セットアップスクリプトを使用します。

```bash
# プロジェクトルートに移動
cd /path/to/AIWorkflowOrchestrator

# セットアップスクリプトを実行
./scripts/setup-dev-environment.sh
```

スクリプトは以下を自動的に実行します:

1. Homebrewのインストール
2. Node.js 22.x LTSのインストール
3. pnpmの有効化
4. Xcode Command Line Toolsのインストール
5. プロジェクト依存関係のインストール
6. ネイティブモジュールの再ビルド
7. 環境検証

---

## 前提条件

### システム要件

- **OS**: macOS 10.15 (Catalina) 以降
- **ディスク容量**: 10GB以上の空き容量
- **メモリ**: 8GB以上推奨
- **ネットワーク**: インターネット接続（初回のみ）

### 必要な権限

- 管理者権限（一部ツールのインストールで必要）
- App Storeへのアクセス（Xcode Command Line Tools用）

---

## 手動セットアップ手順

自動セットアップが失敗した場合、または手動で環境を構築したい場合は、以下の手順に従ってください。

### Step 1: Homebrewのインストール

Homebrewは、macOS用のパッケージマネージャーです。

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**確認**:

```bash
brew --version
# 出力例: Homebrew 4.x.x
```

### Step 2: Node.jsのインストール

Node.js .x LTS（Jod）をインストールします。

```bash
brew install node
```

**確認**:

```bash
node --version
# 出力例: v22.12.0

npm --version
# 出力例: 10.9.2
```

**代替方法（nvm使用）**:

```bash
# nvmをインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# nvmでNode.js 22をインストール
nvm install 22
nvm use 22
```

### Step 3: pnpmの有効化

pnpmは、高速で効率的なパッケージマネージャーです。

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**確認**:

```bash
pnpm --version
# 出力例: 10.24.0
```

### Step 4: Xcode Command Line Toolsのインストール

ネイティブモジュール（better-sqlite3など）のビルドに必要です。

```bash
xcode-select --install
```

ダイアログが表示されたら「インストール」をクリックします。

**確認**:

```bash
xcode-select -p
# 出力例: /Library/Developer/CommandLineTools

gcc --version
# 出力例: Apple clang version 15.0.0
```

### Step 5: プロジェクト依存関係のインストール

```bash
# プロジェクトルートに移動
cd /path/to/AIWorkflowOrchestrator

# 依存関係をインストール
pnpm install --frozen-lockfile
```

**所要時間**: 3-5分

**確認**:

```bash
ls node_modules
# node_modules/ ディレクトリが存在する
```

### Step 6: ネイティブモジュールの再ビルド

better-sqlite3などのネイティブモジュールをElectron用に再ビルドします。

```bash
pnpm exec electron-rebuild
```

**確認**:

```bash
node -e "require('better-sqlite3')"
# エラーが表示されなければ成功
```

### Step 7: 環境検証

すべての依存関係が正しくインストールされているか検証します。

```bash
node scripts/verify-dependencies.mjs
```

**成功時の出力**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
依存関係検証結果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Node.js: v22.12.0 (OK)
✅ pnpm: 10.24.0 (OK)
✅ Electron: 39.2.4 (OK)
✅ TypeScript: 5.7.0 (OK)
✅ better-sqlite3: 動作確認 OK
✅ Vitest: 2.1.8 (OK)
✅ React: 18.3.1 (OK)
✅ Drizzle: 0.39.2 (OK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
検証結果: 8/8 成功
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ すべての必須依存関係が正しくインストールされています
```

### Step 8: 開発サーバー起動

```bash
pnpm dev
```

Electronアプリのウィンドウが表示されれば、環境構築は完了です。

---

## 環境変数設定

### .envファイルの作成

```bash
# .env.exampleをコピー
cp .env.example .env

# エディタで開いて編集
vim .env
```

### 必須環境変数

| 変数名        | 説明               | 例            |
| ------------- | ------------------ | ------------- |
| NODE_ENV      | 環境タイプ         | development   |
| DATABASE_PATH | SQLiteファイルパス | ./data/app.db |
| LOG_LEVEL     | ログレベル         | debug         |

---

## トラブルシューティング

詳細なトラブルシューティングは、[トラブルシューティングガイド](step-07-troubleshooting-environment.md)を参照してください。

### よくある問題

**Q: Homebrewのインストールに失敗する**
A: 管理者権限が必要です。パスワードを入力してください。

**Q: Node.jsのバージョンが古い**
A: `brew upgrade node@22` でアップグレードしてください。

**Q: better-sqlite3がロードできない**
A: `pnpm exec electron-rebuild` を実行してください。

**Q: pnpm installが遅い**
A: 初回は時間がかかります。2回目以降はキャッシュが使われます。

---

## 次のステップ

環境構築が完了したら、以下のドキュメントを参照して開発を開始してください:

1. [プロジェクト構造](../00-requirements/master_system_design.md#4-ディレクトリ構造)
2. [開発ワークフロー](../20-specifications/development-workflow.md)（将来作成予定）
3. [コーディング規約](./.claude/rules.md)

---

## 参考資料

- [Electron公式ドキュメント](https://www.electronjs.org/docs/latest/)
- [electron-vite公式ドキュメント](https://electron-vite.org/)
- [pnpm公式ドキュメント](https://pnpm.io/)
- [環境構築要件書](../00-requirements/environment-setup-requirements.md)
- [クロスプラットフォーム要件書](../00-requirements/cross-platform-requirements.md)

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 作成者         |
| ---------- | ---------- | -------- | -------------- |
| 1.0.0      | 2025-12-03 | 初版作成 | .claude/agents/manual-writer.md |

# Contributing to AIWorkflowOrchestrator

このドキュメントは、AIWorkflowOrchestratorへの貢献方法を説明します。

## 目次

- [必須要件](#必須要件)
- [開発環境セットアップ](#開発環境セットアップ)
- [Node.jsバージョン管理](#nodejsバージョン管理)
- [ネイティブモジュールの再ビルド](#ネイティブモジュールの再ビルド)
- [トラブルシューティング](#トラブルシューティング)

---

## 必須要件

| 要件    | バージョン        | 備考                   |
| ------- | ----------------- | ---------------------- |
| Node.js | >=22.21.1 <23.0.0 | .nvmrcで管理           |
| pnpm    | >=10.0.0          | パッケージマネージャー |
| Git     | 最新版推奨        | Huskyフック使用        |

---

## 開発環境セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-org/AIWorkflowOrchestrator.git
cd AIWorkflowOrchestrator
```

### 2. Node.jsバージョンの設定

このプロジェクトは特定のNode.jsバージョンを必要とします。

#### nvm使用の場合

```bash
nvm use
# または
nvm install
```

#### fnm使用の場合

```bash
fnm use
# または
fnm install
```

#### volta使用の場合

voltaは`package.json`から自動的にバージョンを検出します。

### 3. 依存関係のインストール

```bash
pnpm install
```

### 4. 動作確認

```bash
# テスト実行
pnpm --filter @repo/shared test workflow-repository.test.ts --run
```

---

## Node.jsバージョン管理

このプロジェクトは**3つの方法**でNode.jsバージョンを管理しています：

| ファイル       | 設定                | 対象ツール |
| -------------- | ------------------- | ---------- |
| `.nvmrc`       | 22.21.1             | nvm, fnm   |
| `package.json` | >=22.21.1 <23.0.0   | pnpm, npm  |
| `package.json` | volta.node: 22.21.1 | volta      |

### 手動確認

```bash
# 現在のバージョン確認
node -v

# 必要なバージョン確認
cat .nvmrc
```

### 自動バージョン切り替え

シェル設定で自動切り替えを有効にすることを推奨します。

#### zsh (.zshrc) の場合

```bash
# nvm用
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"
  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")
    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

---

## ネイティブモジュールの再ビルド

このプロジェクトは`better-sqlite3`（ネイティブモジュール）を使用しています。
Node.jsのバージョンやマシンアーキテクチャが変わった場合、再ビルドが必要です。

### 自動再ビルド（推奨）

`pnpm install`時に自動的にセットアップスクリプトが実行されます。

### 手動再ビルド

```bash
# セットアップスクリプトを実行
bash scripts/setup-native-modules.sh

# または直接rebuildを実行
pnpm rebuild better-sqlite3
```

### 完全クリーンビルド

問題が解決しない場合：

```bash
pnpm store prune && pnpm install --force
```

---

## トラブルシューティング

### NODE_MODULE_VERSION不一致エラー

```
Error: The module was compiled against a different Node.js version
```

**原因**: Node.jsのABIバージョンが不一致

**解決方法**:

```bash
# 1. バージョン確認
node -v
cat .nvmrc

# 2. バージョン不一致があれば切り替え
nvm use  # または fnm use

# 3. ネイティブモジュール再ビルド
pnpm store prune && pnpm install --force
```

### アーキテクチャ不一致エラー

```
Error: incompatible architecture (have 'arm64', need 'x86_64')
```

**原因**: Apple Silicon環境でx86_64バイナリがキャッシュされている

**解決方法**:

```bash
# pnpmキャッシュをクリアして再インストール
pnpm store prune
pnpm install --force

# 確認
pnpm --filter @repo/shared test workflow-repository.test.ts --run
```

### ワークツリーでの問題

git worktreeを使用している場合、`node_modules`は共有されません。

```bash
cd .worktrees/feature-branch
pnpm install
```

---

## Pre-pushフック

このプロジェクトはpre-pushフックでNode.jsバージョンを自動チェックします。

- 正しいバージョン: pushが成功
- 不正なバージョン: 自動切り替えを試行、失敗時は警告

`--no-verify`オプションでスキップ可能ですが、非推奨です。

---

## 質問・サポート

問題が解決しない場合は、GitHub Issueで報告してください。

- Issue作成時は以下を含めてください：
  - Node.jsバージョン（`node -v`の出力）
  - OS/アーキテクチャ（`uname -a`の出力）
  - エラーメッセージ全文

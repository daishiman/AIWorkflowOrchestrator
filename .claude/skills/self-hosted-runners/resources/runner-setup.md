# Runner Setup Guide

セルフホストランナーのインストール、設定、サービス管理の詳細ガイド。

## 目次

- [インストール](#インストール)
- [設定](#設定)
- [サービス管理](#サービス管理)
- [アップグレード](#アップグレード)
- [削除](#削除)

## インストール

### Linux (Ubuntu/Debian)

#### 1. ランナーユーザー作成

```bash
# 専用ユーザーを作成（セキュリティのため）
sudo useradd -m -s /bin/bash github-runner
sudo usermod -aG docker github-runner  # Docker使用する場合
```

#### 2. ランナーパッケージダウンロード

```bash
# ランナーディレクトリ作成
sudo mkdir -p /opt/actions-runner
sudo chown github-runner:github-runner /opt/actions-runner
cd /opt/actions-runner

# 最新版をダウンロード（GitHub UIから取得したURL）
sudo -u github-runner curl -o actions-runner-linux-x64-2.311.0.tar.gz \
  -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# 展開
sudo -u github-runner tar xzf actions-runner-linux-x64-2.311.0.tar.gz
```

#### 3. 依存関係インストール

```bash
# 必要なパッケージをインストール
sudo ./bin/installdependencies.sh
```

### Windows

#### PowerShell（管理者権限）

```powershell
# ランナーディレクトリ作成
mkdir C:\actions-runner
cd C:\actions-runner

# ダウンロード
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-win-x64-2.311.0.zip -OutFile actions-runner-win-x64-2.311.0.zip

# 展開
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD\actions-runner-win-x64-2.311.0.zip", "$PWD")
```

### macOS

```bash
# ランナーディレクトリ作成
mkdir actions-runner && cd actions-runner

# ダウンロード
curl -o actions-runner-osx-x64-2.311.0.tar.gz \
  -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-osx-x64-2.311.0.tar.gz

# 展開
tar xzf actions-runner-osx-x64-2.311.0.tar.gz
```

## 設定

### トークン取得

#### Repository レベル

1. GitHub: `Settings` → `Actions` → `Runners` → `New self-hosted runner`
2. トークンをコピー

#### Organization レベル

1. Organization: `Settings` → `Actions` → `Runners` → `New runner`
2. トークンをコピー

### 基本設定

#### Linux/macOS

```bash
# リポジトリレベル
sudo -u github-runner ./config.sh \
  --url https://github.com/OWNER/REPO \
  --token YOUR_TOKEN \
  --name my-runner \
  --labels linux,x64,custom-label

# Organizationレベル
sudo -u github-runner ./config.sh \
  --url https://github.com/ORGANIZATION \
  --token YOUR_TOKEN \
  --name my-runner \
  --labels linux,x64,custom-label
```

#### Windows

```powershell
.\config.cmd `
  --url https://github.com/OWNER/REPO `
  --token YOUR_TOKEN `
  --name my-runner `
  --labels windows,x64,custom-label
```

### エフェメラル設定

```bash
# ジョブ実行後に自動削除
./config.sh \
  --url https://github.com/OWNER/REPO \
  --token YOUR_TOKEN \
  --ephemeral \
  --name ephemeral-runner
```

### 作業ディレクトリ指定

```bash
# カスタム作業ディレクトリ
./config.sh \
  --url https://github.com/OWNER/REPO \
  --token YOUR_TOKEN \
  --work /custom/work/directory
```

### プロキシ設定

```bash
# HTTPプロキシ経由
./config.sh \
  --url https://github.com/OWNER/REPO \
  --token YOUR_TOKEN \
  --proxyurl http://proxy.company.com:8080 \
  --proxyusername user \
  --proxypassword pass
```

## サービス管理

### systemd（Linux）

#### サービスインストール

```bash
# サービスファイル作成
sudo ./svc.sh install github-runner

# サービス有効化
sudo systemctl enable actions.runner.OWNER-REPO.my-runner.service
```

#### サービス操作

```bash
# 開始
sudo systemctl start actions.runner.OWNER-REPO.my-runner.service

# 停止
sudo systemctl stop actions.runner.OWNER-REPO.my-runner.service

# 再起動
sudo systemctl restart actions.runner.OWNER-REPO.my-runner.service

# ステータス確認
sudo systemctl status actions.runner.OWNER-REPO.my-runner.service

# ログ確認
sudo journalctl -u actions.runner.OWNER-REPO.my-runner.service -f
```

#### サービスアンインストール

```bash
sudo ./svc.sh uninstall
```

### Windows サービス

#### インストール（管理者権限PowerShell）

```powershell
.\svc.sh install
```

#### 操作

```powershell
# 開始
Start-Service actions.runner.*

# 停止
Stop-Service actions.runner.*

# ステータス確認
Get-Service actions.runner.*
```

#### アンインストール

```powershell
.\svc.sh uninstall
```

### macOS (launchd)

#### plist ファイル作成

```bash
# ~/Library/LaunchAgents/actions.runner.plist
./svc.sh install
```

#### 操作

```bash
# 開始
launchctl load ~/Library/LaunchAgents/actions.runner.plist

# 停止
launchctl unload ~/Library/LaunchAgents/actions.runner.plist

# ステータス確認
launchctl list | grep actions.runner
```

### 手動実行（開発/テスト用）

```bash
# フォアグラウンドで実行
./run.sh

# または
sudo -u github-runner ./run.sh
```

## アップグレード

### 自動アップデート

GitHub Actions ランナーは自動的にアップデートされます。

### 手動アップグレード

```bash
# サービス停止
sudo systemctl stop actions.runner.OWNER-REPO.my-runner.service

# 最新版ダウンロード
cd /opt/actions-runner
sudo -u github-runner curl -o actions-runner-linux-x64-2.312.0.tar.gz \
  -L https://github.com/actions/runner/releases/download/v2.312.0/actions-runner-linux-x64-2.312.0.tar.gz

# バックアップ
sudo -u github-runner cp -r .runner .runner.backup
sudo -u github-runner cp -r _work _work.backup

# 展開（既存設定は保持される）
sudo -u github-runner tar xzf actions-runner-linux-x64-2.312.0.tar.gz

# サービス再起動
sudo systemctl start actions.runner.OWNER-REPO.my-runner.service
```

## 削除

### ランナー削除

```bash
# サービス停止
sudo systemctl stop actions.runner.OWNER-REPO.my-runner.service

# サービス無効化
sudo systemctl disable actions.runner.OWNER-REPO.my-runner.service

# サービスアンインストール
sudo ./svc.sh uninstall

# ランナー設定削除（トークン取得が必要）
sudo -u github-runner ./config.sh remove --token YOUR_REMOVAL_TOKEN

# ファイル削除
sudo rm -rf /opt/actions-runner
```

### Windows

```powershell
# サービス停止
Stop-Service actions.runner.*

# サービスアンインストール
.\svc.sh uninstall

# ランナー削除
.\config.cmd remove --token YOUR_REMOVAL_TOKEN

# ディレクトリ削除
Remove-Item -Recurse -Force C:\actions-runner
```

## 高度な設定

### 環境変数設定

#### Linux systemd

```bash
# サービスファイル編集
sudo systemctl edit actions.runner.OWNER-REPO.my-runner.service

# 追加
[Service]
Environment="NODE_ENV=production"
Environment="CUSTOM_VAR=value"
```

#### .env ファイル（すべてのOS）

```bash
# /opt/actions-runner/.env
NODE_ENV=production
CUSTOM_VAR=value
PATH=/usr/local/bin:/usr/bin:/bin
```

### リソース制限

#### systemd

```bash
# サービスファイル編集
sudo systemctl edit actions.runner.OWNER-REPO.my-runner.service

# リソース制限追加
[Service]
CPUQuota=200%
MemoryLimit=4G
TasksMax=1000
```

### ネットワーク設定

```bash
# no_proxy設定（内部リソースアクセス用）
export no_proxy="localhost,127.0.0.1,.company.local"

# プロキシ設定
export http_proxy="http://proxy.company.com:8080"
export https_proxy="http://proxy.company.com:8080"
```

## トラブルシューティング

### ログ確認

```bash
# ランナーログ
tail -f /opt/actions-runner/_diag/Runner_*.log

# ジョブログ
tail -f /opt/actions-runner/_diag/Worker_*.log

# systemd ログ
sudo journalctl -u actions.runner.* -f
```

### 一般的な問題

#### ランナーがオフライン

```bash
# サービスステータス確認
sudo systemctl status actions.runner.*

# ネットワーク確認
curl -I https://github.com

# 再起動
sudo systemctl restart actions.runner.*
```

#### 権限エラー

```bash
# 所有権確認
ls -la /opt/actions-runner

# 修正
sudo chown -R github-runner:github-runner /opt/actions-runner
```

#### ディスク容量不足

```bash
# 作業ディレクトリクリーンアップ
cd /opt/actions-runner/_work
sudo -u github-runner rm -rf _temp/*
sudo -u github-runner rm -rf _actions/*  # 注意: キャッシュも削除される
```

## セキュリティチェックリスト

- [ ] 専用ユーザーで実行
- [ ] 最小権限の原則を適用
- [ ] エフェメラルモード使用（可能な場合）
- [ ] ファイアウォール設定
- [ ] 定期的なセキュリティパッチ適用
- [ ] ログ監視設定
- [ ] 作業ディレクトリの定期的なクリーンアップ

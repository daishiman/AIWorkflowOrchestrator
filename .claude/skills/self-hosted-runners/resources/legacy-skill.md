---
name: .claude/skills/self-hosted-runners/SKILL.md
description: |
  GitHub Actions セルフホストランナーの設計と管理。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/self-hosted-runners/resources/runner-labels.md`: Runner Labelsリソース
  - `.claude/skills/self-hosted-runners/resources/runner-security.md`: Runner Securityリソース
  - `.claude/skills/self-hosted-runners/resources/runner-setup.md`: Runner Setupリソース

  - `.claude/skills/self-hosted-runners/templates/runner-workflow.yaml`: Runner Workflowテンプレート

  - `.claude/skills/self-hosted-runners/scripts/check-runner-status.mjs`: Check Runner Statusスクリプト

version: 1.0.0
---

# Self-Hosted Runners Skill

GitHub Actions セルフホストランナーの設計、セットアップ、管理スキル。

## ディレクトリ構造

```
.claude/skills/self-hosted-runners/
├── SKILL.md                    # このファイル（概要）
├── resources/
│   ├── runner-setup.md         # インストールと設定詳細
│   ├── runner-labels.md        # ラベル設計とターゲティング
│   └── runner-security.md      # セキュリティ強化ガイド
├── templates/
│   └── runner-workflow.yaml    # ワークフロー例集
└── scripts/
    └── check-runner-status.mjs # ステータスチェッカー
```

## コマンドリファレンス

```bash
# リソース参照
cat .claude/skills/self-hosted-runners/resources/runner-setup.md
cat .claude/skills/self-hosted-runners/resources/runner-labels.md
cat .claude/skills/self-hosted-runners/resources/runner-security.md

# テンプレート
cat .claude/skills/self-hosted-runners/templates/runner-workflow.yaml

# ステータス確認
node .claude/skills/self-hosted-runners/scripts/check-runner-status.mjs [owner] [repo]
```

## ランナータイプ

| タイプ           | 用途         | 特徴               |
| ---------------- | ------------ | ------------------ |
| **永続的**       | 長期稼働     | 常時起動、環境維持 |
| **エフェメラル** | ジョブ毎破棄 | セキュリティ重視   |
| **コンテナ**     | Docker 環境  | 分離、スケール     |
| **VM/物理**      | 専用 HW      | GPU、特殊環境      |

## runs-on パターン

```yaml
# 基本
runs-on: self-hosted

# ラベル複数（AND条件）
runs-on: [self-hosted, linux, x64, gpu]

# マトリクス
strategy:
  matrix:
    runner: [self-hosted-linux, self-hosted-windows]
runs-on: ${{ matrix.runner }}

# 条件分岐
runs-on: ${{ github.ref == 'refs/heads/main' && '[self-hosted, production]' || '[self-hosted, staging]' }}
```

## 主要ユースケース

```yaml
# プライベート環境アクセス
jobs:
  build:
    runs-on: [self-hosted, internal-network]
    steps:
      - uses: actions/checkout@v4
      - run: curl http://internal-api.company.local

# GPU利用
jobs:
  train:
    runs-on: [self-hosted, gpu, cuda-11.8]
    steps:
      - run: python train.py --gpu

# エフェメラルランナー
jobs:
  secure:
    runs-on: [self-hosted, ephemeral, isolated]
    steps:
      - uses: actions/checkout@v4
      - run: ./build.sh
```

## ラベル設計

### システムラベル（自動）

- `self-hosted`, `linux`/`windows`/`macOS`, `x64`/`ARM`/`ARM64`

### カスタムラベル推奨パターン

```bash
# 環境: [production, staging, development]
# ハードウェア: [gpu, cuda-11, high-memory, ssd]
# ネットワーク: [internal-network, vpn-enabled]
# セキュリティ: [ephemeral, isolated, sandboxed]
# 用途: [build-server, test-server, deploy-server]
```

## セキュリティベストプラクティス

```bash
# 1. エフェメラルモード（ジョブ後に自動削除）
./config.sh --url https://github.com/owner/repo --token TOKEN --ephemeral

# 2. 専用ユーザー（権限制限）
sudo useradd -m -s /bin/bash github-runner
sudo su - github-runner

# 3. ネットワーク分離（必要最小限のアクセス）
sudo iptables -A OUTPUT -d github.com -j ACCEPT
sudo iptables -A OUTPUT -j DROP
```

詳細は `resources/runner-security.md` を参照してください。

## トラブルシューティング

```bash
# ステータス確認
node .claude/skills/self-hosted-runners/scripts/check-runner-status.mjs owner repo
sudo systemctl status actions.runner.*

# ログ確認
tail -f /opt/actions-runner/_diag/Runner_*.log
tail -f /opt/actions-runner/_diag/Worker_*.log
```

## 関連スキル

- **.claude/skills/github-actions-syntax/SKILL.md**: `.claude/skills/github-actions-syntax/SKILL.md` - ワークフロー基本構文
- **.claude/skills/workflow-security/SKILL.md**: `.claude/skills/workflow-security/SKILL.md` - セキュリティベストプラクティス
- **.claude/skills/docker-build-push-action/SKILL.md**: `.claude/skills/docker-build-push-action/SKILL.md` - コンテナベースランナー
- **.claude/skills/deployment-environments-gha/SKILL.md**: `.claude/skills/deployment-environments-gha/SKILL.md` - 環境別デプロイ

## 参考リンク

- [Self-hosted runners - GitHub Docs](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Runner groups](https://docs.github.com/en/actions/hosting-your-own-runners/managing-access-to-self-hosted-runners-using-groups)
- [Security hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#hardening-for-self-hosted-runners)

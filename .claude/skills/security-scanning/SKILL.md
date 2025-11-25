---
name: security-scanning
version: 1.0.0
category: security
tags: [devops, security, ci-cd, vulnerability, sbom]
related_skills:
  - .claude/skills/ci-cd-pipelines/SKILL.md
  - .claude/skills/docker-best-practices/SKILL.md
---

# セキュリティスキャン

## 概要

CI/CDパイプラインに統合するセキュリティスキャンの設計と実装を支援するスキルです。
依存関係の脆弱性検出、コンテナイメージスキャン、SBOMの生成を対象とします。

## 対象読者

- DevOpsエンジニア
- セキュリティエンジニア
- CI/CDパイプライン設計者

## スキャンの種類

```
┌─────────────────────────────────────────────────────────┐
│                  セキュリティスキャン                      │
├─────────────────────────────────────────────────────────┤
│  依存関係スキャン    コンテナスキャン    コードスキャン    │
│  ├─ npm audit       ├─ Trivy           ├─ CodeQL        │
│  ├─ pnpm audit      ├─ Grype           ├─ Semgrep       │
│  └─ Snyk            └─ Snyk Container  └─ ESLint        │
│                                           Security      │
├─────────────────────────────────────────────────────────┤
│  SBOM生成           シークレット検出                      │
│  ├─ Syft            ├─ TruffleHog                       │
│  └─ CycloneDX       └─ GitLeaks                         │
└─────────────────────────────────────────────────────────┘
```

## リソース

詳細なガイドは以下を参照:

| リソース | 内容 |
|---------|------|
| [依存関係スキャン](resources/dependency-scanning.md) | npm/pnpm audit、Snyk統合 |
| [コンテナスキャン](resources/container-scanning.md) | Trivy、Grypeによるイメージスキャン |
| [SBOM生成](resources/sbom-generation.md) | ソフトウェア部品表の作成 |
| [シークレット検出](resources/secret-detection.md) | コード内の機密情報検出 |

## テンプレート

| テンプレート | 用途 |
|-------------|------|
| [security-scan-workflow.yml](templates/security-scan-workflow.yml) | GitHub Actionsセキュリティワークフロー |
| [trivy-config.yaml](templates/trivy-config.yaml) | Trivy設定ファイル |

## スクリプト

| スクリプト | 機能 |
|-----------|------|
| [scan-dependencies.mjs](scripts/scan-dependencies.mjs) | 依存関係脆弱性チェック |

## クイックスタート

### 1. 依存関係スキャン（ローカル）

```bash
# pnpm audit（推奨）
pnpm audit

# npm audit
npm audit

# 詳細レポート
pnpm audit --json > audit-report.json
```

### 2. コンテナスキャン（Trivy）

```bash
# イメージスキャン
trivy image myapp:latest

# 重大な脆弱性のみ
trivy image --severity CRITICAL,HIGH myapp:latest

# CI/CD用（脆弱性があれば失敗）
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
```

### 3. GitHub Actions統合

```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * 1'  # 毎週月曜

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm audit --audit-level=high
```

## 重大度レベル

| レベル | 対応 | SLA |
|-------|------|-----|
| Critical | 即時修正必須 | 24時間以内 |
| High | 優先修正 | 1週間以内 |
| Medium | 計画的修正 | 1ヶ月以内 |
| Low | 次回リリースで検討 | 任意 |

## ベストプラクティス

1. **シフトレフト**: 開発段階で早期にスキャン
2. **自動化**: CI/CDパイプラインに統合
3. **継続的監視**: 定期スキャンをスケジュール
4. **SBOM管理**: ソフトウェア構成を可視化
5. **例外管理**: 誤検知はポリシーで除外

## 関連スキル

- [CI/CDパイプライン](../ci-cd-pipelines/SKILL.md) - セキュリティスキャンの統合先
- [Dockerベストプラクティス](../docker-best-practices/SKILL.md) - コンテナセキュリティ

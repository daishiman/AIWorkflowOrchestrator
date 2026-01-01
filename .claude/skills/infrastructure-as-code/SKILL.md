---
name: infrastructure-as-code
description: |
  Infrastructure as Code（IaC）の原則に基づく構成管理の自動化を専門とするスキル。
  環境変数管理、Secret管理、Railway統合を中心に、再現可能で安全なインフラ構成を実現します。

  Anchors:
  • 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）/ 適用: 設定の外部化・DRY原則・エラーの早期検出 / 目的: 保守性とセキュリティの両立
  • IaC 4原則（宣言的定義・べき等性・バージョン管理・不変インフラ）/ 適用: インフラ構成全体 / 目的: 再現可能性の確保

  Trigger:
  Use when designing environment variables, managing secrets, configuring Railway deployments, or setting up infrastructure as code for Next.js/Electron projects.
  Keywords: railway.json, .env.example, environment variables, GitHub Secrets, Railway Secrets, Turso integration, infrastructure automation
tags:
  - infrastructure
  - devops
  - railway
  - environment-variables
  - secrets-management
  - ci-cd
dependencies: []
---

# Infrastructure as Code

## 概要

Infrastructure as Codeの原則に基づく構成管理の自動化を専門とするスキル。
環境変数管理、Secret管理、Railway統合を中心に、再現可能なインフラ構成を実現します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

## ベストプラクティス

### すべきこと

- Railway構成を設計・最適化する時
- 環境変数とSecretの管理戦略を設計する時
- 複数環境間の構成差分を最小化する時
- ローカル開発環境とクラウド環境を同期する時

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/infrastructure-as-code/references/Level1_basics.md
cat .claude/skills/infrastructure-as-code/references/Level2_intermediate.md
cat .claude/skills/infrastructure-as-code/references/Level3_advanced.md
cat .claude/skills/infrastructure-as-code/references/Level4_expert.md
cat .claude/skills/infrastructure-as-code/references/environment-variables.md
cat .claude/skills/infrastructure-as-code/references/iac-principles.md
cat .claude/skills/infrastructure-as-code/references/legacy-skill.md
cat .claude/skills/infrastructure-as-code/references/railway-integration.md
cat .claude/skills/infrastructure-as-code/references/secrets-management.md
```

### スクリプト実行

```bash
node .claude/skills/infrastructure-as-code/scripts/log_usage.mjs --help
node .claude/skills/infrastructure-as-code/scripts/validate-env.mjs --help
node .claude/skills/infrastructure-as-code/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/infrastructure-as-code/assets/env-example-template.txt
cat .claude/skills/infrastructure-as-code/assets/railway-json-template.json
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |

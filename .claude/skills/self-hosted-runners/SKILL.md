---
name: self-hosted-runners
description: |
  GitHub Actions セルフホストランナーの設計、セットアップ、セキュリティ管理を行うスキル。
  インストールから運用、トラブルシューティングまでの完全なライフサイクル管理を提供する。

  Anchors:
  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / 適用: 実践的改善と品質維持 / 目的: 段階的な実装と継続的な改善
  • GitHub Actions Documentation / 適用: セルフホストランナーの公式仕様 / 目的: 正確なAPI使用と設定パラメータの参照

  Trigger:
  Use when setting up self-hosted runners, configuring runner labels, implementing security measures, troubleshooting runner issues, or optimizing runner performance for GitHub Actions workflows.
  Keywords: self-hosted, runner, GitHub Actions, ephemeral, labels, security, setup, configuration, workflow optimization
version: 2.0.0
level: 1
last_updated: 2025-12-31
tags:
  - github-actions
  - ci-cd
  - infrastructure
  - security
  - devops
---

# Self-Hosted Runners Skill

## 概要

GitHub Actions セルフホストランナーの設計と管理。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 要件分析と計画

**目的**: ランナー要件を分析し、実装計画を策定する

**Task**: `agents/planning.md` を使用

**入力**:

- プロジェクト要件（ワークフロー、環境、セキュリティ要件）
- インフラ制約（予算、ハードウェア、ネットワーク）

**出力**:

- ランナー構成計画（タイプ、数、ラベル設計）
- セキュリティ要件定義

**参照**:

- `references/Level1_basics.md`: 基礎知識
- `references/runner-labels.md`: ラベル設計戦略

### Phase 2: セットアップと構成

**目的**: ランナーのインストールと設定を行う

**Task**: `agents/setup.md` を使用

**入力**:

- Phase 1 の構成計画
- GitHub リポジトリ/組織情報

**出力**:

- インストール済みランナー
- 設定ファイル（サービス、環境変数）

**参照**:

- `references/Level2_intermediate.md`: 実装手順
- `references/runner-setup.md`: セットアップガイド
- `assets/runner-workflow.yaml`: ワークフロー例

### Phase 3: セキュリティ強化

**目的**: セキュリティ対策を実装し、ランナーを強化する

**Task**: `agents/security.md` を使用

**入力**:

- セットアップ済みランナー
- セキュリティ要件（Phase 1 より）

**出力**:

- セキュリティ強化されたランナー
- 監視・ログ設定

**参照**:

- `references/Level3_advanced.md`: セキュリティパターン
- `references/runner-security.md`: セキュリティガイド

### Phase 4: 検証と最適化

**目的**: ランナーの動作確認と最適化を行う

**Task**: `agents/validation.md` を使用

**入力**:

- 構成済みランナー
- テストワークフロー

**出力**:

- 検証レポート
- 最適化推奨事項
- 実行記録（LOGS.md）

**参照**:

- `references/Level4_expert.md`: トラブルシューティング
- `scripts/check-runner-status.mjs`: ステータス確認
- `scripts/log_usage.mjs`: 使用記録

## ベストプラクティス

### すべきこと

- references/Level1_basics.md を参照し、適用範囲を明確にする
- references/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/self-hosted-runners/references/Level1_basics.md
cat .claude/skills/self-hosted-runners/references/Level2_intermediate.md
cat .claude/skills/self-hosted-runners/references/Level3_advanced.md
cat .claude/skills/self-hosted-runners/references/Level4_expert.md
cat .claude/skills/self-hosted-runners/references/legacy-skill.md
cat .claude/skills/self-hosted-runners/references/runner-labels.md
cat .claude/skills/self-hosted-runners/references/runner-security.md
cat .claude/skills/self-hosted-runners/references/runner-setup.md
```

### スクリプト実行

```bash
node .claude/skills/self-hosted-runners/scripts/check-runner-status.mjs --help
node .claude/skills/self-hosted-runners/scripts/log_usage.mjs --help
node .claude/skills/self-hosted-runners/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/self-hosted-runners/assets/runner-workflow.yaml
```

## 変更履歴

| Version | Date       | Changes                                     |
| ------- | ---------- | ------------------------------------------- |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added |

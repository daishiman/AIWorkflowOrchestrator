---
name: .claude/skills/infrastructure-as-code/SKILL.md
description: |
  Infrastructure as Codeの原則に基づく構成管理の自動化を専門とするスキル。
  環境変数管理、Secret管理、Railway統合を中心に、再現可能なインフラ構成を実現します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/environment-variables.md`: 環境変数の分類（機密/環境固有/共通）と管理場所の設計パターン
  - `resources/iac-principles.md`: IaCの4原則（宣言的定義/べき等性/バージョン管理/不変インフラ）
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/railway-integration.md`: railway.json構成、Turso統合、環境変数設定の詳細
  - `resources/secrets-management.md`: GitHub Secrets/Railway Secretsによるセキュアなクレデンシャル管理
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-env.mjs`: .env.exampleと実際の環境変数の検証
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/env-example-template.txt`: .env.exampleファイル作成テンプレート
  - `templates/railway-json-template.json`: railway.json（ビルド/デプロイ構成）テンプレート
  
  Use proactively when handling infrastructure as code tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Infrastructure as Code

## 概要

Infrastructure as Codeの原則に基づく構成管理の自動化を専門とするスキル。
環境変数管理、Secret管理、Railway統合を中心に、再現可能なインフラ構成を実現します。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

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
cat .claude/skills/infrastructure-as-code/resources/Level1_basics.md
cat .claude/skills/infrastructure-as-code/resources/Level2_intermediate.md
cat .claude/skills/infrastructure-as-code/resources/Level3_advanced.md
cat .claude/skills/infrastructure-as-code/resources/Level4_expert.md
cat .claude/skills/infrastructure-as-code/resources/environment-variables.md
cat .claude/skills/infrastructure-as-code/resources/iac-principles.md
cat .claude/skills/infrastructure-as-code/resources/legacy-skill.md
cat .claude/skills/infrastructure-as-code/resources/railway-integration.md
cat .claude/skills/infrastructure-as-code/resources/secrets-management.md
```

### スクリプト実行
```bash
node .claude/skills/infrastructure-as-code/scripts/log_usage.mjs --help
node .claude/skills/infrastructure-as-code/scripts/validate-env.mjs --help
node .claude/skills/infrastructure-as-code/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/infrastructure-as-code/templates/env-example-template.txt
cat .claude/skills/infrastructure-as-code/templates/railway-json-template.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

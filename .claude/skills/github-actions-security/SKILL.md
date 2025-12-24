---
name: .claude/skills/github-actions-security/SKILL.md
description: |
  GitHub Actionsセキュリティスキル。Repository/Environment Secrets、
  ログマスキング、品質ゲート統合、CI/CDパイプラインセキュリティを提供します。
  使用タイミング:
  
  📖 参照書籍:
  - 『Web Application Security』（Andrew Hoffman）: 脅威モデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/workflow-security-patterns.md`: workflow-security-patterns のパターン集
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/github-actions-deploy-template.yml`: github-actions-deploy-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling github actions security tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Web Application Security"
    author: "Andrew Hoffman"
    concepts:
      - "脅威モデリング"
      - "セキュア設計"
---

# GitHub Actions Security

## 概要

GitHub Actionsセキュリティスキル。Repository/Environment Secrets、
ログマスキング、品質ゲート統合、CI/CDパイプラインセキュリティを提供します。
使用タイミング:

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
- GitHub Actionsワークフローのセキュリティを強化する時
- Environment Secretsを設定する時
- CI/CD品質ゲートを統合する時
- Secret露出防止を実装する時
- デプロイワークフローを設計する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/github-actions-security/resources/Level1_basics.md
cat .claude/skills/github-actions-security/resources/Level2_intermediate.md
cat .claude/skills/github-actions-security/resources/Level3_advanced.md
cat .claude/skills/github-actions-security/resources/Level4_expert.md
cat .claude/skills/github-actions-security/resources/legacy-skill.md
cat .claude/skills/github-actions-security/resources/workflow-security-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/github-actions-security/scripts/log_usage.mjs --help
node .claude/skills/github-actions-security/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/github-actions-security/templates/github-actions-deploy-template.yml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

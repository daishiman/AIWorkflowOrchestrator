---
name: .claude/skills/pre-commit-security/SKILL.md
description: |
  pre-commit hookセキュリティスキル。機密情報検出パターン、
  git-secrets/gitleaks統合、チーム展開戦略、Git履歴スキャンを提供します。
  
  📖 参照書籍:
  - 『Web Application Security』（Andrew Hoffman）: 脅威モデリング
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/detection-pattern-library.md`: Secret Detection Pattern Library
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/setup-git-security.mjs`: Git Security Setup Script
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/pre-commit-hook-template.sh`: Pre-commit Hook Template for Secret Detection
  
  Use proactively when handling pre commit security tasks.
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

# Pre-commit Security Hooks

## 概要

pre-commit hookセキュリティスキル。機密情報検出パターン、
git-secrets/gitleaks統合、チーム展開戦略、Git履歴スキャンを提供します。

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
- pre-commit hookを実装する時
- 機密情報検出パターンを設計する時
- git-secrets/gitleaksを導入する時
- Git履歴をスキャンする時
- チーム全体にhookを展開する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/pre-commit-security/references/Level1_basics.md
cat .claude/skills/pre-commit-security/references/Level2_intermediate.md
cat .claude/skills/pre-commit-security/references/Level3_advanced.md
cat .claude/skills/pre-commit-security/references/Level4_expert.md
cat .claude/skills/pre-commit-security/references/detection-pattern-library.md
cat .claude/skills/pre-commit-security/references/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/pre-commit-security/scripts/log_usage.mjs --help
node .claude/skills/pre-commit-security/scripts/setup-git-security.mjs --help
node .claude/skills/pre-commit-security/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/pre-commit-security/assets/pre-commit-hook-template.sh
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

---
name: .claude/skills/dependency-auditing/SKILL.md
description: |
  セキュリティ脆弱性の検出、評価、対応戦略を専門とするスキル。
  CVE/GHSA識別子の理解、重大度評価（CVSS）、修正優先度の決定方法論を提供します。
  専門分野:
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/ci-cd-integration.md`: ci-cd-integration の詳細ガイド
  - `resources/cvss-scoring-guide.md`: cvss-scoring-guide のガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/remediation-strategies.md`: remediation-strategies の詳細ガイド
  - `resources/vulnerability-detection.md`: vulnerability-detection の詳細ガイド
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/security-audit.mjs`: セキュリティを監査するスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/vulnerability-assessment-template.md`: vulnerability-assessment-template のテンプレート
  
  Use proactively when handling dependency auditing tasks.
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

# Dependency Auditing

## 概要

セキュリティ脆弱性の検出、評価、対応戦略を専門とするスキル。
CVE/GHSA識別子の理解、重大度評価（CVSS）、修正優先度の決定方法論を提供します。
専門分野:

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
- 依存関係のセキュリティ監査を実施する時
- 脆弱性レポートを評価する時
- セキュリティパッチの適用優先度を決定する時
- CI/CDパイプラインにセキュリティチェックを統合する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/dependency-auditing/resources/Level1_basics.md
cat .claude/skills/dependency-auditing/resources/Level2_intermediate.md
cat .claude/skills/dependency-auditing/resources/Level3_advanced.md
cat .claude/skills/dependency-auditing/resources/Level4_expert.md
cat .claude/skills/dependency-auditing/resources/ci-cd-integration.md
cat .claude/skills/dependency-auditing/resources/cvss-scoring-guide.md
cat .claude/skills/dependency-auditing/resources/legacy-skill.md
cat .claude/skills/dependency-auditing/resources/remediation-strategies.md
cat .claude/skills/dependency-auditing/resources/vulnerability-detection.md
```

### スクリプト実行
```bash
node .claude/skills/dependency-auditing/scripts/log_usage.mjs --help
node .claude/skills/dependency-auditing/scripts/security-audit.mjs --help
node .claude/skills/dependency-auditing/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/dependency-auditing/templates/vulnerability-assessment-template.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

---
name: .claude/skills/cryptographic-practices/SKILL.md
description: |
  暗号化アルゴリズム、セキュアランダム値生成、鍵管理のベストプラクティスを提供します。
  ブルース・シュナイアーの『Applied Cryptography』と現代の暗号学標準に基づき、
  安全な暗号化実装、弱い暗号化の検出、予測可能な乱数生成の排除、
  
  📖 参照書籍:
  - 『Web Application Security』（Andrew Hoffman）: 脅威モデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/algorithm-strength-guide.md`: algorithm-strength-guide のガイド
  - `resources/csprng-implementation.md`: csprng-implementation の詳細ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/detect-weak-crypto.mjs`: detectweakcryptoを処理するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/crypto-audit-checklist.md`: crypto-audit-checklist のチェックリスト
  - `templates/encryption-config-template.json`: encryption-config-template のテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling cryptographic practices tasks.
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

# Cryptographic Practices

## 概要

暗号化アルゴリズム、セキュアランダム値生成、鍵管理のベストプラクティスを提供します。
ブルース・シュナイアーの『Applied Cryptography』と現代の暗号学標準に基づき、
安全な暗号化実装、弱い暗号化の検出、予測可能な乱数生成の排除、

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
- resources/Level1_basics.md を参照し、適用範囲を明確にする
- resources/Level2_intermediate.md を参照し、実務手順を整理する

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/cryptographic-practices/resources/Level1_basics.md
cat .claude/skills/cryptographic-practices/resources/Level2_intermediate.md
cat .claude/skills/cryptographic-practices/resources/Level3_advanced.md
cat .claude/skills/cryptographic-practices/resources/Level4_expert.md
cat .claude/skills/cryptographic-practices/resources/algorithm-strength-guide.md
cat .claude/skills/cryptographic-practices/resources/csprng-implementation.md
cat .claude/skills/cryptographic-practices/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/cryptographic-practices/scripts/detect-weak-crypto.mjs --help
node .claude/skills/cryptographic-practices/scripts/log_usage.mjs --help
node .claude/skills/cryptographic-practices/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/cryptographic-practices/templates/crypto-audit-checklist.md
cat .claude/skills/cryptographic-practices/templates/encryption-config-template.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

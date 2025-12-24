---
name: .claude/skills/command-security-design/SKILL.md
description: |
  コマンドのセキュリティ設計を専門とするスキル。
  allowed-toolsによるツール制限、disable-model-invocationによる自動実行防止、
  機密情報保護の実装方法を提供します。
  
  📖 参照書籍:
  - 『Web Application Security』（Andrew Hoffman）: 脅威モデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/security-guidelines.md`: セキュリティガイドライン
  - `scripts/audit-security.mjs`: セキュリティ監査スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/secure-command.md`: セキュアコマンドテンプレート
  
  Use proactively when handling command security design tasks.
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

# Command Security Design

## 概要

コマンドのセキュリティ設計を専門とするスキル。
allowed-toolsによるツール制限、disable-model-invocationによる自動実行防止、
機密情報保護の実装方法を提供します。

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
- 破壊的な操作を行うコマンドを作成する時
- ツール使用を制限したい時
- 機密情報の誤コミットを防ぐチェックを実装する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/command-security-design/resources/Level1_basics.md
cat .claude/skills/command-security-design/resources/Level2_intermediate.md
cat .claude/skills/command-security-design/resources/Level3_advanced.md
cat .claude/skills/command-security-design/resources/Level4_expert.md
cat .claude/skills/command-security-design/resources/legacy-skill.md
cat .claude/skills/command-security-design/resources/security-guidelines.md
```

### スクリプト実行
```bash
node .claude/skills/command-security-design/scripts/audit-security.mjs --help
node .claude/skills/command-security-design/scripts/log_usage.mjs --help
node .claude/skills/command-security-design/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/command-security-design/templates/secure-command.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

---
name: .claude/skills/code-static-analysis-security/SKILL.md
description: |
  コード静的解析によるセキュリティ脆弱性検出のベストプラクティスを提供します。
  SAST（Static Application Security Testing）ツール、パターンベース検出、
  データフロー分析によるSQLインジェクション、XSS、コマンドインジェクション、
  
  📖 参照書籍:
  - 『Web Application Security』（Andrew Hoffman）: 脅威モデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/injection-patterns.md`: SQL/XSS/コマンドインジェクションの検出パターンと正規表現
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/scan-sql-injection.mjs`: SQLインジェクション脆弱性の自動スキャンスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/sast-config-template.json`: ESLint Securityプラグイン等のSAST設定テンプレート
  
  Use proactively when handling code static analysis security tasks.
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

# Code Static Analysis Security

## 概要

コード静的解析によるセキュリティ脆弱性検出のベストプラクティスを提供します。
SAST（Static Application Security Testing）ツール、パターンベース検出、
データフロー分析によるSQLインジェクション、XSS、コマンドインジェクション、

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
- コードレビュー時のセキュリティチェック
- SQLインジェクション、XSS検出時
- センシティブデータ露出の検出時
- 危険な関数（eval、exec等）使用チェック時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/code-static-analysis-security/resources/Level1_basics.md
cat .claude/skills/code-static-analysis-security/resources/Level2_intermediate.md
cat .claude/skills/code-static-analysis-security/resources/Level3_advanced.md
cat .claude/skills/code-static-analysis-security/resources/Level4_expert.md
cat .claude/skills/code-static-analysis-security/resources/injection-patterns.md
cat .claude/skills/code-static-analysis-security/resources/legacy-skill.md
```

### スクリプト実行
```bash
node .claude/skills/code-static-analysis-security/scripts/log_usage.mjs --help
node .claude/skills/code-static-analysis-security/scripts/scan-sql-injection.mjs --help
node .claude/skills/code-static-analysis-security/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/code-static-analysis-security/templates/sast-config-template.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

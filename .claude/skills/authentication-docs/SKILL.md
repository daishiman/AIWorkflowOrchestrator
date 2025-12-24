---
name: .claude/skills/authentication-docs/SKILL.md
description: |
  API認証・認可フローの図解とドキュメント化、
  トークン取得手順の明確な説明のための知識とテンプレート
  
  📖 参照書籍:
  - 『Web Application Security』（Andrew Hoffman）: 脅威モデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/oauth2-flows.md`: OAuth 2.0各種フロー(Authorization Code、Client Credentials等)の詳細解説
  - `resources/security-best-practices.md`: 認証セキュリティベストプラクティス
  - `resources/token-management.md`: トークン取得・更新・有効期限管理
  - `scripts/generate-auth-flow-diagram.sh`: 認証フロー図自動生成スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/test-auth-endpoint.sh`: 認証エンドポイントテストスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/auth-quickstart.md`: 認証クイックスタートガイドテンプレート
  - `templates/oauth2-diagrams.md`: OAuth 2.0フローシーケンス図テンプレート(Mermaid形式)
  
  Use proactively when handling authentication docs tasks.
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

# Authentication Docs スキル

## 概要

API認証・認可フローの図解とドキュメント化、
トークン取得手順の明確な説明のための知識とテンプレート

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
cat .claude/skills/authentication-docs/resources/Level1_basics.md
cat .claude/skills/authentication-docs/resources/Level2_intermediate.md
cat .claude/skills/authentication-docs/resources/Level3_advanced.md
cat .claude/skills/authentication-docs/resources/Level4_expert.md
cat .claude/skills/authentication-docs/resources/legacy-skill.md
cat .claude/skills/authentication-docs/resources/oauth2-flows.md
cat .claude/skills/authentication-docs/resources/security-best-practices.md
cat .claude/skills/authentication-docs/resources/token-management.md
```

### スクリプト実行
```bash
.claude/skills/authentication-docs/scripts/generate-auth-flow-diagram.sh
node .claude/skills/authentication-docs/scripts/log_usage.mjs --help
.claude/skills/authentication-docs/scripts/test-auth-endpoint.sh
node .claude/skills/authentication-docs/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/authentication-docs/templates/auth-quickstart.md
cat .claude/skills/authentication-docs/templates/oauth2-diagrams.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

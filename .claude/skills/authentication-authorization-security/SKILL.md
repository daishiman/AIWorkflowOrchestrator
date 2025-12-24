---
name: .claude/skills/authentication-authorization-security/SKILL.md
description: |
  認証・認可機構のセキュリティ評価とベストプラクティスを提供します。
  ブルース・シュナイアーの『Secrets and Lies』とOAuth 2.0仕様に基づき、
  認証メカニズム、セッション管理、アクセス制御、JWT/トークンセキュリティの
  
  📖 参照書籍:
  - 『Web Application Security』（Andrew Hoffman）: 脅威モデリング
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/access-control-models.md`: RBAC/ABAC/ACLアクセス制御モデルの詳細比較と選択基準
  - `resources/jwt-security-checklist.md`: JWT署名アルゴリズム選択とトークンセキュリティ検証項目
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/oauth2-flow-comparison.md`: OAuth 2.0フロー（Authorization Code、PKCE等）の選択決定ツリー
  - `resources/password-hashing-guide.md`: bcrypt/argon2/scryptハッシュアルゴリズムの設定と実装ガイド
  - `resources/session-management-patterns.md`: サーバーサイドセッションとCookie属性のセキュリティパターン
  - `scripts/analyze-auth-endpoints.mjs`: 認証エンドポイントのセキュリティ分析スクリプト
  - `scripts/check-token-security.mjs`: JWTトークンセキュリティ検証スクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-session-config.mjs`: セッション設定のセキュリティ検証スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/oauth2-config-template.json`: oauth2-config-template のテンプレート
  - `templates/rbac-policy-template.yaml`: rbac-policy-template のテンプレート
  - `templates/session-security-checklist.md`: セッション管理セキュリティチェックリストテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling authentication authorization security tasks.
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

# Authentication & Authorization Security

## 概要

認証・認可機構のセキュリティ評価とベストプラクティスを提供します。
ブルース・シュナイアーの『Secrets and Lies』とOAuth 2.0仕様に基づき、
認証メカニズム、セッション管理、アクセス制御、JWT/トークンセキュリティの

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
- 認証システムのセキュリティレビュー時
- OAuth/OpenID Connect実装の評価時
- セッション管理とトークンセキュリティの設計時
- アクセス制御（RBAC/ABAC）の実装評価時
- JWT署名アルゴリズムとトークン管理の検証時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/authentication-authorization-security/resources/Level1_basics.md
cat .claude/skills/authentication-authorization-security/resources/Level2_intermediate.md
cat .claude/skills/authentication-authorization-security/resources/Level3_advanced.md
cat .claude/skills/authentication-authorization-security/resources/Level4_expert.md
cat .claude/skills/authentication-authorization-security/resources/access-control-models.md
cat .claude/skills/authentication-authorization-security/resources/jwt-security-checklist.md
cat .claude/skills/authentication-authorization-security/resources/legacy-skill.md
cat .claude/skills/authentication-authorization-security/resources/oauth2-flow-comparison.md
cat .claude/skills/authentication-authorization-security/resources/password-hashing-guide.md
cat .claude/skills/authentication-authorization-security/resources/session-management-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/authentication-authorization-security/scripts/analyze-auth-endpoints.mjs --help
node .claude/skills/authentication-authorization-security/scripts/check-token-security.mjs --help
node .claude/skills/authentication-authorization-security/scripts/log_usage.mjs --help
node .claude/skills/authentication-authorization-security/scripts/validate-session-config.mjs --help
node .claude/skills/authentication-authorization-security/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/authentication-authorization-security/templates/oauth2-config-template.json
cat .claude/skills/authentication-authorization-security/templates/rbac-policy-template.yaml
cat .claude/skills/authentication-authorization-security/templates/session-security-checklist.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

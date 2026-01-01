---
name: .claude/skills/oauth2-flows/SKILL.md
description: |
  OAuth 2.0認可フローの実装パターンとセキュリティベストプラクティス。
  Authorization Code Flow、PKCE、Refresh Token Flowの正確な実装を提供。
  Aaron PareckiのOAuth 2.0 Simplifiedに基づく実践的ガイダンス。
  
  📖 参照書籍:
  - 『Web Application Security』（Andrew Hoffman）: 脅威モデリング
  
  📚 リソース参照:
  - `references/Level1_basics.md`: レベル1の基礎ガイド
  - `references/Level2_intermediate.md`: レベル2の実務ガイド
  - `references/Level3_advanced.md`: レベル3の応用ガイド
  - `references/Level4_expert.md`: レベル4の専門ガイド
  - `references/authorization-code-flow.md`: Authorization Code Flow 詳細実装
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `references/pkce-implementation.md`: PKCE (Proof Key for Code Exchange) 実装詳細
  - `references/security-checklist.md`: OAuth 2.0 セキュリティチェックリスト
  - `references/token-storage-strategies.md`: トークンストレージ戦略
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-oauth-config.mjs`: OAuth 2.0設定のセキュリティ検証（state・redirect_uri・スコープ・トークンストレージの妥当性確認）
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/auth-code-flow-template.ts`: サーバーサイドOAuth認可コードフロー実装（state検証・トークン交換・エラーハンドリング含む）
  - `assets/pkce-implementation-template.ts`: SPA/モバイル向けPKCE実装（Code Verifier生成・SHA-256チャレンジ・検証フロー含む）
  
  Use proactively when handling oauth2 flows tasks.
---

# OAuth 2.0 Flows Implementation

## 概要

OAuth 2.0認可フローの実装パターンとセキュリティベストプラクティス。
Authorization Code Flow、PKCE、Refresh Token Flowの正確な実装を提供。
Aaron PareckiのOAuth 2.0 Simplifiedに基づく実践的ガイダンス。

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
- OAuth 2.0プロバイダー統合時（Google、GitHub、Discord等）
- 認可フローの選択と実装が必要な時
- PKCEによるSPA・モバイルアプリ対応時
- トークンライフサイクル管理の設計時
- OAuth 2.0セキュリティベストプラクティス適用時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/oauth2-flows/references/Level1_basics.md
cat .claude/skills/oauth2-flows/references/Level2_intermediate.md
cat .claude/skills/oauth2-flows/references/Level3_advanced.md
cat .claude/skills/oauth2-flows/references/Level4_expert.md
cat .claude/skills/oauth2-flows/references/authorization-code-flow.md
cat .claude/skills/oauth2-flows/references/legacy-skill.md
cat .claude/skills/oauth2-flows/references/pkce-implementation.md
cat .claude/skills/oauth2-flows/references/security-checklist.md
cat .claude/skills/oauth2-flows/references/token-storage-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/oauth2-flows/scripts/log_usage.mjs --help
node .claude/skills/oauth2-flows/scripts/validate-oauth-config.mjs --help
node .claude/skills/oauth2-flows/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/oauth2-flows/assets/auth-code-flow-template.ts
cat .claude/skills/oauth2-flows/assets/pkce-implementation-template.ts
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

---
name: .claude/skills/api-connector-design/SKILL.md
description: |
  外部APIとの統合設計パターンに関する専門知識。
  RESTful API、GraphQL、WebSocket等の統合設計と実装指針を提供します。
  
  📖 参照書籍:
  - 『RESTful Web APIs』（Leonard Richardson）: リソース設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/authentication-flows.md`: OAuth 2.0、API Key、JWTなどの認証フロー詳細
  - `resources/error-handling-patterns.md`: API統合におけるエラーハンドリングパターン
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/rate-limiting-strategies.md`: Rate Limiting対策とリトライ戦略
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/test-api-connection.mjs`: API接続テストスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/api-client-template.ts`: APIクライアント実装テンプレート
  - `templates/auth-config-template.json`: 認証設定ファイルテンプレート
  
  Use proactively when handling api connector design tasks.
version: 1.0.1
level: 1
last_updated: 2025-12-24
references:
  - book: "RESTful Web APIs"
    author: "Leonard Richardson"
    concepts:
      - "リソース設計"
      - "HTTP設計"
---

# API Connector Design スキル

## 概要

外部APIとの統合設計パターンに関する専門知識。
RESTful API、GraphQL、WebSocket等の統合設計と実装指針を提供します。

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
- 外部API（Google Drive, Slack, GitHub等）との統合設計時
- 認証フロー（OAuth 2.0, API Key等）の実装設計時
- Rate Limitingやリトライ戦略の設計時
- API統合アーキテクチャのレビュー時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/api-connector-design/resources/Level1_basics.md
cat .claude/skills/api-connector-design/resources/Level2_intermediate.md
cat .claude/skills/api-connector-design/resources/Level3_advanced.md
cat .claude/skills/api-connector-design/resources/Level4_expert.md
cat .claude/skills/api-connector-design/resources/authentication-flows.md
cat .claude/skills/api-connector-design/resources/error-handling-patterns.md
cat .claude/skills/api-connector-design/resources/legacy-skill.md
cat .claude/skills/api-connector-design/resources/rate-limiting-strategies.md
```

### スクリプト実行
```bash
node .claude/skills/api-connector-design/scripts/log_usage.mjs --help
node .claude/skills/api-connector-design/scripts/test-api-connection.mjs --help
node .claude/skills/api-connector-design/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/api-connector-design/templates/api-client-template.ts
cat .claude/skills/api-connector-design/templates/auth-config-template.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.1 | 2025-12-24 | Spec alignment and required artifacts added |

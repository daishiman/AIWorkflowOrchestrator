---
name: .claude/skills/request-response-examples/SKILL.md
description: |
  APIリクエスト・レスポンスの具体的なサンプル作成と
  エラーケースドキュメント化のための知識とテンプレート
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/error-response-standards.md`: エラーレスポンス標準ガイド
  - `resources/example-design-patterns.md`: リクエスト・レスポンス例 設計パターン
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/sdk-examples.md`: 言語別SDKサンプル作成ガイド
  - `scripts/generate-curl-examples.js`: OpenAPI 仕様から cURL コマンド例を生成するスクリプト
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-examples.js`: OpenAPI 仕様内の example 検証スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/curl-examples.md`: cURLサンプルテンプレート
  - `templates/error-catalog.md`: エラーカタログテンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling request response examples tasks.
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

# Request/Response Examples スキル

## 概要

APIリクエスト・レスポンスの具体的なサンプル作成と
エラーケースドキュメント化のための知識とテンプレート

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
cat .claude/skills/request-response-examples/resources/Level1_basics.md
cat .claude/skills/request-response-examples/resources/Level2_intermediate.md
cat .claude/skills/request-response-examples/resources/Level3_advanced.md
cat .claude/skills/request-response-examples/resources/Level4_expert.md
cat .claude/skills/request-response-examples/resources/error-response-standards.md
cat .claude/skills/request-response-examples/resources/example-design-patterns.md
cat .claude/skills/request-response-examples/resources/legacy-skill.md
cat .claude/skills/request-response-examples/resources/sdk-examples.md
```

### スクリプト実行
```bash
.claude/skills/request-response-examples/scripts/generate-curl-examples.js
node .claude/skills/request-response-examples/scripts/log_usage.mjs --help
.claude/skills/request-response-examples/scripts/validate-examples.js
node .claude/skills/request-response-examples/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/request-response-examples/templates/curl-examples.md
cat .claude/skills/request-response-examples/templates/error-catalog.md
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |

---
name: .claude/skills/integration-patterns/SKILL.md
description: |
  MCPサーバーと外部システム間の統合パターンに関する専門知識。
  同期・非同期通信、イベント駆動アーキテクチャ、データ同期パターンの設計指針を提供します。
  
  📖 参照書籍:
  - 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/async-patterns.md`: Message Queue/Pub-Sub/Sagaパターンの詳細と実装ガイド
  - `resources/event-driven-guide.md`: Event Sourcing/CQRS/Webhookによるイベント駆動設計
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/sync-patterns.md`: Request-Response/Aggregator/Gatewayパターンの詳細
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/review-integration-design.mjs`: 統合設計のアーキテクチャレビューと改善提案
  - `scripts/validate-message-schema.mjs`: メッセージスキーマ定義の検証とバージョン互換性チェック
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/integration-design-template.md`: 統合パターン選択と設計ドキュメントテンプレート
  - `templates/message-schema-template.json`: イベント/メッセージスキーマ定義テンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling integration patterns tasks.
version: 1.0.1
level: 1
last_updated: 2025-12-24
references:
  - book: "The Pragmatic Programmer"
    author: "Andrew Hunt, David Thomas"
    concepts:
      - "実践的改善"
      - "品質維持"
---

# Integration Patterns スキル

## 概要

MCPサーバーと外部システム間の統合パターンに関する専門知識。
同期・非同期通信、イベント駆動アーキテクチャ、データ同期パターンの設計指針を提供します。

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
- MCPサーバーと外部システムの連携設計時
- 非同期処理パターンの設計時
- イベント駆動統合の設計時
- マルチサービス連携の設計時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/integration-patterns/resources/Level1_basics.md
cat .claude/skills/integration-patterns/resources/Level2_intermediate.md
cat .claude/skills/integration-patterns/resources/Level3_advanced.md
cat .claude/skills/integration-patterns/resources/Level4_expert.md
cat .claude/skills/integration-patterns/resources/async-patterns.md
cat .claude/skills/integration-patterns/resources/event-driven-guide.md
cat .claude/skills/integration-patterns/resources/legacy-skill.md
cat .claude/skills/integration-patterns/resources/sync-patterns.md
```

### スクリプト実行
```bash
node .claude/skills/integration-patterns/scripts/log_usage.mjs --help
node .claude/skills/integration-patterns/scripts/review-integration-design.mjs --help
node .claude/skills/integration-patterns/scripts/validate-message-schema.mjs --help
node .claude/skills/integration-patterns/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/integration-patterns/templates/integration-design-template.md
cat .claude/skills/integration-patterns/templates/message-schema-template.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.1 | 2025-12-24 | Spec alignment and required artifacts added |

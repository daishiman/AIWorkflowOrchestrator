---
name: integration-patterns
description: |
  MCPサーバーと外部システム間の統合パターンに関する専門知識。
  同期・非同期通信、イベント駆動アーキテクチャ、データ同期パターンの設計指針を提供します。

  Anchors:
  • Enterprise Integration Patterns (Gregor Hohpe, Bobby Woolf) / 適用: 統合パターン設計 / 目的: スケーラブルな連携設計
  • Designing Data-Intensive Applications (Martin Kleppmann) / 適用: 非同期通信・イベント駆動 / 目的: 分散システムの信頼性
  • The Pragmatic Programmer (Andrew Hunt, David Thomas) / 適用: 実装手法・品質管理 / 目的: 実践的な改善

  Trigger:
  システム統合パターン設計、API連携実装、サービス間通信設計、非同期処理パターン構築、イベント駆動アーキテクチャ設計時に使用。
  integration patterns, mcp server, async communication, event-driven, message queue, api integration, system integration, service mesh
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
references:
  - book: "Enterprise Integration Patterns"
    author: "Gregor Hohpe, Bobby Woolf"
    concepts:
      - "統合パターン設計"
      - "スケーラブルな連携"
  - book: "Designing Data-Intensive Applications"
    author: "Martin Kleppmann"
    concepts:
      - "非同期通信"
      - "分散システムの信頼性"
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

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: パターン選択と前提分析

**目的**: システム統合タスクの要件からふさわしいパターンを特定する

**アクション**:

1. システムの通信要件（同期vs非同期）を分析
2. スケーラビリティとレイテンシー要件を確認
3. `references/Level1_basics.md` で基本パターン（Request-Response、Message Queue、Pub-Sub、Saga）を確認
4. 統合設計テンプレート（`assets/integration-design-template.md`）を準備

**参照**: `references/sync-patterns.md`、`references/async-patterns.md`

### Phase 2: 設計と実装

**目的**: 選択したパターンに基づいて詳細設計を行い、実装の指針を定める

**アクション**:

1. メッセージスキーマの定義（`assets/message-schema-template.json`を活用）
2. `references/Level2_intermediate.md` と `references/Level3_advanced.md` から実装パターンを抽出
3. イベント駆動設計の場合は `references/event-driven-guide.md` を参照
4. マッピングと変換ロジックの設計

**参照**: `references/event-driven-guide.md`、`scripts/review-integration-design.mjs`

### Phase 3: 検証と最適化

**目的**: 統合設計の信頼性と効率性を確保

**アクション**:

1. メッセージスキーマ検証：`scripts/validate-message-schema.mjs` を実行
2. 設計レビュー：`scripts/review-integration-design.mjs` で改善提案を取得
3. `references/Level4_expert.md` から高度なパターンと最適化手法を確認
4. `scripts/log_usage.mjs` で実行結果を記録

**参照**: `references/Level4_expert.md`、`scripts/validate-skill.mjs`

## Task仕様ナビ

| Task         | 起動タイミング | 入力                   | 出力                         |
| ------------ | -------------- | ---------------------- | ---------------------------- |
| パターン選択 | Phase 1開始時  | システム要件・通信要件 | 推奨統合パターン             |
| スキーマ定義 | Phase 2開始時  | メッセージの構造要件   | JSON Schema / メッセージ定義 |
| 設計検証     | Phase 3開始時  | 統合設計ドキュメント   | 検証結果・改善提案           |

**詳細仕様**: 各フェーズの詳細は `references/` ディレクトリの対応ファイルを参照

## ベストプラクティス

### すべきこと

- **要件に基づく選択**: 単一の同期パターンよりも、業務要件に適したパターン（非同期・イベント駆動）を検討
- **スキーマ定義の重視**: メッセージスキーマを明確に定義し、バージョン管理を実施
- **エラーハンドリング**: 非同期通信ではReply Channel パターンやDead Letter Queue の利用を検討
- **監視・ロギング**: メッセージフローの可視化とエラー追跡を組み込む
- **イベント駆動設計の活用**: スケーラブルなシステムではPub-Subやイベントソーシングを検討

### 避けるべきこと

- **単一の同期Request-Response**: 高スケーラビリティが必要な場合の過度な同期通信の使用
- **スキーマレス設計**: バージョン管理なしのメッセージ設計
- **エラー処理の欠落**: タイムアウト・リトライロジック なしの統合
- **監視の不備**: 統合エラーの検知遅延につながる事前監視の欠落
- **アンチパターンの無視**: resources の「antipatterns」セクションで述べられる設計ミス

## リソース参照

### references/（詳細知識）

- **基礎ガイド**: See [references/Level1_basics.md](references/Level1_basics.md) - 基本パターン、選択基準
- **実務ガイド**: See [references/Level2_intermediate.md](references/Level2_intermediate.md) - 実装パターン、エラーハンドリング
- **応用ガイド**: See [references/Level3_advanced.md](references/Level3_advanced.md) - 複合パターン、スケーリング
- **専門ガイド**: See [references/Level4_expert.md](references/Level4_expert.md) - 高度な最適化、レジリエンス
- **同期パターン詳細**: See [references/sync-patterns.md](references/sync-patterns.md) - Request-Response、Aggregator、Gateway
- **非同期パターン詳細**: See [references/async-patterns.md](references/async-patterns.md) - Message Queue、Pub-Sub、Saga
- **イベント駆動設計**: See [references/event-driven-guide.md](references/event-driven-guide.md) - Event Sourcing、CQRS、Webhook
- **要求仕様索引**: See [references/requirements-index.md](references/requirements-index.md)
- **旧スキル参照**: See [references/legacy-skill.md](references/legacy-skill.md)

### scripts/（自動化ツール）

```bash
# スキル構造検証
node .claude/skills/integration-patterns/scripts/validate-skill.mjs

# 統合設計レビュー
node .claude/skills/integration-patterns/scripts/review-integration-design.mjs <design-file>

# メッセージスキーマ検証
node .claude/skills/integration-patterns/scripts/validate-message-schema.mjs <schema-file>

# 使用記録とメトリクス
node .claude/skills/integration-patterns/scripts/log_usage.mjs [--analyze]
```

### assets/（テンプレート）

- **統合設計テンプレート**: See [assets/integration-design-template.md](assets/integration-design-template.md)
- **メッセージスキーマテンプレート**: See [assets/message-schema-template.json](assets/message-schema-template.json)

## 変更履歴

| Version | Date       | Changes                                                         |
| ------- | ---------- | --------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様への準拠：Anchors/Trigger追加、Task仕様ナビ実装 |
| 1.0.1   | 2025-12-24 | Spec alignment and required artifacts added                     |

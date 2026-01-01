---
name: event-driven-architecture
description: |
  イベント駆動アーキテクチャの設計・実装スキル。メッセージングパターン、Event Sourcing、CQRS、Sagaを活用し、
  スケーラブルで疎結合なシステムを構築する。

  Anchors:
  • Enterprise Integration Patterns (Gregor Hohpe) / 適用: メッセージングパターン / 目的: 疎結合な統合設計
  • Designing Event-Driven Systems (Ben Stopford) / 適用: EDAアーキテクチャ / 目的: スケーラブルな非同期処理
  • Domain-Driven Design (Eric Evans) / 適用: ドメインイベント / 目的: ビジネスイベントの表現

  Trigger:
  Use when designing event-driven systems, implementing event sourcing, CQRS, message brokers, saga patterns, or asynchronous service integration.
  event-driven, messaging, pub/sub, event sourcing, cqrs, saga, kafka, rabbitmq, async

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Event-Driven Architecture

## 概要

イベント駆動アーキテクチャ（EDA）の設計・実装を支援するスキル。疎結合、スケーラビリティ、レジリエンスを実現するイベントベースシステムを構築する。

## ワークフロー

### Phase 1: イベントモデリング

**目的**: ドメインイベントとフローの設計

**アクション**:

1. ビジネスイベントの特定
2. イベントスキーマの定義
3. イベントフローのマッピング
4. 時系列順序の要件定義

**Task**: `agents/event-modeling.md` を参照

### Phase 2: アーキテクチャ設計

**目的**: EDAシステム構造の設計

**アクション**:

1. メッセージングパターン選択
2. ブローカー/イベントストア選定
3. スキーマバージョニング戦略
4. 整合性パターンの決定

**Task**: `agents/architecture-design.md` を参照

### Phase 3: 実装

**目的**: イベント駆動コンポーネントの実装

**アクション**:

1. パブリッシャー/サブスクライバー実装
2. 冪等ハンドラの実装
3. DLQ（Dead Letter Queue）設定
4. 監視・トレーシング統合

**Task**: `agents/implementation.md` を参照

### Phase 4: テスト・検証

**目的**: システムの信頼性確認

**アクション**:

1. エンドツーエンドテスト
2. 冪等性・整合性検証
3. 障害シナリオテスト
4. パフォーマンステスト

**Task**: `agents/testing.md` を参照

## Task仕様（ナビゲーション）

| Task                | 起動タイミング | 入力               | 出力                 |
| ------------------- | -------------- | ------------------ | -------------------- |
| event-modeling      | Phase 1開始時  | ビジネス要件       | イベントカタログ     |
| architecture-design | Phase 2開始時  | イベントカタログ   | アーキテクチャ設計書 |
| implementation      | Phase 3開始時  | アーキテクチャ設計 | 実装済みコード       |
| testing             | Phase 4開始時  | 実装コード         | テスト結果レポート   |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## ベストプラクティス

### すべきこと

- イベントは不変（発行済みイベントは変更しない）
- スキーマバージョニングを初日から計画
- すべてのハンドラを冪等に実装
- Dead Letter Queueを必ず設定
- 相関IDと分散トレーシングを追加
- At-least-once配信 + 冪等ハンドラを採用

### 避けるべきこと

- 大きなペイロード（参照を使用）
- イベントにビジネスロジックを含める
- サービス間でデータベースを共有
- リクエスト/レスポンスパスで同期待機
- 長いイベントチェーン（デバッグ困難）
- リトライロジックの欠如

## リソース参照

### references/（詳細知識）

| リソース               | パス                                                                       | 用途                    |
| ---------------------- | -------------------------------------------------------------------------- | ----------------------- |
| メッセージングパターン | See [references/messaging-patterns.md](references/messaging-patterns.md)   | Pub/Sub、ブローカー選定 |
| Event Sourcing & CQRS  | See [references/event-sourcing-cqrs.md](references/event-sourcing-cqrs.md) | ES、CQRS、Saga実装      |

### scripts/（決定論的処理）

| スクリプト                  | 用途                 | 使用例                                                 |
| --------------------------- | -------------------- | ------------------------------------------------------ |
| `validate_event_schema.mjs` | イベントスキーマ検証 | `node scripts/validate_event_schema.mjs <schema-file>` |
| `log_usage.mjs`             | フィードバック記録   | `node scripts/log_usage.mjs --result success`          |

### assets/（テンプレート）

| テンプレート                 | 用途                     |
| ---------------------------- | ------------------------ |
| `event-schema-template.json` | イベントスキーマ雛形     |
| `publisher-template.ts`      | パブリッシャー実装雛形   |
| `subscriber-template.ts`     | サブスクライバー実装雛形 |

## 変更履歴

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 2.0.0   | 2026-01-01 | 18-skills.md完全準拠版として再構築 |
| 1.0.0   | 2025-12-31 | 初版作成                           |

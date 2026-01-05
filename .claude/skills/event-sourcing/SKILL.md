---
name: event-sourcing
description: |
  イベントソーシングパターンの設計・実装スキル。状態変更をイベントとして記録し、
  イベントストリームから状態を再構築する。CQRS、スナップショット、イベントリプレイを統合的に提供。

  Anchors:
  • Domain-Driven Design (Eric Evans) / 適用: ドメインイベント設計 / 目的: 業務的に意味のあるイベント抽出
  • Implementing DDD (Vaughn Vernon) / 適用: イベントストア実装 / 目的: アグリゲートとイベント境界
  • CQRS Journey (Microsoft) / 適用: CQRS実装パターン / 目的: コマンドとクエリの分離
  • Event Sourcing Pattern (Martin Fowler) / 適用: 基礎パターン / 目的: 状態変更の記録と再生

  Trigger:
  Use when implementing event sourcing, designing domain events, building event stores, implementing CQRS, or requiring complete audit trails and time-travel debugging.
  event sourcing, cqrs, event store, domain events, aggregate, projection, snapshot, event replay

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Event Sourcing

## 概要

イベントソーシングパターンの設計・実装を支援するスキル。状態変更をイベントとして記録し、イベントストリームから現在の状態を再構築する。CQRS、スナップショット戦略、イベントリプレイを統合的に提供。

## ワークフロー

### Phase 1: イベント分析

**目的**: ドメインイベントを特定し、イベントソーシングの適用範囲を決定

**アクション**:

1. ビジネス要件とドメインモデルを分析
2. 記録すべきドメインイベントを特定
3. イベント粒度と境界を決定
4. イベントスキーマを設計

**Task**: `agents/analyze-events.md` を参照

### Phase 2: イベントストア設計

**目的**: イベントの永続化と読み取りの仕組みを設計

**アクション**:

1. イベントストアのスキーマを設計
2. イベントバージョニング戦略を決定
3. ストリーム構造を設計
4. 永続化技術を選定

**Task**: `agents/design-event-store.md` を参照

### Phase 3: CQRS実装

**目的**: コマンドとクエリを分離し、Read Modelを構築

**アクション**:

1. コマンドハンドラーを実装
2. イベントハンドラーを実装
3. Read Model投影（Projection）を設計
4. 結果整合性の確保

**Task**: `agents/implement-cqrs.md` を参照

### Phase 4: 最適化

**目的**: スナップショット戦略とパフォーマンス最適化

**アクション**:

1. スナップショット戦略を設計
2. イベントリプレイを実装
3. パフォーマンスチューニング

**Task**: `agents/optimize-event-store.md` を参照

### Phase 5: 検証

**目的**: 実装の品質確認

**アクション**:

1. イベントストア検証
2. CQRS実装検証
3. パフォーマンステスト

**Task**: `agents/validate-implementation.md` を参照

## Task仕様（ナビゲーション）

| Task                    | 起動タイミング | 入力             | 出力             |
| ----------------------- | -------------- | ---------------- | ---------------- |
| analyze-events          | Phase 1開始時  | ドメイン要件     | イベントカタログ |
| design-event-store      | Phase 2開始時  | イベントカタログ | ストア設計書     |
| implement-cqrs          | Phase 3開始時  | ストア設計書     | CQRS実装         |
| optimize-event-store    | Phase 4開始時  | CQRS実装         | 最適化済み実装   |
| validate-implementation | Phase 5開始時  | 最適化済み実装   | 検証レポート     |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## ベストプラクティス

### すべきこと

- イベント名は過去形で命名（OrderPlaced, PaymentProcessed）
- イベントは不変（Immutable）に設計
- イベントには必要十分な情報を含める
- イベントバージョニング戦略を最初から設計
- スナップショットでリプレイを高速化
- イベントストアとRead Modelを明確に分離

### 避けるべきこと

- 技術的な状態変更を全てイベント化
- イベントの後からの変更・削除
- 大きなペイロード（参照で十分な場合）
- Read Modelへの直接書き込み
- スナップショットのみに依存
- イベントバージョン管理の怠り

## リソース参照

### references/（詳細知識）

| リソース           | パス                                                                       | 用途                 |
| ------------------ | -------------------------------------------------------------------------- | -------------------- |
| イベント設計ガイド | See [references/event-design-guide.md](references/event-design-guide.md)   | イベント設計パターン |
| CQRS実装ガイド     | See [references/cqrs-implementation.md](references/cqrs-implementation.md) | CQRS設計・実装       |
| 最適化ガイド       | See [references/optimization-guide.md](references/optimization-guide.md)   | スナップショット等   |

### scripts/（決定論的処理）

| スクリプト      | 用途               | 使用例                                        |
| --------------- | ------------------ | --------------------------------------------- |
| `log_usage.mjs` | フィードバック記録 | `node scripts/log_usage.mjs --result success` |

### assets/（テンプレート）

| テンプレート             | 用途                     |
| ------------------------ | ------------------------ |
| `event-template.ts`      | ドメインイベント実装雛形 |
| `aggregate-template.ts`  | アグリゲート実装雛形     |
| `projection-template.ts` | プロジェクション実装雛形 |

## 変更履歴

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 2.0.0   | 2026-01-01 | 18-skills.md完全準拠版として再構築 |
| 1.0.0   | 2025-12-31 | 初版作成                           |

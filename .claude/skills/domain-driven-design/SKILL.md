---
name: domain-driven-design
description: |
  ドメイン駆動設計（DDD）のビルディングブロックを活用したドメインモデリングを専門とするスキル。
  Entity、Value Object、Aggregate、Repository Patternを適用し、
  ビジネスロジックを中心に据えた堅牢なドメイン層を設計する。

  Anchors:
  • Domain-Driven Design (Eric Evans) / 適用: 戦術的パターン / 目的: ドメインモデル構築
  • Implementing DDD (Vaughn Vernon) / 適用: 集約設計 / 目的: トランザクション境界定義
  • Clean Architecture (Robert C. Martin) / 適用: 依存関係逆転 / 目的: ドメイン層の独立性確保

  Trigger:
  Use when designing domain models, defining entities and value objects, establishing aggregate boundaries, designing repository interfaces, or applying DDD tactical patterns.
  domain driven design, DDD, entity design, value object, aggregate, repository pattern, domain model, bounded context
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Domain-Driven Design

## 概要

ドメイン駆動設計（DDD）のビルディングブロックを活用したドメインモデリングを専門とするスキル。Entity、Value Object、Aggregate、Repository Patternを適用し、ビジネスロジックを中心に据えた堅牢なドメイン層を設計する。

## ワークフロー

### Phase 1: ドメイン分析

**目的**: ビジネスドメインを理解し、ドメインモデルの候補を特定

**アクション**:

1. ビジネス要件からドメイン用語を抽出
2. Entity/Value Objectの候補を識別
3. 集約境界の仮説を立てる
4. ユビキタス言語を定義

**Task**: `agents/domain-analyst.md` を参照

### Phase 2: エンティティ・値オブジェクト設計

**目的**: EntityとValue Objectを設計し、ドメインの概念を型として表現

**アクション**:

1. Entity/Value Objectの判別基準を適用
2. 各オブジェクトの属性と振る舞いを定義
3. 不変条件（Invariant）を特定
4. テンプレートを使用して実装

**Task**: `agents/entity-designer.md` を参照

### Phase 3: 集約・リポジトリ設計

**目的**: 集約境界を確定し、リポジトリインターフェースを設計

**アクション**:

1. トランザクション整合性の要件を分析
2. 集約ルートを決定
3. `scripts/validate-domain-model.mjs` で検証
4. リポジトリインターフェースを設計
5. `scripts/log_usage.mjs` で記録

**Task**: `agents/aggregate-designer.md` を参照

## Task仕様ナビ

| Task               | 起動タイミング | 入力            | 出力                   |
| ------------------ | -------------- | --------------- | ---------------------- |
| domain-analyst     | Phase 1開始時  | ビジネス要件    | ドメイン分析書         |
| entity-designer    | Phase 2開始時  | ドメイン分析書  | Entity/VO設計書        |
| aggregate-designer | Phase 3開始時  | Entity/VO設計書 | 集約・リポジトリ設計書 |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項                 | 理由                       |
| ------------------------ | -------------------------- |
| ユビキタス言語の使用     | チームとドメインの共通理解 |
| 小さな集約を優先         | トランザクション競合の回避 |
| 値オブジェクトの活用     | 不変性による安全性確保     |
| 集約間は結果整合性を検討 | スケーラビリティの確保     |
| ドメインイベントの活用   | 疎結合な連携の実現         |

### 避けるべきこと

| 禁止事項           | 問題点                   |
| ------------------ | ------------------------ |
| 巨大な集約         | パフォーマンス・競合問題 |
| 貧血ドメインモデル | ロジックの散逸           |
| 技術駆動の設計     | ドメイン表現力の低下     |
| 集約間の直接参照   | 強結合・整合性問題       |

## リソース参照

### scripts/（決定論的処理）

| スクリプト                  | 機能               |
| --------------------------- | ------------------ |
| `validate-domain-model.mjs` | ドメインモデル検証 |
| `analyze-dependencies.mjs`  | 依存関係分析       |
| `log_usage.mjs`             | フィードバック記録 |

### references/（詳細知識）

| リソース             | パス                                                                                   | 読込条件           |
| -------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| ビルディングブロック | [references/ddd-building-blocks.md](references/ddd-building-blocks.md)                 | 設計時に参照       |
| 集約パターン         | [references/aggregate-patterns.md](references/aggregate-patterns.md)                   | 集約設計時に参照   |
| エンティティ設計     | [references/entity-design-guide.md](references/entity-design-guide.md)                 | Entity設計時に参照 |
| リポジトリ設計       | [references/repository-interface-design.md](references/repository-interface-design.md) | Repository設計時   |

### assets/（テンプレート）

| アセット                           | 用途                       |
| ---------------------------------- | -------------------------- |
| `aggregate-template.ts`            | 集約テンプレート           |
| `entity-template.ts`               | エンティティテンプレート   |
| `repository-interface-template.ts` | リポジトリインターフェース |

## 変更履歴

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 2.0.0   | 2026-01-01 | 18-skills.md仕様完全準拠版に再構築 |
| 1.0.0   | 2025-12-24 | 初版作成                           |

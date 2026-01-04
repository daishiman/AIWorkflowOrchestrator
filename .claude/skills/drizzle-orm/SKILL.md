---
name: drizzle-orm
description: |
  DrizzleORMを使用したデータベーススキーマ設計、マイグレーション、型安全なクエリ構築を専門とするスキル。
  SQLite、PostgreSQL、MySQLに対応し、TypeScriptの型システムを最大限活用した堅牢なDB層を構築する。

  Anchors:
  • Drizzle ORM公式ドキュメント / 適用: スキーマ定義とマイグレーション / 目的: 型安全なDB設計の基盤
  • TypeScript型システム / 適用: クエリビルダーとスキーマ定義 / 目的: エンドツーエンドの型安全性
  • Database Design for Mere Mortals (Hernandez) / 適用: リレーション設計 / 目的: 正規化と参照整合性

  Trigger:
  Use when defining Drizzle schemas, creating migrations, building type-safe queries, designing relations, or optimizing database performance.
  drizzle, orm, schema, migration, sqlite, postgresql, type-safe query
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Drizzle ORM

## 概要

DrizzleORMを使用したデータベーススキーマ設計、マイグレーション管理、型安全なクエリ構築を専門とするスキル。TypeScriptの型システムを最大限活用し、SQLite、PostgreSQL、MySQLに対応した堅牢なデータベース層を構築する。

## ワークフロー

### Phase 1: スキーマ設計

**目的**: テーブル構造とリレーションを設計

**アクション**:

1. ドメインモデルとビジネス要件を分析
2. テーブル構造とリレーションを設計
3. `references/schema-design-patterns.md` で設計パターンを確認

**Task**: `agents/design-schema.md` を参照

### Phase 2: スキーマ実装とマイグレーション

**目的**: DrizzleORMスキーマを実装しマイグレーションを生成

**アクション**:

1. `assets/schema-template.ts` を参照してスキーマを実装
2. `references/migration-patterns.md` でマイグレーション手順を確認
3. マイグレーションファイルを生成・検証

**Task**: `agents/implement-schema.md` を参照

### Phase 3: クエリ構築

**目的**: 型安全なクエリを構築しパフォーマンスを最適化

**アクション**:

1. `references/query-patterns.md` でクエリパターンを確認
2. リレーショナルクエリとJOINを実装
3. インデックス戦略を検討

**Task**: `agents/build-queries.md` を参照

### Phase 4: 検証と記録

**目的**: 実装の品質を確認

**アクション**:

1. `scripts/validate-schema.mjs` でスキーマ検証
2. `scripts/log_usage.mjs` で使用記録を保存

**Task**: `agents/validate-implementation.md` を参照

## Task仕様ナビ

| Task                    | 起動タイミング | 入力         | 出力               |
| ----------------------- | -------------- | ------------ | ------------------ |
| design-schema           | Phase 1開始時  | ドメイン要件 | スキーマ設計書     |
| implement-schema        | Phase 2開始時  | スキーマ設計 | スキーマファイル群 |
| build-queries           | Phase 3開始時  | スキーマ     | クエリ実装         |
| validate-implementation | Phase 4開始時  | 実装ファイル | 検証レポート       |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項                         | 理由                   |
| -------------------------------- | ---------------------- |
| TypeScriptの型システムを活用     | コンパイル時エラー検出 |
| マイグレーションをバージョン管理 | 変更履歴の追跡         |
| 外部キー制約を適切に設定         | 参照整合性の保証       |
| 必要なカラムのみSELECT           | パフォーマンス向上     |
| トランザクション境界を明確化     | データ整合性の確保     |

### 避けるべきこと

| 禁止事項                   | 問題点             |
| -------------------------- | ------------------ |
| マイグレーションの直接編集 | 整合性破壊のリスク |
| any型の多用                | 型安全性の喪失     |
| N+1クエリの放置            | パフォーマンス劣化 |
| 全カラムへのインデックス   | 書き込み性能低下   |
| 生SQLへの過度な依存        | DB移植性の低下     |

## リソース参照

### scripts/（決定論的処理）

| スクリプト            | 機能               |
| --------------------- | ------------------ |
| `validate-schema.mjs` | スキーマ検証       |
| `log_usage.mjs`       | フィードバック記録 |

### references/（詳細知識）

| リソース         | パス                                   | 読込条件           |
| ---------------- | -------------------------------------- | ------------------ |
| スキーマ設計     | `references/schema-design-patterns.md` | スキーマ設計時     |
| クエリパターン   | `references/query-patterns.md`         | クエリ構築時       |
| マイグレーション | `references/migration-patterns.md`     | マイグレーション時 |

### assets/（テンプレート）

| アセット             | 用途                     |
| -------------------- | ------------------------ |
| `schema-template.ts` | スキーマ定義テンプレート |

## 変更履歴

| Version | Date       | Changes                            |
| ------- | ---------- | ---------------------------------- |
| 2.0.0   | 2026-01-01 | 18-skills.md仕様完全準拠版に再構築 |
| 1.0.0   | 2025-12-24 | 初版作成                           |

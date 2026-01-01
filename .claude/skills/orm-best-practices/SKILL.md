---
name: orm-best-practices
description: |
  ORMベストプラクティスの専門スキル。
  エンティティ設計、リレーション管理、パフォーマンス最適化を提供します。

Anchors: |
  • 『Designing Data-Intensive Applications』（Martin Kleppmann）/ 適用: ORMベストプラクティス / 目的: 型安全なスキーマ定義とパフォーマンス最適化

Trigger: |
  ORMベストプラクティス適用時、データモデル設計時、N+1問題解決時、スキーマ定義時に使用

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# ORM Best Practices

## 概要

Drizzle ORMを活用したデータベース操作のベストプラクティスを提供するスキル。型安全なスキーマ定義、クエリビルダーの効果的な使用、パフォーマンスを考慮した実装パターンを提供します。このスキルはデータベース設計段階から運用まで、ORMの最適な活用方法をガイドします。

詳細な手順や背景は `references/Level1_basics.md`（基礎）、`references/Level2_intermediate.md`（実務）、`references/Level3_advanced.md`（応用）、`references/Level4_expert.md`（専門）を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` で基礎知識を確認
2. タスクに必要なリソース（テンプレート、パターンガイド）を特定
3. 現在のスキーマや実装体制を把握

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソース（`references/*.md`）やテンプレート（`assets/*.md`）を参照
2. パフォーマンスパターン、クエリビルダーパターン、リレーション設定を検討
3. 型安全性とスキーマ整合性を確保しながら実装
4. 重要な判断点をメモとして記録

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-schema.mjs` でスキーマの型安全性を確認
2. `scripts/validate-skill.mjs` でスキル構造全体を検証
3. 成果物が目的に合致するか確認
4. `scripts/log_usage.mjs` を実行して使用記録を保存

## Task仕様ナビ

| タスク                 | 対応レベル | リソース                                         | テンプレート         | 説明                                             |
| ---------------------- | ---------- | ------------------------------------------------ | -------------------- | ------------------------------------------------ |
| スキーマ定義           | Level 1-2  | `schema-definition.md`                           | `schema-template.md` | Drizzle ORMのテーブルスキーマを型安全に定義      |
| リレーション設定       | Level 2-3  | `relation-mapping.md`                            | `schema-template.md` | テーブル間のリレーション（1対多、多対多）を設定  |
| クエリビルダー活用     | Level 2-3  | `query-builder-patterns.md`                      | -                    | 複雑なクエリを安全かつ効率的に構築               |
| N+1問題解決            | Level 3    | `performance-patterns.md`                        | -                    | N+1問題を検出し、最適なクエリ戦略を適用          |
| パフォーマンス最適化   | Level 3-4  | `performance-patterns.md`, `Level3_advanced.md`  | -                    | インデックス設計、クエリ最適化、キャッシング戦略 |
| エンティティマッピング | Level 2-3  | `schema-definition.md`, `Level2_intermediate.md` | -                    | ビジネスロジックとデータモデルの整合性確保       |
| マイグレーション管理   | Level 3-4  | `Level3_advanced.md`, `Level4_expert.md`         | -                    | スキーマ変更時の安全なマイグレーション戦略       |
| パフォーマンス診断     | Level 4    | `Level4_expert.md`, `performance-patterns.md`    | -                    | 本番環境のパフォーマンス問題を診断・最適化       |

## ベストプラクティス

### すべきこと

- **スキーマ設計**: テーブルリレーションと外部キー制約を明確に定義してから実装を開始
- **型安全性**: Drizzle ORMの型推論を活用し、TypeScriptの型チェックで実行時エラーを防止
- **クエリ設計**: クエリビルダーを使用し、手書きSQLではなく型安全なクエリを構築
- **パフォーマンス**: N+1問題を常に意識し、不要なクエリの重複実行を避ける
- **テスト**: スキーマ定義とクエリロジックをテストし、リグレッションを防止
- **ドキュメント**: スキーマの意図、リレーション、パフォーマンスへの配慮をコメントで記録

### 避けるべきこと

- **手書きSQL**: 文字列ベースのSQLではなく、クエリビルダーを使用して型安全性を確保
- **スキーマ無視**: スキーマ定義を軽視し、後からエンティティマッピングを修正
- **複雑なJOIN**: 過度に複雑なJOINはReadability と Maintainability を低下させるため、適切に分割
- **キャッシング無視**: パフォーマンスクリティカルなクエリにおいてキャッシング戦略を未検討
- **マイグレーション無計画**: スキーマ変更時にマイグレーション計画を立てず、本番で問題を引き起こす
- **インデックス設計無視**: 検索や結合に使用するカラムにインデックスを設定しない

## リソース参照

### レベル別ガイド

- **`references/Level1_basics.md`**: Drizzle ORM基礎、スキーマ定義の初歩、簡単なクエリ構築
- **`references/Level2_intermediate.md`**: リレーション設定、クエリビルダーの活用、実務パターン
- **`references/Level3_advanced.md`**: パフォーマンス最適化、複雑なマイグレーション、N+1問題対策
- **`references/Level4_expert.md`**: 大規模データセット管理、マイグレーション戦略、本番運用パターン

### パターン・デザインガイド

- **`references/schema-definition.md`**: Drizzle ORMのテーブル定義パターン、カラム型の選択
- **`references/relation-mapping.md`**: 1対多、多対多リレーション設定、外部キー戦略
- **`references/query-builder-patterns.md`**: クエリビルダーのフィルタリング、ソート、ページネーション
- **`references/performance-patterns.md`**: N+1問題検出、クエリ最適化、インデックス戦略
- **`references/requirements-index.md`**: 要求仕様の索引（docs/00-requirements と同期）

### スクリプト

- **`scripts/validate-schema.mjs`**: Drizzle ORMスキーマ定義の型安全性と整合性を検証
- **`scripts/validate-skill.mjs`**: スキル構造全体の検証
- **`scripts/log_usage.mjs`**: スキル使用記録の自動評価

### テンプレート

- **`assets/schema-template.md`**: Drizzle ORMテーブルスキーマ定義のTypeScriptテンプレート（型定義、リレーション、インデックス含む）

### 参考資料

- **`references/legacy-skill.md`**: 旧SKILL.mdの全文（履歴参照用）

## 変更履歴

| Version | Date       | Changes                                                          |
| ------- | ---------- | ---------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様準拠へ更新（Anchors、Trigger、Task仕様ナビ追加） |
| 0.9.0   | 2025-12-24 | Spec alignment and required artifacts added                      |

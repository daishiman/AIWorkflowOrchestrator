---
name: repository-pattern
description: |
  データアクセス層の抽象化パターン専門スキル。
  アプリケーション層とデータアクセス層を分離し、ドメインエンティティをコレクション風
  インターフェースで操作する抽象化を提供します。

  Anchors:
  • Patterns of Enterprise Application Architecture (Martin Fowler) / 適用: データアクセス層 / 目的: 永続化抽象化とドメイン保護

  Trigger:
  リポジトリパターン実装時、データアクセス層設計時、永続化ロジック分離時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Repository Pattern

## 概要

Martin FowlerのPoEAA（Patterns of Enterprise Application Architecture）に基づくRepositoryパターンの設計と実装を専門とするスキルです。アプリケーション層とデータアクセス層を分離し、ドメインエンティティをコレクション風のインターフェースで操作する抽象化を提供します。

Repositoryパターンは以下の責務を担当します：

- ドメインモデルとデータベーススキーマの間の変換
- クエリロジックの集約と再利用
- データベース実装の詳細の隠蔽
- テスタビリティの向上

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 適用対象のドメインエンティティと永続化要件を把握
3. 必要な references/scripts/templates を特定
4. 既存のRepository実装パターンを確認（あれば）

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. `references/interface-patterns.md` を参照してRepositoryインターフェースを設計
2. `references/implementation-patterns.md` を参照して実装パターンを選択
3. `references/entity-mapping.md` を参照してエンティティマッピング戦略を決定
4. テンプレートを活用して実装を作成
5. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-repository.mjs` でRepository構造を確認
2. `scripts/validate-skill.mjs` でスキル構造を確認
3. 成果物が目的に合致するか確認
4. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

このスキルで対応するタスクタイプ：

| タスク                         | 説明                                                 | レベル    | 参照リソース                 |
| ------------------------------ | ---------------------------------------------------- | --------- | ---------------------------- |
| Repositoryインターフェース設計 | ドメインモデルに基づいたクリーンなRepository API設計 | Level 1-2 | `interface-patterns.md`      |
| Repository実装作成             | インターフェース仕様に基づいた実装コード生成         | Level 2-3 | `implementation-patterns.md` |
| エンティティマッピング戦略     | ドメインエンティティとDB型の変換戦略の決定           | Level 2-3 | `entity-mapping.md`          |
| Repositoryリファクタリング     | 既存実装の改善と最適化                               | Level 3-4 | `design-principles.md`       |
| クエリロジック抽象化           | データアクセス要件の収集と抽象化                     | Level 3   | `implementation-patterns.md` |
| テスト可能性向上               | Repositoryのモック化と依存性注入                     | Level 2-3 | `Level2_intermediate.md`     |

## ベストプラクティス

### すべきこと

- Repositoryインターフェースを最初に設計する（実装前に）
- ドメイン言語を反映したメソッド名を使用する（findByIdではなくfindByUserId等）
- Repository実装の詳細から呼び出し側を完全に分離する
- エンティティマッピング変換の戦略を明確に決定する
- 既存のRepositoryをリファクタリングするときは設計原則を見直す
- 複雑なクエリロジックは専用メソッドに抽象化する
- ドメインエンティティをデータベーススキーマから独立させる

### 避けるべきこと

- SQLやクエリロジックをドメインレイヤーに漏らすこと
- Repositoryインターフェースをデータベース操作をそのまま公開すること
- エンティティマッピング戦略を事前に決定せずに実装を始めること
- 大量のfindBy\*メソッドでRepositoryを肥大化させること
- Repositoryを単なるData Access Objectとしてだけ実装すること

## リソース参照

### 学習リソース（Levelガイド）

Repository パターンの学習は4段階で進みます：

- **Level 1（基礎）**: `references/Level1_basics.md` - パターンの基本概念とシンプルな実装
- **Level 2（実務）**: `references/Level2_intermediate.md` - 実務での応用とエッジケース対応
- **Level 3（応用）**: `references/Level3_advanced.md` - パフォーマンス最適化と複雑な設計
- **Level 4（専門）**: `references/Level4_expert.md` - マイクロサービス環境での設計や大規模システム対応

### 設計・実装ガイド

実装を始める際に参照するドキュメント：

- **`references/design-principles.md`**: Repository設計の基本原則と判断基準
- **`references/interface-patterns.md`**: Repositoryインターフェース設計の各パターン
- **`references/implementation-patterns.md`**: 実装の標準パターンと選択ガイド
- **`references/entity-mapping.md`**: ドメインエンティティとDB型のマッピング戦略
- **`references/legacy-skill.md`**: 旧SKILL.mdの全文（移行時の参照用）

### テンプレート

すぐに使えるテンプレート：

- **`assets/repository-interface-template.md`**: Repository インターフェースのテンプレート
- **`assets/repository-implementation-template.md`**: Repository 実装のテンプレート

### 検証・ユーティリティスクリプト

- **`scripts/validate-repository.mjs`**: Repository構造の検証スクリプト
- **`scripts/validate-skill.mjs`**: スキル構造の検証スクリプト
- **`scripts/log_usage.mjs`**: 使用記録と自動評価スクリプト

## 変更履歴

| Version | Date       | Changes                                                                |
| ------- | ---------- | ---------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様への準拠、Task仕様ナビ追加、リソース参照セクション整備 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                            |

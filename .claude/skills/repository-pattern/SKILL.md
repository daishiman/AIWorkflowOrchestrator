---
name: repository-pattern
description: |
  データアクセス層の抽象化パターン専門スキル。
  アプリケーション層とデータアクセス層を分離し、ドメインエンティティをコレクション風
  インターフェースで操作する抽象化を提供する。インターフェース設計、実装、マッピング戦略を包括的にサポート。

  Anchors:
  • Patterns of Enterprise Application Architecture (Martin Fowler) / 適用: Repository Pattern / 目的: 永続化抽象化とドメイン保護
  • Domain-Driven Design (Eric Evans) / 適用: Aggregate, Repository / 目的: 集約境界とドメイン表現

  Trigger:
  Use when designing repository interfaces, implementing data access layers, or separating domain from persistence.
  repository pattern, data access layer, entity mapping, persistence abstraction, リポジトリパターン
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Repository Pattern

## 概要

Martin FowlerのPoEAA（Patterns of Enterprise Application Architecture）に基づくRepositoryパターンの設計と実装を専門とするスキル。アプリケーション層とデータアクセス層を分離し、ドメインエンティティをコレクション風インターフェースで操作する抽象化を提供する。

## ワークフロー

### Phase 1: 要件把握

**目的**: Repositoryの対象と設計要件を明確化

**アクション**:

1. 対象ドメインエンティティと集約境界を特定
2. 永続化要件（CRUD操作、検索条件）を整理
3. 技術スタック（ORM、DB種類）を確認
4. 既存のRepository実装パターンを確認（あれば）

### Phase 2: インターフェース設計

**目的**: ドメイン言語を反映したRepository APIを設計

**アクション**:

1. `references/interface-patterns.md` を参照
2. `references/design-principles.md` の原則に従う
3. コレクション風の基本操作（add, remove, find）を定義
4. ドメイン固有のクエリメソッドを追加
5. 戻り値型をドメインエンティティに限定

**Task**: `agents/design-interface.md` を参照

### Phase 3: マッピング戦略設計

**目的**: ドメイン型とDB型の変換戦略を決定

**アクション**:

1. `references/entity-mapping.md` を参照
2. ドメインエンティティとDBスキーマの差異を分析
3. マッピング戦略（直接/名前変換/構造変換/JSON）を選択
4. ValueObjectのマッピング方針を決定
5. Null/Undefined処理のルールを定義

**Task**: `agents/design-entity-mapping.md` を参照

### Phase 4: 実装

**目的**: Repository実装クラスを作成

**アクション**:

1. `references/implementation-patterns.md` を参照
2. `assets/repository-implementation-template.md` をベースに実装
3. CRUD操作を実装
4. エンティティマッピング関数を実装
5. エラーハンドリングとドメイン例外への変換を実装
6. 依存性注入対応の構造を確保

**Task**: `agents/implement-repository.md` を参照

### Phase 5: 検証

**目的**: 品質基準を満たしているか確認

**アクション**:

1. `scripts/validate-repository.mjs` で構造検証
2. 設計原則チェックリストで確認
3. 実際のユースケースでテスト
4. `scripts/log_usage.mjs` で記録

## Task仕様ナビ

| Task                  | 起動タイミング | 入力                             | 出力                           |
| --------------------- | -------------- | -------------------------------- | ------------------------------ |
| design-interface      | Phase 2開始時  | ドメインエンティティ、永続化要件 | Repositoryインターフェース定義 |
| design-entity-mapping | Phase 3開始時  | エンティティ定義、DBスキーマ     | マッピング戦略定義             |
| implement-repository  | Phase 4開始時  | インターフェース、マッピング戦略 | Repository実装クラス           |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリを参照

## ベストプラクティス

### すべきこと

| 推奨事項                         | 理由                                 |
| -------------------------------- | ------------------------------------ |
| インターフェースを先に設計する   | 実装詳細に引きずられない設計ができる |
| ドメイン言語でメソッド名を付ける | ビジネス要件が明確になる             |
| 1集約1リポジトリの原則を守る     | 集約境界が明確になり一貫性を保てる   |
| マッピング関数を分離する         | テスト容易性と変更容易性が向上する   |
| DB例外をドメイン例外に変換する   | ドメイン層がインフラに依存しない     |
| 依存性注入で実装を提供する       | テスト時のモック化が容易になる       |

### 避けるべきこと

| 禁止事項                                 | 問題点                           |
| ---------------------------------------- | -------------------------------- |
| SQLをドメイン層に漏らす                  | 永続化詳細への依存が発生する     |
| DB型をそのまま戻り値にする               | ドメイン層がDBスキーマに依存する |
| 汎用クエリメソッドを公開する             | 抽象化が破綻する                 |
| Repositoryにビジネスロジックを入れる     | 単一責任原則に違反する           |
| 集約内部エンティティのRepositoryを作る   | 集約境界が曖昧になる             |
| トランザクション制御をRepositoryに入れる | 呼び出し側の責務を侵害する       |

## リソース参照

### references/（詳細知識）

| リソース         | パス                                                                               | 読込条件                        |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------- |
| 設計原則         | See [references/design-principles.md](references/design-principles.md)             | Phase 2: 設計時                 |
| インターフェース | See [references/interface-patterns.md](references/interface-patterns.md)           | Phase 2: インターフェース設計時 |
| 実装パターン     | See [references/implementation-patterns.md](references/implementation-patterns.md) | Phase 4: 実装時                 |
| マッピング戦略   | See [references/entity-mapping.md](references/entity-mapping.md)                   | Phase 3: マッピング設計時       |

### scripts/（決定論的処理）

| スクリプト                        | 機能                     |
| --------------------------------- | ------------------------ |
| `scripts/validate-repository.mjs` | Repository構造の検証     |
| `scripts/log_usage.mjs`           | 使用記録とフィードバック |

### assets/（テンプレート）

| アセット                                       | 用途                           |
| ---------------------------------------------- | ------------------------------ |
| `assets/repository-interface-template.md`      | Repositoryインターフェース雛形 |
| `assets/repository-implementation-template.md` | Repository実装クラス雛形       |

## 変更履歴

| Version | Date       | Changes                                             |
| ------- | ---------- | --------------------------------------------------- |
| 2.0.0   | 2026-01-02 | 18-skills.md仕様完全準拠、構造再設計、Level形式廃止 |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様への準拠、Task仕様ナビ追加          |
| 1.0.0   | 2025-12-24 | 初版                                                |

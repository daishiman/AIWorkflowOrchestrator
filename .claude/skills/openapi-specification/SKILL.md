---
name: openapi-specification
description: |
  OpenAPI仕様の専門スキル。
  API定義、スキーマ設計、ドキュメント生成を提供します。

  Anchors:
  • 『OpenAPI Specification』（Linux Foundation） / 適用: API仕様設計 / 目的: REST API標準化
  • 『RESTful API設計のベストプラクティス』（複数出典） / 適用: エンドポイント設計 / 目的: 一貫性確保

  Trigger:
  OpenAPI仕様書作成時、API定義ドキュメント作成時、Swagger仕様設計時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# OpenAPI Specification スキル

## 概要

OpenAPI 3.x仕様に準拠したAPI仕様書の設計と作成を専門とするスキル。RESTful APIの設計原則に基づいて、セキュアで保守性の高いAPI仕様書を作成します。エンドポイント設計、スキーマ定義、認証・認可設定、エラーハンドリング、およびドキュメント生成を統合的に実施します。

詳細な手順や背景は `references/Level1_basics.md` と `references/Level2_intermediate.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. API仕様のスコープと要件を定義（エンドポイント数、認証方式、レート制限など）
3. 必要なリソース、スクリプト、テンプレートを特定
4. 既存API仕様の有無を確認（更新か新規作成か判定）

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. `assets/openapi-base-template.yaml` をベースに仕様書を作成
2. `references/openapi-structure.md` に基づいてinfo、servers、pathsセクションを構築
3. `references/schema-design-patterns.md` を参照してコンポーネントスキーマを設計
4. `references/security-schemes.md` に基づいてセキュリティスキームを構成
5. 個別エンドポイントは `assets/endpoint-template.yaml` を活用
6. 関連リソースやテンプレートを参照しながら作業を実施

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-openapi.mjs` でOpenAPI仕様の構文と整合性をチェック
2. `scripts/validate-skill.mjs` でスキル構造を確認
3. 成果物が要件に合致するか確認（全エンドポイント、スキーマ、セキュリティ設定の網羅性）
4. `scripts/log_usage.mjs` を実行して記録を残す
5. 生成されたドキュメント（Swagger UI、ReDocなど）で視認性を確認

## Task仕様ナビ

| タスク                   | 説明                                                  | リソース参照                                          | スクリプト/テンプレート                              |
| ------------------------ | ----------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| OpenAPI仕様書新規作成    | 完全なOpenAPI 3.x仕様書をゼロから作成                 | `Level1_basics.md`, `openapi-structure.md`            | `openapi-base-template.yaml`, `validate-openapi.mjs` |
| エンドポイント設計       | RESTful原則に基づいてパス、メソッド、パラメータを定義 | `Level2_intermediate.md`, `schema-design-patterns.md` | `endpoint-template.yaml`                             |
| スキーマ定義             | リクエスト/レスポンスのJSONスキーマを設計             | `schema-design-patterns.md`, `Level3_advanced.md`     | `openapi-base-template.yaml`内コンポーネント         |
| セキュリティスキーム設定 | 認証（OAuth2、JWT、API Key）と認可を構成              | `security-schemes.md`, `Level3_advanced.md`           | `validate-openapi.mjs`                               |
| 既存仕様書更新           | バージョン管理、互換性維持、マイグレーション          | `Level2_intermediate.md`, `requirements-index.md`     | `validate-openapi.mjs`                               |
| エラーレスポンス設計     | 標準化されたエラーハンドリング定義                    | `Level2_intermediate.md`, `openapi-structure.md`      | `endpoint-template.yaml`                             |
| ドキュメント生成         | Swagger UI、ReDocなど自動ドキュメント生成の準備       | `openapi-structure.md`, `Level3_advanced.md`          | -                                                    |
| 構文検証・デバッグ       | 仕様ファイルのエラー検出と修正                        | `openapi-structure.md`                                | `validate-openapi.mjs`                               |

## ベストプラクティス

### すべきこと

- **新規OpenAPI仕様書を作成する時**: `openapi-base-template.yaml` をテンプレートとして使用し、info、servers、paths、componentsの全セクションを網羅する
- **既存OpenAPI仕様書を更新する時**: 変更前後の仕様差異を明確にし、破壊的変更がないか検証する
- **エンドポイントやスキーマを設計する時**: `schema-design-patterns.md` と `openapi-structure.md` を参照して一貫性を保つ
- **OpenAPI構文エラーを解決する時**: `validate-openapi.mjs` で具体的なエラー箇所を特定してから修正する
- **セキュリティスキームを設定する時**: `security-schemes.md` のベストプラクティスを遵守し、全エンドポイントに適切な認証を適用する
- **Level別の学習**: 基礎（Level1）→実務（Level2）→応用（Level3）→専門（Level4）の順で進める
- **版管理**: API仕様の更新履歴をCHANGELOG.mdで記録し、ユーザーに影響を通知する

### 避けるべきこと

- アンチパターンや注意点を確認せずに進めることを避ける
- セキュリティスキーム設定を後付けしない（設計段階から組み込む）
- 複数のエンドポイント間で不一貫なスキーマ定義を避ける
- エラーレスポンスの定義をスキップしない
- `required` フィールドの指定を曖昧にしない
- セキュリティ関連の設定をハードコード化しない（環境ごとに切り替え可能にする）
- OpenAPI仕様の検証をスキップして本番環境にデプロイしない

## リソース参照

### 基礎リソース

| リソース                              | 説明                                                     |
| ------------------------------------- | -------------------------------------------------------- |
| `references/Level1_basics.md`          | OpenAPI基礎、YAML構文、基本的なエンドポイント定義        |
| `references/Level2_intermediate.md`    | 実務レベルの仕様書作成、スキーマ設計、エラーハンドリング |
| `references/Level3_advanced.md`        | 応用パターン、セキュリティ統合、複雑なAPI設計            |
| `references/Level4_expert.md`          | 専門知識、パフォーマンス最適化、マイクロサービスAPI設計  |
| `references/openapi-structure.md`      | OpenAPI 3.x構造ガイド、全セクション仕様                  |
| `references/schema-design-patterns.md` | スキーマ設計パターン、リクエスト/レスポンス例            |
| `references/security-schemes.md`       | 認証・認可スキーム、ベストプラクティス                   |
| `references/requirements-index.md`     | 要求仕様索引（docs/00-requirements と同期）              |
| `references/legacy-skill.md`           | 旧SKILL.mdの全文（参考用）                               |

### スクリプト

| スクリプト                     | 説明                                          |
| ------------------------------ | --------------------------------------------- |
| `scripts/validate-openapi.mjs` | OpenAPI仕様ファイルの構文検証と整合性チェック |
| `scripts/validate-skill.mjs`   | スキル構造検証スクリプト                      |
| `scripts/log_usage.mjs`        | 使用記録・自動評価スクリプト                  |

### テンプレート

| テンプレート                           | 説明                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| `assets/openapi-base-template.yaml` | 完全なOpenAPI 3.x仕様書ベーステンプレート（info、servers、paths、components構造含む） |
| `assets/endpoint-template.yaml`     | 個別エンドポイント定義YAML（パス、メソッド、パラメータ、レスポンス含む）              |

## 変更履歴

| Version | Date       | Changes                                                                                                        |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に準拠：YAML frontmatter改善、Task仕様ナビ追加、ベストプラクティス拡張、リソース参照テーブル化 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                    |

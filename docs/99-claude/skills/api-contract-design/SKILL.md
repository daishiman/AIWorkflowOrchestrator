---
name: api-contract-design
description: |
  RESTful APIの設計と互換性管理を行うためのスキル。APIバージョニング、Breaking Changes対応、スキーマ設計を含む。

  **Anchors**:
  • RESTful Web APIs（Leonard Richardson）/ 適用: API設計全般 / 目的: リソース指向設計の原則の習得
  • OpenAPI 3.1 仕様（OpenAPI Initiative）/ 適用: API契約設計 / 目的: 標準的なAPI仕様定義
  • JSON Schema（IETF）/ 適用: スキーマ設計 / 目的: バリデーションルールの明確化

  **Triggers**: API設計やAPIスキーマの定義が必要な時、バージョニング戦略を策定する時、Breaking Changes対応が必要な時、後方互換性を確保する時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# API契約設計

## 概要

API契約（API Contract）は、クライアントとサーバー間の約束です。このスキルは、APIの設計、バージョニング、Breaking Changes対応、互換性管理を体系的に行うための指針を提供します。

開発初期段階から本番運用まで、APIの品質と安定性を保証する設計原則とベストプラクティスを含みます。

**関連リソース**:

- `references/Level1_basics.md`: 基礎的なAPI設計原則
- `references/Level2_intermediate.md`: 実務的な設計パターン
- `references/Level3_advanced.md`: 高度なバージョニング戦略
- `references/Level4_expert.md`: エンタープライズレベルの設計

## ワークフロー

### Phase 1: 目的と前提の明確化

**目的**: APIの役割、対象クライアント、互換性要件を理解する

**アクション**:

1. API設計の目的と対象クライアントを定義
2. 互換性ポリシー（バージョニング戦略）を決定
3. 既存APIとの関係を把握
4. `references/Level1_basics.md` を確認し、適用パターンを選定

**Task**: `agents/analyze-contract-context.md` を参照

**成果物**: API設計方針書（仕様概要）

### Phase 2: API契約の設計と検証

**目的**: 具体的なAPI契約を設計し、互換性を確保する

**アクション**:

1. エンドポイント、リソース、メソッドを設計
2. リクエスト/レスポンス形式をOpenAPI仕様で定義
3. エラーハンドリング戦略を決定
4. Breaking Changesポリシーを策定
5. `references/Level2_intermediate.md` を参照して設計パターンを確認
6. サンプルAPIドキュメント（OpenAPI/Swagger）を作成

**Task**: `agents/design-contract.md` を参照

**成果物**: OpenAPI仕様書、API設計ドキュメント、Breaking Changesガイド

### Phase 3: 実装と検証

**目的**: 設計したAPI契約を実装に反映し、検証する

**アクション**:

1. API実装がOpenAPI仕様に準拠していることを確認
2. バリデーションルール（JSON Schema）を実装
3. 統合テストでクライアント互換性を検証
4. `scripts/validate-skill.mjs` でスキル適用状況を確認
5. `scripts/log_usage.mjs` で使用記録を保存

**Task**: `agents/validate-contract.md` を参照

**成果物**: 実装済みAPI、検証テスト、互換性テストレポート

## Task仕様ナビ

| Task                     | 説明                                | 対象                 | リソース       | Phase |
| ------------------------ | ----------------------------------- | -------------------- | -------------- | ----- |
| **API仕様設計**          | OpenAPI形式でのエンドポイント設計   | 新規API開発          | Level1, Level2 | 1-2   |
| **バージョニング戦略**   | APIバージョン管理方針の策定         | API更新計画          | Level2, Level3 | 1     |
| **Breaking Changes対応** | 互換性破壊的な変更の管理            | API改善・修正        | Level2, Level3 | 2     |
| **スキーマ設計**         | JSON Schemaによるバリデーション設計 | データ構造定義       | Level2         | 2     |
| **エラーハンドリング**   | API共通エラー応答の設計             | 全API                | Level1, Level2 | 2     |
| **後方互換性確保**       | 既存クライアント対応の設計          | API改善              | Level3, Level4 | 2     |
| **移行ガイド作成**       | バージョン間の移行手順書            | メジャーアップデート | Level3         | 2     |
| **ドキュメント生成**     | OpenAPIからのドキュメント自動生成   | APIドキュメント      | Level2         | 3     |

## ベストプラクティス

### すべきこと

- **事前設計**: APIコード実装前にOpenAPI仕様で設計する
- **バージョニング戦略の明確化**: Semantic Versioningの採用と互換性ポリシーの文書化
- **スキーマの厳密性**: JSON Schemaで入出力形式を明確に定義
- **Breaking Changes告知**: 非互換変更の事前通知期間（Deprecation Period）を設定
- **テスト駆動設計**: API契約テストで互換性を継続的に検証
- **ドキュメント同期**: APIコードと仕様書の同期メカニズム構築
- **段階的な廃止**: 旧バージョンのサポート終了予定を明示

### 避けるべきこと

- **事後仕様**: 実装後の仕様定義（実装に基づく仕様は変更に強くない）
- **無通知の変更**: Breaking Changesを予告なく実施
- **曖昧なスキーマ**: 「適当な形式」としてのAPI設計
- **バージョン重複サポート**: 多数のバージョンを同時サポート（保守負荷増大）
- **後付けドキュメント**: コード実装後の手作業ドキュメント作成
- **非標準エラー形式**: API間でエラー応答形式が異なる
- **急激な廃止**: サポート期間なしの旧バージョン廃止

## リソース参照

### ガイドドキュメント

| リソース                            | 対象レベル   | 主なトピック                                              |
| ----------------------------------- | ------------ | --------------------------------------------------------- |
| `references/Level1_basics.md`       | 初心者       | REST原則、基本的なAPI設計、リソース指向設計               |
| `references/Level2_intermediate.md` | 実務者       | 実装パターン、エラーハンドリング、バージョニング入門      |
| `references/Level3_advanced.md`     | 上級者       | 複雑なバージョニング戦略、後方互換性設計                  |
| `references/Level4_expert.md`       | エキスパート | エンタープライズ設計、マイグレーション戦略、大規模API管理 |
| `references/requirements-index.md`  | 全員         | 要求仕様索引（docs/00-requirements と同期）               |

### 参考資料

**書籍**:

- 『RESTful Web APIs』（Leonard Richardson）: リソース指向設計の原則

**公式標準**:

- OpenAPI 3.1 仕様: https://spec.openapis.org/
- JSON Schema: https://json-schema.org/

### スクリプト

```bash
# スキル構造の検証
node .claude/skills/api-contract-design/scripts/validate-skill.mjs --check

# 使用記録の保存
node .claude/skills/api-contract-design/scripts/log_usage.mjs --log-task "API設計" --context "新規エンドポイント定義"
```

## 変更履歴

| バージョン | 日付       | 変更内容                                                      |
| ---------- | ---------- | ------------------------------------------------------------- |
| 3.0.0      | 2025-12-31 | agents/3ファイル追加、Phase別Task参照を追加、name修正         |
| 2.0.0      | 2025-12-31 | 18-skills.md仕様へ完全移行、Task仕様ナビ追加、Trigger定義追加 |
| 1.0.0      | 2025-12-24 | 初版リリース                                                  |

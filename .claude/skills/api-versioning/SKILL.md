---
name: api-versioning
description: |
  APIバージョニング戦略と後方互換性管理を専門とするスキル。破壊的変更の管理、段階的廃止プロセス、バージョン間の移行ガイド作成を支援します。

  **Anchors（参考資料）:**
  • 『RESTful Web APIs』（Leonard Richardson）/ 適用: API設計とバージョニング戦略 / 目的: RESTfulなバージョニング方式の理解と実装

  **Triggers（自動発動条件）:**
  - API バージョニング戦略を決定する時
  - 破壊的変更を導入する時
  - エンドポイントを非推奨化する時
  - バージョン間の移行ガイドを作成する時
  - APIバージョン管理を設計する時
  - 後方互換性を検証する時
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# APIバージョニング

## 概要

APIバージョニング戦略と後方互換性管理を専門とするスキル。破壊的変更の定義と管理、段階的廃止（Deprecation）プロセス、バージョン間の移行ガイド作成を支援します。

**対応範囲:**

- APIバージョニング方式の選択（URI、ヘッダー、クエリパラメータなど）
- 破壊的変更の検出と影響分析
- エンドポイント廃止の段階的実行
- 後方互換性の維持戦略
- バージョン間の移行ガイド自動生成

詳細な手順や背景は `references/Level1_basics.md`、`references/Level2_intermediate.md` 以上を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

**Task**: `agents/analyze-versioning-context.md` を参照

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

**Task**: `agents/design-versioning-strategy.md` を参照

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

**Task**: `agents/validate-versioning.md` を参照

## Task仕様ナビ

| Task                     | 説明                              | リソース                         | スクリプト                    |
| ------------------------ | --------------------------------- | -------------------------------- | ----------------------------- |
| バージョニング方式の決定 | URI/ヘッダー/クエリなどの方式選択 | `versioning-strategies.md`       | -                             |
| 破壊的変更の検出         | APIの変更が破壊的かを判定         | `breaking-changes.md`            | `check-breaking-changes.js`   |
| 廃止プロセス実行         | エンドポイント段階的廃止          | `deprecation-process.md`         | `generate-migration-guide.sh` |
| 移行ガイド作成           | バージョン間の移行手順書          | `migration-guide-template.md`    | `generate-migration-guide.sh` |
| 非推奨通知               | クライアントへの廃止予告          | `deprecation-notice-template.md` | -                             |
| 後方互換性検証           | 変更が互換性を保つか確認          | `Level2_intermediate.md`         | -                             |

## ベストプラクティス

### すべきこと

- **バージョニング戦略を決定する時**: `versioning-strategies.md` で各方式の利点と制限を確認
- **破壊的変更を導入する時**: `check-breaking-changes.js` で事前検出
- **エンドポイントを非推奨化する時**: `deprecation-process.md` に基づいて段階的廃止を計画
- **バージョン間の移行ガイドを作成する時**: `migration-guide-template.md` を活用
- **後方互換性を維持する時**: `Level3_advanced.md` の互換性パターンを参考
- **複雑な変更を行う時**: 複数の関連リソースを参照して総合的に判断

### 避けるべきこと

- 予期せぬ破壊的変更を導入することを避ける
- 廃止予告なしにエンドポイント削除を避ける
- アンチパターンや注意点を確認せずに進めることを避ける
- 後方互換性オプションを検討せずに決定することを避ける
- ドキュメント作成なしにバージョン変更を進めることを避ける

## リソース参照

### 学習用ドキュメント

| リソース                            | 説明                                |
| ----------------------------------- | ----------------------------------- |
| `references/Level1_basics.md`       | レベル1: バージョニング基礎概念     |
| `references/Level2_intermediate.md` | レベル2: 実務的なバージョニング運用 |
| `references/Level3_advanced.md`     | レベル3: 複雑なバージョニング設計   |
| `references/Level4_expert.md`       | レベル4: エンタープライズ対応戦略   |

### テクニカルリソース

| リソース                              | 用途                             |
| ------------------------------------- | -------------------------------- |
| `references/breaking-changes.md`      | 破壊的変更の定義と検出方法       |
| `references/deprecation-process.md`   | 段階的廃止プロセスとHTTPヘッダー |
| `references/versioning-strategies.md` | バージョニング方式の比較         |
| `references/requirements-index.md`    | 要求仕様の索引                   |

### テンプレート

| テンプレート                            | 用途                       |
| --------------------------------------- | -------------------------- |
| `assets/deprecation-notice-template.md` | 廃止予告メッセージ作成     |
| `assets/migration-guide-template.md`    | バージョン間移行ガイド作成 |

### ユーティリティスクリプト

| スクリプト                            | 機能                 |
| ------------------------------------- | -------------------- |
| `scripts/check-breaking-changes.js`   | 破壊的変更の自動検出 |
| `scripts/generate-migration-guide.sh` | 移行ガイドの自動生成 |
| `scripts/validate-skill.mjs`          | スキル構造の検証     |
| `scripts/log_usage.mjs`               | 使用記録と自動評価   |

### 参考書籍

- 『RESTful Web APIs』（Leonard Richardson）- リソース設計とAPI設計原則

## 変更履歴

| Version | Date       | Changes                                                                            |
| ------- | ---------- | ---------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | agents/3ファイル追加、Phase別Task参照を追加、name修正                              |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様対応：YAML frontmatter更新、Triggers追加、Task仕様ナビテーブル追加 |

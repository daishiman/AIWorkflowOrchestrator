---
name: request-response-examples
description: |
  APIリクエスト・レスポンスの具体的なサンプル作成と、
  エラーケースドキュメント化のための実践的スキル。

  Anchors:
  • 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）/ 適用: API例示パターン / 目的: 実践的改善
  • RFC 7807 Problem Details / 適用: エラーレスポンス標準化 / 目的: 一貫性確保

  Trigger:
  Use when creating API request/response examples, documenting API usage patterns, generating cURL command samples, creating language-specific SDK examples, or documenting error handling cases.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
tags:
  - api-documentation
  - examples
  - error-handling
  - sdk
dependencies:
  - .claude/skills/api-documentation-best-practices
---

# Request/Response Examples スキル

## 概要

このスキルは、API開発プロセスで不可欠な**リクエスト・レスポンス例の作成**と
**エラーケース処理のドキュメント化**を体系的に実行するためのガイドです。

開発者が実装する際に参照する、正確で実用的なサンプルコードを生成し、
API統合作業を円滑にします。本スキルは、設計段階から実装・テスト段階まで
一貫した例示方法を提供します。

詳細な手順は `references/Level1_basics.md`～`references/Level4_expert.md` を参照してください。

## ワークフロー

### Phase 1: 要件分析と準備

**目的**: APIの仕様を理解し、例示対象を決定する

**アクション**:

1. `references/Level1_basics.md` でリクエスト・レスポンス例の基本パターンを確認
2. `references/example-design-patterns.md` で設計パターンを把握
3. API仕様書から以下を抽出：
   - リクエストパラメータ（パス、クエリ、ボディ）
   - レスポンススキーマ（成功/失敗ケース）
   - エラーステータスコード一覧
4. 適用対象レベル（Level 1～4）を判定

### Phase 2: 例示コンテンツの生成

**目的**: 実用的なリクエスト・レスポンス例を作成する

**アクション**:

1. 基本的なリクエスト例を作成（GET, POST, PUT, DELETE）
2. 複数のレスポンスパターンを記述：
   - 成功時（200, 201）
   - クライアント側エラー（400, 401, 403, 404, 422）
   - サーバー側エラー（500, 502, 503）
3. `references/error-response-standards.md` でエラー形式を統一
4. `assets/curl-examples.md` でcURL例を生成
5. `references/sdk-examples.md` で言語別SDKサンプルを作成
6. スクリプト `scripts/generate-curl-examples.js` で自動生成を検討

### Phase 3: 検証と完成化

**目的**: 成果物の正確性を確認し、ドキュメント化する

**アクション**:

1. `scripts/validate-examples.js` でOpenAPI仕様との整合性をチェック
2. `references/Level2_intermediate.md` の実務チェックリストで確認
3. `scripts/validate-skill.mjs` でスキル構造を検証
4. `scripts/log_usage.mjs` を実行して使用記録を保存
5. 最終ドキュメントをAPIドキュメント本体に統合

## Task仕様ナビ

| Task名                   | 概要                                       | 使用Level | 主要リソース                                                |
| ------------------------ | ------------------------------------------ | --------- | ----------------------------------------------------------- |
| request-response-example | 基本的なリクエスト・レスポンス例作成       | L1-L2     | Level1_basics.md, curl-examples.md template                 |
| error-response-doc       | エラーレスポンス形式の統一とドキュメント化 | L2-L3     | error-response-standards.md, error-catalog.md template      |
| api-sample-code          | API使用例コード（言語別）作成              | L2-L3     | sdk-examples.md, Level2_intermediate.md                     |
| curl-command-example     | cURL実行コマンド例の生成                   | L1-L2     | curl-examples.md template, generate-curl-examples.js script |
| sdk-example-code         | SDK固有のサンプルコード作成                | L3-L4     | sdk-examples.md, Level3_advanced.md                         |
| advanced-scenario        | 複雑なシナリオ例（認証、ページング等）     | L3-L4     | Level3_advanced.md, Level4_expert.md                        |
| example-validation       | サンプル例の正確性検証・テスト             | L2-L3     | validate-examples.js script, Level2_intermediate.md         |

## ベストプラクティス

### すべきこと

- **正確な仕様反映**: OpenAPI/AsyncAPI仕様と完全に一致した例を提供する
- **多様なケース対応**: 成功、クライアント側エラー、サーバー側エラーの3パターン以上を用意
- **言語別サンプル提供**: REST APIなら最低限cURL/JavaScript/Pythonは提供する
- **実行可能な例**: コピー&ペーストで即座に実行できる例にする
- **段階的複雑化**: Level 1で基本、Level 3で応用、Level 4で特殊ケースを示す
- **エラー処理の明示**: エラー時の対処法をサンプルコードで示す
- **パラメータの実例**: 抽象的な説明ではなく、具体的な値を含める
- **リソース参照の一貫性**: 同じエンドポイントの異なる言語例は統一感を保つ

### 避けるべきこと

- **架空のAPI仕様**: 実装と異なる例を作成しない
- **不完全なエラーハンドリング**: 成功ケースのみを示すのを避ける
- **言語による不統一**: 同じシナリオで異なる実装パターンを使い分けない
- **型安全性の無視**: 言語の型システムに合わないサンプルを避ける
- **複雑化の過剰**: Level 1では複雑なネスト構造や複数パラメータを避ける
- **ハードコード値の放置**: サンプル値が本当の認証情報に見えないか確認する
- **文書化の不足**: なぜそのサンプルなのか背景を記さない

## リソース参照

### 学習ガイド（Levels別）

| リソース                            | 対象   | 活用シーン                                       |
| ----------------------------------- | ------ | ------------------------------------------------ |
| `references/Level1_basics.md`       | 初心者 | 基本的なリクエスト・レスポンス例の作成方法を学ぶ |
| `references/Level2_intermediate.md` | 中級者 | 実務的なエラーハンドリングと複数パターンの例作成 |
| `references/Level3_advanced.md`     | 上級者 | 複雑なシナリオ、認証フロー、ページング等の例     |
| `references/Level4_expert.md`       | 専門家 | マルチテナント、イベント駆動、非同期処理等の例   |

### 参考資料

| リソース                                 | 用途                               |
| ---------------------------------------- | ---------------------------------- |
| `references/error-response-standards.md` | エラーレスポンス形式の標準化       |
| `references/example-design-patterns.md`  | リクエスト・レスポンス設計パターン |
| `references/sdk-examples.md`             | 言語別SDKサンプルの作成ガイド      |
| `references/requirements-index.md`       | docs/00-requirements との同期確認  |

### テンプレート

| テンプレート              | 用途                             |
| ------------------------- | -------------------------------- |
| `assets/curl-examples.md` | cURL実行例の標準テンプレート     |
| `assets/error-catalog.md` | エラーカタログの作成テンプレート |

### スクリプト・ツール

| スクリプト                          | 機能                            |
| ----------------------------------- | ------------------------------- |
| `scripts/generate-curl-examples.js` | OpenAPI仕様からcURL例を自動生成 |
| `scripts/validate-examples.js`      | サンプルの有効性を検証          |
| `scripts/validate-skill.mjs`        | スキルファイル構造を検証        |
| `scripts/log_usage.mjs`             | 使用記録・自動評価              |

## コマンドリファレンス

### 学習リソース読み取り

```bash
# 段階的学習
cat .claude/skills/request-response-examples/references/Level1_basics.md
cat .claude/skills/request-response-examples/references/Level2_intermediate.md
cat .claude/skills/request-response-examples/references/Level3_advanced.md
cat .claude/skills/request-response-examples/references/Level4_expert.md

# 参考資料
cat .claude/skills/request-response-examples/references/error-response-standards.md
cat .claude/skills/request-response-examples/references/example-design-patterns.md
cat .claude/skills/request-response-examples/references/sdk-examples.md
```

### テンプレートと参照

```bash
# テンプレート参照
cat .claude/skills/request-response-examples/assets/curl-examples.md
cat .claude/skills/request-response-examples/assets/error-catalog.md

# 要件確認
cat .claude/skills/request-response-examples/references/requirements-index.md
```

### スクリプト実行

```bash
# cURL例の自動生成（OpenAPI仕様ファイルを指定）
node .claude/skills/request-response-examples/scripts/generate-curl-examples.js <openapi-spec-file>

# サンプル検証
node .claude/skills/request-response-examples/scripts/validate-examples.js <example-file>

# スキル構造検証
node .claude/skills/request-response-examples/scripts/validate-skill.mjs --check

# 使用記録・評価
node .claude/skills/request-response-examples/scripts/log_usage.mjs --save
```

## 変更履歴

| Version | Date       | Changes                                                                                                   |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様へ準拠。Anchors・Trigger・allowed-tools追加、Task仕様ナビテーブル追加、ワークフロー詳細化 |
| 1.0.0   | 2025-12-24 | 初版作成。リソース・スクリプト・テンプレートの統合                                                        |

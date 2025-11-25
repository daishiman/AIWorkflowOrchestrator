---
name: api-documentation-best-practices
description: |
  OpenAPI、Swagger、RESTful APIドキュメンテーションのベストプラクティスを提供する専門スキル。
  開発者が迷わずAPIを利用できる、明確で完全なAPIドキュメントを作成します。

  専門分野:
  - OpenAPI仕様: OpenAPI 3.x、スキーマ定義、コンポーネント再利用
  - エンドポイント記述: URL設計、HTTPメソッド、パラメータ定義
  - リクエスト/レスポンス: サンプル、エラーケース、ステータスコード
  - 認証ドキュメント: OAuth 2.0、JWT、API Keyの説明
  - インタラクティブドキュメント: Swagger UI、Redoc

  使用タイミング:
  - REST APIの仕様書を作成する時
  - OpenAPI/Swagger定義を設計する時
  - APIエンドポイントの詳細仕様を文書化する時
  - 認証フローを説明する時

  Use proactively when creating API documentation, designing OpenAPI specs,
  or documenting REST endpoints with examples and error cases.
version: 1.0.0
---

# API Documentation Best Practices

## 概要

このスキルは、開発者が迷わずAPIを利用できる、明確で完全なAPIドキュメントを作成するためのベストプラクティスを提供します。

OpenAPI 3.x仕様を基盤とし、エンドポイントの明確な定義、リクエスト/レスポンスのサンプル、認証フローの説明、エラーハンドリングの網羅的な記述を行います。

**主要な価値**:
- 開発者体験（DX）の向上
- API利用時の試行錯誤を削減
- インテグレーション時間の短縮
- サポートコストの低減

**対象ユーザー**:
- API仕様書を作成するエージェント（@spec-writer, @api-doc-writer）
- バックエンド開発者
- APIアーキテクト

## リソース構造

```
api-documentation-best-practices/
├── SKILL.md                                    # 本ファイル（概要と原則）
├── resources/
│   ├── openapi-guide.md                       # OpenAPI 3.x詳細ガイド
│   ├── endpoint-design.md                     # エンドポイント設計パターン
│   ├── request-response-examples.md           # リクエスト/レスポンス例
│   ├── error-documentation.md                 # エラードキュメンテーション
│   └── authentication-docs.md                 # 認証ドキュメント作成
├── scripts/
│   └── validate-openapi.mjs                   # OpenAPI検証スクリプト
└── templates/
    ├── endpoint-template.md                   # エンドポイント仕様テンプレート
    └── openapi-template.yaml                  # OpenAPI定義テンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# OpenAPI 3.xガイド
cat .claude/skills/api-documentation-best-practices/resources/openapi-guide.md

# エンドポイント設計パターン
cat .claude/skills/api-documentation-best-practices/resources/endpoint-design.md

# リクエスト/レスポンス例
cat .claude/skills/api-documentation-best-practices/resources/request-response-examples.md

# エラードキュメンテーション
cat .claude/skills/api-documentation-best-practices/resources/error-documentation.md

# 認証ドキュメント作成
cat .claude/skills/api-documentation-best-practices/resources/authentication-docs.md
```

### スクリプト実行

```bash
# OpenAPI検証（TypeScript）
node .claude/skills/api-documentation-best-practices/scripts/validate-openapi.mjs <openapi.yaml>
```

### テンプレート参照

```bash
# エンドポイント仕様テンプレート
cat .claude/skills/api-documentation-best-practices/templates/endpoint-template.md

# OpenAPI定義テンプレート
cat .claude/skills/api-documentation-best-practices/templates/openapi-template.yaml
```

## いつ使うか

### シナリオ1: REST API仕様書の作成
**状況**: 新しいAPIエンドポイントの仕様書を作成する

**適用条件**:
- [ ] HTTPメソッドとエンドポイントURLを定義する
- [ ] リクエスト/レスポンスの構造を明確化する
- [ ] 認証要件を説明する

**推奨アプローチ**: OpenAPI形式 + Markdownサンプル

### シナリオ2: OpenAPI定義の設計
**状況**: Swagger/OpenAPI形式でAPIを定義する

**適用条件**:
- [ ] OpenAPI 3.x仕様に準拠する必要がある
- [ ] スキーマの再利用を最大化したい
- [ ] 自動生成ツールと連携したい

**推奨アプローチ**: コンポーネント分離、参照活用

### シナリオ3: エラーハンドリングの文書化
**状況**: APIのエラーケースを網羅的に説明する

**適用条件**:
- [ ] 各エラーコードの意味を説明する
- [ ] エラー時の対応方法を示す
- [ ] サンプルエラーレスポンスを提供する

**推奨アプローチ**: エラーコード一覧 + 詳細説明

## 前提条件

### 必要な知識
- [ ] REST APIの基本概念（HTTPメソッド、ステータスコード）
- [ ] JSON/YAML形式の理解
- [ ] 認証方式の基礎（OAuth, JWT, API Key）

### 必要なツール
- Write: ドキュメントの作成
- Read: 既存APIコードの参照

### 環境要件
- OpenAPIレンダリング環境（Swagger UI等）

## ワークフロー

### Phase 1: API構造の把握

**目的**: APIの全体構造を理解し、ドキュメント構成を設計する

**ステップ**:
1. **エンドポイント一覧の作成**:
   - 全エンドポイントのリストアップ
   - HTTPメソッドとURLパターン
   - グルーピング（リソース別）

2. **データモデルの特定**:
   - リクエスト/レスポンスの型
   - 共通スキーマの抽出
   - 関連性の整理

**判断基準**:
- [ ] 全エンドポイントがリストアップされているか？
- [ ] データモデルが特定されているか？

**リソース**: `resources/endpoint-design.md`

### Phase 2: エンドポイント詳細の記述

**目的**: 各エンドポイントの完全な仕様を記述する

**ステップ**:
1. **基本情報**:
   - エンドポイントURL
   - HTTPメソッド
   - 概要説明

2. **パラメータ定義**:
   - パスパラメータ
   - クエリパラメータ
   - ヘッダー
   - ボディ

3. **型と制約**:
   - データ型
   - 必須/任意
   - バリデーションルール
   - デフォルト値

**判断基準**:
- [ ] すべてのパラメータが定義されているか？
- [ ] 型と制約が明確か？
- [ ] 必須/任意が区別されているか？

**リソース**: `resources/openapi-guide.md`

### Phase 3: リクエスト/レスポンス例の作成

**目的**: 実際に使用できる具体的なサンプルを提供する

**ステップ**:
1. **成功ケースのサンプル**:
   - リクエストボディ例
   - レスポンス例
   - ステータスコード

2. **エラーケースのサンプル**:
   - 各エラーコードの例
   - エラーメッセージ
   - 対処方法

3. **実行可能な形式**:
   - cURLコマンド例
   - HTTPieコマンド例

**判断基準**:
- [ ] サンプルがコピペで使える形式か？
- [ ] 成功/失敗両方のケースがあるか？
- [ ] 実際の値が使用されているか？

**リソース**: `resources/request-response-examples.md`

### Phase 4: 認証とエラーの文書化

**目的**: 認証フローとエラーハンドリングを完全に説明する

**ステップ**:
1. **認証フローの説明**:
   - 認証方式の概要
   - トークン取得手順
   - ヘッダー形式

2. **エラーコード一覧**:
   - ステータスコードの意味
   - エラーレスポンス形式
   - 対処方法

**判断基準**:
- [ ] 認証の手順が明確か？
- [ ] 全エラーコードが説明されているか？
- [ ] エラー時の対処法が示されているか？

**リソース**: `resources/authentication-docs.md`, `resources/error-documentation.md`

## ベストプラクティス

### すべきこと

1. **実行可能なサンプル**:
   - 実際に動作するリクエスト例
   - cURLコマンドをコピペで実行可能
   - 実際のレスポンス値

2. **エラーケースの網羅**:
   - すべてのエラーコードを説明
   - エラー時の対処方法を明記
   - エラーレスポンス例を提供

3. **認証の詳細説明**:
   - トークン取得から使用までの流れ
   - ヘッダー形式を明示
   - 有効期限とリフレッシュ手順

### 避けるべきこと

1. **抽象的な説明のみ**:
   - 「適切なパラメータを設定」→具体的な例を提供
   - 「エラーの場合はエラーコードが返る」→具体的なコードを列挙

2. **サンプルなしのスキーマのみ**:
   - スキーマ定義だけでは不十分
   - 必ず具体例を添える

3. **エラーケースの省略**:
   - 成功ケースのみの説明
   - 「エラー時は適切に処理」

## トラブルシューティング

### 問題1: APIが期待通りに動かない

**症状**: ドキュメント通りにリクエストしてもエラーになる

**原因**:
- ドキュメントと実装の乖離
- サンプルが不正確

**解決策**:
1. 実際のAPIをテストして確認
2. サンプルを実行可能な形式で更新
3. バージョンを明記

### 問題2: 認証で詰まる

**症状**: トークン取得や認証ヘッダーが分からない

**原因**:
- 認証フローの説明不足
- サンプルがない

**解決策**:
1. 認証の全手順を図解
2. 具体的なヘッダー形式を提示
3. トークン取得のサンプルリクエストを追加

### 問題3: エラーの原因が分からない

**症状**: エラーが発生しても対処方法が不明

**原因**:
- エラーコードの説明不足
- 対処方法の欠如

**解決策**:
1. エラーコード一覧を作成
2. 各エラーの原因と対処法を記載
3. サンプルエラーレスポンスを追加

## 関連スキル

- **technical-documentation-standards** (`.claude/skills/technical-documentation-standards/SKILL.md`): 技術文書化標準
- **markdown-advanced-syntax** (`.claude/skills/markdown-advanced-syntax/SKILL.md`): Markdown高度構文
- **structured-writing** (`.claude/skills/structured-writing/SKILL.md`): 構造化ライティング

## メトリクス

### サンプル提供率
**測定方法**: サンプル付きエンドポイント数 / 総エンドポイント数
**目標**: 100%

### エラーカバレッジ
**測定方法**: 説明済みエラーコード数 / 発生しうるエラーコード数
**目標**: 100%

### 認証説明の完全性
**評価基準**: トークン取得、使用、リフレッシュがすべて説明されている
**目標**: 完全

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 - OpenAPI、エンドポイント、エラードキュメント |

## 使用上の注意

### このスキルが得意なこと
- REST APIの仕様書作成
- OpenAPI定義の設計
- リクエスト/レスポンス例の作成
- エラードキュメンテーション

### このスキルが行わないこと
- API実装
- OpenAPIファイルの自動生成
- 実際のAPI検証

### 参考文献
- **OpenAPI Specification**: https://spec.openapis.org/oas/v3.1.0
- **API Design Patterns**: https://www.oreilly.com/library/view/api-design-patterns/
- **『Continuous API Management』**: API管理のベストプラクティス

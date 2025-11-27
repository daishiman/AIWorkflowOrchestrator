---
name: request-response-examples
description: |
  APIリクエスト・レスポンスの具体的なサンプル作成と
  エラーケースドキュメント化のための知識とテンプレート
version: 1.0.0
---

# Request/Response Examples スキル

## 概要

APIドキュメントにおける具体的なリクエスト・レスポンス例、
エラーケース、エッジケースの効果的な文書化手法を提供します。

## 知識ドメイン

### 1. リクエスト例設計
- cURLコマンド形式
- 言語別SDKサンプル（JavaScript, Python, Go, etc.）
- HTTPリクエスト生フォーマット
- 必須/オプションパラメータの明示

### 2. レスポンス例設計
- 成功レスポンス（200, 201, 204）
- ページネーション付きリスト
- ネストしたリソース表現
- HATEOASリンク

### 3. エラーレスポンス
- RFC 7807 Problem Details形式
- エラーコード体系
- バリデーションエラー詳細
- リトライ可能性の明示

### 4. エッジケース
- 空配列・null値
- 大量データ
- 特殊文字・Unicode
- タイムゾーン・日付形式

### 5. インタラクティブ例
- Try It Out機能
- サンドボックス環境
- テストデータ戦略

## リソース

| ファイル | 内容 |
|---------|------|
| `resources/example-design-patterns.md` | 効果的なサンプル設計パターン |
| `resources/error-response-standards.md` | エラーレスポンス標準（RFC 7807） |
| `resources/sdk-examples.md` | 言語別SDKサンプル作成ガイド |

## テンプレート

| ファイル | 用途 |
|---------|------|
| `templates/curl-examples.md` | cURLコマンドテンプレート |
| `templates/error-catalog.md` | エラーカタログテンプレート |

## 使用方法

```
このスキルを使用して：
1. APIエンドポイントの具体的なリクエスト例を作成
2. 成功・エラーレスポンスの両方を文書化
3. 開発者が即座に使えるコードスニペットを提供
4. エッジケースとその処理方法を明示
```

## 適用対象

- REST API ドキュメント
- GraphQL API サンプル
- WebSocket メッセージ例
- SDK リファレンス
- チュートリアル・クイックスタート

## 関連スキル

| スキル | パス | 関連性 |
|-------|------|--------|
| openapi-specification | `.claude/skills/openapi-specification/SKILL.md` | OpenAPI仕様書内のexamples定義 |
| authentication-docs | `.claude/skills/authentication-docs/SKILL.md` | 認証リクエスト/レスポンス例 |
| api-documentation-best-practices | `.claude/skills/api-documentation-best-practices/SKILL.md` | APIドキュメント全体のベストプラクティス |

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-27 | 初版リリース。リクエスト/レスポンス例設計パターン、RFC 7807エラー標準、SDK例を追加 |

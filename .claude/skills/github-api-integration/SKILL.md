---
name: GitHub API統合
description: |
  GitHub API を GitHub Actions 内で活用するための統合スキル。REST API と GraphQL API の両方を活用して、Issue、Pull Request、リリース、ワークフローなどの自動化を実現します。

  アンカー:
  - github-api-rest
  - github-api-graphql
  - github-actions-integration

  トリガー（これらの質問が来たら利用）:
  - GitHub Actions から GitHub API を呼び出す方法は？
  - gh CLI で Issue を自動作成したい
  - GraphQL API で複雑なデータを取得したい
  - API認証やトークン管理について教えてほしい
  - REST API と GraphQL API どちらを使うべき？
  - GitHub API のレート制限への対策は？
  - ワークフローからリリースノートを自動生成したい

  参照書籍:
  - 『RESTful Web APIs』（Leonard Richardson）

version: 1.0.0
level: 1
last_updated: 2025-12-31
allowed-tools:
  - Bash (GitHub CLI)
  - curl (REST API呼び出し)
  - jq (JSON処理)
references:
  - book: "RESTful Web APIs"
    author: "Leonard Richardson"
    concepts:
      - "リソース設計"
      - "HTTP設計"
---

# GitHub API統合スキル

## 概要

このスキルは、GitHub API を GitHub Actions ワークフロー内で効果的に活用するための実装ガイドです。以下の領域をカバーしています：

- **REST API**: Issue、Pull Request、リリース、リポジトリ管理などの基本的な操作
- **GraphQL API**: 複雑なデータ取得とバッチ処理による効率的な自動化
- **認証と権限**: トークン管理、スコープ設定、セキュアな認証フロー
- **エラー処理**: レート制限、リトライロジック、タイムアウト対応
- **gh CLI 統合**: シェルスクリプトからの簡単な API 操作

詳細な実装手順とベストプラクティスは関連リソースを参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

以下は、GitHub API統合で頻出するタスクと対応するリソース・テンプレートです：

| タスク                                   | 説明                                       | 関連リソース                                 | レベル |
| ---------------------------------------- | ------------------------------------------ | -------------------------------------------- | ------ |
| GitHub CLI で Issue を自動作成           | gh コマンドを使用した簡単な Issue 作成     | `rest-api.md`、`api-workflow.yaml`           | 初級   |
| REST API で PR を検索・フィルタリング    | curl または gh CLI での高度な検索          | `Level1_basics.md`、`rest-api.md`            | 初級   |
| GraphQL API で複雑なリポジトリ情報を取得 | GraphQL クエリを使用した効率的なデータ取得 | `graphql-api.md`、`Level2_intermediate.md`   | 中級   |
| ワークフロー内でトークン認証を設定       | GITHUB_TOKEN の安全な管理と権限設定        | `Level1_basics.md`、`Level2_intermediate.md` | 初級   |
| レート制限を考慮した API 呼び出し実装    | リトライロジックとバックオフ戦略           | `Level3_advanced.md`、`rest-api.md`          | 上級   |
| 複数リポジトリへの一括操作               | バッチ処理による効率的な自動化             | `Level2_intermediate.md`、`graphql-api.md`   | 中級   |
| リリースノートの自動生成                 | API を使用した自動化リリース作成           | `api-workflow.yaml`、`Level3_advanced.md`    | 上級   |
| API エラーのハンドリングと通知           | エラー処理と通知インテグレーション         | `Level3_advanced.md`、`Level4_expert.md`     | 上級   |

## ベストプラクティス

### すべきこと

1. **認証トークンの安全な管理**
   - GITHUB_TOKEN は secrets として管理し、決してコミットしない
   - 必要な最小限のスコープのみを設定する
   - 定期的にトークンをローテーションする

2. **レート制限への対応**
   - GraphQL API を使用して一度に複数のデータを取得する
   - リトライロジックとエクスポーネンシャルバックオフを実装する
   - X-RateLimit-\* レスポンスヘッダーを監視する

3. **API の選択**
   - シンプな操作には gh CLI を使用（可読性が高い）
   - 複雑なデータ取得には GraphQL API を使用（効率的）
   - 標準的な操作には REST API を使用（安定性が高い）

4. **エラーハンドリング**
   - HTTP ステータスコードを適切に処理する
   - API レスポンスのエラーメッセージを記録する
   - 一時的なエラーはリトライ、永続的なエラーは失敗させる

5. **パフォーマンス最適化**
   - 不要なデータは取得しない（必要なフィールドのみを指定）
   - バッチ処理で複数リポジトリを効率的に処理する
   - キャッシングの活用を検討する

### 避けるべきこと

1. **セキュリティリスク**
   - トークンをワークフローファイルに直接記載する
   - 不必要に高い権限スコープを設定する
   - API レスポンスに含まれる機密情報をログに出力する

2. **パフォーマンス問題**
   - ループ内で複数回 API を呼び出す（バッチ処理を使用）
   - 不要なデータを含めて取得する
   - レート制限を超過するまでリトライをしない

3. **エラー処理の不備**
   - エラーを無視して続行する
   - 一時的なエラーを永続的なエラーとして扱う
   - ユーザーへの通知なしに失敗する

4. **API の誤用**
   - 条件なしにすべてのデータを取得する
   - 廃止予定の API エンドポイントを使用する
   - ドキュメントなしに API を呼び出す

## リソース参照

### レベル別ガイド

このスキルは 4 段階のレベル別ガイドを提供します：

- **Level 1 (基礎)**: GitHub CLI の基本的な使用法、REST API の簡単な操作、認証の基本
  - ファイル: `references/Level1_basics.md`

- **Level 2 (実務)**: REST API の実務的な使用、複数操作の組み合わせ、エラーハンドリングの基本
  - ファイル: `references/Level2_intermediate.md`

- **Level 3 (応用)**: GraphQL API の活用、複雑なデータ取得、パフォーマンス最適化
  - ファイル: `references/Level3_advanced.md`

- **Level 4 (専門)**: 高度なエラーハンドリング、大規模自動化、セキュリティベストプラクティス
  - ファイル: `references/Level4_expert.md`

### 技術別ガイド

- **REST API 詳細ガイド**: `references/rest-api.md`
  - エンドポイント仕様、リクエスト/レスポンス形式、エラーコード

- **GraphQL API 詳細ガイド**: `references/graphql-api.md`
  - クエリ構文、複雑な検索方法、バッチ処理パターン

### テンプレート

- **API ワークフロー テンプレート**: `assets/api-workflow.yaml`
  - GitHub Actions ワークフローの実装例

### スクリプト・ツール

- **API ヘルパースクリプト**: `scripts/api-helper.mjs`
  - 共通の API 操作を簡素化するユーティリティ

- **スキル検証スクリプト**: `scripts/validate-skill.mjs`
  - このスキルの構造と完全性を検証

- **使用ログスクリプト**: `scripts/log_usage.mjs`
  - スキルの使用実績を記録・分析

### 旧ドキュメント

- **レガシースキル**: `references/legacy-skill.md`
  - 以前のバージョンのドキュメント（参考用）

## 変更履歴

| Version | Date       | Changes                                                                                                               |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様への準拠：Task仕様ナビテーブルを追加、Triggerを日本語化、ベストプラクティスを拡充、リソース参照を整理 |
| 0.9.0   | 2025-12-24 | 初版リリース：Level 1-4ガイド、REST/GraphQL API対応、テンプレート及びスクリプト完備                                   |

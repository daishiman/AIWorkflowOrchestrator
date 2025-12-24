# Level 1: Basics

## 概要

外部APIとの統合設計パターンに関する専門知識。 RESTful API、GraphQL、WebSocket等の統合設計と実装指針を提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling api connector design tasks.

### 必要な知識
- 対象領域: 外部APIとの統合設計パターンに関する専門知識。 RESTful API、GraphQL、WebSocket等の統合設計と実装指針を提供します。
- 主要概念: 1. API Key認証 / 実装パターン / ローテーション戦略 / API エラーハンドリングパターン / 1. エラー分類体系
- 実務指針: 外部API（Google Drive, Slack, GitHub等）との統合設計時
- 実務指針: 認証フロー（OAuth 2.0, API Key等）の実装設計時
- 実務指針: Rate Limitingやリトライ戦略の設計時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/api-client-template.ts`
- 参照テンプレート: `templates/auth-config-template.json`

### 参照書籍
- 『RESTful Web APIs』（Leonard Richardson）: リソース設計

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/api-client-template.ts`: このレベルでは参照のみ
- `templates/auth-config-template.json`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

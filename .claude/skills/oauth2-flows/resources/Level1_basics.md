# Level 1: Basics

## 概要

OAuth 2.0認可フローの実装パターンとセキュリティベストプラクティス。 Authorization Code Flow、PKCE、Refresh Token Flowの正確な実装を提供。 Aaron PareckiのOAuth 2.0 Simplifiedに基づく実践的ガイダンス。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling oauth2 flows tasks.

### 必要な知識
- 対象領域: OAuth 2.0認可フローの実装パターンとセキュリティベストプラクティス。 Authorization Code Flow、PKCE、Refresh Token Flowの正確な実装を提供。 Aaron PareckiのOAuth 2.0 Simplifiedに基づく実践的ガイダンス。
- 主要概念: フロー全体図 / 実装ステップ / Step 1: 認可リクエストの構築 / PKCEとは / PKCE拡張フロー
- 実務指針: OAuth 2.0プロバイダー統合時（Google、GitHub、Discord等）
- 実務指針: 認可フローの選択と実装が必要な時
- 実務指針: PKCEによるSPA・モバイルアプリ対応時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/auth-code-flow-template.ts`
- 参照テンプレート: `templates/pkce-implementation-template.ts`

### 参照書籍
- 『Web Application Security』（Andrew Hoffman）: 脅威モデリング

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/auth-code-flow-template.ts`: このレベルでは参照のみ
- `templates/pkce-implementation-template.ts`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

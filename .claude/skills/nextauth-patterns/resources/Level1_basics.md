# Level 1: Basics

## 概要

NextAuth.js v5の設定とカスタマイズパターン。 プロバイダー設定、アダプター統合、セッション戦略、 コールバックカスタマイズ、型安全性の確保を提供。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling nextauth patterns tasks.

### 必要な知識
- 対象領域: NextAuth.js v5の設定とカスタマイズパターン。 プロバイダー設定、アダプター統合、セッション戦略、 コールバックカスタマイズ、型安全性の確保を提供。
- 主要概念: NextAuth.js Provider Configurations / Google OAuth 2.0 / GitHub OAuth 2.0 / NextAuth.js Session Callbacks Guide / コールバックの役割
- 実務指針: NextAuth.jsの初期設定時
- 実務指針: OAuth 2.0プロバイダー統合時
- 実務指針: セッション戦略（JWT/Database）の実装時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/nextauth-config-template.ts`

### 参照書籍
- 『Web Application Security』（Andrew Hoffman）: 脅威モデリング

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/nextauth-config-template.ts`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

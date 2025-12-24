# Level 1: Basics

## 概要

コマンドのセキュリティ設計を専門とするスキル。 allowed-toolsによるツール制限、disable-model-invocationによる自動実行防止、 機密情報保護の実装方法を提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling command security design tasks.

### 必要な知識
- 対象領域: コマンドのセキュリティ設計を専門とするスキル。 allowed-toolsによるツール制限、disable-model-invocationによる自動実行防止、 機密情報保護の実装方法を提供します。
- 主要概念: セキュリティガイドライン / allowed-tools でツール制限 / disable-model-invocation / Command Security Design / リソース構造
- 実務指針: 破壊的な操作を行うコマンドを作成する時
- 実務指針: ツール使用を制限したい時
- 実務指針: 機密情報の誤コミットを防ぐチェックを実装する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/secure-command.md`

### 参照書籍
- 『Web Application Security』（Andrew Hoffman）: 脅威モデリング

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/secure-command.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

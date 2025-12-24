# Level 1: Basics

## 概要

コード静的解析によるセキュリティ脆弱性検出のベストプラクティスを提供します。 SAST（Static Application Security Testing）ツール、パターンベース検出、 データフロー分析によるSQLインジェクション、XSS、コマンドインジェクション、

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling code static analysis security tasks.

### 必要な知識
- 対象領域: コード静的解析によるセキュリティ脆弱性検出のベストプラクティスを提供します。 SAST（Static Application Security Testing）ツール、パターンベース検出、 データフロー分析によるSQLインジェクション、XSS、コマンドインジェクション、
- 主要概念: インジェクション脆弱性検出パターン / SQLインジェクション / 検出パターン / Code Static Analysis Security / 1. SQLインジェクション検出
- 実務指針: コードレビュー時のセキュリティチェック
- 実務指針: SQLインジェクション、XSS検出時
- 実務指針: センシティブデータ露出の検出時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/sast-config-template.json`

### 参照書籍
- 『Web Application Security』（Andrew Hoffman）: 脅威モデリング

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/sast-config-template.json`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

# Level 1: Basics

## 概要

Git commit hooksとプレコミット品質ゲートの専門知識。 Husky、lint-staged統合による自動lint/format実行を設計します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling commit hooks tasks.

### 必要な知識
- 対象領域: Git commit hooksとプレコミット品質ゲートの専門知識。 Husky、lint-staged統合による自動lint/format実行を設計します。
- 主要概念: Husky Configuration Guide / Huskyとは / セットアップ / lint-staged Patterns / 基本パターン
- 実務指針: コミット時の自動品質チェックを設定する時
- 実務指針: Husky、lint-stagedを導入する時
- 実務指針: ステージングファイルのみを処理する設定を行う時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/lint-staged-advanced.js`
- 参照テンプレート: `templates/pre-commit-basic.sh`

### 参照書籍
- 『Learning React』（Alex Banks, Eve Porcello）: コンポーネント設計

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/lint-staged-advanced.js`: このレベルでは参照のみ
- `templates/pre-commit-basic.sh`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

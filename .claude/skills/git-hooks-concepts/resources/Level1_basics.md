# Level 1: Basics

## 概要

Git Hooksの基本概念、ライフサイクル、実装パターンを提供するスキル。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling git hooks concepts tasks.

### 必要な知識
- 対象領域: Git Hooksの基本概念、ライフサイクル、実装パターンを提供するスキル。
- 主要概念: Git Hooks フック種類リファレンス / クライアント側フック / pre-commit / Git Hooks 実装パターン集 / パターン1: Prettier + ESLint統合
- 実務指針: Git Hooks を実装する時
- 実務指針: コミット前のコード品質チェックを自動化したい時
- 実務指針: プッシュ前のテスト実行を強制したい時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/pre-commit-template.sh`
- 参照テンプレート: `templates/pre-push-template.sh`

### 参照書籍
- 『Learning React』（Alex Banks, Eve Porcello）: コンポーネント設計

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/pre-commit-template.sh`: このレベルでは参照のみ
- `templates/pre-push-template.sh`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

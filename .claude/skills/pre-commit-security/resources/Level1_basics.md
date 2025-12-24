# Level 1: Basics

## 概要

pre-commit hookセキュリティスキル。機密情報検出パターン、 git-secrets/gitleaks統合、チーム展開戦略、Git履歴スキャンを提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling pre commit security tasks.

### 必要な知識
- 対象領域: pre-commit hookセキュリティスキル。機密情報検出パターン、 git-secrets/gitleaks統合、チーム展開戦略、Git履歴スキャンを提供します。
- 主要概念: Secret Detection Pattern Library / 汎用Secretパターン / Password / Pre-commit Security Hooks / ツール選択
- 実務指針: pre-commit hookを実装する時
- 実務指針: 機密情報検出パターンを設計する時
- 実務指針: git-secrets/gitleaksを導入する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/pre-commit-hook-template.sh`

### 参照書籍
- 『Web Application Security』（Andrew Hoffman）: 脅威モデリング

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/pre-commit-hook-template.sh`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

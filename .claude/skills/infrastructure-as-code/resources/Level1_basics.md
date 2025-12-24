# Level 1: Basics

## 概要

Infrastructure as Codeの原則に基づく構成管理の自動化を専門とするスキル。 環境変数管理、Secret管理、Railway統合を中心に、再現可能なインフラ構成を実現します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling infrastructure as code tasks.

### 必要な知識
- 対象領域: Infrastructure as Codeの原則に基づく構成管理の自動化を専門とするスキル。 環境変数管理、Secret管理、Railway統合を中心に、再現可能なインフラ構成を実現します。
- 主要概念: 環境変数設計パターン / 環境変数の分類 / 1. 機密情報 (Secrets) / Infrastructure as Code 原則 / IaCとは
- 実務指針: Railway構成を設計・最適化する時
- 実務指針: 環境変数とSecretの管理戦略を設計する時
- 実務指針: 複数環境間の構成差分を最小化する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/env-example-template.txt`
- 参照テンプレート: `templates/railway-json-template.json`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/env-example-template.txt`: このレベルでは参照のみ
- `templates/railway-json-template.json`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

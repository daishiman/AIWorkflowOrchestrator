# Level 1: Basics

## 概要

本番環境への安全なデプロイとリスク軽減を専門とするスキル。 Blue-Green、Canary、Rolling等のデプロイパターンとロールバック戦略を提供します。 専門分野:

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling deployment strategies tasks.

### 必要な知識
- 対象領域: 本番環境への安全なデプロイとリスク軽減を専門とするスキル。 Blue-Green、Canary、Rolling等のデプロイパターンとロールバック戦略を提供します。 専門分野:
- 主要概念: Blue-Green デプロイ / 概念 / 特徴 / ヘルスチェック設計 / ヘルスチェックの種類
- 実務指針: デプロイ戦略を選択・設計する時
- 実務指針: ロールバック手順を定義する時
- 実務指針: 本番デプロイのリスクを最小化したい時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/deployment-runbook.md`
- 参照テンプレート: `templates/health-endpoint-template.ts`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/deployment-runbook.md`: このレベルでは参照のみ
- `templates/health-endpoint-template.ts`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

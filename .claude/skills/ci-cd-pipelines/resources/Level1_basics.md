# Level 1: Basics

## 概要

ジーン・キムのDevOps原則に基づくCI/CDパイプライン設計と実装を専門とするスキル。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling ci cd pipelines tasks.

### 必要な知識
- 対象領域: ジーン・キムのDevOps原則に基づくCI/CDパイプライン設計と実装を専門とするスキル。
- 主要概念: キャッシュ戦略 / キャッシュの基本原則 / なぜキャッシュが重要か / GitHub Actions構文リファレンス / プルリクエストトリガー
- 実務指針: GitHub Actionsワークフローを新規作成・最適化する時
- 実務指針: CI/CDパイプラインの品質ゲートを設計する時
- 実務指針: ビルド・テストの並列化による高速化が必要な時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/ci-workflow-template.yml`
- 参照テンプレート: `templates/deploy-workflow-template.yml`

### 参照書籍
- 『Continuous Delivery』（Jez Humble）: パイプライン

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/ci-workflow-template.yml`: このレベルでは参照のみ
- `templates/deploy-workflow-template.yml`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

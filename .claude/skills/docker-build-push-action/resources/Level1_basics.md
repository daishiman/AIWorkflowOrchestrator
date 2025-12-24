# Level 1: Basics

## 概要

GitHub ActionsにおけるDockerイメージのビルドとプッシュの専門知識。 専門分野:

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling docker build push action tasks.

### 必要な知識
- 対象領域: GitHub ActionsにおけるDockerイメージのビルドとプッシュの専門知識。 専門分野:
- 主要概念: docker/build-push-action 完全構文リファレンス / 基本構文 / 必須パラメータ / コンテナレジストリ認証パターン / GitHub Container Registry (GHCR)
- 実務指針: Dockerイメージをビルド・プッシュするワークフローを作成する時
- 実務指針: マルチプラットフォーム対応のイメージを構築する時
- 実務指針: コンテナレジストリへの認証を設定する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/docker-workflow.yaml`

### 参照書籍
- 『Docker Deep Dive』（Nigel Poulton）: コンテナ基礎

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/docker-workflow.yaml`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

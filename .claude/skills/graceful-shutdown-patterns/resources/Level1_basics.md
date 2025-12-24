# Level 1: Basics

## 概要

Node.jsアプリケーションのGraceful Shutdown実装を専門とするスキル。 Twelve-Factor Appの「廃棄容易性」原則に基づき、優雅なプロセス終了、 リソースクリーンアップ、接続ドレイン、タイムアウト処理を設計します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when designing shutdown sequences, implementing.

### 必要な知識
- 対象領域: Node.jsアプリケーションのGraceful Shutdown実装を専門とするスキル。 Twelve-Factor Appの「廃棄容易性」原則に基づき、優雅なプロセス終了、 リソースクリーンアップ、接続ドレイン、タイムアウト処理を設計します。
- 主要概念: 接続ドレインガイド / 接続ドレインとは / HTTPサーバーのドレイン / リソースクリーンアップガイド / クリーンアップ対象一覧
- 実務指針: アプリケーションの終了処理を設計する時
- 実務指針: リソースリークを防ぐクリーンアップを実装する時
- 実務指針: ゼロダウンタイムデプロイを実現する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/graceful-shutdown.template.ts`
- 参照テンプレート: `templates/shutdown-manager.ts`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/graceful-shutdown.template.ts`: このレベルでは参照のみ
- `templates/shutdown-manager.ts`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

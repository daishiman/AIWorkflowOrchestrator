# Level 1: Basics

## 概要

Database Reliability Engineeringに基づくデータベース監視と可観測性の専門スキル。 SQLite/Turso統計情報、スロークエリログ、接続数監視、 ディスク使用量、レプリケーション遅延などの運用メトリクスを提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling database monitoring tasks.

### 必要な知識
- 対象領域: Database Reliability Engineeringに基づくデータベース監視と可観測性の専門スキル。 SQLite/Turso統計情報、スロークエリログ、接続数監視、 ディスク使用量、レプリケーション遅延などの運用メトリクスを提供します。
- 主要概念: アラート設計戦略 / アラート設計原則 / 1. アクション可能性 / 健全性メトリクスと閾値設計 / 主要監視メトリクス
- 実務指針: 本番DBの健全性を監視する時
- 実務指針: パフォーマンス劣化を検知する時
- 実務指針: アラート設定を構築する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/alert-rules-template.md`
- 参照テンプレート: `templates/monitoring-dashboard-template.md`

### 参照書籍
- 『Designing Data-Intensive Applications』（Martin Kleppmann）: データモデリング

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/alert-rules-template.md`: このレベルでは参照のみ
- `templates/monitoring-dashboard-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

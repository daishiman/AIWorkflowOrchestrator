# Level 1: Basics

## 概要

ファイル監視システムの可観測性（Observability）設計と実装。 Metrics、Logs、Tracesの3本柱に基づくPrometheus/Grafana統合パターンを提供。 専門分野:

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling file watcher observability tasks.

### 必要な知識
- 対象領域: ファイル監視システムの可観測性（Observability）設計と実装。 Metrics、Logs、Tracesの3本柱に基づくPrometheus/Grafana統合パターンを提供。 専門分野:
- 主要概念: ローカルエージェント仕様 / .claude/skills/file-watcher-observability/SKILL.md / 可観測性の3本柱 / クイックリファレンス
- 実務指針: 本番環境でのファイル監視のパフォーマンス監視が必要な時
- 実務指針: SLA遵守のための定量的測定が必要な時
- 実務指針: 障害の根本原因分析（RCA）を実施する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/metrics-collector.ts`

### 参照書籍
- 『Observability Engineering』（Charity Majors）: ログ設計

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/metrics-collector.ts`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

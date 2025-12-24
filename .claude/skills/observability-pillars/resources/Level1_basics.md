# Level 1: Basics

## 概要

オブザーバビリティの三本柱（ログ・メトリクス・トレース）の統合設計スキル。 Charity Majorsの『Observability Engineering』に基づく実践的な統合パターンを提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling observability pillars tasks.

### 必要な知識
- 対象領域: オブザーバビリティの三本柱（ログ・メトリクス・トレース）の統合設計スキル。 Charity Majorsの『Observability Engineering』に基づく実践的な統合パターンを提供します。
- 主要概念: 三本柱統合パターン / パターン1: 相関IDによる統合 / 設計原則 / OpenTelemetry導入ガイド / OpenTelemetryとは
- 実務指針: ログ、メトリクス、トレースを統合的に設計する時
- 実務指針: 相関IDで三本柱を連携させる時
- 実務指針: メトリクス異常から該当ログへナビゲートする仕組みを構築する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/integration-config.ts`

### 参照書籍
- 『Observability Engineering』（Charity Majors）: ログ設計

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/integration-config.ts`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

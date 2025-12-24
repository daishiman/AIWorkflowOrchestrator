# Level 1: Basics

## 概要

『Database Reliability Engineering』に基づく、データ損失を許さない堅牢なバックアップ・復旧戦略スキル。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling backup recovery tasks.

### 必要な知識
- 対象領域: 『Database Reliability Engineering』に基づく、データ損失を許さない堅牢なバックアップ・復旧戦略スキル。
- 主要概念: 多層防御バックアップ戦略 / Layer 1: 自動バックアップ / 目的 / 災害復旧計画（DR計画）ガイド / DR計画の構成要素
- 実務指針: バックアップ戦略を設計・レビューする時
- 実務指針: RPO/RTO要件を定義する時
- 実務指針: 復旧手順を文書化する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/backup-policy-template.md`
- 参照テンプレート: `templates/recovery-runbook-template.md`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/backup-policy-template.md`: このレベルでは参照のみ
- `templates/recovery-runbook-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

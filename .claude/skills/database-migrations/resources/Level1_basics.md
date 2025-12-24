# Level 1: Basics

## 概要

スコット・アンブラーの『Refactoring Databases』に基づく、安全で可逆的なデータベースマイグレーション管理スキル。 Drizzle Kitを使用したスキーマ変更の計画、マイグレーション生成、本番適用、 ロールバック戦略、および移行期間（Transition Period）を含む包括的なワークフローを提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling database migrations tasks.

### 必要な知識
- 対象領域: スコット・アンブラーの『Refactoring Databases』に基づく、安全で可逆的なデータベースマイグレーション管理スキル。 Drizzle Kitを使用したスキーマ変更の計画、マイグレーション生成、本番適用、 ロールバック戦略、および移行期間（Transition Period）を含む包括的なワークフローを提供します。
- 主要概念: 基本設定 / drizzle.config.ts (SQLite/Turso) / Turso用の設定例 / マイグレーション戦略 / マイグレーションの分類
- 実務指針: スキーマを変更する時
- 実務指針: マイグレーションを生成・適用する時
- 実務指針: 破壊的変更に移行期間を設ける時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/migration-checklist.md`
- 参照テンプレート: `templates/migration-plan-template.md`

### 参照書籍
- 『Designing Data-Intensive Applications』（Martin Kleppmann）: データモデリング

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/migration-checklist.md`: このレベルでは参照のみ
- `templates/migration-plan-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

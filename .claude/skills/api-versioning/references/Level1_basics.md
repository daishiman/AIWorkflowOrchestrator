# Level 1: Basics

## 概要

APIバージョニング戦略と後方互換性管理を専門とするスキル。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling api versioning tasks.

### 必要な知識
- 対象領域: APIバージョニング戦略と後方互換性管理を専門とするスキル。
- 主要概念: 破壊的変更（Breaking Changes）ガイド / 破壊的変更の定義 / 何が破壊的変更か？ / API非推奨化（Deprecation）プロセス / 非推奨化の原則
- 実務指針: APIバージョニング戦略を決定する時
- 実務指針: 破壊的変更を導入する時
- 実務指針: エンドポイントを非推奨化する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/deprecation-notice-template.md`
- 参照テンプレート: `templates/migration-guide-template.md`

### 参照書籍
- 『RESTful Web APIs』（Leonard Richardson）: リソース設計

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/deprecation-notice-template.md`: このレベルでは参照のみ
- `templates/migration-guide-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

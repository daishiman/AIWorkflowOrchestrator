# Level 1: Basics

## 概要

ロバート・C・マーティン（Uncle Bob）の『Clean Architecture』に基づく

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling clean architecture principles tasks.

### 必要な知識
- 対象領域: ロバート・C・マーティン（Uncle Bob）の『Clean Architecture』に基づく
- 主要概念: 基本原則 / 依存の方向 / 何が依存とみなされるか / ハイブリッドアーキテクチャへのマッピング / shared/core/（Entities相当）
- 実務指針: アーキテクチャの依存関係違反を検出する時
- 実務指針: レイヤー構造を設計・検証する時
- 実務指針: インターフェースによる境界設計が必要な時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/architecture-review-checklist.md`

### 参照書籍
- 『Clean Architecture』（Robert C. Martin）: 依存関係ルール

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/architecture-review-checklist.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

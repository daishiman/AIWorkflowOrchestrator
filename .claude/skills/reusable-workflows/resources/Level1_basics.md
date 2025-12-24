# Level 1: Basics

## 概要

GitHub Actions再利用可能ワークフローの設計と実装。 workflow_call イベント、入力/出力/シークレット定義、呼び出しパターン、 合成設計、継承、チェーンパターンの専門知識を提供。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling reusable workflows tasks.

### 必要な知識
- 対象領域: GitHub Actions再利用可能ワークフローの設計と実装。 workflow_call イベント、入力/出力/シークレット定義、呼び出しパターン、 合成設計、継承、チェーンパターンの専門知識を提供。
- 主要概念: Caller Patterns / Basic Calling Pattern / Local vs Remote / Design Patterns / Composition Patterns
- 実務指針: SKILL.md のベストプラクティスを守る

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/caller-workflow.yaml`
- 参照テンプレート: `templates/reusable-workflow.yaml`

### 参照書籍
- 『Continuous Delivery』（Jez Humble）: パイプライン

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/caller-workflow.yaml`: このレベルでは参照のみ
- `templates/reusable-workflow.yaml`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

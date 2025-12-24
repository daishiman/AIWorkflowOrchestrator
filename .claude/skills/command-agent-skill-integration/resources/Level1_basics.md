# Level 1: Basics

## 概要

コマンド、エージェント、スキルの統合を専門とするスキル。 三位一体の概念、コマンド→エージェント起動パターン、コマンド→スキル参照パターン、 複合ワークフローの設計を提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling command agent skill integration tasks.

### 必要な知識
- 対象領域: コマンド、エージェント、スキルの統合を専門とするスキル。 三位一体の概念、コマンド→エージェント起動パターン、コマンド→スキル参照パターン、 複合ワークフローの設計を提供します。
- 主要概念: Command → Agent統合パターン / 基本概念 / なぜコマンドからエージェントを起動するのか？ / 明示的参照構文 / Step N: Load Best Practices
- 実務指針: コマンドからエージェントを起動したい時
- 実務指針: コマンド内でスキルを参照したい時
- 実務指針: Command-Agent-Skillの協調ワークフローを設計する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/agent-invocation-template.md`
- 参照テンプレート: `templates/composite-workflow-template.md`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/agent-invocation-template.md`: このレベルでは参照のみ
- `templates/composite-workflow-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

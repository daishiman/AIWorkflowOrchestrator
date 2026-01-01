# Level 1: Basics

## 概要

SOLID原則のインターフェース分離原則（ISP）を専門とするスキル。 Robert C. Martinの『アジャイルソフトウェア開発の奥義』に基づき、 クライアントが使用しないメソッドへの依存を強制しない、

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling interface segregation tasks.

### 必要な知識
- 対象領域: SOLID原則のインターフェース分離原則（ISP）を専門とするスキル。 Robert C. Martinの『アジャイルソフトウェア開発の奥義』に基づき、 クライアントが使用しないメソッドへの依存を強制しない、
- 主要概念: 肥大化インターフェースの検出（Fat Interface Detection） / 検出指標 / 1. 定量的指標 / インターフェースの組み合わせ（Interface Composition） / 組み合わせパターン
- 実務指針: IWorkflowExecutorのようなコアインターフェースを設計する時
- 実務指針: 既存インターフェースの肥大化を検出した時
- 実務指針: 複数のクライアントが異なる機能を必要とする時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/segregated-interface-template.md`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/segregated-interface-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

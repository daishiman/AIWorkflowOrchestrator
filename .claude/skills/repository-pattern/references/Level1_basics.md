# Level 1: Basics

## 概要

Martin FowlerのPoEAAに基づくRepositoryパターン設計と実装を専門とするスキル。 アプリケーション層とデータアクセス層を分離し、ドメインエンティティをコレクション風 インターフェースで操作する抽象化を提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling repository pattern tasks.

### 必要な知識
- 対象領域: Martin FowlerのPoEAAに基づくRepositoryパターン設計と実装を専門とするスキル。 アプリケーション層とデータアクセス層を分離し、ドメインエンティティをコレクション風 インターフェースで操作する抽象化を提供します。
- 主要概念: Repository設計原則 / 1. コレクション抽象化原則 / 2. 集約ルート原則 / エンティティマッピングガイド / マッピング戦略
- 実務指針: Repositoryインターフェースを設計する時
- 実務指針: Repository実装を作成する時
- 実務指針: ドメインエンティティとDB型の変換を設計する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/repository-implementation-template.md`
- 参照テンプレート: `templates/repository-interface-template.md`

### 参照書籍
- 『Design Patterns』（Erich Gamma et al.）: 設計パターン

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/repository-implementation-template.md`: このレベルでは参照のみ
- `templates/repository-interface-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

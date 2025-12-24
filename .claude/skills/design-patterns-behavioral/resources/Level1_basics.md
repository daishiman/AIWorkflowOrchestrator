# Level 1: Basics

## 概要

GoF（Gang of Four）の行動パターンを専門とするスキル。 エリック・ガンマの『デザインパターン』に基づき、オブジェクト間の通信と 責務の分散を効果的に設計するパターンを提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling design patterns behavioral tasks.

### 必要な知識
- 対象領域: GoF（Gang of Four）の行動パターンを専門とするスキル。 エリック・ガンマの『デザインパターン』に基づき、オブジェクト間の通信と 責務の分散を効果的に設計するパターンを提供します。
- 主要概念: Chain of Responsibility Pattern（責任の連鎖パターン） / パターン構造 / 構成要素 / Command Pattern（コマンドパターン） / Observer Pattern（オブザーバーパターン）
- 実務指針: ワークフローエンジンでアルゴリズムの切り替えが必要な時
- 実務指針: 共通処理フローを定義し、個別実装を分離したい時
- 実務指針: 操作の実行、取り消し、キューイングが必要な時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/strategy-implementation.md`
- 参照テンプレート: `templates/template-method-implementation.md`

### 参照書籍
- 『Design Patterns』（Erich Gamma et al.）: 設計パターン

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/strategy-implementation.md`: このレベルでは参照のみ
- `templates/template-method-implementation.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

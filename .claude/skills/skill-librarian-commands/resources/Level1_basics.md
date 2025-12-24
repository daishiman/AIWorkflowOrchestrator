# Level 1: Basics

## 概要

Skill Librarianエージェント専用のコマンド、スクリプト、リソース参照ガイド。 スキル作成・管理に必要なTypeScriptスクリプトの実行方法、 詳細リソースへのアクセスパス、テンプレート参照方法を提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when [英語の発動条件].

### 必要な知識
- 対象領域: Skill Librarianエージェント専用のコマンド、スクリプト、リソース参照ガイド。 スキル作成・管理に必要なTypeScriptスクリプトの実行方法、 詳細リソースへのアクセスパス、テンプレート参照方法を提供します。
- 主要概念: Command Reference / Script Execution Commands / validate-knowledge.mjs / Claude Code 3層アーキテクチャ設計仕様書 / TypeScriptスクリプト実行
- 実務指針: スキル品質を検証したい時（validate-knowledge.mjs）
- 実務指針: トークン使用量を計算したい時（calculate-token-usage.mjs）
- 実務指針: ドキュメント構造を分析したい時（analyze-structure.mjs）

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/resource-template.md`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 手順設計

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/resource-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

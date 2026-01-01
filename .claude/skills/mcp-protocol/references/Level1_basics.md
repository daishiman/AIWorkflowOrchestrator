# Level 1: Basics

## 概要

Model Context Protocol (MCP) の標準仕様とツール定義パターンに関する専門知識。 MCPプロトコルの構造、サーバー設定、ツール定義、パラメータスキーマ設計を提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling mcp protocol tasks.

### 必要な知識
- 対象領域: Model Context Protocol (MCP) の標準仕様とツール定義パターンに関する専門知識。 MCPプロトコルの構造、サーバー設定、ツール定義、パラメータスキーマ設計を提供します。
- 主要概念: MCP設定例集 / 1. 基本的なMCPサーバー設定 / npxベースのサーバー / 1. プロトコルバージョン / バージョン管理
- 実務指針: MCPサーバーの新規設定が必要な時
- 実務指針: ツール定義のYAML/JSON構造を設計する時
- 実務指針: MCPプロトコル仕様への準拠を確認する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/server-config-template.json`
- 参照テンプレート: `templates/tool-definition-template.json`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/server-config-template.json`: このレベルでは参照のみ
- `templates/tool-definition-template.json`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

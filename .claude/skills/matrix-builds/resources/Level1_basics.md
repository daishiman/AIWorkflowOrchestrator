# Level 1: Basics

## 概要

GitHub Actionsのマトリックスビルド戦略（strategy.matrix）の設計と最適化。 複数のOS、バージョン、環境での並列テスト実行、動的マトリックス生成、include/exclude条件、 fail-fast制御、max-parallel設定による効率的なCI/CDパイプライン構築を支援。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling matrix builds tasks.

### 必要な知識
- 対象領域: GitHub Actionsのマトリックスビルド戦略（strategy.matrix）の設計と最適化。 複数のOS、バージョン、環境での並列テスト実行、動的マトリックス生成、include/exclude条件、 fail-fast制御、max-parallel設定による効率的なCI/CDパイプライン構築を支援。
- 主要概念: 動的マトリックス生成 / fromJSON: JSON文字列からマトリックス生成 / 基本パターン / 基本構文 / シンプルマトリックス
- 実務指針: SKILL.md のベストプラクティスを守る

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/matrix-template.yaml`

### 参照書籍
- 『Don't Make Me Think』（Steve Krug）: ユーザビリティ

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/matrix-template.yaml`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

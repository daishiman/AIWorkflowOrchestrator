# Level 1: Basics

## 概要

ロックファイル（pnpm-lock.yaml、package-lock.json等）の整合性管理と 依存関係の再現性確保を専門とするスキル。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling lock file management tasks.

### 必要な知識
- 対象領域: ロックファイル（pnpm-lock.yaml、package-lock.json等）の整合性管理と 依存関係の再現性確保を専門とするスキル。
- 主要概念: CI/CDでの最適化 / キャッシュ戦略 / pnpm + GitHub Actions / マージコンフリクトの解決 / コンフリクトの原因
- 実務指針: ロックファイルのマージコンフリクトを解決する時
- 実務指針: 依存関係の再現性問題をデバッグする時
- 実務指針: CI/CD環境での依存関係インストールを最適化する時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/lockfile-troubleshooting-template.md`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/lockfile-troubleshooting-template.md`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

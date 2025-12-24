# Level 1: Basics

## 概要

Rate Limitingとクォータ管理のベストプラクティスを提供します。 外部APIのレート制限を適切に処理し、サーバー側・クライアント側両方の 観点からRate Limitingを実装するためのパターンを提供します。

SKILL.md の内容だけで完結する基本運用を扱います。

## 前提条件

- SKILL.md の概要とワークフローを読了している
- 対象タスクの目的と成果物を把握している

## 詳細ガイド

### 使用タイミング
- Use proactively when handling rate limiting tasks.

### 必要な知識
- 対象領域: Rate Limitingとクォータ管理のベストプラクティスを提供します。 外部APIのレート制限を適切に処理し、サーバー側・クライアント側両方の 観点からRate Limitingを実装するためのパターンを提供します。
- 主要概念: Rate Limiting Algorithms（レート制限アルゴリズム） / アルゴリズム比較 / Token Bucket / Client-Side Rate Limit Handling（クライアント側のレート制限対応） / レート制限レスポンスの理解
- 実務指針: APIのRate Limiting設計時
- 実務指針: DoS/DDoS攻撃対策の実装時
- 実務指針: 外部APIクライアントの実装時

### 判断基準
- 避けるべき判断: アンチパターンや注意点を確認せずに進めることを避ける

### 成果物の最小要件
- テンプレートの必須項目を満たしている
- 主要テンプレート: `templates/rate-limiter-template.ts`

### 参照書籍
- 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）: 実践的改善

### 主要リソース
- `SKILL.md`: スキルの目的・前提・判断基準の基礎

### 主要テンプレート
- `templates/rate-limiter-template.ts`: このレベルでは参照のみ

## 実践手順

1. SKILL.md の概要と目的を確認する
2. 適用タイミングと成果物の期待値を言語化する
3. 作業の冒頭で前提条件が満たされているか確認する

## チェックリスト

- [ ] スキルの適用タイミングを説明できる
- [ ] 必要な知識と判断基準を整理できた
- [ ] テンプレートの必須項目を把握している

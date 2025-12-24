---
name: .claude/skills/clean-code-practices/SKILL.md
description: |
  ロバート・C・マーティン（Uncle Bob）の『Clean Code』に基づくコード品質プラクティスを専門とするスキル。
  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/clean-code-practices/resources/comments-and-documentation.md`: コメントとドキュメンテーション
  - `.claude/skills/clean-code-practices/resources/dry-principle.md`: DRY原則（Do Not Repeat Yourself）
  - `.claude/skills/clean-code-practices/resources/meaningful-names.md`: 意図を明確にする命名・発音しやすい名前・検索しやすい名前の原則と変数/関数/クラス/ブール値の品詞別命名規則
  - `.claude/skills/clean-code-practices/resources/small-functions.md`: 5-10行の理想サイズ・単一責任原則・抽象度の統一・パラメータ3つ以下の関数設計ガイドライン
  - `.claude/skills/clean-code-practices/templates/code-review-checklist.md`: コードレビューチェックリスト
  - `.claude/skills/clean-code-practices/scripts/measure-code-quality.mjs`: コード品質測定スクリプト

  専門分野:
  - 意味のある命名: 変数、関数、クラスの命名規則
  - 小さな関数: 単一責任、適切なサイズ
  - DRY原則: 重複の排除
  - コメント: 適切なコメントと自己文書化コード

  使用タイミング:
  - コードの命名を改善したい時
  - 関数が大きすぎると感じた時
  - コードの重複を発見した時
  - コードの可読性を向上させたい時

  Use proactively when improving code readability, naming conventions, or applying clean code principles.
version: 1.0.0
---

# Clean Code Practices

## 概要

このスキルは、ロバート・C・マーティン（Uncle Bob）が『Clean Code』で体系化した
コード品質のプラクティスを提供します。可読性が高く、保守しやすいコードを書くための
基本原則と具体的なテクニックを解説します。

**核心原則**:

- コードは書かれるより読まれる回数が圧倒的に多い
- 明確さが簡潔さに勝る
- 小さなものは理解しやすい

**対象ユーザー**:

- ビジネスロジック実装エージェント（.claude/agents/logic-dev.md）
- コードレビュー担当者
- 品質向上を目指す開発者

## リソース構造

```
clean-code-practices/
├── SKILL.md                              # 本ファイル
├── resources/
│   ├── meaningful-names.md               # 意味のある命名の詳細
│   ├── small-functions.md                # 小さな関数の原則
│   ├── dry-principle.md                  # DRY原則の適用
│   └── comments-and-documentation.md     # コメントの書き方
├── scripts/
│   └── measure-code-quality.mjs          # コード品質測定
└── templates/
    └── code-review-checklist.md          # コードレビューチェックリスト
```

## コマンドリファレンス

### リソース読み取り

```bash
# 意味のある命名
cat .claude/skills/clean-code-practices/resources/meaningful-names.md

# 小さな関数の原則
cat .claude/skills/clean-code-practices/resources/small-functions.md

# DRY原則
cat .claude/skills/clean-code-practices/resources/dry-principle.md

# コメントの書き方
cat .claude/skills/clean-code-practices/resources/comments-and-documentation.md
```

### スクリプト実行

```bash
# コード品質測定
node .claude/skills/clean-code-practices/scripts/measure-code-quality.mjs src/features/
```

## 意味のある命名（概要）

### 意図を明確にする

変数名、関数名、クラス名は、その存在理由、機能、使用方法を表現すべきです。

**基準**:

- 名前だけで何をするか分かるか？
- コメントなしで理解できるか？
- 発音しやすいか？

### 命名規則

- **変数**: 内容を表す名詞（例: `userCount`, `orderItems`）
- **関数**: 動詞で始まる（例: `calculateTotal`, `validateEmail`）
- **クラス**: 名詞（例: `UserService`, `OrderProcessor`）
- **ブール値**: is/has/canで始まる（例: `isValid`, `hasPermission`）

**詳細**: `resources/meaningful-names.md`

## 小さな関数（概要）

### 単一責任

関数は一つのことだけを行い、それを上手くやるべきです。

**基準**:

- 関数が一つのことだけをしているか？
- 関数名が処理内容を正確に表しているか？
- 抽象度が統一されているか？

### サイズの目安

- 理想: 5-10行
- 上限: 20-30行
- ネスト: 2段階まで

**詳細**: `resources/small-functions.md`

## DRY原則（概要）

### 重複の排除

"Don't Repeat Yourself" - 同じ知識を複数箇所に持たない。

**適用条件**:

- 同じロジックが3回以上繰り返される
- 変更時に複数箇所を修正する必要がある
- コピー&ペーストでコードを書いている

### 注意点

- 早すぎる抽象化を避ける
- 偶然の類似と本質的な重複を区別する

**詳細**: `resources/dry-principle.md`

## コメント（概要）

### 自己文書化コード

コメントよりも、コード自体で意図を表現することを優先します。

**良いコメント**:

- 法的情報
- 意図の説明（なぜそうしたか）
- 警告
- TODO（一時的）

**悪いコメント**:

- 冗長な説明
- 誤解を招くコメント
- コメントアウトされたコード
- 変更履歴

**詳細**: `resources/comments-and-documentation.md`

## ワークフロー

### コード品質改善

```
1. コードを読む
   ↓
2. 問題点を特定
   - 命名は明確か？
   - 関数は小さいか？
   - 重複はないか？
   ↓
3. 優先順位を決定
   - 可読性への影響
   - 修正の容易さ
   ↓
4. 一つずつ改善
   ↓
5. テストで確認
```

### コードレビュー

```
1. 全体構造の確認
   ↓
2. 命名のチェック
   ↓
3. 関数サイズのチェック
   ↓
4. 重複のチェック
   ↓
5. フィードバック作成
```

## ベストプラクティス

### すべきこと

1. **読みやすさを優先**:
   - 明確さが簡潔さに勝つ
   - 理解しやすいコードを書く

2. **継続的に改善**:
   - ボーイスカウトルール：来た時よりも綺麗に
   - 小さな改善を積み重ねる

3. **一貫性を保つ**:
   - プロジェクト内で命名規則を統一
   - 既存のスタイルに従う

### 避けるべきこと

1. **不明瞭な命名**:
   - ❌ `d`, `temp`, `data`, `info`
   - ✅ `elapsedTimeInDays`, `tempUserId`, `userData`

2. **巨大な関数**:
   - ❌ 100行の関数
   - ✅ 10-20行の小さな関数

3. **コードのコピー&ペースト**:
   - ❌ 同じロジックを複数箇所に
   - ✅ 共通関数に抽出

## 関連スキル

- **.claude/skills/refactoring-techniques/SKILL.md** (`.claude/skills/refactoring-techniques/SKILL.md`): コード改善のテクニック
- **.claude/skills/tdd-red-green-refactor/SKILL.md** (`.claude/skills/tdd-red-green-refactor/SKILL.md`): テストを伴う改善
- **.claude/skills/solid-principles/SKILL.md** (`.claude/skills/solid-principles/SKILL.md`): 設計原則

## メトリクス

### 関数サイズ

**目標**: 20行以下

### 循環的複雑度

**目標**: 10以下

### 認知的複雑度

**目標**: 15以下

## 参考文献

- **『Clean Code』** ロバート・C・マーティン著
  - 第2章: 意味のある名前
  - 第3章: 関数
  - 第4章: コメント

- **『リーダブルコード』** Dustin Boswell、Trevor Foucher著

## 変更履歴

| バージョン | 日付       | 変更内容                                     |
| ---------- | ---------- | -------------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版作成 - Uncle BobのClean Codeプラクティス |

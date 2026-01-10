# Task仕様書：Changelog Generation

## 1. メタ情報

- 名前: Olivier Lacan (Keep a Changelog 提唱者の思考様式を参照)

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Keep a Changelog (keepachangelog.com) の提唱者として、
人間が読みやすい変更履歴の重要性を説いた。
Semantic Versioning と連携した変更ログの構造化手法を確立し、
プロジェクトの変更を追跡可能にする方法論を持つ。

### 2.2 目的

コミット履歴から人間が理解しやすい Changelog を生成し、
ドキュメントの変更内容を利害関係者に明確に伝える。

### 2.3 責務

- コミット履歴の分析と分類（Added / Changed / Deprecated / Removed / Fixed / Security）
- バージョン番号の決定（Semantic Versioning に基づく）
- 変更内容のグルーピングと優先順位付け
- Changelog フォーマットへの整形

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Keep a Changelog (Olivier Lacan)
- 適用方法:
  変更を6つのカテゴリ（Added, Changed, Deprecated, Removed, Fixed, Security）に分類。
  最新の変更を上部に配置し、時系列を維持。

#### 書籍2

- 書籍: Semantic Versioning 2.0.0
- 適用方法:
  MAJOR.MINOR.PATCH の番号付けルールを適用。
  Breaking Changes は MAJOR バージョンアップ、新機能は MINOR、バグ修正は PATCH。

> ルール: 詳細は references/changelog-generation.md を参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. コミット履歴の取得
   - git log の範囲を決定（前回リリース以降 or 全履歴）
   - Conventional Commits 形式のパース
   - マージコミットの除外

2. 変更の分類
   - feat → Added
   - fix → Fixed
   - docs → Changed（ドキュメント変更の場合）
   - BREAKING CHANGE → Changed（重大な変更として強調）
   - security → Security

3. バージョン番号の決定
   - BREAKING CHANGE あり → MAJOR
   - feat あり → MINOR
   - fix のみ → PATCH

4. Changelog の構造化
   - バージョンごとにセクション分割
   - 各セクション内でカテゴリ別にグループ化
   - 日付の追加（YYYY-MM-DD 形式）

5. 出力フォーマットへの整形
   - Markdown 形式で出力
   - assets/changelog-template.md のテンプレート適用

### 4.2 チェックリスト

- 項目: コミット履歴の完全性
  - 基準: 対象範囲のすべてのコミットが分析されている
- 項目: カテゴリ分類の正確性
  - 基準: 各変更が適切なカテゴリに配置されている
- 項目: バージョン番号の妥当性
  - 基準: Semantic Versioning のルールに準拠している
- 項目: 日付形式の統一
  - 基準: すべて YYYY-MM-DD 形式
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: バージョン番号、日付、変更内容が含まれている
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: コミットメッセージの内容を正確に反映

### 4.3 ビジネスルール（制約）

- 内容: Unreleased セクションを常に最上部に配置
- 内容: 空のカテゴリセクションは出力しない
- 内容: 変更内容は簡潔に（1行1変更）

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: コミット履歴
- 提供元: Commit Message Crafting Task または git log コマンド
- 検証ルール:
  Conventional Commits 形式のコミットメッセージのリスト
- 拒否すべき入力:
  空のコミット履歴
- 欠損時処理:
  git log コマンドの実行を促す

#### 入力2

- データ名: バージョン範囲（任意）
- 提供元: 外部（ユーザー指定）
- 検証ルール:
  Git のリビジョン範囲形式（例: v1.0.0..HEAD）
- 拒否すべき入力:
  存在しないタグやコミットハッシュ
- 欠損時処理:
  全コミット履歴を対象とする

#### 入力3

- データ名: 現在のバージョン番号（任意）
- 提供元: 外部（CHANGELOG.md または package.json）
- 検証ルール:
  Semantic Versioning 形式（x.y.z）
- 拒否すべき入力:
  不正な形式のバージョン番号
- 欠損時処理:
  0.1.0 を初期バージョンとする

### 5.2 出力

#### 成果物1

- 成果物名: CHANGELOG.md
- 受領先: PR Review Preparation Task
- 出力テンプレート:

  ```markdown
  # Changelog

  All notable changes to this project will be documented in this file.

  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

  ## [Unreleased]

  ## [{{version}}] - {{date}}

  ### Added

  - {{change-1}}

  ### Changed

  - {{change-2}}

  ### Fixed

  - {{change-3}}
  ```

- 内容:
  Keep a Changelog 形式に準拠した変更履歴ドキュメント

#### 成果物2

- 成果物名: 次期バージョン番号
- 受領先: 外部（リリース作業）
- 出力テンプレート:
  ```
  {{next-version}}
  ```
- 内容:
  Semantic Versioning に基づいて算出された次期バージョン番号

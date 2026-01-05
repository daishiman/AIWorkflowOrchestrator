# Task仕様書：Commit Message Crafting

## 1. メタ情報

- 名前: Tim Pope (Conventional Commits 普及に貢献した思考様式を参照)

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

「A Note About Git Commit Messages」の著者として、
明確で検索可能なコミットメッセージの重要性を説いた。
Conventional Commits の設計思想を理解し、
将来の開発者が変更の意図を理解できるメッセージを作成できる。

### 2.2 目的

変更の意図と影響範囲を明確に伝えるコミットメッセージを作成し、
ドキュメント変更履歴の追跡性と検索性を向上させる。

### 2.3 責務

- 変更内容の分析と分類（feat / fix / docs / refactor 等）
- コミットメッセージの構造化（subject / body / footer）
- Breaking Changes の明示
- 関連Issue/PRの参照追加

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Conventional Commits 仕様
- 適用方法:
  type(scope): subject の形式を用いて、変更の種類と影響範囲を明示。
  BREAKING CHANGE フッターで後方互換性のない変更を明確化。

#### 書籍2

- 書籍: Pro Git (Scott Chacon) 第5章
- 適用方法:
  コミットメッセージのベストプラクティス（50文字以内のサマリ、72文字での折り返し）を適用。

> ルール: 詳細は references/commit-conventions.md を参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. 変更内容の分析
   - git diff の出力を確認
   - 変更されたファイルの性質を分類（構造 / 内容 / メタデータ）
   - 変更の意図を特定（新規追加 / 修正 / 削除 / リファクタリング）

2. Type の決定
   - docs: ドキュメントのみの変更
   - feat: 新しいドキュメントセクションの追加
   - fix: 誤記や誤情報の修正
   - refactor: 構造の整理（内容変更なし）
   - style: フォーマットのみの変更

3. Scope の決定（任意）
   - 影響を受けるドキュメントセクションや対象領域

4. Subject の作成
   - 動詞の命令形で開始（Add / Update / Fix / Remove）
   - 50文字以内に収める
   - 末尾にピリオドを付けない

5. Body の作成（必要に応じて）
   - 変更の理由（Why）を記述
   - 変更前の問題点を明示
   - 72文字で折り返し

6. Footer の追加（必要に応じて）
   - Breaking Changes の明示
   - 関連Issue/PRの参照（Closes #123, Refs #456）

### 4.2 チェックリスト

- 項目: Type の適切性
  - 基準: 変更内容と Type が一致している
- 項目: Subject の簡潔性
  - 基準: 50文字以内、動詞の命令形、末尾にピリオドなし
- 項目: Body の必要性判断
  - 基準: Subject だけで伝わる場合は Body を省略
- 項目: Breaking Changes の明示
  - 基準: 後方互換性のない変更は BREAKING CHANGE フッターで明示
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: Type、Subject が含まれている
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 変更内容を正確に記述し、憶測を含めない

### 4.3 ビジネスルール（制約）

- 内容: Subject は必ず英語で記述（国際的な協業を想定）
- 内容: Type は Conventional Commits 仕様に準拠
- 内容: 複数の独立した変更は複数のコミットに分割

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: 変更差分
- 提供元: git diff コマンドまたは Branch Strategy Planning Task
- 検証ルール:
  git diff の出力形式または変更されたファイルのリスト
- 拒否すべき入力:
  空の差分（変更がない状態）
- 欠損時処理:
  git diff コマンドの実行を促す

#### 入力2

- データ名: 変更の背景情報（任意）
- 提供元: 外部（ユーザーまたはIssue）
- 検証ルール:
  変更の理由や目的を説明するテキスト
- 拒否すべき入力:
  意味のない文字列（例: "aaa", "test"）
- 欠損時処理:
  Subject のみのシンプルなメッセージとして扱う

### 5.2 出力

#### 成果物1

- 成果物名: コミットメッセージ
- 受領先: Changelog Generation Task
- 出力テンプレート:

  ```
  {{type}}({{scope}}): {{subject}}

  {{body}}

  {{footer}}
  ```

- 内容:
  Conventional Commits 形式に準拠したコミットメッセージ

#### 成果物2

- 成果物名: git commit コマンド例
- 受領先: 外部（実行者）
- 出力テンプレート:
  ```bash
  git commit -m "{{type}}({{scope}}): {{subject}}"
  ```
- 内容:
  作成したメッセージを用いた git commit コマンド

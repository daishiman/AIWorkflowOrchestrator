# コードスメルカタログ

## 概要

コードスメル（Code Smell）は、コードに問題がある可能性を示すサインです。
バグではないが、設計上の問題を示唆し、リファクタリングの必要性を示します。

## メソッドレベルのスメル

### 1. Long Method（長大なメソッド）

**定義**: メソッドの行数が多すぎる

**検出基準**:
- 30行を超えるメソッド
- スクロールしないと全体が見えない
- 複数の「段落」に分かれている

**対処法**:
- Extract Method
- Replace Temp with Query
- Introduce Parameter Object

### 2. Long Parameter List（パラメータ過多）

**定義**: メソッドのパラメータ数が多すぎる

**検出基準**:
- パラメータが4つ以上
- 同じパラメータ群が複数メソッドで使用される
- プリミティブ型のパラメータが連続

**対処法**:
- Introduce Parameter Object
- Preserve Whole Object
- Replace Parameter with Method Call

### 3. Duplicated Code（重複コード）

**定義**: 同一または類似のコードが複数箇所に存在

**検出基準**:
- 3行以上の同一コードが2箇所以上
- コピー&ペーストで作成されたコード
- 微妙に異なる類似コード

**対処法**:
- Extract Method（同一クラス内）
- Extract Superclass（兄弟クラス間）
- Pull Up Method（親クラスへ移動）

### 4. Complex Conditional（複雑な条件式）

**定義**: 条件式が複雑で理解しにくい

**検出基準**:
- ネストが3段階以上
- 条件が3つ以上の&&/||で結合
- 条件の意図が読み取れない

**対処法**:
- Decompose Conditional
- Replace Nested Conditional with Guard Clauses
- Replace Conditional with Polymorphism

### 5. Magic Number（マジックナンバー）

**定義**: 意味不明な数値リテラルがコード中に存在

**検出基準**:
- 0, 1, -1 以外の数値リテラル
- 数値の意味がコンテキストから不明
- 同じ数値が複数箇所で使用

**対処法**:
- Replace Magic Number with Symbolic Constant
- 定数またはenum定義

## クラスレベルのスメル

### 6. Large Class（巨大クラス）

**定義**: クラスが担当する責務が多すぎる

**検出基準**:
- 500行を超えるクラス
- メソッド数が20を超える
- 複数の異なる関心事を持つ

**対処法**:
- Extract Class
- Extract Subclass
- Extract Interface

### 7. Feature Envy（特性への依存）

**定義**: 自クラスより他クラスのデータを多く使用

**検出基準**:
- 他クラスのgetterを3つ以上呼び出す
- 自クラスのフィールドをほとんど使用しない
- 計算ロジックが本来あるべき場所にない

**対処法**:
- Move Method
- Extract Method + Move Method

### 8. Data Clumps（データの群れ）

**定義**: 同じデータ群が複数箇所で一緒に使用される

**検出基準**:
- 同じ3つ以上のフィールドが複数クラスに存在
- 同じパラメータ群が複数メソッドに存在
- データがいつも一緒に渡される

**対処法**:
- Extract Class
- Introduce Parameter Object
- Preserve Whole Object

### 9. Primitive Obsession（基本データ型への固執）

**定義**: 基本データ型を概念の表現に過度に使用

**検出基準**:
- 文字列で型を表現（"ADMIN", "USER"）
- 数値で状態を表現（0, 1, 2）
- 配列で構造化データを表現

**対処法**:
- Replace Type Code with Class
- Replace Type Code with Subclasses
- Replace Array with Object

## 変更妨害のスメル

### 10. Divergent Change（変更の発散）

**定義**: 一つのクラスが異なる理由で頻繁に変更される

**検出基準**:
- 機能追加で常に同じクラスを変更
- 異なる種類の変更が同じクラスに集中
- 責務が不明確

**対処法**:
- Extract Class
- Split Phase

### 11. Shotgun Surgery（散弾銃手術）

**定義**: 一つの変更が多くのクラスに影響

**検出基準**:
- 小さな変更で多数のファイルを修正
- 変更漏れが発生しやすい
- 関連コードが分散している

**対処法**:
- Move Method
- Move Field
- Inline Class

## 優先度評価基準

### 高優先度（即座に対処）

- 重複コード（バグ修正時の漏れリスク）
- 長大なメソッド（可読性の大幅な低下）
- 複雑な条件式（バグの温床）

### 中優先度（計画的に対処）

- パラメータ過多
- データの群れ
- Feature Envy

### 低優先度（余裕がある時に対処）

- マジックナンバー
- 基本データ型への固執
- コメント過多

## 検出チェックリスト

### メソッドレビュー時

- [ ] 行数が30行を超えていないか？
- [ ] パラメータが4つ以上ないか？
- [ ] ネストが3段階以上ないか？
- [ ] マジックナンバーがないか？

### クラスレビュー時

- [ ] 行数が500行を超えていないか？
- [ ] 単一責任原則に従っているか？
- [ ] 他クラスへの依存が過度でないか？
- [ ] 同じデータ群が繰り返し現れていないか？

## 自動検出ツール

### 静的解析メトリクス

- **循環的複雑度**: 10以上は要注意
- **認知的複雑度**: 15以上は要注意
- **メソッド行数**: 30行以上は要注意
- **クラス行数**: 500行以上は要注意
- **パラメータ数**: 4つ以上は要注意

---
name: .claude/skills/database-normalization/SKILL.md
description: |
    C.J.デイトの『データベース実践講義』に基づくリレーショナルデータベース正規化理論。
    第1〜5正規形の段階的適用と、パフォーマンス要件に基づく意図的な非正規化の判断基準を提供。
    専門分野:
    - 正規化理論: 1NF〜5NF、BCNF の段階的理解と適用
    - 関数従属性分析: 完全関数従属、部分関数従属、推移関数従属の識別
    - 更新異常: 挿入異常、削除異常、修正異常の検出と排除
    - 意図的非正規化: パフォーマンス要件に基づく戦略的な正規化緩和
    使用タイミング:
    - 新規テーブル設計時の正規化レベル決定
    - 既存スキーマの正規化レベル評価
    - パフォーマンス問題の原因が正規化レベルにある可能性がある場合
    - 非正規化の判断とその文書化が必要な場合
    Use proactively when designing database schemas, evaluating normalization levels,
    or making denormalization decisions for performance optimization.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/database-normalization/resources/normalization-levels-detail.md`: 第1〜5正規形、BCNFの詳細解説と適用例
  - `.claude/skills/database-normalization/templates/denormalization-decision-template.md`: 非正規化決定の記録と文書化テンプレート
  - `.claude/skills/database-normalization/scripts/analyze-normalization.mjs`: スキーマの正規化レベルを分析する評価スクリプト

version: 1.0.0
---

# Database Normalization Skill

## 概要

このスキルは、C.J.デイトのリレーショナルモデル理論に基づく正規化の知識を提供します。
データベース設計において、データの冗長性を排除し、更新異常を防ぐための体系的なアプローチを学びます。

## 核心概念

### 正規化の目的

1. **データ冗長性の排除**: 同じ情報の重複保存を防ぐ
2. **更新異常の防止**: 挿入・削除・修正時の整合性問題を回避
3. **データ整合性の保証**: 制約による不正データの混入防止
4. **保守性の向上**: スキーマ変更の影響範囲を最小化

### 正規化の段階

#### 第 1 正規形（1NF）

**定義**: すべての属性が原子値（分割不可能な値）を持つ

**違反例**:

```sql
-- 違反: 繰り返しグループ
CREATE TABLE orders (
  id INT,
  customer_name TEXT(100),
  items TEXT(500)  -- "item1,item2,item3" のような値
);
```

**解決策**:

```sql
-- 正規化: 関連テーブルに分離
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT(100)
);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INT REFERENCES orders(id),
  item_name TEXT(100)
);
```

**判断基準**:

- [ ] すべてのカラムが原子値か？
- [ ] 繰り返しグループ（配列、カンマ区切り値）がないか？
- [ ] 各行が一意に識別可能か？

#### 第 2 正規形（2NF）

**定義**: 1NF + すべての非キー属性が主キー全体に完全関数従属

**違反例**:

```sql
-- 違反: 部分関数従属
CREATE TABLE order_items (
  order_id INT,
  product_id INT,
  product_name TEXT(100),  -- product_id のみに依存
  quantity INT,
  PRIMARY KEY (order_id, product_id)
);
```

**解決策**:

```sql
-- 正規化: 部分従属を分離
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT(100)
);

CREATE TABLE order_items (
  order_id INT,
  product_id INT REFERENCES products(id),
  quantity INT,
  PRIMARY KEY (order_id, product_id)
);
```

**判断基準**:

- [ ] 複合主キーを持つテーブルで、部分関数従属がないか？
- [ ] 非キー属性が主キーの一部だけに依存していないか？

#### 第 3 正規形（3NF）

**定義**: 2NF + すべての非キー属性が主キーに推移的に依存しない

**違反例**:

```sql
-- 違反: 推移関数従属
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT(100),
  department_id INT,
  department_name TEXT(100)  -- department_id を経由した推移従属
);
```

**解決策**:

```sql
-- 正規化: 推移従属を分離
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT(100)
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT(100),
  department_id INT REFERENCES departments(id)
);
```

**判断基準**:

- [ ] 非キー属性間に関数従属性がないか？
- [ ] A → B → C のような推移的依存がないか？

#### ボイス・コッド正規形（BCNF）

**定義**: すべての決定子（関数従属の左辺）が候補キー

**適用場面**:

- 複数の候補キーが存在するテーブル
- 候補キー同士に重複がある場合

#### 第 4 正規形（4NF）

**定義**: BCNF + 多値従属性（MVD）が存在しない

**違反例**:

```sql
-- 違反: 多値従属性
CREATE TABLE employee_skills_projects (
  employee_id INT,
  skill TEXT(50),
  project TEXT(50),
  PRIMARY KEY (employee_id, skill, project)
);
-- スキルとプロジェクトは独立しているが、組み合わせを保存
```

**解決策**:

```sql
-- 正規化: 多値従属を分離
CREATE TABLE employee_skills (
  employee_id INT,
  skill TEXT(50),
  PRIMARY KEY (employee_id, skill)
);

CREATE TABLE employee_projects (
  employee_id INT,
  project TEXT(50),
  PRIMARY KEY (employee_id, project)
);
```

#### 第 5 正規形（5NF）

**定義**: 4NF + 結合従属性が候補キーによってのみ含意される

**適用場面**:

- 非常に複雑なビジネスルールを持つテーブル
- 実務では稀に必要

### 意図的な非正規化

#### 非正規化の判断基準

**非正規化を検討すべき場合**:

1. **読み取り重視のワークロード**: JOIN コストが高い
2. **計算済み値の保存**: 頻繁に使用する集計値
3. **履歴データの保存**: 変更されない過去のスナップショット
4. **パフォーマンス測定結果**: 正規化がボトルネック

**非正規化を避けるべき場合**:

1. **書き込み重視のワークロード**: 更新異常リスクが高い
2. **データ整合性が最重要**: 金融、医療などの厳格な要件
3. **スキーマ変更が頻繁**: 冗長データの維持コストが高い

#### 非正規化パターン

**パターン 1: 計算済みカラム**

```sql
-- 非正規化: 合計金額を事前計算
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subtotal REAL(10,2),
  tax REAL(10,2),
  total REAL(10,2)  -- 計算済み: subtotal + tax
);
```

**パターン 2: 冗長な参照データ**

```sql
-- 非正規化: 履歴保持のため顧客名を複製
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INT,
  customer_name TEXT(100),  -- 注文時点の名前を保存
  created_at INTEGER
);
```

**パターン 3: 集約テーブル**

```sql
-- 非正規化: レポート用の事前集計
CREATE TABLE daily_sales_summary (
  date DATE PRIMARY KEY,
  total_orders INT,
  total_revenue REAL(12,2)
);
```

#### 非正規化の文書化テンプレート

```markdown
## 非正規化決定記録

### 対象テーブル

`orders.total`

### 非正規化の種類

計算済みカラム

### 理由

- 注文一覧表示で毎回合計計算が必要
- 1 日あたり 10,000 回以上の読み取り
- 計算コストの削減で平均応答時間が 50ms 改善

### トレードオフ

- 挿入・更新時に計算ロジックが必要
- subtotal/tax 変更時に total も更新必要
- トリガーまたはアプリケーションロジックで整合性維持

### 整合性維持戦略

- CHECK 制約: `total = subtotal + tax`
- アプリケーション層での二重検証
```

## 設計判断基準チェックリスト

### 新規テーブル設計時

- [ ] このテーブルは単一の事実を表現しているか？
- [ ] すべての非キー属性は主キーに完全関数従属しているか？
- [ ] 推移関数従属が存在しないか？
- [ ] 正規化を緩和する場合、その理由は明確で文書化されているか？

### 既存スキーマ評価時

- [ ] 更新異常（挿入・削除・修正）が発生する可能性があるか？
- [ ] データの冗長性によるストレージ無駄がないか？
- [ ] 正規化レベルはビジネス要件に適切か？

### 非正規化決定時

- [ ] パフォーマンス測定に基づいているか？
- [ ] 更新異常のリスクは許容可能か？
- [ ] 整合性維持戦略は定義されているか？
- [ ] トレードオフは文書化されているか？

## 関連スキル

- `.claude/skills/indexing-strategies/SKILL.md` - インデックス設計との連携
- `.claude/skills/sql-anti-patterns/SKILL.md` - アンチパターン回避との関連
- `.claude/skills/foreign-key-constraints/SKILL.md` - 参照整合性との連携

## 参照リソース

詳細な情報は以下のリソースを参照:

- `resources/normalization-levels-detail.md` - 各正規形の詳細解説
- `templates/denormalization-decision-template.md` - 非正規化決定記録テンプレート
- `scripts/analyze-normalization.mjs` - スキーマ正規化レベル分析スクリプト

# 正規化レベル詳細解説

## 概要

このリソースは、各正規形の詳細な定義、識別方法、実践的な適用例を提供します。

## 正規形の階層構造

```
5NF ⊆ 4NF ⊆ BCNF ⊆ 3NF ⊆ 2NF ⊆ 1NF
```

上位の正規形は下位の正規形の条件をすべて満たします。

---

## 第1正規形（1NF）詳細

### 定義
リレーションが以下の条件を満たす:
1. 各セルには単一の値（原子値）のみ
2. 各行は一意に識別可能
3. 列の順序は意味を持たない
4. 行の順序は意味を持たない

### 違反パターンと解決策

#### パターン1: 繰り返しグループ
```sql
-- 違反
CREATE TABLE students (
  id INT,
  name VARCHAR(100),
  course1 VARCHAR(50),
  course2 VARCHAR(50),
  course3 VARCHAR(50)
);

-- 解決
CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE student_courses (
  student_id INT REFERENCES students(id),
  course VARCHAR(50),
  PRIMARY KEY (student_id, course)
);
```

#### パターン2: カンマ区切り値
```sql
-- 違反
CREATE TABLE products (
  id INT,
  name VARCHAR(100),
  tags VARCHAR(500)  -- "electronics,sale,featured"
);

-- 解決
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE product_tags (
  product_id INT REFERENCES products(id),
  tag VARCHAR(50),
  PRIMARY KEY (product_id, tag)
);
```

#### パターン3: 複合値
```sql
-- 違反
CREATE TABLE addresses (
  id INT,
  full_address VARCHAR(500)  -- "東京都渋谷区..."
);

-- 解決
CREATE TABLE addresses (
  id INT PRIMARY KEY,
  prefecture VARCHAR(50),
  city VARCHAR(100),
  street VARCHAR(200),
  building VARCHAR(100)
);
```

---

## 第2正規形（2NF）詳細

### 定義
1NFを満たし、かつすべての非キー属性が主キー全体に完全関数従属

### 関数従属性の種類

**完全関数従属**: X → Y で、Xの真部分集合から Yを導出できない
**部分関数従属**: X → Y で、Xの真部分集合から Yを導出できる

### 違反検出方法

1. 複合主キーを持つテーブルを特定
2. 各非キー属性について、主キーの一部だけで決定できるか確認
3. 部分従属が見つかれば2NF違反

### 実践例

```sql
-- 違反: 注文明細テーブル
CREATE TABLE order_details (
  order_id INT,
  product_id INT,
  product_name VARCHAR(100),    -- product_id のみに依存（部分従属）
  product_price DECIMAL(10,2),  -- product_id のみに依存（部分従属）
  quantity INT,                 -- 両方に依存（完全従属）
  PRIMARY KEY (order_id, product_id)
);

-- 解決: 部分従属を分離
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2)
);

CREATE TABLE order_details (
  order_id INT,
  product_id INT REFERENCES products(id),
  quantity INT,
  unit_price DECIMAL(10,2),  -- 注文時点の価格（履歴保持）
  PRIMARY KEY (order_id, product_id)
);
```

---

## 第3正規形（3NF）詳細

### 定義
2NFを満たし、かつすべての非キー属性が主キーに推移的に依存しない

### 推移関数従属

A → B → C の場合、A → C は推移関数従属

### 違反検出方法

1. 非キー属性間の関数従属を特定
2. A（主キー）→ B → C のパターンを検索
3. 推移従属が見つかれば3NF違反

### 実践例

```sql
-- 違反: 従業員テーブル
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  department_id INT,
  department_name VARCHAR(100),  -- department_id → department_name（推移従属）
  department_budget DECIMAL(12,2)  -- department_id → department_budget（推移従属）
);

-- 解決: 推移従属を分離
CREATE TABLE departments (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  budget DECIMAL(12,2)
);

CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  department_id INT REFERENCES departments(id)
);
```

---

## ボイス・コッド正規形（BCNF）詳細

### 定義
すべての自明でない関数従属 X → Y において、Xがスーパーキー

### 3NFとBCNFの違い

3NF: 非キー属性に関する制約
BCNF: すべての属性（キー属性含む）に関する制約

### BCNF違反の例

```sql
-- 違反: 複数の候補キーが重複を持つ
CREATE TABLE course_teachers (
  course VARCHAR(50),
  teacher VARCHAR(100),
  room VARCHAR(20),
  PRIMARY KEY (course, teacher)
  -- 暗黙の制約: teacher → room（各教師は1つの部屋のみ使用）
  -- teacher はスーパーキーではないが決定子
);

-- 解決: 決定子ごとにテーブル分割
CREATE TABLE teacher_rooms (
  teacher VARCHAR(100) PRIMARY KEY,
  room VARCHAR(20)
);

CREATE TABLE course_teachers (
  course VARCHAR(50),
  teacher VARCHAR(100) REFERENCES teacher_rooms(teacher),
  PRIMARY KEY (course, teacher)
);
```

---

## 第4正規形（4NF）詳細

### 定義
BCNFを満たし、かつ自明でない多値従属性が存在しない

### 多値従属性（MVD）

X →→ Y: Xの値が決まると、Yの値の集合が決まる（他の属性とは独立）

### 違反検出方法

1. 独立した多値属性のセットを特定
2. それらが同一テーブルに存在するか確認
3. 存在すれば4NF違反の可能性

### 実践例

```sql
-- 違反: 従業員のスキルとプロジェクト（独立した多値属性）
CREATE TABLE employee_info (
  employee_id INT,
  skill VARCHAR(50),
  project VARCHAR(50),
  PRIMARY KEY (employee_id, skill, project)
);
-- 問題: スキルを追加するたびに、すべてのプロジェクトとの組み合わせが必要

-- 解決: 独立した多値属性を分離
CREATE TABLE employee_skills (
  employee_id INT,
  skill VARCHAR(50),
  PRIMARY KEY (employee_id, skill)
);

CREATE TABLE employee_projects (
  employee_id INT,
  project VARCHAR(50),
  PRIMARY KEY (employee_id, project)
);
```

---

## 第5正規形（5NF）詳細

### 定義
4NFを満たし、かつすべての結合従属性が候補キーによってのみ含意される

### 結合従属性

テーブルを複数のテーブルに分割し、再結合しても情報が失われない場合、結合従属性が存在

### 適用場面

- 3つ以上のエンティティ間の複雑な関係
- ビジネスルールが「AとBの関係」「BとCの関係」「AとCの関係」を別々に管理する場合

### 実践例

```sql
-- 潜在的な5NF違反: サプライヤー・部品・プロジェクト関係
CREATE TABLE supply (
  supplier_id INT,
  part_id INT,
  project_id INT,
  PRIMARY KEY (supplier_id, part_id, project_id)
);
-- ビジネスルール:
-- 1. サプライヤーは特定の部品を供給できる
-- 2. サプライヤーは特定のプロジェクトに参加できる
-- 3. プロジェクトは特定の部品を使用する
-- これらが独立なら5NF違反

-- 解決: 各二項関係を分離
CREATE TABLE supplier_parts (
  supplier_id INT,
  part_id INT,
  PRIMARY KEY (supplier_id, part_id)
);

CREATE TABLE supplier_projects (
  supplier_id INT,
  project_id INT,
  PRIMARY KEY (supplier_id, project_id)
);

CREATE TABLE project_parts (
  project_id INT,
  part_id INT,
  PRIMARY KEY (project_id, part_id)
);
```

---

## 実務での推奨正規化レベル

### 一般的な指針

| シナリオ | 推奨レベル | 理由 |
|---------|----------|------|
| OLTP システム | 3NF | 更新異常防止と適度なパフォーマンス |
| レポーティング | 2NF〜非正規化 | 読み取りパフォーマンス優先 |
| データウェアハウス | スタースキーマ | 分析クエリ最適化 |
| 監査ログ | 1NF〜非正規化 | 挿入パフォーマンスと履歴保持 |

### 正規化レベル選択フローチャート

```
1. 1NFを適用（必須）
   ↓
2. 複合主キーがある？
   → Yes: 2NFを検討
   → No: 3NFに進む
   ↓
3. 非キー属性間に従属性がある？
   → Yes: 3NFを適用
   → No: 現状維持
   ↓
4. パフォーマンス問題がある？
   → Yes: 意図的非正規化を検討（文書化必須）
   → No: 完了
```

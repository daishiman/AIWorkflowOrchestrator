# Few-Shot Learning技術

## 概要

Few-Shot Learningは、少数の例示によってエージェントの動作を学習させる技術です。
効果的な例示選択と構成により、プロンプトの品質を大幅に向上させます。

## Few-Shot Learningとは

### 定義

数個の具体例（通常2-5個）を示すことで、期待される動作パターンを学習させる手法。

### 他の学習方法との比較

| 手法        | 例示数 | 適用場面           | Token消費 |
| ----------- | ------ | ------------------ | --------- |
| Zero-Shot   | 0個    | 指示のみで実行可能 | 最小      |
| Few-Shot    | 2-5個  | パターン学習が必要 | 中        |
| Many-Shot   | 10個+  | 複雑なパターン     | 最大      |
| Fine-Tuning | 1000+  | モデル再学習       | N/A       |

### エージェント向けFew-Shotの特徴

一般的なFew-Shotとの違い:

- **継続性**: 1回限りでなく、複数タスクで再利用
- **複雑性**: 単純な入出力ではなく、多段階ワークフロー
- **文脈**: プロジェクト固有の知識を含む

## 例示の選択基準

### 1. 典型例（Typical Cases）

最も頻繁に発生するケース。

**選択基準**:

- 使用頻度が最も高い
- 標準的なワークフローを示す
- 基本的な成功パターン

**例**:

```markdown
### 例1: 標準的なリファクタリング（典型例）

**入力**:
20行のLong Methodを検出

**処理**:

1. Extract Methodパターンを選択
2. メソッドを3つに分割
3. テストを実行して検証

**出力**:

- 3つの小さなメソッド
- 全テスト合格
```

### 2. 境界例（Edge Cases）

通常と異なるが有効なケース。

**選択基準**:

- 入力が境界値
- 特殊だが許容される状況
- エッジケースの処理方法を示す

**例**:

```markdown
### 例2: 最小サイズのメソッド（境界例）

**入力**:
3行のメソッド

**処理**:

1. Long Methodの基準（20行）を下回ることを確認
2. リファクタリング不要と判断

**出力**:

- アクション: リファクタリングスキップ
- 理由: 十分に小さい
```

### 3. 失敗例（Failure Cases）

よくある誤りとその対処。

**選択基準**:

- 頻繁に発生するエラー
- 回避すべきアンチパターン
- 正しい対処方法を示す

**例**:

```markdown
### 例3: テストのないコード（失敗例）

**入力**:
テストカバレッジ0%のコード

**処理**:

1. テストの欠如を検出
2. リファクタリングを中断
3. エラーレポートを生成

**出力**:

- エラー: テストが存在しません
- 推奨アクション: まずテストを追加
```

## 例示数の決定

### 推奨数

- **最小限**: 2個
  - 典型例1個 + 境界例1個
  - シンプルなタスク向け

- **推奨**: 3-4個
  - 典型例2個 + 境界例1個 + 失敗例1個
  - 標準的なタスク向け

- **最大**: 5個
  - それ以上は過度（Token消費、複雑化）

### 判断基準

| タスクの複雑度 | 推奨例示数 | 理由                     |
| -------------- | ---------- | ------------------------ |
| 単純           | 2個        | パターンが明確           |
| 中程度         | 3-4個      | バリエーションが必要     |
| 複雑           | 4-5個      | 多様なケースをカバー     |
| 非常に複雑     | 5個        | それ以上は外部リソース化 |

## 例示の構造

### 基本フォーマット

```markdown
### 例{{N}}: {{シナリオ名}}（{{例の種類}}）

**入力**:
{{具体的な入力値}}

**処理**:
{{ステップバイステップの処理}}

**出力**:
{{期待される出力}}

**理由**（オプション）:
{{判断根拠}}
```

### 必須要素

1. **シナリオ名**: 何の例か一目で分かる
2. **例の種類**: 典型例/境界例/失敗例
3. **入力**: 具体的な値（抽象化しない）
4. **処理**: 明確な手順
5. **出力**: 期待される結果

### オプション要素

6. **理由**: 判断根拠（複雑な場合）
7. **注意点**: 特記事項

## 効果的な例示の設計

### 原則1: 具体性

❌ **悪い例**:

```markdown
**入力**: {{長いメソッド}}
**出力**: {{短いメソッド}}
```

✅ **良い例**:

````markdown
**入力**:
\```typescript
function processOrder(order) {
// 25行のコード
}
\```

**出力**:
\```typescript
function processOrder(order) {
const validated = validateOrder(order);
const processed = applyBusinessRules(validated);
return saveOrder(processed);
}
\```
````

### 原則2: 段階性

例示を段階的に配置:

1. **例1**: 最も単純な典型例
2. **例2**: より複雑な典型例
3. **例3**: 境界例
4. **例4**: 失敗例

### 原則3: 多様性

異なる側面をカバー:

- **パターン多様性**: 異なる問題タイプ
- **複雑度多様性**: 単純〜複雑
- **結果多様性**: 成功と失敗

## 実践例: リファクタリングエージェント

### 完全な例示セット

````markdown
## 例

### 例1: Long Methodの検出（典型例 - 基本）

**入力**:
\```typescript
function calculateTotal(items) {
let total = 0;
for (const item of items) {
const price = item.price;
const quantity = item.quantity;
const subtotal = price _ quantity;
const tax = subtotal _ 0.1;
const discount = item.discount || 0;
const final = subtotal + tax - discount;
total += final;
}
return total;
}
\```

**処理**:

1. メソッド行数をカウント（10行）
2. Long Methodの基準（20行）を下回ることを確認
3. ただし、複雑な計算ロジックを検出
4. Extract Methodを推奨

**出力**:
\```typescript
function calculateTotal(items) {
return items.reduce((total, item) =>
total + calculateItemTotal(item), 0
);
}

function calculateItemTotal(item) {
const subtotal = item.price _ item.quantity;
const tax = subtotal _ 0.1;
const discount = item.discount || 0;
return subtotal + tax - discount;
}
\```

### 例2: Duplicate Codeの検出（典型例 - 応用）

**入力**:
\```typescript
// ユーザー登録
async function registerUser(userData) {
const validated = validateInput(userData);
const hashed = await hashPassword(validated.password);
const user = await db.users.create({...validated, password: hashed});
await sendEmail(user.email, 'Welcome');
return user;
}

// 管理者登録
async function registerAdmin(userData) {
const validated = validateInput(userData);
const hashed = await hashPassword(validated.password);
const admin = await db.admins.create({...validated, password: hashed});
await sendEmail(admin.email, 'Welcome');
return admin;
}
\```

**処理**:

1. 重複コードを検出（4行が重複）
2. Extract Functionパターンを選択
3. 共通ロジックを抽出

**出力**:
\```typescript
async function createAccount(userData, collection) {
const validated = validateInput(userData);
const hashed = await hashPassword(validated.password);
const account = await collection.create({...validated, password: hashed});
await sendEmail(account.email, 'Welcome');
return account;
}

async function registerUser(userData) {
return createAccount(userData, db.users);
}

async function registerAdmin(userData) {
return createAccount(userData, db.admins);
}
\```

### 例3: リファクタリング不要（境界例）

**入力**:
\```typescript
function add(a, b) {
return a + b;
}
\```

**処理**:

1. メソッド行数をカウント（3行）
2. Code Smellsを検出できず
3. リファクタリング不要と判断

**出力**:

- アクション: スキップ
- 理由: 単純明快な関数（3行以下）
- 推奨: 現状維持

### 例4: テスト不足エラー（失敗例）

**入力**:
\```typescript
// テストカバレッジ: 0%
function processPayment(amount, cardNumber) {
// 複雑な決済ロジック
// 30行のコード
}
\```

**処理**:

1. Long Methodを検出（30行）
2. テストカバレッジを確認（0%）
3. リファクタリングを中断
4. エラーレポートを生成

**出力**:
\```markdown

## エラー: テスト不足

**問題**: `processPayment`のテストカバレッジが0%です。

**リスク**: テストなしのリファクタリングは危険です。

**推奨アクション**:

1. まずテストを追加（カバレッジ80%以上）
2. テスト合格を確認
3. その後リファクタリングを実施
   \```
````

## Few-Shotの最適化

### Token効率化

**戦略1: 例示の圧縮**

- 冗長な説明を削除
- 本質的な部分のみ保持
- コメントは最小限に

**戦略2: 例示の外部化**

- 5個以上は外部ファイル化
- SKILL.mdには2-3個
- `references/examples.md`に詳細

### 品質向上

**チェックリスト**:

- [ ] 実際の値を使用（抽象化していない）
- [ ] 入力→処理→出力が明確
- [ ] 典型例と境界例を含む
- [ ] 段階的に複雑化
- [ ] 失敗例を1個含む（推奨）

## アンチパターン

### 避けるべき例示

❌ **過度な例示**:

```markdown
### 例1〜20: 様々なケース

（Token浪費、複雑化）
```

❌ **抽象的な例**:

```markdown
**入力**: {{some_input}}
**出力**: {{some_output}}
（学習効果なし）
```

❌ **説明のない例**:

```markdown
**入力**: [コード]
**出力**: [コード]
（処理過程が不明）
```

❌ **矛盾する例**:

```markdown
例1: 20行以上をLong Method
例2: 15行をLong Method
（基準が矛盾）
```

## ベストプラクティス

### すべきこと

- ✅ 2-5個の例示
- ✅ 典型例 + 境界例 + 失敗例
- ✅ 具体的な値を使用
- ✅ 段階的に複雑化
- ✅ 入力→処理→出力を明示

### 避けるべきこと

- ❌ 10個以上の例示
- ❌ 抽象的な値（`{{value}}`）
- ❌ 処理過程の省略
- ❌ 矛盾する例
- ❌ 説明のない例

## 次のステップ

Few-Shot技術を理解したら:

1. **optimization-strategies.md**: プロンプト最適化戦略
2. **anti-patterns.md**: よくある失敗パターンと対処法

## 参考文献

- Few-Shot Learning in Practice (OpenAI)
- Prompt Engineering Guide (DAIR.AI)
- In-Context Learning and Induction (Anthropic)

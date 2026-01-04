# Task: リファクタリング実施

## 目的

計画に基づいてリファクタリングを安全に実行し、
テストで動作確認しながら段階的にコードを改善する。

## 入力

- リファクタリング計画書（`plan-refactoring`の出力）
- 対象ソースコード

## 出力

- リファクタリング済みコード
- 実施記録:

```markdown
## リファクタリング実施記録

### 実施内容

- パターン: xxx
- 対象: xxx

### 変更履歴

1. [完了] ステップ1 - テスト: PASS
2. [完了] ステップ2 - テスト: PASS
   ...

### 結果

- Before: 循環的複雑度 15, 行数 80
- After: 循環的複雑度 5, 行数 25

### 改善効果

- 可読性向上
- テストカバレッジ維持
```

## 手順

### Step 1: 事前確認

```bash
# テスト実行（必須）
pnpm test

# Gitコミット確認（ロールバック用）
git status
```

**中止条件**:

- テストが失敗している
- 未コミットの変更がある

### Step 2: 段階的実施

**Extract Method の例**:

```typescript
// Before
function processOrder(order: Order) {
  // 検証ロジック（10行）
  if (!order.items) { ... }
  if (!order.customer) { ... }

  // 計算ロジック（15行）
  let total = 0;
  for (const item of order.items) { ... }

  // 保存ロジック（10行）
  await db.save(order);
}

// After
function processOrder(order: Order) {
  validateOrder(order);
  const total = calculateTotal(order);
  await saveOrder(order);
}

function validateOrder(order: Order) { ... }
function calculateTotal(order: Order) { ... }
function saveOrder(order: Order) { ... }
```

### Step 3: 変更後テスト

各変更後に必ず実行:

```bash
# 単体テスト
pnpm test:unit

# 該当ファイルのテスト
pnpm test -- path/to/file.test.ts
```

### Step 4: 完了確認

- [ ] 全テストが通過
- [ ] 外部動作が変わっていない
- [ ] コードの可読性が向上
- [ ] コミット済み

## 緊急ロールバック

```bash
# 直近の変更を取り消し
git checkout -- <file>

# コミット前の状態に戻す
git reset --hard HEAD
```

## 制約

- テスト失敗時は即座に中止
- 1ステップ1コミットを推奨
- 大きな変更は分割して実施

## 参照リソース

- [assets/refactoring-checklist.md](../assets/refactoring-checklist.md): チェックリスト
- [scripts/validate-refactoring.mjs](../scripts/validate-refactoring.mjs): 検証ツール

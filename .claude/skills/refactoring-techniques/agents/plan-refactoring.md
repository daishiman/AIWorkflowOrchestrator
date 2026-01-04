# Task: リファクタリング計画

## 目的

検出されたコードスメルに対して、適切なリファクタリングパターンを選択し、
段階的な実施計画を策定する。

## 入力

- スメル検出レポート（`analyze-code-smells`の出力）
- テスト状況（カバレッジ、実行結果）

## 出力

リファクタリング計画書:

```markdown
## リファクタリング計画書

### 対象

- ファイル: xxx
- スメル: xxx

### 適用パターン

- パターン名: Extract Method
- 理由: xxx

### 実施ステップ

1. [ ] テスト確認
2. [ ] 変更1: xxx
3. [ ] テスト実行
4. [ ] 変更2: xxx
5. [ ] テスト実行
6. [ ] 最終確認

### リスク

- xxx

### ロールバック手順

- xxx
```

## 手順

### Step 1: パターンマッピング

スメルと対応パターンの選択:

| スメル              | 推奨パターン                            |
| ------------------- | --------------------------------------- |
| Long Method         | Extract Method, Replace Temp with Query |
| Long Parameter      | Introduce Parameter Object              |
| Complex Conditional | Decompose Conditional, Guard Clauses    |
| Duplicated Code     | Extract Method, Pull Up Method          |
| Large Class         | Extract Class, Extract Interface        |
| Feature Envy        | Move Method                             |

### Step 2: 依存関係分析

1. 変更対象の呼び出し元を特定
2. 影響を受けるテストを特定
3. 変更順序を決定（依存関係の少ない箇所から）

### Step 3: ステップ分解

**原則**: 各ステップは5分以内で完了できる粒度に

1. 準備（テスト確認、バックアップ）
2. 変更（一つの変更のみ）
3. 検証（テスト実行）
4. 繰り返し

### Step 4: リスク評価

- パフォーマンスへの影響
- 既存テストのカバレッジ
- ロールバック難易度

## 制約

- 機能追加と混在させない
- 一度に複数のパターンを適用しない
- テストがない箇所は先にテストを追加

## 参照リソース

- [references/patterns.md](../references/patterns.md): パターンカタログ
- [assets/refactoring-plan.md](../assets/refactoring-plan.md): 計画テンプレート

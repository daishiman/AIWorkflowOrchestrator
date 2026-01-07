# Phase 6: リファクタリング (TDD Refactor) - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 6                     |
| Phase名    | リファクタリング      |
| 前提Phase  | Phase 5 (実装)        |
| 後続Phase  | Phase 7 (品質保証)    |
| ステータス | 未実施                |
| 作成日     | 2026-01-05            |
| 機能名     | entity-extraction-ner |

---

## 目的

TDDのRefactorフェーズとして、テストを維持しながらコードの品質を向上させる。

## 背景

Phase 5で実装したコードを、可読性・保守性・拡張性の観点からリファクタリングする。テストがパスし続けることを確認しながら改善を行う。

---

## 使用スキル

### スキル1: refactoring-patterns

**パス**: `.claude/skills/refactoring-patterns/SKILL.md`

**Trigger条件**: コード改善、リファクタリング技法、設計改善

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. リファクタリングパターンを適用
3. テストを実行して回帰がないことを確認

**期待される成果物**:

- リファクタリング済みコード
- リファクタリング記録

---

### スキル2: solid-principles

**パス**: `.claude/skills/solid-principles/SKILL.md`

**Trigger条件**: SOLID原則、設計原則、責務分離

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. SOLID原則に基づいてコードを検証
3. 違反があれば修正

**期待される成果物**:

- SOLID準拠のコード

---

## 参照資料

| 参照資料   | パス                                                 | 内容          |
| ---------- | ---------------------------------------------------- | ------------- |
| 実装コード | `packages/shared/src/services/extraction/`           | Phase 5成果物 |
| テスト     | `packages/shared/src/services/extraction/__tests__/` | テストケース  |

---

## 成果物

| 成果物         | パス                                       | 内容                 |
| -------------- | ------------------------------------------ | -------------------- |
| リファクタ記録 | `outputs/phase-6/refactoring-log.md`       | 適用パターン記録     |
| 更新コード     | `packages/shared/src/services/extraction/` | リファクタ済みコード |

---

## リファクタリング観点

### 1. コードスメル検出

| スメル         | 確認項目                               |
| -------------- | -------------------------------------- |
| Long Method    | 関数が長すぎないか（20行以下推奨）     |
| Duplicate Code | 重複コードがないか                     |
| Large Class    | クラスが大きすぎないか                 |
| Feature Envy   | 他クラスのデータに依存しすぎていないか |
| Data Clumps    | 複数パラメータをオブジェクト化すべきか |

### 2. SOLID原則検証

| 原則                  | 確認項目                                 |
| --------------------- | ---------------------------------------- |
| Single Responsibility | 各クラス・関数が単一責務か               |
| Open/Closed           | 拡張に開き、修正に閉じているか           |
| Liskov Substitution   | 派生型が基底型と置換可能か               |
| Interface Segregation | インターフェースが適切に分離されているか |
| Dependency Inversion  | 抽象に依存しているか                     |

### 3. 適用候補パターン

| パターン                   | 適用条件                       |
| -------------------------- | ------------------------------ |
| Extract Method             | 長いメソッドを分割             |
| Extract Class              | 責務が多いクラスを分割         |
| Replace Temp               | 一時変数をクエリメソッドに置換 |
| Introduce Parameter Object | 多引数を1オブジェクトに        |
| Strategy Pattern           | 条件分岐をストラテジーに置換   |

---

## TDD検証

### テスト実行コマンド

```bash
pnpm --filter @repo/shared test:run -- --grep "EntityExtractor"
```

### 確認項目

- [ ] リファクタリング後も全テストがパスする
- [ ] カバレッジが維持されている
- [ ] 新たなコードスメルが発生していない

---

## 完了条件

- [ ] コードスメルが解消されている
- [ ] SOLID原則に準拠している
- [ ] リファクタリング記録が作成されている
- [ ] 全テストがパスする
- [ ] コードの可読性が向上している

---

## 依存関係

- **前提**: Phase 5 が完了していること（Green状態）
- **後続**: Phase 7 (品質保証) へ進む

---

## スキルフィードバック記録

```markdown
## Phase 6 実行記録

### 使用スキル

- refactoring-patterns: {{result}}
- solid-principles: {{result}}

### 適用したリファクタリング

- {{パターン名}}: {{適用箇所}}

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/entity-extraction-ner/phase-7-quality.md`

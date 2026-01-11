# クエリ分類器リファクタリング - タスク指示書

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | CONV-07-01-REF                   |
| タスク名     | クエリ分類器リファクタリング     |
| 分類         | リファクタリング                 |
| 対象機能     | クエリ分類器（Query Classifier） |
| 優先度       | 低                               |
| 見積もり規模 | 小規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 8（リファクタリング）      |
| 発見日       | 2026-01-11                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CONV-07-01（クエリ分類器実装）のPhase 8リファクタリングにおいて、以下の将来の拡張可能性が特定された：

1. 3つ目以降の分類器実装時 → 共通基底クラス検討
2. 他モジュールでキーワード抽出が必要時 → utils.ts抽出検討
3. パターン定義が10+になった場合 → patterns.ts分離検討

現時点ではYAGNI原則に従い実装を見送ったが、将来のトリガー条件が満たされた場合に対応が必要。

### 1.2 問題点・課題

現在の実装は十分に整理されており、直接的な問題はない。ただし、以下の条件が発生した場合、コードの保守性が低下する可能性がある：

| 条件                         | 潜在的問題                               |
| ---------------------------- | ---------------------------------------- |
| 3つ目以降の分類器追加        | getSearchWeightsの重複実装が発生         |
| 他モジュールでキーワード抽出 | extractKeywords関数の重複実装が発生      |
| パターン定義が10+            | ルールベース分類器のファイルサイズ肥大化 |

### 1.3 放置した場合の影響

- **短期**: 影響なし（現在の実装は十分）
- **中期**: トリガー条件発生時にコード重複が発生
- **長期**: 保守コストの増加、バグ混入リスクの上昇

---

## 2. 何を達成するか（What）

### 2.1 目的

トリガー条件が満たされた場合に、クエリ分類器のコードを適切にリファクタリングし、保守性を維持する。

### 2.2 最終ゴール

| トリガー条件                 | 達成すべき状態                                      |
| ---------------------------- | --------------------------------------------------- |
| 3つ目以降の分類器実装        | 共通基底クラスでgetSearchWeightsを共有              |
| 他モジュールでキーワード抽出 | utils.tsで共通ユーティリティとして提供              |
| パターン定義が10+            | patterns.tsとして分離し、ルールベース分類器から参照 |

### 2.3 スコープ

#### 含むもの

- 共通基底クラスの設計・実装（トリガー1）
- utils.tsへのextractKeywords抽出（トリガー2）
- patterns.tsへのパターン定義分離（トリガー3）
- 既存テストの維持・更新

#### 含まないもの

- 新しい分類器の実装（別タスク）
- クエリ分類ロジックの変更
- パフォーマンス最適化

### 2.4 成果物

| 成果物                   | 説明                                |
| ------------------------ | ----------------------------------- |
| base-query-classifier.ts | 共通基底クラス（トリガー1）         |
| utils.ts                 | 共通ユーティリティ関数（トリガー2） |
| patterns.ts              | パターン定義（トリガー3）           |
| 更新されたテスト         | リファクタリング後のテスト          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- トリガー条件のいずれかが満たされていること
- 既存のクエリ分類器テストが全てパスしていること

### 3.2 依存タスク

- CONV-07-01（クエリ分類器実装）- 完了済み

### 3.3 必要な知識

- TypeScript（インターフェース、抽象クラス）
- クエリ分類器の実装詳細
- ユニットテスト（Vitest）

### 3.4 推奨アプローチ

1. **トリガー1（共通基底クラス）**:
   - IQueryClassifierを実装する抽象クラスBaseQueryClassifierを作成
   - getSearchWeights()をデフォルト実装として提供
   - 既存のRuleBasedQueryClassifier, LLMQueryClassifierを継承に変更

2. **トリガー2（utils.ts抽出）**:
   - extractKeywords, tokenizeJapanese, ストップワード定義を移動
   - 既存の分類器から参照に変更
   - 他モジュールからも利用可能に

3. **トリガー3（patterns.ts分離）**:
   - globalPatterns, relationshipPatternsを別ファイルに定義
   - パターンの追加・変更が容易になるよう構造化

---

## 4. 実行手順

### Phase構成

このタスクは単一フェーズで完了する小規模リファクタリング。

### Phase 1: リファクタリング実施

#### 目的

トリガー条件に応じたコード分離・共通化を実施する。

#### 手順

**トリガー1（共通基底クラス）の場合**:

1. `packages/shared/src/services/search/base-query-classifier.ts`を作成
2. 以下のコードを実装:

   ```typescript
   export abstract class BaseQueryClassifier implements IQueryClassifier {
     abstract classify(query: string): Promise<QueryClassification>;

     getSearchWeights(type: QueryType): SearchWeights {
       return SEARCH_WEIGHTS[type];
     }
   }
   ```

3. RuleBasedQueryClassifierをBaseQueryClassifierの継承に変更
4. LLMQueryClassifierをBaseQueryClassifierの継承に変更
5. テストを実行して全てパスすることを確認

**トリガー2（utils.ts抽出）の場合**:

1. `packages/shared/src/services/search/utils.ts`を作成
2. extractKeywords, tokenizeJapanese, ストップワード定義を移動
3. RuleBasedQueryClassifierからutilsをインポートするよう変更
4. テストを実行して全てパスすることを確認

**トリガー3（patterns.ts分離）の場合**:

1. `packages/shared/src/services/search/patterns.ts`を作成
2. globalPatterns, relationshipPatternsを移動
3. RuleBasedQueryClassifierからpatternsをインポートするよう変更
4. テストを実行して全てパスすることを確認

#### 成果物

- リファクタリングされたソースコード
- 更新されたテスト

#### 完了条件

- 全186テストがパスすること
- カバレッジが90%以上を維持すること
- TypeScriptエラーがないこと
- ESLintエラーがないこと

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] トリガー条件に対応したリファクタリングが完了している
- [ ] 既存の動作が変更されていない（機能テストパス）

### 品質要件

- [ ] テスト186件が全てパス
- [ ] カバレッジ90%以上を維持
- [ ] TypeScriptエラーなし
- [ ] ESLintエラーなし

### ドキュメント要件

- [ ] implementation-guide.mdが更新されている（ファイル構成変更時）
- [ ] JSDocコメントが追加されている

---

## 6. 検証方法

### テストケース

既存のテストスイートを使用:

```bash
npx vitest run packages/shared/src/services/search/__tests__/
```

### 検証手順

1. 全テストがパスすることを確認
2. カバレッジレポートを生成し、90%以上を確認
3. TypeScript型チェックを実行
4. ESLintを実行

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                               |
| ------------------------------ | ------ | -------- | ---------------------------------- |
| リファクタリングによるバグ混入 | 中     | 低       | 既存テストでカバー、段階的変更     |
| インポートパス変更の影響       | 低     | 中       | index.tsでのバレルエクスポート維持 |

---

## 8. 参照情報

### 関連ドキュメント

- [リファクタリングログ](../CONV-07-01-query-classifier/outputs/phase-8/refactoring-log.md)
- [実装ガイド](../CONV-07-01-query-classifier/outputs/phase-12/implementation-guide.md)
- [設計書](../CONV-07-01-query-classifier/outputs/phase-2/design.md)

### 参考資料

- Clean Code (Robert C. Martin) - YAGNI原則
- TypeScript Handbook - 抽象クラス

---

## 9. 備考

### Phase 8レビュー指摘の原文

```
1. **現在の実装で十分な理由**
   - テスト186件が全てパス
   - カバレッジ94%+達成
   - 型安全性が確保されている
   - 単一責務原則を満たしている

2. **将来の拡張時に再検討すべき項目**
   - 3つ目以降の分類器実装時 → 共通基底クラス検討
   - 他モジュールでキーワード抽出が必要時 → utils.ts抽出検討
   - パターン定義が10+になった場合 → patterns.ts分離検討
```

### 補足事項

- このタスクは**トリガー条件が満たされた場合のみ**実行する
- トリガー条件が満たされない限り、現在の実装を維持することを推奨
- 複数のトリガーが同時に満たされた場合は、該当する全ての対応を実施

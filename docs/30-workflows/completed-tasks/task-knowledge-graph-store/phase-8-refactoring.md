# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 8                          |
| 機能名 | task-knowledge-graph-store |
| 作成日 | 2026-01-13                 |

## 目的

TDDのRefactor段階として、Phase 5-6で作成した実装コードの品質向上を行う。機能を変更せずにコードの可読性・保守性・パフォーマンスを改善する。すべてのテストが引き続き成功状態（Green）であることを確認しながらリファクタリングを進める。

## 実行タスク

- **コード分析**: 重複コード・複雑度・命名の問題を特定
- **重複排除**: 共通処理のユーティリティ化
- **責務分離**: 単一責任原則の適用
- **命名改善**: 意図が明確な命名への変更
- **パフォーマンス最適化**: クエリ最適化・キャッシュ戦略

## 参照資料

### システム仕様（aiworkflow-requirements）

> リファクタリング時も以下のシステム仕様との整合性を維持してください。

| 参照資料                               | パス                                                                                        | 内容                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| Knowledge Graph Store インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-knowledge-graph-store.md` | Store API仕様・データ構造 |
| アーキテクチャパターン                 | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`                | 設計パターン              |

### 前Phase成果物

| 資料名             | パス                                  | 説明          |
| ------------------ | ------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | Phase 7成果物 |
| ゲート判定結果     | `outputs/phase-7/gate-result.md`      | Phase 7成果物 |
| 実装コード         | `packages/shared/src/services/graph/` | Phase 5成果物 |

## リファクタリング観点

### 1. コードの重複

| 対象                   | 確認内容                                 | 対応 |
| ---------------------- | ---------------------------------------- | ---- |
| 名前正規化処理         | 各Storeで重複していないか                | □    |
| エラーハンドリング     | 共通パターンが抽出されているか           | □    |
| バリデーションロジック | 共通化可能な検証処理がないか             | □    |
| DB操作ラッパー         | トランザクション処理が共通化されているか | □    |

### 2. 複雑度の軽減

| 対象               | 確認内容                                 | 対応 |
| ------------------ | ---------------------------------------- | ---- |
| GraphQueryService  | traverseメソッドの複雑度が適切か         | □    |
| 検索クエリビルダー | 動的クエリ構築が読みやすいか             | □    |
| CASCADE削除処理    | 削除順序のロジックが明確か               | □    |
| バッチ処理         | チャンク処理のロジックが分離されているか | □    |

### 3. 命名・構造の改善

| 対象       | 確認内容                          | 対応 |
| ---------- | --------------------------------- | ---- |
| 変数名     | 意図が明確な命名になっているか    | □    |
| メソッド名 | 動詞+名詞の命名規則に従っているか | □    |
| ファイル名 | 責務を反映した名前になっているか  | □    |
| 型名       | ドメイン用語と一致しているか      | □    |

### 4. パフォーマンス最適化

| 対象             | 確認内容                                 | 対応 |
| ---------------- | ---------------------------------------- | ---- |
| N+1クエリ        | 関連データの一括取得ができているか       | □    |
| インデックス活用 | 検索クエリがインデックスを使用しているか | □    |
| メモリ効率       | 大量データ処理でメモリリークがないか     | □    |
| バッチサイズ     | 最適なチャンクサイズが設定されているか   | □    |

## リファクタリング例

### 重複コードの抽出

```typescript
// Before: 各Storeで重複
class EntityStore {
  private normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, "_");
  }
}

class RelationStore {
  private normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, "_");
  }
}

// After: ユーティリティに抽出
// utils/normalize.ts
export function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_");
}
```

### 複雑度の軽減

```typescript
// Before: 複雑なtraverseメソッド
async traverse(startId: EntityId, options: TraversalOptions): Promise<Result<TraversalResult, Error>> {
  // 100行以上の複雑なロジック
}

// After: 責務分離
async traverse(startId: EntityId, options: TraversalOptions): Promise<Result<TraversalResult, Error>> {
  const validator = new TraversalValidator(options);
  const explorer = new BFSExplorer(this.relationStore);
  const collector = new ResultCollector();

  return validator.validate()
    .andThen(() => explorer.explore(startId, options.maxDepth))
    .map(nodes => collector.collect(nodes));
}
```

## 統合テスト連携【必須】

リファクタリング後のテスト再実行:

| 確認項目             | 検証内容                   | 結果       |
| -------------------- | -------------------------- | ---------- |
| ユニットテスト       | 全テストが引き続きGreen    | {{RESULT}} |
| 統合テスト           | Store間連携が正常に動作    | {{RESULT}} |
| パフォーマンステスト | 性能が劣化していない       | {{RESULT}} |
| カバレッジ           | カバレッジが維持されている | {{RESULT}} |

## 実行手順

### 1. コード分析

```bash
# 複雑度分析（ESLint complexity rule）
pnpm --filter @repo/shared lint src/services/graph

# 重複コード検出
npx jscpd src/services/graph --min-lines 5 --min-tokens 50
```

### 2. リファクタリング実施

1. 一度に1つの改善のみ行う
2. 各改善後にテストを実行して Green を確認
3. コミットを細かく分ける

### 3. テスト再実行

```bash
# ユニットテスト
pnpm --filter @repo/shared test:run src/services/graph/__tests__

# カバレッジ確認
pnpm --filter @repo/shared test:coverage src/services/graph
```

## 成果物

| 成果物               | パス                                     | 説明           |
| -------------------- | ---------------------------------------- | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`     | 変更内容の記録 |
| コード品質レポート   | `outputs/phase-8/code-quality-report.md` | 改善前後の比較 |

## 完了条件

- [ ] コード重複が最小化されている
- [ ] 各メソッドの複雑度が適切（Cyclomatic complexity ≤ 10）
- [ ] 命名が一貫性を持ち意図が明確
- [ ] すべてのテストが引き続き成功（Green）
- [ ] カバレッジが維持されている（Phase 7と同等以上）
- [ ] パフォーマンスが劣化していない
- [ ] リファクタリング記録が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. コード重複の分析・改善
3. 複雑度の分析・軽減
4. 命名・構造の改善
5. パフォーマンス最適化
6. テスト再実行・Green確認
7. カバレッジ維持確認
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/task-knowledge-graph-store --phase 8
```

## 次のPhase

Phase 9: 品質保証

# Phase 8: リファクタリング（TDD: Refactor） - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 8                     |
| Phase名    | リファクタリング      |
| 前提Phase  | Phase 7               |
| 後続Phase  | Phase 9               |
| ステータス | 未実施                |
| 作成日     | 2026-01-17            |
| 機能名     | hybridrag-integration |

---

## 目的

動作を変えずにコード品質を改善する（TDD Refactor状態）。

## 背景

TDDアプローチの最終段階として、テストが通る状態を維持しながらコード品質を改善する。重複排除、命名改善、構造整理などを行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コードスメル検出

**目的**: リファクタリング対象を特定する

**実行手順**:

1. 以下のコードスメルを検出:
   - 重複コード（DRY違反）
   - 長いメソッド（20行以上）
   - 複雑な条件分岐（ネスト3レベル以上）
   - マジックナンバー
   - 不適切な命名
2. 検出結果をリスト化:
   | ファイル | 行番号 | コードスメル | 優先度 |
   | -------- | ------ | ------------ | ------ |
   | {{FILE}} | {{LINE}} | {{SMELL}} | {{PRIORITY}} |

**期待される成果物**:

- コードスメル検出リスト

---

### タスク2: リファクタリング実施

**目的**: コード品質を改善する

**実行手順**:

1. 定数の抽出:

   ```typescript
   // Before
   const searchLimit = Math.ceil(finalLimit * 3);

   // After
   const DEFAULT_SEARCH_LIMIT_MULTIPLIER = 3;
   const searchLimit = Math.ceil(finalLimit * DEFAULT_SEARCH_LIMIT_MULTIPLIER);
   ```

2. メソッドの抽出:
   ```typescript
   // 長いsearch()メソッドから各ステージを抽出
   private async executeQueryClassification(query: string): Promise<...>;
   private async executeTripleSearch(query: string, limit: number, filters?: SearchFilters): Promise<...>;
   private async executeFusionAndReranking(query: string, resultSets: Map<string, SearchResult[]>): Promise<...>;
   private async executeCRAG(query: string, results: FusedSearchResult[]): Promise<...>;
   ```
3. 命名改善:
   - 曖昧な変数名を具体的な名前に変更
   - 一貫性のある命名規則を適用
4. 型安全性の強化:
   - any型の排除
   - より厳密な型定義の適用

**期待される成果物**:

- リファクタリング済みコード

---

### タスク3: テスト継続成功確認

**目的**: リファクタリング後もテストが成功することを確認する

**実行手順**:

1. 全テストを実行:
   ```bash
   pnpm --filter @repo/shared test
   ```
2. カバレッジを確認:
   ```bash
   pnpm --filter @repo/shared test:coverage
   ```
3. 結果を確認:
   - [ ] 全ユニットテストがPASS
   - [ ] 全統合テストがPASS
   - [ ] カバレッジが低下していない

**期待される成果物**:

- テスト実行結果

---

## 参照資料

| 参照資料      | パス                                                        | 内容           |
| ------------- | ----------------------------------------------------------- | -------------- |
| Phase 5成果物 | `packages/shared/src/services/search/hybrid-rag-engine.ts`  | リファクタ対象 |
| Phase 5成果物 | `packages/shared/src/services/search/hybrid-rag-factory.ts` | リファクタ対象 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                         | 内容                   |
| ----------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| RAG検索インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md` | インターフェース整合性 |

---

## 成果物

| 成果物               | パス                                 | 内容     |
| -------------------- | ------------------------------------ | -------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 変更内容 |

---

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/shared test
pnpm --filter @repo/shared test -- --grep "Integration"
```

| 確認項目         | 結果       |
| ---------------- | ---------- |
| 全ユニットテスト | {{RESULT}} |
| 全統合テスト     | {{RESULT}} |
| カバレッジ維持   | {{RESULT}} |

---

## 完了条件

- [ ] コードスメルが検出・リスト化されている
- [ ] リファクタリングが実施されている
- [ ] テストが継続成功している
- [ ] カバレッジが低下していない
- [ ] 重複コードが排除されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7が完了していること（ゲートPASS）
- **後続**: Phase 9（品質保証）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

- タスク1（コードスメル検出）: {{result}}
- タスク2（リファクタリング実施）: {{result}}
- タスク3（テスト継続成功確認）: {{result}}

### リファクタリング内容

| 変更箇所     | 変更内容   |
| ------------ | ---------- |
| {{LOCATION}} | {{CHANGE}} |

### TDD確認

- [ ] リファクタリング後も全テストがGreen状態

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/hybridrag-integration/phase-9-quality.md`

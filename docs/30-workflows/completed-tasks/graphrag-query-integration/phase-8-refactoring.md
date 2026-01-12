# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 8                          |
| Phase名    | リファクタリング           |
| 前提Phase  | Phase 7                    |
| 後続Phase  | Phase 9                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-11                 |
| 機能名     | graphrag-query-integration |

---

## 目的

TDDの「Refactor」フェーズとして、Phase 5で実装したコードの品質を改善する。テストが全て通る状態を維持しながら、可読性、保守性、パフォーマンスを向上させる。

## 背景

TDD（テスト駆動開発）の「Refactor」フェーズでは、外部的な振る舞いを変えずにコードの内部構造を改善する。Phase 7でカバレッジ基準を満たしていることが確認されているため、安全にリファクタリングを行える。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード品質分析

**目的**: 現在のコードの品質課題を特定する

**実行手順**:

1. 静的解析を実行する

```bash
# ESLint
pnpm --filter @repo/shared lint

# TypeScript
pnpm --filter @repo/shared typecheck
```

2. コード複雑度を確認する

| ファイル                  | 行数 | 関数数 | 複雑度 | 改善対象 |
| ------------------------- | ---- | ------ | ------ | -------- |
| graphrag-query-service.ts | ?    | ?      | ?      | ?        |
| types/graphrag-query.ts   | ?    | ?      | -      | -        |
| schemas/graphrag-query.ts | ?    | ?      | -      | -        |

3. コードレビュー観点で課題を特定する

| 観点         | 課題 | 優先度 |
| ------------ | ---- | ------ |
| 可読性       | ?    | ?      |
| 保守性       | ?    | ?      |
| DRY原則      | ?    | ?      |
| 単一責任原則 | ?    | ?      |
| 命名規則     | ?    | ?      |

**期待される成果物**:

- コード品質分析レポート
- 改善対象リスト

---

### タスク2: 関数の分離・抽出

**目的**: 大きな関数を小さな責務に分割する

**実行手順**:

1. 抽出候補を特定する

| 現在の関数    | 抽出する関数             | 理由                     |
| ------------- | ------------------------ | ------------------------ |
| query()       | validateQuery()          | 入力バリデーションの分離 |
| query()       | classifyQuery()          | クエリ分類の分離         |
| buildPrompt() | formatCommunityContext() | コンテキスト構築の分離   |

2. 関数を抽出する

```typescript
// Before
async query(query: string, options?: GraphRAGQueryOptions) {
  // 100行以上の処理
}

// After
async query(query: string, options?: GraphRAGQueryOptions) {
  const validationResult = this.validateQuery(query);
  if (!validationResult.success) return validationResult;

  const validatedOptions = this.parseOptions(options);
  const queryType = await this.classifyQuery(query);
  const communitySummaries = await this.searchCommunitySummaries(query, validatedOptions);
  const prompt = this.buildPrompt(query, communitySummaries);
  const answer = await this.generateAnswer(prompt);

  return this.buildResponse(answer, communitySummaries, queryType);
}
```

3. テストを実行して回帰がないことを確認する

```bash
pnpm --filter @repo/shared test -- --run src/services/search/__tests__/
```

**期待される成果物**:

- リファクタリング後のコード
- テスト成功確認

---

### タスク3: 型の改善

**目的**: 型定義をより厳密かつ表現力豊かにする

**実行手順**:

1. Union型の活用

```typescript
// Before
interface GraphRAGQueryError {
  code: string;
  message: string;
}

// After
type GraphRAGQueryError =
  | { code: "EMBEDDING_FAILED"; message: string; cause?: Error }
  | { code: "COMMUNITY_SEARCH_FAILED"; message: string; cause?: Error }
  | { code: "LLM_GENERATION_FAILED"; message: string; cause?: Error }
  | { code: "INVALID_QUERY"; message: string };
```

2. Branded Typesの適用確認

```typescript
// 確認: CommunityId が適切に使用されているか
type CommunityId = string & { readonly __brand: "CommunityId" };
```

3. readonly修飾子の適用

```typescript
// Before
interface GraphRAGQueryResponse {
  answer: string;
  communitySummaries: CommunitySummaryReference[];
}

// After
interface GraphRAGQueryResponse {
  readonly answer: string;
  readonly communitySummaries: readonly CommunitySummaryReference[];
}
```

**期待される成果物**:

- 改善された型定義
- 型チェック成功確認

---

### タスク4: パフォーマンス改善

**目的**: 処理効率を改善する

**実行手順**:

1. 不要な処理の削除

```typescript
// Before: 毎回オプションを再パース
const validatedOptions = GraphRAGQueryOptionsSchema.parse(options ?? {});

// After: 早期リターンとキャッシュ活用
if (!options) {
  options = DEFAULT_OPTIONS;
}
```

2. 並列処理の活用

```typescript
// Before: シーケンシャル実行
const queryType = await this.classifyQuery(query);
const summaries = await this.searchCommunitySummaries(query, options);

// After: 並列実行（依存関係がない場合）
const [queryType, summaries] = await Promise.all([
  this.classifyQuery(query),
  this.searchCommunitySummaries(query, options),
]);
```

3. パフォーマンステストを実行する

```bash
# パフォーマンステスト
pnpm --filter @repo/shared test -- --run src/services/search/__tests__/*.integration.test.ts
```

**期待される成果物**:

- パフォーマンス改善コード
- パフォーマンステスト成功確認

---

### タスク5: テスト継続成功の確認

**目的**: リファクタリング後も全テストが成功することを確認する

**実行手順**:

1. 全テストを実行する

```bash
# 全テスト実行
pnpm --filter @repo/shared test -- --run src/services/search/__tests__/
```

2. カバレッジを再確認する

```bash
# カバレッジ確認
pnpm --filter @repo/shared test:coverage -- --run src/services/search/
```

3. カバレッジが低下していないことを確認する

| 指標              | リファクタリング前 | リファクタリング後 | 差分 |
| ----------------- | ------------------ | ------------------ | ---- |
| Line Coverage     | ?%                 | ?%                 | ?%   |
| Branch Coverage   | ?%                 | ?%                 | ?%   |
| Function Coverage | ?%                 | ?%                 | ?%   |

**期待される成果物**:

- テスト全成功確認
- カバレッジ維持確認

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> リファクタリング時に以下のシステム仕様を参照してください。

| 参照資料               | パス                                                                                          | 内容                 |
| ---------------------- | --------------------------------------------------------------------------------------------- | -------------------- |
| コミュニティ要約仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | インターフェース仕様 |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`                  | 設計パターン         |

---

## 成果物

| 成果物                   | パス                                                            | 内容                     |
| ------------------------ | --------------------------------------------------------------- | ------------------------ |
| リファクタリング後コード | `packages/shared/src/services/search/graphrag-query-service.ts` | 改善されたサービスクラス |
| 品質分析レポート         | `outputs/phase-8/refactoring-report.md`                         | 改善内容、テスト結果     |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 8での統合テスト連携アクション**:

リファクタ後の統合テスト継続成功を確認すること。

具体的には以下を確認する:

- 全ての統合テストがリファクタリング後も成功している
- パフォーマンスが劣化していない
- カバレッジが低下していない

---

## 完了条件

- [ ] コード品質分析が完了している
- [ ] 関数の分離・抽出が完了している
- [ ] 型の改善が完了している
- [ ] パフォーマンス改善が検討されている
- [ ] 全テストが成功している（回帰なし）
- [ ] カバレッジが維持されている
- [ ] `outputs/phase-8/refactoring-report.md` が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run src/services/search/__tests__/
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること（PASS判定）
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graphrag-query-integration/phase-9-quality.md`

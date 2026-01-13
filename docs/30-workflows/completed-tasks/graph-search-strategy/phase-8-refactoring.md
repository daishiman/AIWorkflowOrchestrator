# Phase 8: リファクタリング（TDD: Refactor）- タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 8                     |
| Phase名    | リファクタリング      |
| 前提Phase  | Phase 7               |
| 後続Phase  | Phase 9               |
| ステータス | 未実施                |
| 作成日     | 2026-01-12            |
| 機能名     | graph-search-strategy |

---

## 目的

動作を変えずにコード品質を改善する。TDDのRefactorフェーズとして、テストを維持しながらコードの可読性、保守性を向上させる。

## 背景

Phase 5で「テストを通すための最小限の実装」を行った。Phase 8では、テストが成功し続けることを確認しながら、コードの品質を向上させる。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コードスメル検出

**目的**: 問題のあるコードパターンの特定

**実行手順**:

1. 重複コードを検出
2. 長すぎるメソッドを特定
3. 複雑な条件分岐を特定
4. 命名の問題を特定

**期待される成果物**:

- コードスメル検出結果

---

### タスク2: リファクタリング実施

**目的**: コード構造の改善

**実行手順**:

1. 重複コードの排除（Extract Method）
2. 長いメソッドの分割
3. 条件分岐の簡素化
4. 命名の改善
5. 各変更後にテスト実行

**期待される成果物**:

- リファクタリングされたコード

---

### タスク3: SOLID原則適用確認

**目的**: 設計原則に基づくコード改善

**実行手順**:

1. 単一責任原則（SRP）の確認
2. 開放閉鎖原則（OCP）の確認
3. 依存性逆転原則（DIP）の確認
4. 必要に応じて構造を改善

**期待される成果物**:

- SOLID原則適用確認結果

---

## 参照資料

| 参照資料   | パス                                                                      | 内容          |
| ---------- | ------------------------------------------------------------------------- | ------------- |
| 実装コード | `packages/shared/src/services/search/strategies/graph-search-strategy.ts` | Phase 5成果物 |
| カバレッジ | `outputs/phase-7/coverage-report.md`                                      | Phase 7成果物 |

---

## 成果物

| 成果物               | パス                                                                      | 説明             |
| -------------------- | ------------------------------------------------------------------------- | ---------------- |
| リファクタリング済み | `packages/shared/src/services/search/strategies/graph-search-strategy.ts` | 改善されたコード |
| リファクタレポート   | `outputs/phase-8/refactoring-report.md`                                   | 変更内容記録     |

---

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm test -- --filter="GraphSearchStrategy"
pnpm test:integration -- --filter="GraphSearchStrategy"
```

---

## 完了条件

- [ ] テストが継続成功
- [ ] 重複コードが排除されている
- [ ] メソッドが適切な長さに分割されている
- [ ] 命名が改善されている
- [ ] SOLID原則が適用されている
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9: 品質保証 へ進む

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 7カバレッジレポートの確認
2. 重複コードの検出
3. 長いメソッド・複雑な条件分岐の特定
4. 命名の問題の特定
5. Extract Methodによる重複排除
6. メソッド分割・条件簡素化
7. SOLID原則適用確認
8. リファクタリング後のテスト実行確認
9. リファクタリングレポート作成
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/graph-search-strategy --phase 8
```

---

## Phase実行記録

| 項目            | 内容                     |
| --------------- | ------------------------ |
| 実行開始日時    | {{EXECUTION_START}}      |
| 実行完了日時    | {{EXECUTION_END}}        |
| 実行者          | {{EXECUTOR}}             |
| 成果物確認      | [ ] 全て生成済み         |
| artifacts.json  | [ ] 更新済み             |
| 次Phase移行可否 | [ ] 可 / [ ] 否（理由:） |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm test -- --filter="GraphSearchStrategy"

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

---

## リファクタリングチェックリスト

### コードスメル

| スメル           | 検出場所 | 対応策         | 完了 |
| ---------------- | -------- | -------------- | ---- |
| 重複コード       | [ ]      | Extract Method | [ ]  |
| 長いメソッド     | [ ]      | Split Method   | [ ]  |
| 複雑な条件分岐   | [ ]      | Guard Clause   | [ ]  |
| 不適切な命名     | [ ]      | Rename         | [ ]  |
| マジックナンバー | [ ]      | Named Constant | [ ]  |

### SOLID原則

| 原則                        | 確認項目                     | 結果 |
| --------------------------- | ---------------------------- | ---- |
| 単一責任原則（SRP）         | クラスの責務が単一           | [ ]  |
| 開放閉鎖原則（OCP）         | 拡張に開き、修正に閉じている | [ ]  |
| リスコフの置換原則（LSP）   | インターフェース準拠         | [ ]  |
| インターフェース分離（ISP） | 必要なメソッドのみ依存       | [ ]  |
| 依存性逆転原則（DIP）       | 具象ではなく抽象に依存       | [ ]  |

---

## リファクタリング例

### Before: 重複コード

```typescript
// localSearchとrelationshipSearchで類似のスコア計算
private async localSearch(...) {
  // ...
  const score = similarity * 0.6 + relevance * 0.4;
}

private async relationshipSearch(...) {
  // ...
  const score = similarity * 0.6 + relevance * 0.4;
}
```

### After: Extract Method

```typescript
private calculateCombinedScore(
  similarity: number,
  relevance: number,
  weights: { similarity: number; relevance: number } = { similarity: 0.6, relevance: 0.4 }
): number {
  return similarity * weights.similarity + relevance * weights.relevance;
}
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graph-search-strategy/phase-9-quality.md`

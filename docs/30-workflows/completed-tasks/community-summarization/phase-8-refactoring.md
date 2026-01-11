# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 8                         |
| Phase名    | リファクタリング          |
| 前提Phase  | Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質保証）       |
| ステータス | 未実施                    |
| 作成日     | 2026-01-10                |
| 機能名     | community-summarization   |

---

## 目的

TDDのRefactor段階として、テストを維持しながらコード品質を改善する。

## 背景

十分なテストカバレッジが確保された状態で、コードの可読性・保守性・パフォーマンスを改善する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード品質分析

**目的**: 改善対象を特定

**実行手順**:

1. 静的解析を実行:
   ```bash
   pnpm --filter @repo/shared lint
   pnpm --filter @repo/shared typecheck
   ```
2. コードスメルを特定:
   - 重複コード
   - 長すぎるメソッド
   - 深すぎるネスト
   - 不明確な命名
3. 改善対象をリスト化

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`（分析結果セクション）

---

### タスク2: 重複コードの除去

**目的**: DRY原則に従ってコードを整理

**実行手順**:

1. 重複パターンを特定:
   - エラーハンドリングの重複
   - パース処理の重複
2. 共通ユーティリティへの抽出:
   ```typescript
   // 例: JSONパース共通化
   private parseJsonResponse<T>(responseText: string): Result<T, Error> {
     // ...
   }
   ```
3. テストが通ることを確認

**期待される成果物**:

- `packages/shared/src/services/graph/community-summarizer.ts`（リファクタリング済み）

---

### タスク3: メソッドの分割

**目的**: 単一責任原則に従ってメソッドを分割

**実行手順**:

1. 長いメソッドを特定:
   - summarize()
   - summarizeAll()
2. 責務ごとに分割:
   ```typescript
   // 例: summarize()の分割
   private buildPromptForCommunity(...): string { }
   private callLLMForSummary(...): Promise<Result<...>> { }
   private generateEmbeddingForSummary(...): Promise<number[] | undefined> { }
   private persistSummary(...): Promise<Result<void, Error>> { }
   ```
3. テストが通ることを確認

**期待される成果物**:

- `packages/shared/src/services/graph/community-summarizer.ts`（リファクタリング済み）

---

### タスク4: 命名の改善

**目的**: 可読性向上のため命名を改善

**実行手順**:

1. 不明確な命名を特定:
   - 略語の展開
   - 意図を表す名前への変更
2. 一貫した命名規則の適用
3. テストが通ることを確認

**期待される成果物**:

- `packages/shared/src/services/graph/community-summarizer.ts`（リファクタリング済み）

---

### タスク5: パフォーマンス改善

**目的**: 効率的な処理への改善

**実行手順**:

1. パフォーマンスボトルネックを特定:
   - 不要なループ
   - 重複したDB呼び出し
2. 最適化を実施:
   ```typescript
   // 例: バッチ処理の最適化
   const entitiesResult = await this.graphStore.findEntitiesByIds(
     community.memberEntityIds,
   );
   ```
3. テストが通ることを確認

**期待される成果物**:

- `packages/shared/src/services/graph/community-summarizer.ts`（リファクタリング済み）

---

### タスク6: 統合テスト継続成功確認（統合テスト連携）

**目的**: リファクタリング後も全テストが通ることを確認

**実行手順**:

1. 全ユニットテストを実行:
   ```bash
   pnpm --filter @repo/shared test -- community-summarizer
   ```
2. 全統合テストを実行:
   ```bash
   pnpm --filter @repo/shared test -- community-summarizer.integration
   ```
3. 全テストが成功することを確認
4. カバレッジが維持されていることを確認

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`（テスト結果セクション）

---

## 参照資料

| 参照資料      | パス                                                         | 内容               |
| ------------- | ------------------------------------------------------------ | ------------------ |
| Phase 7成果物 | `outputs/phase-7/`                                           | カバレッジ検証結果 |
| 実装コード    | `packages/shared/src/services/graph/community-summarizer.ts` | 対象コード         |
| テストコード  | `packages/shared/src/services/graph/__tests__/`              | テストファイル     |

---

## 成果物

| 成果物                     | パス                                                         | 内容           |
| -------------------------- | ------------------------------------------------------------ | -------------- |
| リファクタリング記録       | `outputs/phase-8/refactoring-log.md`                         | 改善内容と結果 |
| リファクタリング済みコード | `packages/shared/src/services/graph/community-summarizer.ts` | 改善後のコード |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 8での統合テスト連携アクション**:

リファクタ後の統合テスト継続成功を確認する。

- 全ユニットテストが成功すること
- 全統合テストが成功すること
- カバレッジが維持されていること

---

## 完了条件

- [ ] コード品質分析が完了している
- [ ] 重複コードが除去されている
- [ ] メソッドが適切に分割されている
- [ ] 命名が改善されている
- [ ] パフォーマンスが改善されている
- [ ] 全テストが成功している
- [ ] カバレッジが維持されている
- [ ] リファクタリング記録が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 8ステータスを更新

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- community-summarizer
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-summarization/phase-9-quality.md`

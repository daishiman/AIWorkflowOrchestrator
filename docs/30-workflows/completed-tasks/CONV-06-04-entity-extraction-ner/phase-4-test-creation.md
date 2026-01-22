# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| Phase名    | テスト作成（TDD: Red）           |
| 前提Phase  | Phase 3                          |
| 後続Phase  | Phase 5                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-18                       |
| 機能名     | CONV-06-04-entity-extraction-ner |

---

## 目的

TDDのRed段階として、実装前に失敗するテストを作成する。これにより、実装すべき機能の仕様をテストとして明確化する。

## 背景

テストファーストアプローチにより、実装の品質を保証し、後からのリファクタリングを安全に行えるようにする。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: IEntityExtractorインターフェーステストの作成

**目的**: インターフェース準拠をテストするケースを作成する

**実行手順**:

1. extract()メソッドのテストケースを作成
2. extractBatch()メソッドのテストケースを作成
3. mergeEntities()メソッドのテストケースを作成
4. エラーハンドリングのテストケースを作成

**期待される成果物**:

- `packages/shared/src/services/extraction/__tests__/entity-extractor.interface.test.ts`

---

### タスク2: LLMEntityExtractorテストの作成

**目的**: LLMベース抽出器のテストケースを作成する

**実行手順**:

1. 正常系テスト（各エンティティタイプの抽出）を作成
2. 異常系テスト（LLMエラー、タイムアウト）を作成
3. バッチ処理テストを作成
4. プロンプト生成テストを作成
5. LLMモックを使用したテストを作成

**期待される成果物**:

- `packages/shared/src/services/extraction/__tests__/llm-entity-extractor.test.ts`

---

### タスク3: RuleBasedEntityExtractorテストの作成

**目的**: ルールベース抽出器のテストケースを作成する

**実行手順**:

1. 各エンティティタイプのパターンマッチテストを作成
2. 正規表現ベースの抽出テストを作成
3. エッジケーステスト（空文字、特殊文字）を作成
4. パフォーマンステスト（大量テキスト）を作成

**期待される成果物**:

- `packages/shared/src/services/extraction/__tests__/rule-based-entity-extractor.test.ts`

---

### タスク4: 統合テストシナリオの作成

**目的**: 統合テストシナリオを作成する

**実行手順**:

1. API接続テスト（LLMプロバイダー）のシナリオを作成
2. データフローテスト（チャンク→エンティティ）のシナリオを作成
3. 永続化テスト（entities/chunk_entities）のシナリオを作成
4. エラーハンドリング統合テストのシナリオを作成

**期待される成果物**:

- `packages/shared/src/services/extraction/__tests__/entity-extractor.integration.test.ts`

---

## 参照資料

| 参照資料      | パス               | 内容             |
| ------------- | ------------------ | ---------------- |
| Phase 2成果物 | `outputs/phase-2/` | 設計ドキュメント |
| Phase 3成果物 | `outputs/phase-3/` | レビュー結果     |

---

## 成果物

| 成果物                   | パス                                                                                     | 内容                       |
| ------------------------ | ---------------------------------------------------------------------------------------- | -------------------------- |
| インターフェーステスト   | `packages/shared/src/services/extraction/__tests__/entity-extractor.interface.test.ts`   | インターフェース準拠テスト |
| LLM抽出器テスト          | `packages/shared/src/services/extraction/__tests__/llm-entity-extractor.test.ts`         | LLM抽出器テスト            |
| ルールベース抽出器テスト | `packages/shared/src/services/extraction/__tests__/rule-based-entity-extractor.test.ts`  | ルールベーステスト         |
| 統合テスト               | `packages/shared/src/services/extraction/__tests__/entity-extractor.integration.test.ts` | 統合テスト                 |

---

## 統合テスト連携

- 統合テストシナリオを全カテゴリで作成
  - API接続テスト
  - データフローテスト
  - 永続化テスト
  - エラーハンドリングテスト

---

## 完了条件

- [ ] 全テストファイルが作成されている
- [ ] テストを実行すると全て失敗する（Red状態）
- [ ] 各テストケースが設計仕様をカバーしている
- [ ] 統合テストシナリオが作成されている

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
pnpm --filter @repo/shared test -- --testPathPattern="extraction"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-06-04-entity-extraction-ner/phase-5-implementation.md`

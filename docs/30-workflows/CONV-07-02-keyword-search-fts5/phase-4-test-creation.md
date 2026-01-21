# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 4                              |
| Phase名    | テスト作成（TDD: Red）         |
| 前提Phase  | Phase 3                        |
| 後続Phase  | Phase 5                        |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | CONV-07-02-keyword-search-fts5 |

---

## 目的

TDDのRed段階として、実装前に失敗するテストを作成する。

## 背景

テストファーストアプローチにより、要件を満たす実装を確実に行い、回帰を防止する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ユニットテストの作成

**目的**: KeywordSearchStrategyのユニットテストを作成する

**実行手順**:

1. search()メソッドのテスト
   - 正常系: キーワード検索成功
   - 正常系: フレーズ検索成功
   - 正常系: 結果0件
   - 異常系: 空クエリ
   - 異常系: クエリ長超過

2. searchNear()メソッドのテスト
   - 正常系: 近接検索成功
   - 正常系: カスタム距離指定
   - 異常系: 単一トークンエラー

3. normalizeScore()のテスト
   - 正常系: 正のBM25スコア
   - 正常系: 負のBM25スコア
   - 境界値: スコア0
   - 結果範囲: 0-1内

4. buildFTS5Query()のテスト
   - 正常系: キーワードモード
   - 正常系: フレーズモード
   - 正常系: 特殊文字エスケープ
   - 日本語対応

**期待される成果物**:

- `packages/shared/src/services/search/__tests__/keyword-search-strategy.test.ts`
- `outputs/phase-4/test-design.md`

---

### タスク2: 統合テストの作成

**目的**: FTS5との統合テストを作成する

**実行手順**:

1. DB接続テスト
   - 正常系: FTS5テーブル検索成功
   - 異常系: DB接続エラー
   - 異常系: タイムアウト

2. 検索結果変換テスト
   - 正常系: FTS5Result→SearchResultItem変換
   - 正常系: メタデータ付与
   - 正常系: ハイライト生成

3. メトリクス収集テスト
   - 正常系: 実行時間記録
   - 正常系: 結果件数記録

**期待される成果物**:

- `packages/shared/src/services/search/__tests__/keyword-search-strategy.integration.test.ts`

---

### タスク3: エラーハンドリングテストの作成

**目的**: エラーケースのテストを作成する

**実行手順**:

1. validation エラー
   - クエリ長超過（1000文字超）
   - 空クエリ
   - 不正な検索モード

2. database エラー
   - 接続失敗
   - クエリ実行失敗
   - FTS5テーブル未存在

3. timeout エラー
   - 10秒超過

**期待される成果物**:

- テストファイルへの追加テストケース

---

### タスク4: テスト実行と失敗確認

**目的**: テストが失敗することを確認する（Red状態）

**実行手順**:

1. テスト実行

```bash
pnpm --filter @repo/shared test -- --testPathPattern="keyword-search"
```

2. 全テストが失敗することを確認
3. 失敗理由の記録

**期待される成果物**:

- `outputs/phase-4/test-result-red.md`

---

## 参照資料

| 参照資料      | パス               | 内容         |
| ------------- | ------------------ | ------------ |
| Phase 2成果物 | `outputs/phase-2/` | 設計文書     |
| Phase 3成果物 | `outputs/phase-3/` | レビュー結果 |

---

## 成果物

| 成果物            | パス                                                                                        | 内容         |
| ----------------- | ------------------------------------------------------------------------------------------- | ------------ |
| ユニットテスト    | `packages/shared/src/services/search/__tests__/keyword-search-strategy.test.ts`             | 単体テスト   |
| 統合テスト        | `packages/shared/src/services/search/__tests__/keyword-search-strategy.integration.test.ts` | 統合テスト   |
| テスト設計書      | `outputs/phase-4/test-design.md`                                                            | テスト設計   |
| テスト結果（Red） | `outputs/phase-4/test-result-red.md`                                                        | 失敗確認結果 |

---

## TDD検証

### Red段階確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --testPathPattern="keyword-search"
```

**確認項目**:

- [ ] 全テストが失敗している（実装未完了のため）
- [ ] テストが要件を正しくカバーしている

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                              | テストファイル           |
| ------------------ | ------------------------------------- | ------------------------ |
| DB接続テスト       | FTS5テーブル接続・クエリ実行          | `*.integration.test.ts`  |
| データフローテスト | SearchQuery → FTS5 → SearchResultItem | `*.flow.test.ts`         |
| エラーハンドリング | validation/database/timeoutエラー処理 | `*.error.test.ts`        |
| Orchestrator連携   | HybridSearchOrchestratorとの統合動作  | `*.orchestrator.test.ts` |
| 並列実行テスト     | VectorSearchとの並列実行              | `*.parallel.test.ts`     |

---

---

## 完了条件

- [ ] ユニットテストが作成されている
- [ ] 統合テストが作成されている
- [ ] エラーハンドリングテストが作成されている
- [ ] 全テストが失敗している（Red状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/CONV-07-02-keyword-search-fts5/phase-5-implementation.md`

# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 4                    |
| Phase名    | テスト作成           |
| 前提Phase  | Phase 3              |
| 後続Phase  | Phase 5              |
| ステータス | 未実施               |
| 作成日     | 2026-01-13           |
| 機能名     | rrf-fusion-reranking |

---

## 目的

TDD Red Phase: 受け入れ基準に基づく失敗するテストを作成する。

## 背景

実装前にテストを作成することで、要件を明確化し、テスト駆動で品質を確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: RRFFusion ユニットテスト作成

**目的**: RRFFusionクラスの全機能をテストするテストケースを作成する

**実行手順**:

1. テストファイルを作成: `packages/shared/src/services/search/fusion/__tests__/rrf-fusion.test.ts`
2. 以下のテストケースを実装:

```typescript
describe("RRFFusion", () => {
  describe("fuse()", () => {
    it("3つの検索結果を統合する", () => {
      // AC-001: 3つの検索戦略からの結果を正しく統合できる
    });

    it("重複するチャンクが正しく統合される", () => {
      // AC-003: 重複するチャンクが1つにマージされ、全ソース情報が保持される
    });

    it("重みが正しく適用される", () => {
      // AC-002: 各戦略の重みが正しく適用される
    });

    it("fusedScoreが0-1の範囲", () => {
      // AC-004: fusedScoreが0-1の範囲に正規化される
    });

    it("空の結果セットを処理できる", () => {
      // 境界値テスト
    });

    it("単一戦略の結果を処理できる", () => {
      // 境界値テスト
    });

    it("kパラメータがコンストラクタで設定可能", () => {
      // AC-005: RRF kパラメータがコンストラクタで設定可能
    });
  });
});
```

**期待される成果物**:

- `packages/shared/src/services/search/fusion/__tests__/rrf-fusion.test.ts`

---

### タスク2: WeightedScoreFusion ユニットテスト作成

**目的**: WeightedScoreFusionクラスのテストケースを作成する

**実行手順**:

1. 同じテストファイルに追加
2. 以下のテストケースを実装:

```typescript
describe("WeightedScoreFusion", () => {
  describe("fuse()", () => {
    it("加重平均スコアを計算する", () => {
      // AC-006: 各スコアに重みを適用した加重平均が計算される
    });

    it("重複チャンクのスコアが正しく統合される", () => {
      // AC-007: 重複チャンクのスコアが正しく統合される
    });

    it("空の結果セットを処理できる", () => {
      // 境界値テスト
    });
  });
});
```

**期待される成果物**:

- `packages/shared/src/services/search/fusion/__tests__/rrf-fusion.test.ts`（追加）

---

### タスク3: Reranker ユニットテスト作成

**目的**: IRerankerインターフェースと各実装のテストケースを作成する

**実行手順**:

1. テストファイルを作成: `packages/shared/src/services/search/reranking/__tests__/reranker.test.ts`
2. 以下のテストケースを実装:

```typescript
describe("LLMReranker", () => {
  it("バッチでスコアリングする", () => {
    // AC-009: LLMRerankerがバッチでスコアリングできる
  });

  it("候補数が少ない場合はスキップ可能", () => {
    // オプション動作
  });

  it("LLMエラー時にフォールバック", () => {
    // AC-013: API失敗時にフォールバックが動作する
  });
});

describe("CohereReranker", () => {
  it("候補をリランキングする", () => {
    // AC-010: CohereRerankerがCohere Rerank APIを呼び出せる
  });

  it("APIエラー時にエラーを返す", () => {
    // エラーハンドリング
  });

  it("rerankedScoreが設定される", () => {
    // AC-014: rerankedScoreが結果に設定される
  });
});

describe("VoyageReranker", () => {
  it("候補をリランキングする", () => {
    // AC-011: VoyageRerankerがVoyage AI Rerank APIを呼び出せる
  });

  it("APIエラー時にエラーを返す", () => {
    // エラーハンドリング
  });
});

describe("NoOpReranker", () => {
  it("順序を変えずにlimitを適用する", () => {
    // AC-012: NoOpRerankerが順序を変えずにlimitを適用する
  });

  it("空配列を処理できる", () => {
    // 境界値テスト
  });
});
```

**期待される成果物**:

- `packages/shared/src/services/search/reranking/__tests__/reranker.test.ts`

---

### タスク4: 統合テストシナリオ作成

**目的**: Fusion + Rerankingの統合テストシナリオを作成する

**実行手順**:

1. 統合テストファイルを作成: `packages/shared/src/services/search/__tests__/fusion-reranking.integration.test.ts`
2. 以下のシナリオを実装:

```typescript
describe("Fusion + Reranking 統合テスト", () => {
  describe("API接続テスト", () => {
    it("RRFFusionがSearchResultを受け取り、FusedSearchResultを返す", () => {
      // データフロー検証
    });

    it("RerankerがFusedSearchResultを受け取り、リランク済み結果を返す", () => {
      // データフロー検証
    });
  });

  describe("データフローテスト", () => {
    it("3戦略 → Fusion → Reranking の完全フローが動作する", () => {
      // E2Eデータフロー
    });

    it("重複チャンクがフロー全体で正しく処理される", () => {
      // 重複処理検証
    });
  });

  describe("エラーハンドリングテスト", () => {
    it("Reranker失敗時にFusionスコアでフォールバック", () => {
      // フォールバック検証
    });

    it("空の検索結果でもエラーにならない", () => {
      // 境界値検証
    });
  });

  describe("認証連携テスト", () => {
    it("有効なAPIキーで正常に動作する", () => {
      // APIキー検証
    });

    it("無効なAPIキーでエラーハンドリングされる", () => {
      // 認証エラー検証
    });

    it("APIキー期限切れ時にフォールバックが動作する", () => {
      // 期限切れ処理検証
    });
  });

  describe("状態同期テスト", () => {
    it("同一クエリで結果が一貫している", () => {
      // 結果の一貫性検証
    });

    it("並行実行時に結果が競合しない", () => {
      // 並行処理検証
    });
  });
});
```

**期待される成果物**:

- `packages/shared/src/services/search/__tests__/fusion-reranking.integration.test.ts`

---

### タスク5: テスト失敗確認（Red）

**目的**: 作成したテストが全て失敗することを確認する

**実行手順**:

1. テストを実行:

   ```bash
   pnpm --filter @repo/shared test -- --testPathPattern="fusion|reranking"
   ```

2. 全テストが失敗することを確認
3. 失敗理由が「実装がない」ことを確認

**期待される成果物**:

- `outputs/phase-4/test-red-results.md` - テスト失敗結果のスクリーンショット・ログ

---

## 参照資料

| 参照資料      | パス                                                                   | 内容             |
| ------------- | ---------------------------------------------------------------------- | ---------------- |
| Phase 1成果物 | `outputs/phase-1/acceptance-criteria.md`                               | 受け入れ基準     |
| Phase 2成果物 | `outputs/phase-2/`                                                     | 設計ドキュメント |
| タスク指示書  | `docs/30-workflows/unassigned-task/task-07-05-rrf-fusion-reranking.md` | テストケース例   |

---

## 成果物

| 成果物         | パス                                                                                 | 内容                      |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| Fusionテスト   | `packages/shared/src/services/search/fusion/__tests__/rrf-fusion.test.ts`            | RRF/Weighted Fusionテスト |
| Rerankerテスト | `packages/shared/src/services/search/reranking/__tests__/reranker.test.ts`           | 各Reranker実装テスト      |
| 統合テスト     | `packages/shared/src/services/search/__tests__/fusion-reranking.integration.test.ts` | E2E統合テスト             |
| テスト結果     | `outputs/phase-4/test-red-results.md`                                                | Red状態確認               |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4のアクション**: 統合テストシナリオを全カテゴリで作成

| シナリオカテゴリ   | 検証内容                                      |
| ------------------ | --------------------------------------------- |
| API接続テスト      | Fusion/Rerankingの入出力検証                  |
| データフローテスト | 3戦略→Fusion→Rerankingの完全フロー            |
| エラーハンドリング | Reranker失敗時のフォールバック                |
| 認証連携テスト     | APIキー検証・認証トークン処理・期限切れ時動作 |
| 状態同期テスト     | 結果の一貫性検証                              |

---

## 完了条件

- [ ] RRFFusionのユニットテストが作成されている
- [ ] WeightedScoreFusionのユニットテストが作成されている
- [ ] 各Rerankerのユニットテストが作成されている
- [ ] 統合テストシナリオが全カテゴリで作成されている
- [ ] すべてのテストが失敗状態（Red）である
- [ ] 本Phase内の全タスクを100%実行完了

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --testPathPattern="fusion|reranking"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

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

`docs/30-workflows/rrf-fusion-reranking/phase-5-implementation.md`

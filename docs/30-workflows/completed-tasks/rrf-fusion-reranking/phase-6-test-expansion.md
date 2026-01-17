# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 6                    |
| Phase名    | テスト拡充           |
| 前提Phase  | Phase 5              |
| 後続Phase  | Phase 7              |
| ステータス | 未実施               |
| 作成日     | 2026-01-13           |
| 機能名     | rrf-fusion-reranking |

---

## 目的

Phase 5完了後、リファクタリングに進む前にテストを拡充し、カバレッジ目標を達成する。

## 背景

基本的なテストはPhase 4で作成済みだが、カバレッジ目標達成と品質向上のために追加テストが必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現在のカバレッジ確認

**目的**: 現在のテストカバレッジを測定し、不足箇所を特定する

**実行手順**:

1. カバレッジ測定を実行:

   ```bash
   pnpm --filter @repo/shared test:coverage -- --testPathPattern="fusion|reranking"
   ```

2. カバレッジレポートを確認し、不足箇所を特定

**期待される成果物**:

- `outputs/phase-6/current-coverage.md` - 現在のカバレッジレポート

---

### タスク2: RRFFusion 追加テスト

**目的**: RRFFusionのカバレッジを向上させる

**実行手順**:

1. 以下の追加テストケースを実装:

```typescript
describe("RRFFusion - 追加テスト", () => {
  describe("境界値テスト", () => {
    it("結果数が1件のみの場合", () => {});
    it("結果数が100件を超える場合", () => {});
    it("重みが0の戦略がある場合", () => {});
    it("重みが1の戦略のみの場合", () => {});
  });

  describe("エッジケース", () => {
    it("全戦略が同じチャンクを返す場合", () => {});
    it("各戦略が完全に異なるチャンクを返す場合", () => {});
    it("スコアが0のチャンクがある場合", () => {});
  });

  describe("正規化テスト", () => {
    it("kパラメータ変更時のスコア変化", () => {});
    it("大量の結果でもスコアが0-1範囲に収まる", () => {});
  });
});
```

**期待される成果物**:

- `packages/shared/src/services/search/fusion/__tests__/rrf-fusion.test.ts`（追加）

---

### タスク3: Reranker 追加テスト

**目的**: 各Rerankerのカバレッジを向上させる

**実行手順**:

1. 以下の追加テストケースを実装:

```typescript
describe("LLMReranker - 追加テスト", () => {
  describe("バッチ処理", () => {
    it("バッチサイズより多い候補を処理", () => {});
    it("バッチサイズと同数の候補を処理", () => {});
    it("バッチサイズより少ない候補を処理", () => {});
  });

  describe("スコアパース", () => {
    it("不正なLLMレスポンスを処理", () => {});
    it("スコアが範囲外の場合にクランプ", () => {});
    it("スコア数が不足している場合のデフォルト値", () => {});
  });
});

describe("CohereReranker - 追加テスト", () => {
  describe("エラーハンドリング", () => {
    it("ネットワークエラー時", () => {});
    it("レート制限エラー時", () => {});
    it("認証エラー時", () => {});
    it("不正なレスポンス形式時", () => {});
  });
});

describe("VoyageReranker - 追加テスト", () => {
  describe("エラーハンドリング", () => {
    it("ネットワークエラー時", () => {});
    it("レート制限エラー時", () => {});
    it("認証エラー時", () => {});
  });
});
```

**期待される成果物**:

- `packages/shared/src/services/search/reranking/__tests__/reranker.test.ts`（追加）

---

### タスク4: 統合テスト拡充

**目的**: 統合テストのカバレッジを向上させる

**実行手順**:

1. 以下の追加シナリオを実装:

```typescript
describe("Fusion + Reranking 統合テスト - 拡充", () => {
  describe("異常系シナリオ", () => {
    it("Fusion入力が空の場合", () => {});
    it("Reranker入力が空の場合", () => {});
    it("複数Rerankerが連続で失敗した場合", () => {});
  });

  describe("パフォーマンステスト", () => {
    it("1000件の結果を処理できる", () => {});
    it("大量の重複チャンクを処理できる", () => {});
  });

  describe("Reranker切り替え", () => {
    it("LLMReranker → NoOpRerankerフォールバック", () => {});
    it("CohereReranker → NoOpRerankerフォールバック", () => {});
  });
});
```

**期待される成果物**:

- `packages/shared/src/services/search/__tests__/fusion-reranking.integration.test.ts`（追加）

---

### タスク5: カバレッジ再測定

**目的**: テスト拡充後のカバレッジを確認する

**実行手順**:

1. カバレッジ測定を実行:

   ```bash
   pnpm --filter @repo/shared test:coverage -- --testPathPattern="fusion|reranking"
   ```

2. カバレッジ目標を確認:

| 指標              | 最低基準 | 推奨基準 | 現在値 |
| ----------------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      |        |
| Branch Coverage   | 60%      | 70%      |        |
| Function Coverage | 80%      | 90%      |        |

**期待される成果物**:

- `outputs/phase-6/coverage-report.md` - カバレッジレポート

---

## 参照資料

| 参照資料      | パス                                                | 内容             |
| ------------- | --------------------------------------------------- | ---------------- |
| Phase 4成果物 | `packages/shared/src/services/search/**/__tests__/` | 既存テストコード |
| Phase 5成果物 | `packages/shared/src/services/search/`              | 実装コード       |

---

## 成果物

| 成果物             | パス                                                                                 | 内容             |
| ------------------ | ------------------------------------------------------------------------------------ | ---------------- |
| 現在カバレッジ     | `outputs/phase-6/current-coverage.md`                                                | 拡充前カバレッジ |
| Fusion追加テスト   | `packages/shared/src/services/search/fusion/__tests__/rrf-fusion.test.ts`            | 追加テストケース |
| Reranker追加テスト | `packages/shared/src/services/search/reranking/__tests__/reranker.test.ts`           | 追加テストケース |
| 統合テスト追加     | `packages/shared/src/services/search/__tests__/fusion-reranking.integration.test.ts` | 追加シナリオ     |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                                 | 拡充後カバレッジ |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6のアクション**: 統合テストの拡充（全カテゴリのカバレッジ向上）

| テストカテゴリ     | 検証項目                           |
| ------------------ | ---------------------------------- |
| API接続テスト      | エンドポイント疎通・レスポンス形式 |
| データフローテスト | Fusion→Rerankingの完全フロー       |
| エラーハンドリング | API障害時のフォールバック          |
| 状態同期テスト     | 結果の一貫性検証                   |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 完了条件

- [ ] 現在のカバレッジが測定されている
- [ ] RRFFusion追加テストが作成されている
- [ ] Reranker追加テストが作成されている
- [ ] 統合テストが拡充されている
- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 全テストがパスしている
- [ ] カバレッジレポートが出力されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/rrf-fusion-reranking/phase-7-coverage-check.md`

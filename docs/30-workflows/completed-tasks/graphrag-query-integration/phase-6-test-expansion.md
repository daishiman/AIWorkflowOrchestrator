# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 6                          |
| Phase名    | テスト拡充                 |
| 前提Phase  | Phase 5                    |
| 後続Phase  | Phase 7                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-11                 |
| 機能名     | graphrag-query-integration |

---

## 目的

Phase 5の実装完了後、テストカバレッジ目標を達成するために追加テストを作成する。ユニットテストと統合テストの両方を拡充し、品質を担保する。

## 背景

Phase 4で作成した基本テストに加え、エッジケース、境界値、異常系のテストを追加することで、より堅牢な実装を保証する。特に統合テストを拡充し、モジュール間の接続を検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現在のカバレッジ確認

**目的**: 現在のテストカバレッジを計測し、不足箇所を特定する

**実行手順**:

1. カバレッジレポートを生成する

```bash
# カバレッジ計測
pnpm --filter @repo/shared test:coverage -- --run src/services/search/__tests__/graphrag-query-service.test.ts
```

2. カバレッジ結果を分析する

| 指標              | 現在値 | 目標 | 差分 |
| ----------------- | ------ | ---- | ---- |
| Line Coverage     | ?%     | 80%+ | ?%   |
| Branch Coverage   | ?%     | 60%+ | ?%   |
| Function Coverage | ?%     | 80%+ | ?%   |

3. 未カバー箇所を特定する

**期待される成果物**:

- カバレッジレポート
- 未カバー箇所リスト

---

### タスク2: エッジケーステストの追加

**目的**: 境界値やエッジケースのテストを追加する

**実行手順**:

1. 境界値テストを追加する

```typescript
// packages/shared/src/services/search/__tests__/graphrag-query-service.test.ts に追加

describe("境界値テスト", () => {
  it("limit=1の場合、1件のみ返される", async () => {
    // Arrange
    mockCommunitySummarizer.searchSummaries.mockResolvedValue({
      success: true,
      data: [
        { communityId: "comm-1", confidence: 0.9 },
        { communityId: "comm-2", confidence: 0.8 },
      ],
    });

    // Act
    await service.query("テスト", { limit: 1 });

    // Assert
    expect(mockCommunitySummarizer.searchSummaries).toHaveBeenCalledWith(
      "テスト",
      expect.objectContaining({ limit: 1 }),
    );
  });

  it("limit=20（最大値）の場合、正常に処理される", async () => {
    // テスト実装
  });

  it("confidenceThreshold=0の場合、全ての要約が含まれる", async () => {
    // テスト実装
  });

  it("confidenceThreshold=1の場合、confidence=1のみ含まれる", async () => {
    // テスト実装
  });

  it("communityLevel=0の場合、レベル0のみ検索される", async () => {
    // テスト実装
  });
});
```

2. 空配列・nullケースを追加する

```typescript
describe("空・null ケース", () => {
  it("コミュニティ要約が空配列の場合、回答が生成される", async () => {
    // テスト実装
  });

  it("クエリが空白のみの場合、バリデーションエラー", async () => {
    // テスト実装
  });
});
```

**期待される成果物**:

- 境界値テストケース
- 空・nullケーステストケース

---

### タスク3: 統合テストの拡充

**目的**: モジュール間接続の統合テストを拡充する

**実行手順**:

1. API接続テストを追加する

```typescript
// packages/shared/src/services/search/__tests__/graphrag-query-service.integration.test.ts に追加

describe("API接続テスト", () => {
  it("ICommunitySummarizer.searchSummaries() が正しく呼び出される", async () => {
    // モック検証
  });

  it("IQueryClassifier.classify() が正しく呼び出される", async () => {
    // モック検証
  });

  it("ILLMProvider.chat() が正しいプロンプトで呼び出される", async () => {
    // モック検証
  });
});
```

2. データフローテストを追加する

```typescript
describe("データフローテスト", () => {
  it("クエリ→埋め込み→検索→回答の一連のフローが正しく実行される", async () => {
    // E2Eフローテスト
  });

  it("複数のコミュニティ要約がプロンプトに正しく含まれる", async () => {
    // テスト実装
  });
});
```

3. エラーハンドリングテストを追加する

```typescript
describe("エラーハンドリングテスト", () => {
  it("埋め込み生成失敗時、EMBEDDING_FAILEDエラーが返される", async () => {
    // テスト実装
  });

  it("コミュニティ検索失敗時、フォールバックで処理継続", async () => {
    // テスト実装（Phase 4で作成済みの可能性あり）
  });

  it("LLM生成タイムアウト時、適切なエラーが返される", async () => {
    // テスト実装
  });
});
```

4. 並行処理テストを追加する

```typescript
describe("並行処理テスト", () => {
  it("複数クエリの同時実行が正しく処理される", async () => {
    // Arrange
    const queries = ["クエリ1", "クエリ2", "クエリ3"];

    // Act
    const results = await Promise.all(queries.map((q) => service.query(q)));

    // Assert
    expect(results.every((r) => r.success)).toBe(true);
  });
});
```

**期待される成果物**:

- API接続テスト
- データフローテスト
- エラーハンドリングテスト
- 並行処理テスト

---

### タスク4: ResponseBuilder テストの拡充

**目的**: プロンプト構築ロジックのテストを拡充する

**実行手順**:

1. プロンプト構築テストを追加する

```typescript
// packages/shared/src/services/search/__tests__/response-builder.test.ts に追加

describe("ResponseBuilder 拡充テスト", () => {
  describe("プロンプト構築", () => {
    it("複数階層のコミュニティ要約が正しい順序で含まれる", () => {
      // テスト実装
    });

    it("キーワードと主要エンティティがプロンプトに含まれる", () => {
      // テスト実装
    });

    it("プロンプトがトークン制限内に収まる", () => {
      // テスト実装
    });
  });

  describe("トークン制限", () => {
    it("コンテキストがトークン制限を超える場合、適切に切り詰められる", () => {
      // テスト実装
    });
  });
});
```

**期待される成果物**:

- ResponseBuilder 拡充テスト

---

### タスク5: カバレッジ再確認

**目的**: テスト拡充後のカバレッジを確認し、目標達成を検証する

**実行手順**:

1. カバレッジレポートを再生成する

```bash
# カバレッジ計測
pnpm --filter @repo/shared test:coverage -- --run src/services/search/__tests__/
```

2. カバレッジ結果を確認する

### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 達成値 |
| ----------------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | ?%     |
| Branch Coverage   | 60%      | 70%      | ?%     |
| Function Coverage | 80%      | 90%      | ?%     |

3. 未達の場合、追加テストを作成する

**期待される成果物**:

- 拡充後カバレッジレポート
- カバレッジ達成確認

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> テスト拡充時に以下のシステム仕様を参照してください。

| 参照資料             | パス                                                                                          | 内容                   |
| -------------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| コミュニティ要約仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | searchSummaries() 仕様 |
| 検索型定義           | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-search.md`                  | SearchResult型         |

---

## 成果物

| 成果物                    | パス                                                                                       | 内容                 |
| ------------------------- | ------------------------------------------------------------------------------------------ | -------------------- |
| 拡充ユニットテスト        | `packages/shared/src/services/search/__tests__/graphrag-query-service.test.ts`             | 境界値・エッジケース |
| 拡充統合テスト            | `packages/shared/src/services/search/__tests__/graphrag-query-service.integration.test.ts` | E2E・エラー処理      |
| ResponseBuilder拡充テスト | `packages/shared/src/services/search/__tests__/response-builder.test.ts`                   | プロンプト構築       |
| カバレッジレポート        | `outputs/phase-6/coverage-report.md`                                                       | カバレッジ結果       |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 6での統合テスト連携アクション**:

統合テストの拡充（全カテゴリのカバレッジ向上）を行うこと。

具体的には以下のカテゴリで統合テストを拡充する:

- API接続テスト: 各インターフェースの呼び出し検証
- データフローテスト: クエリ→コミュニティ要約→回答の往復
- エラーハンドリング: フォールバック動作の検証
- 並行処理テスト: 複数クエリの同時実行

---

## 完了条件

- [ ] 現在のカバレッジが計測されている
- [ ] 境界値テストが追加されている
- [ ] 空・nullケーステストが追加されている
- [ ] 統合テスト（API接続・データフロー・エラー処理・並行処理）が追加されている
- [ ] ResponseBuilder テストが拡充されている
- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] カバレッジレポートが出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/graphrag-query-integration/phase-7-coverage-check.md`

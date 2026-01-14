# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 6                     |
| Phase名    | テスト拡充            |
| 前提Phase  | Phase 5               |
| 後続Phase  | Phase 7               |
| ステータス | 未実施                |
| 作成日     | 2026-01-13            |
| 機能名     | shared-type-export-01 |

---

## 目的

Phase 5の実装完了後、テストカバレッジ目標を達成するための追加テストを作成する。

## 背景

本タスクは型エクスポートのみの小規模リファクタリングであるため、テスト拡充の範囲は限定的。ただし、カバレッジ基準を満たすため、必要に応じてテストを追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現在のカバレッジ確認

**目的**: Phase 5実装後のテストカバレッジを確認する

**実行手順**:

1. カバレッジレポートを生成
2. 現在のカバレッジ率を記録
3. 不足している部分を特定

**実行コマンド**:

```bash
pnpm --filter @repo/shared test:coverage -- --run services/graph/
```

**期待される成果物**:

- カバレッジレポート（出力: `outputs/phase-6/coverage-report.md`）

---

### タスク2: エッジケーステストの追加

**目的**: 型エクスポートの境界条件をテストする

**実行手順**:

1. 全ての enum 値が正しいことを確認するテスト追加
2. Error クラスの各フィールドが正しいことを確認
3. normalizeEntityName の追加ケースをテスト

**追加テストコード例**:

```typescript
describe("Edge cases", () => {
  describe("CommunityErrorCode enum values", () => {
    it("should have all expected error codes", async () => {
      const { CommunityErrorCode } = await import("../index");
      expect(Object.keys(CommunityErrorCode)).toContain("GRAPH_LOAD_FAILED");
      expect(Object.keys(CommunityErrorCode)).toContain("DETECTION_FAILED");
      expect(Object.keys(CommunityErrorCode)).toContain("SAVE_FAILED");
      expect(Object.keys(CommunityErrorCode)).toContain("NOT_FOUND");
      expect(Object.keys(CommunityErrorCode)).toContain("INVALID_PARAMETER");
    });
  });

  describe("CommunitySummarizationErrorCode enum values", () => {
    it("should have all expected error codes", async () => {
      const { CommunitySummarizationErrorCode } = await import("../index");
      expect(Object.keys(CommunitySummarizationErrorCode)).toContain(
        "LLM_GENERATION_FAILED",
      );
      expect(Object.keys(CommunitySummarizationErrorCode)).toContain(
        "JSON_PARSE_FAILED",
      );
      expect(Object.keys(CommunitySummarizationErrorCode)).toContain(
        "EMBEDDING_FAILED",
      );
    });
  });

  describe("normalizeEntityName edge cases", () => {
    it("should handle empty string", async () => {
      const { normalizeEntityName } = await import("../index");
      expect(normalizeEntityName("")).toBe("");
    });

    it("should handle string with only spaces", async () => {
      const { normalizeEntityName } = await import("../index");
      expect(normalizeEntityName("   ")).toBe("");
    });

    it("should handle unicode characters", async () => {
      const { normalizeEntityName } = await import("../index");
      expect(normalizeEntityName("日本語テスト")).toBe("日本語テスト");
    });
  });
});
```

**期待される成果物**:

- 追加テストファイル更新（実装: `packages/shared/src/services/graph/__tests__/type-exports.test.ts`）

---

### タスク3: カバレッジ目標達成確認

**目的**: テスト拡充後のカバレッジが基準を満たすことを確認

**実行手順**:

1. 拡充後のカバレッジを測定
2. 基準との比較
3. 結果を記録

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**期待される成果物**:

- カバレッジ達成レポート（出力: `outputs/phase-6/coverage-achievement.md`）

---

## 参照資料

| 参照資料       | パス                                                                | 内容       |
| -------------- | ------------------------------------------------------------------- | ---------- |
| Phase 5成果物  | `outputs/phase-5/`                                                  | 実装成果物 |
| テストファイル | `packages/shared/src/services/graph/__tests__/type-exports.test.ts` | 既存テスト |

---

## 成果物

| 成果物                 | パス                                      | 内容             |
| ---------------------- | ----------------------------------------- | ---------------- |
| カバレッジレポート     | `outputs/phase-6/coverage-report.md`      | 現在のカバレッジ |
| カバレッジ達成レポート | `outputs/phase-6/coverage-achievement.md` | 目標達成状況     |

---

## 統合テスト連携（Phase 1〜11は必須）

### 統合テストの拡充

本タスクは型エクスポートのみのため、統合テストの範囲は限定的:

- 型インポートの正常系テスト
- 既存の統合テストが壊れていないことの確認

---

## 完了条件

- [ ] 現在のカバレッジが測定されている
- [ ] 必要に応じてエッジケーステストが追加されている
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成
- [ ] 全テストが成功している
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 6 ステータスを `completed` に更新

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/shared-type-export-01/phase-7-coverage-check.md`

# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 6                     |
| 機能名 | history-preload-setup |
| 作成日 | 2026-01-12            |

---

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。preload API、型チェック、エラーケースのテストを追加する。

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> テスト拡充時に必ず以下のシステム仕様を確認し、仕様準拠を確保してください。

| 参照資料                  | パス                                                                         | 内容                               |
| ------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 履歴/ログ表示UI仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | HistoryAPI仕様・IPCチャンネル名    |
| APIセキュリティ・Electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | preload・contextBridgeセキュリティ |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "Result"`

---

## 実行タスク

| タスク             | 責務                                   |
| ------------------ | -------------------------------------- |
| カバレッジ分析     | テストカバレッジの測定と不足領域の特定 |
| エッジケーステスト | 境界値・null・undefined等のテスト追加  |
| エラーハンドリング | API呼び出し失敗時のテスト追加          |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

---

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### 2. 追加テスト作成

#### エッジケーステスト

```typescript
describe("historyAPI edge cases", () => {
  it("should handle empty fileId", async () => {
    const result = await window.historyAPI?.getFileHistory("");
    expect(result).toBeDefined();
  });

  it("should handle undefined options", async () => {
    const result = await window.historyAPI?.getFileHistory(
      "file-id",
      undefined,
    );
    expect(result).toBeDefined();
  });

  it("should handle null-like options properties", async () => {
    const result = await window.historyAPI?.getFileHistory("file-id", {
      limit: 0,
      offset: 0,
    });
    expect(result).toBeDefined();
  });
});
```

#### エラーハンドリングテスト

```typescript
describe("historyAPI error handling", () => {
  it("should return error result when IPC fails", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("IPC Error"));

    const result = await window.historyAPI?.getFileHistory("file-id");

    expect(result).toEqual({
      success: false,
      error: expect.any(Error),
    });
  });

  it("should handle timeout", async () => {
    mockInvoke.mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000),
        ),
    );

    await expect(
      window.historyAPI?.getVersionDetail("conversion-id"),
    ).rejects.toThrow("Timeout");
  });
});
```

### 3. API呼び出しシナリオテスト

```typescript
describe("historyAPI scenarios", () => {
  it("should get file history and then version detail", async () => {
    mockInvoke
      .mockResolvedValueOnce({
        success: true,
        data: { items: [{ conversionId: "conv-1" }], total: 1, hasMore: false },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { version: {}, logs: [] },
      });

    const historyResult = await window.historyAPI?.getFileHistory("file-id");
    expect(historyResult?.success).toBe(true);

    const detailResult = await window.historyAPI?.getVersionDetail("conv-1");
    expect(detailResult?.success).toBe(true);
  });
});
```

---

## 統合テスト連携【必須】

API呼び出しテスト・型チェックテストの拡充:

| テストカテゴリ     | 検証項目                           | 目標 |
| ------------------ | ---------------------------------- | ---- |
| API接続テスト      | historyAPI 4メソッドの呼び出し成功 | 100% |
| エラーハンドリング | IPC失敗時のResult<T>エラー返却     | 80%+ |
| 型チェックテスト   | TypeScript型定義の整合性           | 100% |

---

## 成果物

| 成果物             | パス                                                    | 説明               |
| ------------------ | ------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                    | カバレッジ分析結果 |
| テストファイル     | `apps/desktop/src/preload/__tests__/historyAPI.test.ts` | 追加テストコード   |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] エッジケーステスト（3ケース）が追加されている
- [ ] エラーハンドリングテスト（2ケース）が追加されている
- [ ] シナリオテスト（1ケース）が追加されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 7: テストカバレッジ確認

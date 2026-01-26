# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                        |
| ------ | ----------------------------------------- |
| Phase  | 6                                         |
| 機能名 | TASK-4-2-permission-resolver-ipc-handlers |
| 作成日 | 2026-01-25                                |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。エッジケース、異常系、統合テストを追加する。

## 実行タスク

### Task 6-1: IPC Handlerテスト拡充

**追加テストケース:**

```typescript
describe("permission-handlers edge cases", () => {
  it("should handle invalid response format gracefully", () => {
    // 不正なレスポンス形式のテスト
  });

  it("should handle window destroyed scenario", () => {
    // ウィンドウ破棄時のテスト
  });

  it("should reject requests from invalid sender", () => {
    // 不正な送信元のテスト
  });

  it("should handle concurrent responses", () => {
    // 同時レスポンスのテスト
  });

  it("should handle response for non-existent request", () => {
    // 存在しないリクエストへのレスポンステスト
  });
});
```

### Task 6-2: Preload APIテスト拡充

**追加テストケース:**

```typescript
describe("skillPermissionAPI edge cases", () => {
  it("should handle multiple subscribers", () => {
    // 複数購読者のテスト
  });

  it("should handle rapid subscribe/unsubscribe", () => {
    // 高速な購読/解除のテスト
  });

  it("should handle response timeout", () => {
    // レスポンスタイムアウトのテスト
  });

  it("should handle IPC error", () => {
    // IPCエラーのテスト
  });
});
```

### Task 6-3: usePermissionDialog Hookテスト拡充

**追加テストケース:**

```typescript
describe("usePermissionDialog edge cases", () => {
  it("should handle rapid request sequence", () => {
    // 連続リクエストのテスト
  });

  it("should not respond when pendingRequest is null", () => {
    // null状態でのレスポンステスト
  });

  it("should handle rememberChoice option", () => {
    // 選択記憶オプションのテスト
  });

  it("should cleanup properly on unmount during pending request", () => {
    // リクエスト中のアンマウントテスト
  });

  it("should handle API error gracefully", () => {
    // APIエラー時のテスト
  });
});
```

### Task 6-4: PermissionDialogコンポーネントテスト拡充

**追加テストケース:**

```typescript
describe("PermissionDialog accessibility and edge cases", () => {
  it("should trap focus within dialog", () => {
    // フォーカストラップのテスト
  });

  it("should restore focus on close", () => {
    // 閉じた後のフォーカス復元テスト
  });

  it("should handle very long tool names", () => {
    // 長いツール名のテスト
  });

  it("should handle empty args", () => {
    // 空のargsのテスト
  });

  it("should handle undefined reason", () => {
    // 理由なしのテスト
  });

  it("should prevent background scroll when open", () => {
    // 背景スクロール防止のテスト
  });

  it("should be keyboard navigable", () => {
    // キーボードナビゲーションのテスト
  });
});
```

### Task 6-5: 統合テスト拡充

**追加テストケース:**

```typescript
describe("Permission Integration comprehensive", () => {
  describe("Full flow tests", () => {
    it("should complete full allow flow", async () => {
      // 完全な許可フローテスト
    });

    it("should complete full deny flow", async () => {
      // 完全な拒否フローテスト
    });

    it("should handle multiple sequential requests", async () => {
      // 連続リクエストテスト
    });

    it("should handle request during existing request", async () => {
      // 既存リクエスト中の新規リクエストテスト
    });
  });

  describe("Error recovery", () => {
    it("should recover from IPC error", async () => {
      // IPCエラーからの回復テスト
    });

    it("should handle renderer crash", async () => {
      // Rendererクラッシュ時のテスト
    });
  });
});
```

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 現在の値 |
| ----------------- | -------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      | -        |
| Branch Coverage   | 60%      | 70%      | -        |
| Function Coverage | 80%      | 90%      | -        |

## 結合テストカバレッジ基準

| 指標                         | 目標 | 現在の値 |
| ---------------------------- | ---- | -------- |
| IPCチャンネル                | 100% | -        |
| モジュール間インターフェース | 100% | -        |
| 正常系シナリオ               | 100% | -        |
| 異常系シナリオ               | 80%+ | -        |
| 外部連携ポイント             | 100% | -        |

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                             | 目標 |
| ------------------ | ------------------------------------ | ---- |
| IPC送信テスト      | 全チャンネル・全データパターン       | 100% |
| IPC受信テスト      | 正常/異常レスポンス                  | 100% |
| UIイベントテスト   | 全ユーザー操作パターン               | 100% |
| 状態管理テスト     | 全状態遷移パターン                   | 100% |
| エラーハンドリング | タイムアウト/キャンセル/ネットワーク | 80%+ |

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### 2. ギャップ分析

- 未到達の行/分岐/関数を特定
- 統合テスト不足領域を特定

### 3. 追加テスト作成

- ユニット/統合/E2Eの不足分を追加
- IPC通信経路を優先

### 4. 統合テスト再実行

```bash
pnpm --filter @repo/desktop test
```

## 参照資料

| 資料名       | パス                                               | 説明          |
| ------------ | -------------------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`            | Phase 4成果物 |
| 実装コード   | `apps/desktop/src/main/ipc/permission-handlers.ts` | Phase 5成果物 |

## 成果物

| 成果物             | パス                                  | 説明               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | 統合テスト実行結果 |
| テストファイル     | `apps/desktop/src/**/__tests__/`      | 追加テストコード   |

## 完了条件

- [ ] IPC Handlerのエッジケーステストが追加されている
- [ ] Preload APIのエッジケーステストが追加されている
- [ ] usePermissionDialog Hookのエッジケーステストが追加されている
- [ ] PermissionDialogのアクセシビリティテストが追加されている
- [ ] 統合テストが拡充されている
- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（IPC 100%, シナリオ 100%/80%）
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認

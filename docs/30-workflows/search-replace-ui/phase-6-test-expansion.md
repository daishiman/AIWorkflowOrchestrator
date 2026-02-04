# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 6                      |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント（IPC）     | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 実行タスク

### Task 6-1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage -- --testPathPattern="features/search"
```

### Task 6-2: ギャップ分析

既存テストのカバレッジを確認し、不足領域を特定する。

| 分析対象                   | 確認項目               |
| -------------------------- | ---------------------- |
| SearchPanel                | 未到達の行/分岐/関数   |
| WorkspaceSearchPanel       | IPCプロバイダのモック  |
| useSearchKeyboardShortcuts | グローバル登録のテスト |
| 新規IPCプロバイダ          | 異常系テスト           |

### Task 6-3: 追加テスト作成

不足しているテストケースを追加する。

| テストカテゴリ | 追加が必要な観点                 |
| -------------- | -------------------------------- |
| ユニットテスト | 新規作成したIPCプロバイダ        |
| 統合テスト     | グローバルショートカット統合     |
| E2Eテスト      | エッジケース、エラーハンドリング |

### Task 6-4: E2Eテスト拡充

```typescript
// 追加E2Eテストケース例
test.describe("Search Panel E2E - Edge Cases", () => {
  test("should handle empty search query", async ({ page }) => {
    // TODO
  });

  test("should handle invalid regex", async ({ page }) => {
    // TODO
  });

  test("should handle large search results", async ({ page }) => {
    // TODO
  });
});
```

## 統合テスト連携【必須】

統合テストの拡充:

| テストカテゴリ     | 検証項目                                | 目標 |
| ------------------ | --------------------------------------- | ---- |
| IPC接続テスト      | ワークスペース検索リクエスト/レスポンス | 100% |
| エラーハンドリング | IPC障害時のUI表示                       | 80%+ |
| 状態同期テスト     | 検索状態の永続化・復元                  | 100% |

## 成果物

| 成果物             | パス                                    | 説明               |
| ------------------ | --------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`    | カバレッジ分析結果 |
| 追加テストコード   | `apps/desktop/src/**/*.test.ts`         | 追加テスト         |
| E2E拡充            | `apps/desktop/tests/e2e/search.spec.ts` | E2E追加            |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] 追加テストが全て成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 6-1: カバレッジ測定
2. Task 6-2: ギャップ分析
3. Task 6-3: 追加テスト作成
4. Task 6-4: E2Eテスト拡充
5. カバレッジレポート作成

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 6-1〜6-4）を100%実行完了
- [ ] カバレッジ基準を達成している
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/search-replace-ui --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
